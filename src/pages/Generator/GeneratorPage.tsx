import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStyle } from '../../hooks/useStyle';
import {
  generateProceduralStyle, remixStyle, generateBatch, PERSONALITY_TYPES, GENERATOR_VERSION
} from '../../engine/generator/generator';
import type { GenerationMode, GenerationLocks, GeneratedStyleResult, RemixStrength } from '../../engine/generator/generator';
import type { PersonalityType } from '../../engine/generator/personalities';
import { PERSONALITY_MAP } from '../../engine/generator/personalities';
import { RECIPE_AXES } from '../../engine/generator/vocab';
import type { RecipeAxis } from '../../engine/generator/vocab';
import { findSimilarStyles, DNA_AXES } from '../../engine/generator/dna';
import { STORAGE_KEYS, readJson, writeJson } from '../../engine/storage';
import { StylePreviewCard } from '../../components/preview/StylePreviewCard';
import { WorkspaceSection, WorkspaceSegmented } from '../../components/workspace/Workspace';
import { Badge } from '../../components/ui/Badge';
import {
  Sparkles, Shuffle, Lock, Unlock, Copy, Check, Layers, Wand2, Dna, Bug, History, Link2, Save,
  Trash2, GitBranch, Fingerprint, Sliders, Hash, ListTree, Grid3x3, Download
} from 'lucide-react';
import './GeneratorPage.css';

interface HistoryEntry {
  seedNumber: number;
  name: string;
  mode: GenerationMode;
  personality: string;
  createdAt: string;
  parentSeed?: number;
  parentId?: string;
  family: string;
  keptAxes: RecipeAxis[];
  dnaHash: string;
}

/** One link in a reproducible lineage: seed, mode, personality, family and kept axes. */
interface ChainLink { seed: number; mode: GenerationMode; personality: string; family: string; kept: RecipeAxis[] }

const encodeChain = (links: ChainLink[]) =>
  links.map((l) => [l.seed, l.mode, l.personality, l.family, l.kept.join('+') || '-'].map(encodeURIComponent).join(':')).join('|');

const decodeChain = (raw: string): ChainLink[] =>
  raw.split('|').map((part) => {
    const [seed, mode, personality, family, kept] = part.split(':').map(decodeURIComponent);
    return {
      seed: Number(seed),
      mode: (['Coherent', 'Experimental', 'Extreme'].includes(mode) ? mode : 'Coherent') as GenerationMode,
      personality, family,
      kept: kept === '-' ? [] : kept.split('+').filter((a): a is RecipeAxis => (RECIPE_AXES as string[]).includes(a))
    };
  }).filter((l) => Number.isFinite(l.seed));

/** Regenerate a lineage from its root; every link is a plain generation with locks against the previous one. */
const reproduceChain = (chain: ChainLink[]): GeneratedStyleResult | null => {
  let previous: GeneratedStyleResult | null = null;
  for (const link of chain) {
    const locks: GenerationLocks = {};
    for (const a of link.kept) locks[a] = true;
    const personalityType = (PERSONALITY_TYPES as string[]).includes(link.personality) ? (link.personality as PersonalityType) : undefined;
    previous = generateProceduralStyle({
      seed: link.seed, mode: link.mode, personalityType, visualFamily: link.family || undefined,
      locks: previous && link.kept.length > 0 ? locks : undefined,
      baseStyle: previous && link.kept.length > 0 ? previous.style : undefined,
      parentSeed: previous?.seedNumber, parentId: previous?.style.metadata.id
    });
  }
  return previous;
};

const HISTORY_LIMITS = [20, 50, 100] as const;

const AXIS_LABELS: Record<RecipeAxis, string> = {
  colors: 'Colors', typography: 'Typography', geometry: 'Geometry', surface: 'Surface', depth: 'Depth',
  borders: 'Borders', icons: 'Icons', motion: 'Motion', svg: 'SVG'
};

type ResultTab = 'recipe' | 'why' | 'constraints' | 'dna' | 'similar' | 'debug';

const randomSeed = () => Math.floor(Math.random() * 900000) + 100000;

export const GeneratorPage: React.FC = () => {
  const { setStyle, addCustomStyle, setPreviewStyle, availableStyles, currentStyle } = useStyle();
  const [searchParams, setSearchParams] = useSearchParams();

  // Numeric seeds in the URL are used verbatim so a shared link reproduces the exact style.
  const rawSeed = searchParams.get('seed') || '847291';
  const urlSeed: string | number = /^\d+$/.test(rawSeed) ? Number(rawSeed) : rawSeed;
  const urlMode = (searchParams.get('mode') as GenerationMode | null) ?? undefined;
  const urlPersonality = (searchParams.get('personality') as PersonalityType | null) ?? undefined;
  const startInSurpriseMode = searchParams.get('surprise') === '1';
  const urlFamily = searchParams.get('family') ?? undefined;
  // A remixed style is reproduced from its full lineage (root to current), encoded in `chain`.
  const urlChain = searchParams.get('chain');

  const [seedInput, setSeedInput] = useState<string>(String(urlSeed));
  const [mode, setMode] = useState<GenerationMode>(urlMode ?? (startInSurpriseMode ? 'Experimental' : 'Coherent'));
  const [personality, setPersonality] = useState<PersonalityType | 'Random'>(urlPersonality ?? 'Random');
  const [family, setFamily] = useState<string>('Auto');
  const [locks, setLocks] = useState<GenerationLocks>({});
  const [remixStrength, setRemixStrength] = useState<RemixStrength>('Balanced');
  const [batchSize, setBatchSize] = useState<5 | 10 | 20>(5);
  const [historyLimit, setHistoryLimit] = useState<number>(() => readJson<number>('ui_explorer_generator_history_limit', 50));

  const [result, setResult] = useState<GeneratedStyleResult | null>(null);
  const [candidates, setCandidates] = useState<GeneratedStyleResult[]>([]);
  const [candidatesLabel, setCandidatesLabel] = useState<string>('');
  const [history, setHistory] = useState<HistoryEntry[]>(() => readJson<HistoryEntry[]>(STORAGE_KEYS.generatorHistory, []));
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ResultTab>('recipe');
  const [copied, setCopied] = useState<'seed' | 'link' | 'hash' | null>(null);
  const [inspectAxis, setInspectAxis] = useState<string>('surface');

  const families = useMemo(() => {
    const set = new Set<string>();
    for (const p of Object.values(PERSONALITY_MAP)) for (const f of p.visualFamilies) set.add(f.family);
    return Array.from(set).sort();
  }, []);

  const hasLocks = RECIPE_AXES.some((a) => locks[a]);

  const pushHistory = useCallback((res: GeneratedStyleResult) => {
    setHistory((prev) => {
      const entry: HistoryEntry = {
        seedNumber: res.seedNumber,
        name: res.style.metadata.name,
        mode: res.mode,
        personality: res.semantic.personality,
        createdAt: res.style.generation?.createdAt ?? new Date().toISOString(),
        parentSeed: res.style.generation?.parentSeed,
        parentId: res.style.generation?.parentId,
        family: res.semantic.visualFamily,
        keptAxes: (res.style.generation?.keptAxes ?? []) as RecipeAxis[],
        dnaHash: res.dnaHash
      };
      const next = [entry, ...prev.filter((h) => h.seedNumber !== res.seedNumber)].slice(0, historyLimit);
      writeJson(STORAGE_KEYS.generatorHistory, next);
      return next;
    });
  }, [historyLimit]);

  /** Walk parent links through history to build the root -> current chain. */
  const chainFor = useCallback((res: GeneratedStyleResult): ChainLink[] => {
    const links: ChainLink[] = [{ seed: res.seedNumber, mode: res.mode, personality: res.semantic.personality, family: res.semantic.visualFamily, kept: (res.style.generation?.keptAxes ?? []) as RecipeAxis[] }];
    let parentSeed = res.style.generation?.parentSeed;
    const seen = new Set<number>([res.seedNumber]);
    while (parentSeed !== undefined && !seen.has(parentSeed)) {
      seen.add(parentSeed);
      const entry = history.find((h) => h.seedNumber === parentSeed);
      if (!entry) break;
      links.unshift({ seed: entry.seedNumber, mode: entry.mode, personality: entry.personality, family: entry.family ?? '', kept: entry.keptAxes ?? [] });
      parentSeed = entry.parentSeed;
    }
    return links;
  }, [history]);

  const showResult = useCallback((res: GeneratedStyleResult, updateUrl = true) => {
    setResult(res);
    setError(null);
    setPreviewStyle(res.style);
    setSeedInput(String(res.seedNumber));
    pushHistory(res);
    if (updateUrl) {
      const params: Record<string, string> = { seed: String(res.seedNumber), mode: res.mode, personality: res.semantic.personality, family: res.semantic.visualFamily };
      const kept = res.style.generation?.keptAxes ?? [];
      if (kept.length > 0 && res.style.generation?.parentSeed !== undefined) {
        params.chain = encodeChain(chainFor(res));
      }
      setSearchParams(params, { replace: true });
    }
  }, [pushHistory, setPreviewStyle, setSearchParams, chainFor]);

  const run = useCallback((seed: string | number, overrides?: { mode?: GenerationMode; personality?: PersonalityType | 'Random'; useLocks?: boolean; family?: string }) => {
    try {
      const m = overrides?.mode ?? mode;
      const p = overrides?.personality ?? personality;
      const f = overrides?.family ?? family;
      const res = generateProceduralStyle({
        seed,
        mode: m,
        personalityType: p === 'Random' ? undefined : p,
        visualFamily: f === 'Auto' || !f ? undefined : f,
        locks: (overrides?.useLocks ?? true) && hasLocks ? locks : undefined,
        baseStyle: hasLocks ? (result?.style ?? currentStyle) : undefined
      });
      showResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.');
    }
  }, [mode, personality, family, locks, hasLocks, result, currentStyle, showResult]);

  // First render: reproduce the URL seed (and one level of remix lineage). Leaving the page clears the unsaved preview.
  useEffect(() => {
    const initialMode = urlMode ?? (startInSurpriseMode ? 'Experimental' : 'Coherent');
    if (urlChain) {
      try {
        const chain = decodeChain(urlChain);
        // Record every ancestor so the lineage view and future links stay complete.
        let previous: GeneratedStyleResult | null = null;
        for (let i = 0; i < chain.length; i++) {
          const res = reproduceChain(chain.slice(0, i + 1));
          if (!res) break;
          if (i < chain.length - 1) pushHistory(res);
          previous = res;
        }
        if (previous) {
          const locksFromUrl: GenerationLocks = {};
          for (const a of chain[chain.length - 1].kept) locksFromUrl[a] = true;
          setLocks(locksFromUrl);
          showResult(previous, false);
        } else {
          setError('Could not reproduce the shared style.');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not reproduce the shared style.');
      }
    } else {
      if (urlFamily) setFamily(urlFamily);
      run(urlSeed, { mode: initialMode, personality: urlPersonality ?? 'Random', useLocks: false, family: urlFamily });
    }
    return () => setPreviewStyle(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { writeJson('ui_explorer_generator_history_limit', historyLimit); }, [historyLimit]);

  const handleGenerate = () => run(randomSeed());
  const handleGenerateFromSeed = () => run(/^\d+$/.test(seedInput.trim()) ? Number(seedInput.trim()) : seedInput.trim());
  const handleSurprise = () => { setMode('Experimental'); setPersonality('Random'); run(randomSeed(), { mode: 'Experimental', personality: 'Random', useLocks: false }); };

  const handleRemix = () => {
    if (!result) return;
    try {
      const keep = RECIPE_AXES.filter((a) => locks[a]);
      const res = remixStyle({ base: result.style, seed: randomSeed(), strength: remixStrength, keep, mode });
      showResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Remix failed.');
    }
  };

  const handleVariations = () => {
    if (!result) return;
    const base = result.seedNumber;
    const list = [101, 202, 303].map((offset) =>
      generateProceduralStyle({ seed: base + offset, mode, baseStyle: result.style, locks: { colors: true, typography: true, ...locks }, personalityType: result.semantic.personality as PersonalityType })
    );
    setCandidates(list);
    setCandidatesLabel('Variations of the current style (colors and typography kept)');
  };

  const handleBatch = () => {
    const list = generateBatch(batchSize, {
      seed: randomSeed(), mode,
      personalityType: personality === 'Random' ? undefined : personality,
      visualFamily: family === 'Auto' ? undefined : family,
      locks: hasLocks ? locks : undefined,
      baseStyle: hasLocks ? (result?.style ?? currentStyle) : undefined
    });
    setCandidates(list);
    setCandidatesLabel(`${list.length} candidates (near-duplicates skipped)`);
  };

  const handleApply = (res: GeneratedStyleResult) => {
    // Disambiguate a display-name collision with an already saved style using the seed.
    const collision = availableStyles.some((s) => s.metadata.name === res.style.metadata.name && s.metadata.id !== res.style.metadata.id);
    const style = collision
      ? { ...res.style, metadata: { ...res.style.metadata, name: `${res.style.metadata.name} ${String(res.seedNumber).slice(-4)}` } }
      : res.style;
    addCustomStyle(style);
    setStyle(style.metadata.id);
  };

  const handleDuplicateEntry = (entry: HistoryEntry) => {
    const res = generateProceduralStyle({ seed: entry.seedNumber, mode: entry.mode, personalityType: entry.personality as PersonalityType });
    addCustomStyle({ ...res.style, metadata: { ...res.style.metadata, id: `${res.style.metadata.id}-copy-${Date.now().toString().slice(-4)}`, name: `${res.style.metadata.name} (Copy)` } });
  };

  const handleOpenEntry = (entry: HistoryEntry) => {
    const res = generateProceduralStyle({ seed: entry.seedNumber, mode: entry.mode, personalityType: entry.personality as PersonalityType });
    showResult(res);
  };

  const handleRemixEntry = (entry: HistoryEntry) => {
    const base = generateProceduralStyle({ seed: entry.seedNumber, mode: entry.mode, personalityType: entry.personality as PersonalityType });
    showResult(remixStyle({ base: base.style, seed: randomSeed(), strength: remixStrength, mode }));
  };

  const handleDeleteEntry = (seed: number) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.seedNumber !== seed);
      writeJson(STORAGE_KEYS.generatorHistory, next);
      return next;
    });
  };

  const copy = async (kind: 'seed' | 'link' | 'hash') => {
    if (!result) return;
    const text = kind === 'seed' ? String(result.seedNumber)
      : kind === 'hash' ? result.dnaHash
      : `${window.location.origin}/generator?${searchParams.toString()}`;
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleExport = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.style, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${result.style.metadata.id}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const lineage = useMemo(() => {
    if (!result) return [] as HistoryEntry[];
    const chain: HistoryEntry[] = [];
    let seed = result.style.generation?.parentSeed;
    const seen = new Set<number>();
    while (seed !== undefined && !seen.has(seed)) {
      seen.add(seed);
      const entry = history.find((h) => h.seedNumber === seed);
      if (!entry) break;
      chain.unshift(entry);
      seed = entry.parentSeed;
    }
    return chain;
  }, [result, history]);

  const similar = useMemo(() => (result ? findSimilarStyles(result.style, availableStyles, 4) : []), [result, availableStyles]);

  const toggleLock = (axis: RecipeAxis) => setLocks((prev) => ({ ...prev, [axis]: !prev[axis] }));

  const inspected = result?.trace.find((t) => t.axis === inspectAxis);

  return (
    <div className="ws-workspace gen-workspace">
      {/* ===== Controls ===== */}
      <aside className="ws-settings" aria-label="Generator controls">
        <div className="ws-settings__header">
          <h1 className="ws-title">Style Generator</h1>
          <p className="ws-subtitle">Deterministic design systems from a seed. Same seed, same style, every time.</p>
        </div>

        <div className="ws-settings__scroll">
          <WorkspaceSection title="Seed" icon={<Hash size={14} />}>
            <div className="gen-seed-row">
              <input
                className="ws-input"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateFromSeed(); }}
                aria-label="Seed"
                spellCheck={false}
              />
              <button type="button" className="ws-btn" onClick={handleGenerateFromSeed} title="Generate from this seed">Go</button>
            </div>
            <p className="ws-hint">Any text or number. Engine {GENERATOR_VERSION}.</p>
          </WorkspaceSection>

          <WorkspaceSection title="Mode" icon={<Sliders size={14} />}>
            <WorkspaceSegmented
              label="Generation mode"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'Coherent', label: 'Coherent', title: 'Strong compatibility weighting' },
                { value: 'Experimental', label: 'Experimental', title: 'Allows moderate tension' },
                { value: 'Extreme', label: 'Extreme', title: 'No compatibility weighting, no repair' }
              ]}
            />
            <p className="ws-hint">
              {mode === 'Coherent' && 'Pairings weighted toward compatibility; weak pairs are repaired.'}
              {mode === 'Experimental' && 'Balanced weighting; only incompatible pairs are repaired.'}
              {mode === 'Extreme' && 'Raw personality weights. Tension is allowed and never repaired.'}
            </p>
          </WorkspaceSection>

          <WorkspaceSection title="Personality" icon={<Wand2 size={14} />}>
            <label className="ws-field">
              <span className="ws-field__label">Mood</span>
              <select className="ws-select" value={personality} onChange={(e) => setPersonality(e.target.value as PersonalityType | 'Random')}>
                <option value="Random">Random</option>
                {PERSONALITY_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="ws-field">
              <span className="ws-field__label">Family</span>
              <select className="ws-select" value={family} onChange={(e) => setFamily(e.target.value)}>
                <option value="Auto">Auto</option>
                {families.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
          </WorkspaceSection>

          <WorkspaceSection title="Locks" icon={<Lock size={14} />}>
            <div className="gen-locks">
              {RECIPE_AXES.map((axis) => (
                <button
                  key={axis}
                  type="button"
                  className={`gen-lock ${locks[axis] ? 'gen-lock--locked' : ''}`}
                  aria-pressed={Boolean(locks[axis])}
                  onClick={() => toggleLock(axis)}
                >
                  {locks[axis] ? <Lock size={12} /> : <Unlock size={12} />}
                  <span>{AXIS_LABELS[axis]}</span>
                </button>
              ))}
            </div>
            <p className="ws-hint">Locked axes are kept from the current style when you generate or remix.</p>
          </WorkspaceSection>

          <WorkspaceSection title="Remix" icon={<Shuffle size={14} />}>
            <WorkspaceSegmented
              label="Remix strength"
              value={remixStrength}
              onChange={setRemixStrength}
              options={[
                { value: 'Subtle', label: 'Subtle', title: 'Changes 2 unlocked axes' },
                { value: 'Balanced', label: 'Balanced', title: 'Changes 4 unlocked axes' },
                { value: 'Strong', label: 'Strong', title: 'Changes every unlocked axis' }
              ]}
            />
            <button type="button" className="ws-btn" onClick={handleRemix} disabled={!result}>
              <Shuffle size={14} /> Remix current style
            </button>
          </WorkspaceSection>

          <WorkspaceSection title="Batch" icon={<Grid3x3 size={14} />} defaultOpen={false}>
            <WorkspaceSegmented
              label="Batch size"
              value={String(batchSize) as '5' | '10' | '20'}
              onChange={(v) => setBatchSize(Number(v) as 5 | 10 | 20)}
              options={[{ value: '5', label: '5' }, { value: '10', label: '10' }, { value: '20', label: '20' }]}
            />
            <button type="button" className="ws-btn" onClick={handleBatch}>
              <Layers size={14} /> Generate {batchSize} candidates
            </button>
          </WorkspaceSection>

          <div className="gen-actions">
            <button type="button" className="ws-btn ws-btn--primary gen-actions__btn" onClick={handleGenerate}>
              <Sparkles size={16} /> Generate new style
            </button>
            <button type="button" className="ws-btn gen-actions__btn" onClick={handleSurprise}>
              <Shuffle size={16} /> Surprise me
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Result stage ===== */}
      <section className="ws-stage" aria-label="Generated style">
        <header className="ws-stage__bar">
          <div className="ws-stage__status" aria-live="polite">
            <span className="ws-stage__dot" aria-hidden="true" />
            {result ? `${result.style.metadata.name} · seed ${result.seedNumber} · ${result.mode}${result.fromCache ? ' · cached' : ''}` : 'Generating…'}
          </div>
          <div className="gen-actionbar">
            <button type="button" className="ws-btn ws-btn--primary" onClick={() => result && handleApply(result)} disabled={!result}><Save size={14} /> Use & save</button>
            <button type="button" className="ws-btn" onClick={handleVariations} disabled={!result}><Layers size={14} /> 3 variations</button>
            <button type="button" className="ws-btn" onClick={() => copy('seed')} disabled={!result}>{copied === 'seed' ? <Check size={14} /> : <Copy size={14} />} Seed</button>
            <button type="button" className="ws-btn" onClick={() => copy('link')} disabled={!result}>{copied === 'link' ? <Check size={14} /> : <Link2 size={14} />} Share link</button>
            <button type="button" className="ws-btn" onClick={handleExport} disabled={!result}><Download size={14} /> JSON</button>
          </div>
        </header>

        <div className="ws-stage__body">
          {error && <div className="ws-error" role="alert">{error}</div>}

          {result && (
            <div className="gen-result">
              {/* Live preview: the whole page canvas is already themed by the generated style */}
              <div className="gen-preview">
                <StylePreviewCard style={result.style} size="hero" />
                <div className="gen-preview__meta">
                  <div className="gen-preview__title">
                    <h2>{result.style.metadata.name}</h2>
                    <Badge variant="accent">{result.semantic.personality}</Badge>
                    <Badge variant="outline">{result.semantic.visualFamily}</Badge>
                    <Badge variant={result.accessibility.wcagRating === 'Fail' ? 'error' : result.accessibility.wcagRating === 'AA Large' ? 'warning' : 'success'}>
                      {result.accessibility.wcagRating} · {result.accessibility.textPrimaryRatio}:1
                    </Badge>
                  </div>
                  <p className="gen-preview__desc">{result.style.metadata.description}</p>
                  <div className="gen-trace">
                    <span>Seed {result.seedNumber}</span>
                    <span>Personality {result.semantic.personality}</span>
                    <span>Material {result.recipe.surface}</span>
                    <span>Palette {result.recipe.colorHarmony}</span>
                    <span>Type {result.recipe.typography}</span>
                    <span>Motion {result.recipe.motion}</span>
                    <span>SVG {result.semantic.svg.shapeLanguage}</span>
                    <button type="button" className="gen-trace__hash" onClick={() => copy('hash')} title="Copy DNA hash">
                      <Fingerprint size={12} /> {result.dnaHash} {copied === 'hash' && <Check size={12} />}
                    </button>
                  </div>
                  {lineage.length > 0 && (
                    <div className="gen-lineage" aria-label="Remix lineage">
                      <GitBranch size={12} />
                      {lineage.map((l) => (
                        <button key={l.seedNumber} type="button" className="gen-lineage__node" onClick={() => handleOpenEntry(l)}>{l.name}</button>
                      ))}
                      <span className="gen-lineage__node gen-lineage__node--current">{result.style.metadata.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Detail tabs */}
              <div className="ws-panel gen-detail">
                <div className="ws-tabs" role="tablist">
                  {([
                    ['recipe', 'Recipe', <ListTree size={14} key="i" />],
                    ['why', 'Why this style?', <Wand2 size={14} key="i" />],
                    ['constraints', 'Constraints', <Lock size={14} key="i" />],
                    ['dna', 'Style DNA', <Dna size={14} key="i" />],
                    ['similar', 'Similar', <Layers size={14} key="i" />],
                    ['debug', 'Debug', <Bug size={14} key="i" />]
                  ] as [ResultTab, string, React.ReactNode][]).map(([id, label, icon]) => (
                    <button key={id} type="button" role="tab" aria-selected={tab === id} className={`ws-tab ${tab === id ? 'ws-tab--active' : ''}`} onClick={() => setTab(id)}>
                      {icon} {label}
                    </button>
                  ))}
                </div>

                {tab === 'recipe' && (
                  <dl className="ws-kv">
                    <dt>Personality</dt><dd>{result.recipe.personality}</dd>
                    <dt>Visual family</dt><dd>{result.recipe.visualFamily}</dd>
                    <dt>Palette</dt><dd>{result.recipe.colorHarmony} · <span className="gen-swatch" style={{ background: result.style.tokens.colors.bg }} /> <span className="gen-swatch" style={{ background: result.style.tokens.colors.surface }} /> <span className="gen-swatch" style={{ background: result.style.tokens.colors.accent }} /> {result.style.tokens.colors.accent}</dd>
                    <dt>Typography</dt><dd>{result.recipe.typography} {result.semantic.typography.headingWeight} / body {result.semantic.typography.family.split(',')[0]} {result.semantic.typography.bodyWeight}, {result.semantic.typography.scale} scale</dd>
                    <dt>Surface</dt><dd>{result.recipe.surface}{result.style.tokens.materials?.backdropBlur ? ` · blur ${result.style.tokens.materials.backdropBlur}` : ''}{result.style.tokens.materials?.texture ? ` · ${result.style.tokens.materials.texture}` : ''}</dd>
                    <dt>Depth</dt><dd>{result.recipe.depth} · {result.style.tokens.shadows.md}</dd>
                    <dt>Geometry</dt><dd>{result.recipe.geometry} · {result.semantic.density} density</dd>
                    <dt>Border</dt><dd>{result.recipe.border} · {result.style.tokens.borders.width} {result.style.tokens.borders.style}</dd>
                    <dt>Icons</dt><dd>{result.recipe.icons} · stroke {result.style.tokens.icons?.strokeWidth}</dd>
                    <dt>Motion</dt><dd>{result.recipe.motion} · {result.style.tokens.motion.durationNormal} {result.style.tokens.motion.easing}</dd>
                    <dt>Behaviour</dt><dd>{result.recipe.behavior} · hover {result.style.behavior?.buttonHoverAction}, focus {result.style.behavior?.focusRingStyle}</dd>
                    <dt>SVG</dt><dd>{result.recipe.svg} · glow {result.semantic.svg.glowLevel}, grid {result.semantic.svg.gridLevel}, noise {result.semantic.svg.noiseLevel}</dd>
                  </dl>
                )}

                {tab === 'why' && (
                  <ul className="gen-why">
                    {result.explanations.map((line, i) => <li key={i}>{line}</li>)}
                  </ul>
                )}

                {tab === 'constraints' && (
                  <div className="gen-constraints">
                    {RECIPE_AXES.map((axis) => (
                      <div key={axis} className="gen-constraint">
                        <span>{AXIS_LABELS[axis]}</span>
                        <span className={`gen-constraint__state ${locks[axis] ? 'gen-constraint__state--locked' : ''}`}>
                          {locks[axis] ? <><Lock size={12} /> Locked</> : <><Unlock size={12} /> Open</>}
                        </span>
                      </div>
                    ))}
                    <p className="ws-hint">Locks apply to the next generation or remix and are kept from the style shown above.</p>
                  </div>
                )}

                {tab === 'dna' && (
                  <div className="gen-dna">
                    {DNA_AXES.map((axis) => (
                      <div key={axis} className="gen-dna__row">
                        <span className="gen-dna__label">{axis}</span>
                        <div className="gen-dna__track" aria-hidden="true">
                          <div className="gen-dna__fill" style={{ width: `${result.dna[axis] * 10}%` }} />
                        </div>
                        <span className="gen-dna__value">{result.dna[axis].toFixed(1)}</span>
                      </div>
                    ))}
                    <p className="ws-hint">A description of the style's characteristics, not a score. Fingerprint {result.dnaHash}.</p>
                  </div>
                )}

                {tab === 'similar' && (
                  <div className="gen-similar">
                    {similar.map((s) => (
                      <div key={s.style.metadata.id} className="gen-similar__item">
                        <StylePreviewCard style={s.style} size="thumb" onClick={() => setStyle(s.style.metadata.id)} />
                        <span className="gen-similar__name">{s.style.metadata.name}</span>
                        <span className="gen-similar__shared">{s.shared.length > 0 ? `Shares ${s.shared.join(', ')}` : 'Few shared traits'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'debug' && (
                  <div className="gen-debug">
                    <dl className="ws-kv">
                      <dt>Seed</dt><dd>{result.seedNumber}</dd>
                      <dt>Generator</dt><dd>{result.generatorVersion}</dd>
                      <dt>Mode</dt><dd>{result.mode}</dd>
                      <dt>Coherence</dt><dd>{result.coherence.score.toFixed(2)} (internal)</dd>
                      <dt>Weakest pairing</dt><dd>{result.coherence.weakestAxis ? `${result.coherence.weakestAxis} (${result.coherence.weakestRelation})` : 'none below neutral'}</dd>
                      <dt>Repairs</dt><dd>{result.repairIterations}{result.repairedAxes.length > 0 ? ` · ${result.repairedAxes.join(', ')}` : ''}</dd>
                      <dt>Cache</dt><dd>{result.fromCache ? 'hit' : 'miss'}</dd>
                    </dl>
                    <div className="gen-relations">
                      {result.coherence.relations.map((r) => (
                        <div key={r.label} className={`gen-relation gen-relation--${r.relation}`}>
                          <span>{r.label}</span>
                          <span>{r.relation > 0 ? `+${r.relation}` : r.relation}</span>
                        </div>
                      ))}
                    </div>
                    <div className="gen-inspector">
                      <label className="ws-field">
                        <span className="ws-field__label">Why…</span>
                        <select className="ws-select" value={inspectAxis} onChange={(e) => setInspectAxis(e.target.value)}>
                          {result.trace.filter((t) => t.candidates.length > 0).map((t) => <option key={`${t.axis}-${t.chosen}`} value={t.axis}>{t.axis}: {t.chosen}</option>)}
                        </select>
                      </label>
                      {inspected && (
                        <table className="gen-inspector__table">
                          <thead><tr><th>Candidate</th><th>Base</th><th>Factor</th><th>Final</th><th>Reasons</th></tr></thead>
                          <tbody>
                            {[...inspected.candidates].sort((a, b) => b.finalWeight - a.finalWeight).map((c) => (
                              <tr key={c.value} className={c.value === inspected.chosen || inspected.chosen.startsWith(c.value) ? 'gen-inspector__chosen' : ''}>
                                <td>{c.value}</td><td>{c.baseWeight}</td><td>×{c.factor.toFixed(2)}</td><td>{c.finalWeight.toFixed(1)}</td>
                                <td>{c.reasons.length > 0 ? c.reasons.join('; ') : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Candidates */}
              <div className="ws-panel">
                <div className="ws-panel__title">{candidates.length > 0 ? candidatesLabel : 'Candidates'}</div>
                {candidates.length === 0 ? (
                  <div className="ws-empty">Generate 3 variations or a batch to compare candidates side by side. Same layout, same data, different visual systems.</div>
                ) : (
                  <div className="gen-candidates">
                    {candidates.map((c) => (
                      <div key={c.seedNumber} className="gen-candidate">
                        <StylePreviewCard style={c.style} size="thumb" onClick={() => showResult(c)} />
                        <div className="gen-candidate__meta">
                          <span className="gen-candidate__name">{c.style.metadata.name}</span>
                          <span className="gen-candidate__seed">#{c.seedNumber}</span>
                        </div>
                        <div className="gen-candidate__actions">
                          <button type="button" className="ws-btn ws-btn--sm" onClick={() => showResult(c)}>Open</button>
                          <button type="button" className="ws-btn ws-btn--sm" onClick={() => handleApply(c)}>Save</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History */}
              <div className="ws-panel">
                <div className="gen-history__head">
                  <div className="ws-panel__title"><History size={12} /> Generation history ({history.length})</div>
                  <label className="gen-history__limit">
                    Keep
                    <select className="ws-select" value={historyLimit} onChange={(e) => setHistoryLimit(Number(e.target.value))}>
                      {HISTORY_LIMITS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                </div>
                {history.length === 0 ? (
                  <div className="ws-empty">Nothing generated yet.</div>
                ) : (
                  <div className="gen-history">
                    {history.map((h) => {
                      const preview = generateProceduralStyle({ seed: h.seedNumber, mode: h.mode, personalityType: h.personality as PersonalityType });
                      return (
                        <div key={h.seedNumber} className={`gen-history__item ${result.seedNumber === h.seedNumber ? 'gen-history__item--current' : ''}`}>
                          <StylePreviewCard style={preview.style} size="thumb" onClick={() => handleOpenEntry(h)} />
                          <div className="gen-history__meta">
                            <span className="gen-history__name">{h.name}</span>
                            <span className="gen-history__sub">#{h.seedNumber} · {h.mode} · {new Date(h.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="gen-candidate__actions">
                            <button type="button" className="ws-btn ws-btn--sm" onClick={() => handleOpenEntry(h)}>Open</button>
                            <button type="button" className="ws-btn ws-btn--sm" onClick={() => handleRemixEntry(h)}>Remix</button>
                            <button type="button" className="ws-btn ws-btn--sm" onClick={() => handleDuplicateEntry(h)}>Duplicate</button>
                            <button type="button" className="ws-btn ws-btn--sm ws-btn--danger" onClick={() => handleDeleteEntry(h.seedNumber)} aria-label={`Delete ${h.name}`}><Trash2 size={12} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="ws-empty">Generating your first style…</div>
          )}
        </div>
      </section>
    </div>
  );
};

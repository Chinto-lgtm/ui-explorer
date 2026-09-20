import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStyle } from '../../hooks/useStyle';
import { generateProceduralStyle } from '../../engine/generator/generator';
import type { GenerationMode, GenerationLocks, GeneratedStyleResult } from '../../engine/generator/generator';
import type { PersonalityType } from '../../engine/generator/personalities';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Sparkles, Shuffle, Lock, Unlock, Copy, Check, HelpCircle, Layers } from 'lucide-react';
import './GeneratorPage.css';

export const GeneratorPage: React.FC = () => {
  const { setStyle, addCustomStyle } = useStyle();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSeed = searchParams.get('seed') || '847291';
  const [seed, setSeed] = useState<string>(initialSeed);
  const [mode, setMode] = useState<GenerationMode>('Coherent');
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityType | 'Random'>('Random');

  const [locks, setLocks] = useState<GenerationLocks>({
    colors: false,
    typography: false,
    geometry: false,
    depth: false,
    motion: false
  });

  const [currentResult, setCurrentResult] = useState<GeneratedStyleResult | null>(null);
  const [variations, setVariations] = useState<GeneratedStyleResult[]>([]);
  const [history, setHistory] = useState<GeneratedStyleResult[]>(() => {
    const saved = localStorage.getItem('ui_explorer_generator_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [copiedSeed, setCopiedSeed] = useState(false);
  const [showWhyPanel, setShowWhyPanel] = useState(false);

  const toggleLock = (key: keyof GenerationLocks) => {
    setLocks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const runGenerator = (targetSeed: string | number, targetMode: GenerationMode = mode) => {
    const res = generateProceduralStyle({
      seed: targetSeed,
      mode: targetMode,
      personalityType: selectedPersonality === 'Random' ? undefined : selectedPersonality,
      locks: locks.colors || locks.typography || locks.geometry || locks.depth || locks.motion ? locks : undefined,
      baseStyle: currentResult ? currentResult.style : undefined
    });

    setCurrentResult(res);
    setStyle(res.style.metadata.id);

    // Persist to history
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.seedNumber !== res.seedNumber);
      const updated = [res, ...filtered].slice(0, 30);
      localStorage.setItem('ui_explorer_generator_history', JSON.stringify(updated));
      return updated;
    });

    setSearchParams({ seed: String(res.seedNumber) });
  };

  useEffect(() => {
    runGenerator(initialSeed, 'Coherent');
  }, []);

  const handleGenerateClick = () => {
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    setSeed(String(newSeed));
    runGenerator(newSeed);
  };

  const handleSurpriseMe = () => {
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    setSeed(String(newSeed));
    setSelectedPersonality('Random');
    setMode('Experimental');
    runGenerator(newSeed, 'Experimental');
  };

  const handleGenerateVariations = () => {
    if (!currentResult) return;
    const base = currentResult.seedNumber;
    const var1 = generateProceduralStyle({ seed: base + 101, mode, baseStyle: currentResult.style });
    const var2 = generateProceduralStyle({ seed: base + 202, mode, baseStyle: currentResult.style });
    const var3 = generateProceduralStyle({ seed: base + 303, mode, baseStyle: currentResult.style });
    setVariations([var1, var2, var3]);
  };

  const handleCopySeed = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(String(currentResult.seedNumber));
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 1500);
  };

  const handleApplyStyle = (res: GeneratedStyleResult) => {
    addCustomStyle(res.style);
    setStyle(res.style.metadata.id);
  };

  return (
    <div className="generator-page">
      <div className="gen-header">
        <div>
          <h1 className="gen-title">Procedural Style Synthesis Engine</h1>
          <p className="gen-subtitle">
            Algorithmic, deterministic design system generation powered by seeded Mulberry32 PRNG and rule matrices.
          </p>
        </div>
        <div className="gen-seed-badge">
          <span>SEED #{currentResult?.seedNumber || seed}</span>
          <Button variant="outline" size="sm" icon={copiedSeed ? <Check size={14} /> : <Copy size={14} />} onClick={handleCopySeed}>
            {copiedSeed ? 'Copied' : 'Copy Seed'}
          </Button>
        </div>
      </div>

      {/* Main Generator Grid */}
      <div className="gen-grid">
        {/* Controls Column */}
        <div className="gen-controls-col">
          <Card>
            <CardHeader><CardTitle>Generator Controls</CardTitle></CardHeader>
            <CardBody className="gen-controls-body">
              {/* Mode Selector */}
              <div className="gen-field">
                <label>Generation Mode:</label>
                <div className="mode-btn-group">
                  {(['Coherent', 'Experimental', 'Extreme'] as GenerationMode[]).map((m) => (
                    <button
                      key={m}
                      className={`mode-btn ${mode === m ? 'mode-btn--active' : ''}`}
                      onClick={() => setMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personality Filter */}
              <div className="gen-field">
                <label>Target Personality:</label>
                <select
                  value={selectedPersonality}
                  onChange={(e) => setSelectedPersonality(e.target.value as any)}
                  className="shell-select"
                >
                  <option value="Random">Random / Auto-Select</option>
                  <option value="Calm">Calm</option>
                  <option value="Professional">Professional</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Technical">Technical</option>
                  <option value="Futuristic">Futuristic</option>
                  <option value="Playful">Playful</option>
                  <option value="Organic">Organic</option>
                  <option value="Editorial">Editorial</option>
                  <option value="Dark">Dark</option>
                  <option value="Experimental">Experimental</option>
                </select>
              </div>

              {/* Locks Section */}
              <div className="gen-field">
                <label>Property Locks (Preserve across generations):</label>
                <div className="locks-grid">
                  {(['colors', 'typography', 'geometry', 'depth', 'motion'] as (keyof GenerationLocks)[]).map((lockKey) => (
                    <button
                      key={lockKey}
                      className={`lock-chip ${locks[lockKey] ? 'lock-chip--locked' : ''}`}
                      onClick={() => toggleLock(lockKey)}
                    >
                      {locks[lockKey] ? <Lock size={12} /> : <Unlock size={12} />}
                      <span>{lockKey.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="gen-actions-group">
                <Button variant="primary" icon={<Sparkles size={16} />} onClick={handleGenerateClick} fullWidth>
                  Synthesize New Style
                </Button>
                <div className="gen-sub-actions">
                  <Button variant="secondary" icon={<Shuffle size={16} />} onClick={handleSurpriseMe}>
                    Surprise Me!
                  </Button>
                  <Button variant="outline" icon={<Layers size={16} />} onClick={handleGenerateVariations}>
                    3 Variations
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recipe & Explanation Output Column */}
        <div className="gen-output-col">
          {currentResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{currentResult.style.metadata.name}</CardTitle>
                  <Badge variant="accent">{currentResult.recipe.personality}</Badge>
                </CardHeader>
                <CardBody className="recipe-body">
                  <div className="recipe-grid">
                    <div className="recipe-item">
                      <span className="recipe-label">Colors</span>
                      <span className="recipe-val">{currentResult.recipe.colorHarmony}</span>
                      <div className="swatch-row" style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                        <span className="swatch" style={{ backgroundColor: currentResult.style.tokens.colors.bg, width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #64748b' }} />
                        <span className="swatch" style={{ backgroundColor: currentResult.style.tokens.colors.surface, width: '16px', height: '16px', borderRadius: '4px', border: '1px solid #64748b' }} />
                        <span className="swatch" style={{ backgroundColor: currentResult.style.tokens.colors.accent, width: '16px', height: '16px', borderRadius: '4px' }} />
                      </div>
                    </div>

                    <div className="recipe-item">
                      <span className="recipe-label">Typography</span>
                      <span className="recipe-val">{currentResult.recipe.typography}</span>
                    </div>

                    <div className="recipe-item">
                      <span className="recipe-label">Surface & Depth</span>
                      <span className="recipe-val">{currentResult.recipe.surface} • {currentResult.recipe.depth}</span>
                    </div>

                    <div className="recipe-item">
                      <span className="recipe-label">WCAG Rating</span>
                      <Badge variant={currentResult.accessibility.wcagRating === 'AAA' || currentResult.accessibility.wcagRating === 'AA' ? 'success' : 'warning'}>
                        {currentResult.accessibility.wcagRating} ({currentResult.accessibility.textPrimaryRatio}:1)
                      </Badge>
                    </div>
                  </div>

                  <div className="recipe-btn-row">
                    <Button variant="primary" icon={<Check size={16} />} onClick={() => handleApplyStyle(currentResult)}>
                      Apply & Save Style
                    </Button>
                    <Button variant="outline" icon={<HelpCircle size={16} />} onClick={() => setShowWhyPanel(!showWhyPanel)}>
                      Why This Style?
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* Transparent "Why This Style?" Panel */}
              {showWhyPanel && (
                <Card className="why-panel">
                  <CardHeader><CardTitle>Rule-Based Synthesis Rationale</CardTitle></CardHeader>
                  <CardBody>
                    <ul className="why-list">
                      {currentResult.explanations.map((exp, idx) => (
                        <li key={idx}>{exp}</li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Variations Row */}
      {variations.length > 0 && (
        <section className="variations-section">
          <h2>Seed Variations (3 Candidate Systems)</h2>
          <div className="variations-grid">
            {variations.map((v, idx) => (
              <Card key={idx} hoverable onClick={() => handleApplyStyle(v)}>
                <CardHeader>
                  <CardTitle>{v.style.metadata.name}</CardTitle>
                  <Badge variant="outline">Seed #{v.seedNumber}</Badge>
                </CardHeader>
                <CardBody>
                  <p>{v.recipe.typography} • {v.recipe.colorHarmony}</p>
                  <Button variant="secondary" size="sm" style={{ marginTop: '0.75rem' }}>Select Variation</Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* History Drawer Feed */}
      <section className="history-section">
        <h2>Generation History ({history.length})</h2>
        <div className="history-grid">
          {history.map((h, i) => (
            <div key={i} className="history-card" onClick={() => handleApplyStyle(h)}>
              <span className="history-title">{h.style.metadata.name}</span>
              <span className="history-seed">#{h.seedNumber}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

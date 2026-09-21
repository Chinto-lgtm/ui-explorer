import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette, Image as ImageIcon, Type, Square, Layers, Minus, Box, LayoutGrid, Shapes, Zap, MousePointerClick,
  Undo2, Redo2, Save, RotateCcw, Trash2, Copy, Download, Link2, Check, Pencil, Sparkles
} from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { useStyleEditor, getPath } from './useStyleEditor';
import { WorkspaceSection, WorkspaceSegmented } from '../../components/workspace/Workspace';
import { ColorPicker } from '../../components/ui/ColorPicker';
import { Slider } from '../../components/ui/Selection';
import { Modal } from '../../components/ui/Overlay';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Toggle, Checkbox, Segmented } from '../../components/ui/Selection';
import { Tabs } from '../../components/ui/Navigation';
import { Alert, Progress } from '../../components/ui/Feedback';
import { LineChart } from '../../components/charts/LineChart';
import { StylePreviewCard } from '../../components/preview/StylePreviewCard';
import { SAVE_EVENT } from '../../components/layout/AppShell';
import { buildShareUrl } from '../../engine/share';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { generateProceduralStyle } from '../../engine/generator/generator';
import {
  materializeGeometry, materializeDepth, materializeBorder, materializeSurface, materializeMotion, materializeIcons, materializeTypography
} from '../../engine/generator/vocab';
import type { GeometryType, DepthType, BorderType, SurfaceType, MotionType, IconType } from '../../engine/generator/vocab';
import type { StyleDefinition, ComponentBehavior } from '../../engine/types';
import { makeSeries } from '../../components/charts/chartUtils';
import { STORAGE_KEYS, removeKey } from '../../engine/storage';
import './CustomizerPage.css';

const FONTS = ['Inter', 'Geist', 'DM Sans', 'Manrope', 'Poppins', 'Space Grotesk', 'Plus Jakarta Sans', 'IBM Plex Sans', 'Playfair Display', 'Georgia', 'Helvetica Neue', 'Roboto', 'Orbitron', 'System Sans', 'Monospace'];
const fontStack = (name: string) => name === 'System Sans' ? 'system-ui, -apple-system, Segoe UI, sans-serif' : name === 'Monospace' ? 'JetBrains Mono, Fira Code, monospace' : /Georgia|Playfair/.test(name) ? `${name}, serif` : `${name}, sans-serif`;
const fontName = (stack: string) => { const first = stack.split(',')[0].trim(); return FONTS.find((f) => f.toLowerCase() === first.toLowerCase()) ?? (/mono/i.test(stack) ? 'Monospace' : /system-ui/.test(stack) ? 'System Sans' : first); };

const COLOR_FIELDS: { key: string; label: string; token: string; contrast?: 'bg' | 'surface' }[] = [
  { key: 'bg', label: 'Background', token: '--color-bg' }, { key: 'surface', label: 'Surface', token: '--color-surface' }, { key: 'accent', label: 'Primary / accent', token: '--color-accent', contrast: 'bg' },
  { key: 'accentHover', label: 'Secondary (accent hover)', token: '--color-accent-hover' }, { key: 'accentText', label: 'Text on accent', token: '--color-accent-text' },
  { key: 'textPrimary', label: 'Text', token: '--color-text-primary', contrast: 'bg' }, { key: 'textSecondary', label: 'Muted text', token: '--color-text-secondary', contrast: 'surface' },
  { key: 'border', label: 'Border', token: '--color-border' }, { key: 'success', label: 'Success', token: '--color-success', contrast: 'bg' }, { key: 'warning', label: 'Warning', token: '--color-warning', contrast: 'bg' },
  { key: 'error', label: 'Error', token: '--color-error', contrast: 'bg' }, { key: 'info', label: 'Info', token: '--color-info', contrast: 'bg' }
];

type BackgroundMode = 'solid' | 'linear' | 'radial' | 'mesh' | 'abstract' | 'transparent' | 'custom';

const backgroundFor = (mode: BackgroundMode, style: StyleDefinition, custom: string): string | undefined => {
  const { accent, accentHover } = style.tokens.colors;
  switch (mode) {
    case 'solid': return undefined;
    case 'linear': return `linear-gradient(160deg, color-mix(in srgb, ${accent} 18%, transparent), transparent 60%)`;
    case 'radial': return `radial-gradient(70% 60% at 20% 10%, color-mix(in srgb, ${accent} 22%, transparent), transparent 70%)`;
    case 'mesh': return `radial-gradient(50% 45% at 15% 15%, color-mix(in srgb, ${accent} 26%, transparent), transparent 70%), radial-gradient(45% 40% at 85% 80%, color-mix(in srgb, ${accentHover} 22%, transparent), transparent 70%), radial-gradient(35% 35% at 70% 20%, color-mix(in srgb, ${accent} 14%, transparent), transparent 70%)`;
    case 'abstract': return `conic-gradient(from 210deg at 80% 10%, color-mix(in srgb, ${accent} 20%, transparent), transparent 35%, color-mix(in srgb, ${accentHover} 16%, transparent) 60%, transparent)`;
    case 'transparent': return 'linear-gradient(45deg, rgba(128,128,128,0.08) 25%, transparent 25%, transparent 75%, rgba(128,128,128,0.08) 75%), linear-gradient(45deg, rgba(128,128,128,0.08) 25%, transparent 25%, transparent 75%, rgba(128,128,128,0.08) 75%)';
    case 'custom': return custom || undefined;
    default: return undefined;
  }
};

const inferBackgroundMode = (img: string | undefined): BackgroundMode =>
  !img ? 'solid' : img.startsWith('conic') ? 'abstract' : img.includes('rgba(128,128,128,0.08) 25%') ? 'transparent' : img.split('radial-gradient').length > 2 ? 'mesh' : img.startsWith('radial') ? 'radial' : img.startsWith('linear-gradient(160deg') ? 'linear' : 'custom';

export const CustomizerPage: React.FC = () => {
  const { currentStyle, addCustomStyle, deleteCustomStyle, renameCustomStyle, duplicateStyle, setPreviewStyle, availableStyles, setStyle } = useStyle();
  const navigate = useNavigate();
  const editor = useStyleEditor(currentStyle);
  const { draft, set, setMany, dirty, isChanged, resetPath, resetSection, resetAll, undo, redo, canUndo, canRedo } = editor;

  const [saveOpen, setSaveOpen] = useState(false);
  const [resetAllOpen, setResetAllOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saveTags, setSaveTags] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bgMode, setBgMode] = useState<BackgroundMode>(() => inferBackgroundMode(currentStyle.tokens.materials?.backgroundImage));
  const [customBg, setCustomBg] = useState('');
  const [previewTab, setPreviewTab] = useState('overview');

  const isCustom = Boolean(draft.metadata.isCustom);
  const generated = draft.generation?.seed !== undefined ? generateProceduralStyle({ seed: draft.generation.seed, mode: draft.generation.mode as 'Coherent', personalityType: draft.generation.personality as never }).style : null;

  // The whole app canvas previews the draft while editing.
  useEffect(() => { setPreviewStyle(dirty ? draft : undefined); }, [draft, dirty, setPreviewStyle]);
  useEffect(() => () => setPreviewStyle(undefined), [setPreviewStyle]);
  useEffect(() => { setBgMode(inferBackgroundMode(currentStyle.tokens.materials?.backgroundImage)); }, [currentStyle]);

  // Keyboard: undo / redo and Ctrl+S save.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    };
    const onSave = () => openSave();
    window.addEventListener('keydown', onKey);
    window.addEventListener(SAVE_EVENT, onSave);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener(SAVE_EVENT, onSave); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo, draft]);

  const openSave = () => {
    setSaveName(isCustom ? draft.metadata.name : `${draft.metadata.name} (Custom)`);
    setSaveDesc(draft.metadata.description);
    setSaveTags(draft.metadata.tags.join(', '));
    setSaveOpen(true);
  };

  const save = () => {
    const id = isCustom ? draft.metadata.id : `${draft.metadata.id}-custom-${Date.now().toString().slice(-5)}`;
    const next: StyleDefinition = {
      ...draft,
      metadata: {
        ...draft.metadata,
        id,
        name: saveName.trim() || draft.metadata.name,
        description: saveDesc.trim(),
        tags: saveTags.split(',').map((t) => t.trim()).filter(Boolean),
        category: isCustom ? draft.metadata.category : 'Custom',
        isCustom: true,
        source: draft.metadata.source === 'generated' ? 'generated' : 'custom'
      }
    };
    addCustomStyle(next);
    editor.reset(next);
    setSaveOpen(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const rename = () => { if (isCustom) renameCustomStyle(draft.metadata.id, saveName, saveDesc, saveTags.split(',').map((t) => t.trim()).filter(Boolean)); };

  const duplicate = () => {
    const copy = duplicateStyle(draft.metadata.id);
    if (copy) editor.reset(copy);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${draft.metadata.id}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const isBuiltIn = !isCustom && !dirty && availableStyles.some((s) => s.metadata.id === draft.metadata.id);
    try { await navigator.clipboard.writeText(buildShareUrl(draft, isBuiltIn)); } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const resetEverything = () => {
    removeKey(STORAGE_KEYS.customStyles);
    removeKey(STORAGE_KEYS.settings);
    removeKey(STORAGE_KEYS.favorites);
    removeKey(STORAGE_KEYS.recentStyles);
    removeKey(STORAGE_KEYS.generatorHistory);
    removeKey(STORAGE_KEYS.styleId);
    window.location.href = '/';
  };

  const applyBackground = (mode: BackgroundMode, custom = customBg) => {
    setBgMode(mode);
    set('tokens.materials.backgroundImage', backgroundFor(mode, draft, custom));
  };

  const colors = draft.tokens.colors;
  const resolved = useMemo(() => resolveStyleToCssVars(draft), [draft]);
  const typo = draft.tokens.typography;
  const sample = useMemo(() => [makeSeries('Revenue', 8, 3)], []);

  const ResetBtn: React.FC<{ path: string; label?: string }> = ({ path, label }) => (
    isChanged(path) ? <button type="button" className="cz-reset" onClick={() => resetPath(path)} title={`Reset ${label ?? path}`}><RotateCcw size={11} /> Reset</button> : null
  );
  const GenBtn: React.FC<{ path: string }> = ({ path }) => (
    generated && JSON.stringify(getPath(generated, path)) !== JSON.stringify(getPath(draft, path))
      ? <button type="button" className="cz-reset cz-reset--gen" onClick={() => set(path, getPath(generated, path))} title="Reset to the generated value"><Sparkles size={11} /> Generated</button>
      : null
  );
  const SectionHead: React.FC<{ path: string }> = ({ path }) => (
    isChanged(path) ? <button type="button" className="cz-reset cz-reset--section" onClick={() => resetSection(path)}><RotateCcw size={11} /> Reset section</button> : null
  );

  return (
    <div className="ws-workspace cz-workspace">
      <aside className="ws-settings" aria-label="Style customizer controls">
        <div className="ws-settings__header cz-header">
          <div>
            <h1 className="ws-title">Style Customizer</h1>
            <p className="ws-subtitle">{draft.metadata.name}{dirty ? ' · unsaved changes' : ''}</p>
          </div>
          <div className="cz-history">
            <button type="button" className="ws-btn ws-btn--sm" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)"><Undo2 size={14} /></button>
            <button type="button" className="ws-btn ws-btn--sm" onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z)"><Redo2 size={14} /></button>
          </div>
        </div>

        <div className="ws-settings__scroll">
          <WorkspaceSection title="Colors" icon={<Palette size={14} />}>
            <SectionHead path="tokens.colors" />
            {COLOR_FIELDS.map((f) => (
              <div key={f.key} className="cz-field">
                <ColorPicker
                  label={f.label}
                  value={(colors as unknown as Record<string, string | undefined>)[f.key] ?? resolved[f.token]}
                  onChange={(v) => set(`tokens.colors.${f.key}`, v)}
                  contrastWith={f.contrast === 'bg' ? colors.bg : f.contrast === 'surface' ? colors.surface : undefined}
                />
                <div className="cz-field__resets"><ResetBtn path={`tokens.colors.${f.key}`} label={f.label} /><GenBtn path={`tokens.colors.${f.key}`} /></div>
              </div>
            ))}
          </WorkspaceSection>

          <WorkspaceSection title="Background" icon={<ImageIcon size={14} />} defaultOpen={false}>
            <SectionHead path="tokens.materials.backgroundImage" />
            <label className="ws-field"><span className="ws-field__label">Mode</span>
              <select className="ws-select" value={bgMode} onChange={(e) => applyBackground(e.target.value as BackgroundMode)}>
                {(['solid', 'linear', 'radial', 'mesh', 'abstract', 'transparent', 'custom'] as BackgroundMode[]).map((m) => <option key={m} value={m}>{m[0].toUpperCase() + m.slice(1)}{m === 'linear' || m === 'radial' ? ' gradient' : ''}</option>)}
              </select>
            </label>
            {bgMode === 'custom' && (
              <input className="ws-input" placeholder="linear-gradient(…)" value={customBg} onChange={(e) => { setCustomBg(e.target.value); applyBackground('custom', e.target.value); }} aria-label="Custom background image" />
            )}
            <p className="ws-hint">Layered over the background colour; tints use the accent.</p>
          </WorkspaceSection>

          <WorkspaceSection title="Typography" icon={<Type size={14} />} defaultOpen={false}>
            <SectionHead path="tokens.typography" />
            <label className="ws-field"><span className="ws-field__label">Body</span>
              <select className="ws-select" value={fontName(typo.fontFamilySans)} onChange={(e) => set('tokens.typography.fontFamilySans', fontStack(e.target.value))}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="ws-field"><span className="ws-field__label">Heading</span>
              <select className="ws-select" value={fontName(typo.fontFamilyHeading ?? typo.fontFamilySans)} onChange={(e) => set('tokens.typography.fontFamilyHeading', fontStack(e.target.value))}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="ws-field"><span className="ws-field__label">Scale</span>
              <WorkspaceSegmented label="Type scale" value={typo.fontSizeBase === '0.9375rem' ? 'tight' : typo.fontSizeBase === '1.0625rem' ? 'generous' : 'regular'} onChange={(scale) => {
                const t = materializeTypography({ family: typo.fontFamilySans, headingFamily: typo.fontFamilyHeading ?? typo.fontFamilySans, monoFamily: typo.fontFamilyMono ?? 'JetBrains Mono, monospace', headingWeight: Number(typo.fontWeightBold) || 700, bodyWeight: Number(typo.fontWeightNormal) || 400, letterSpacing: typo.letterSpacing, lineHeight: typo.lineHeight, scale: scale as 'tight' | 'regular' | 'generous' });
                setMany({ 'tokens.typography.fontSizeXs': t.fontSizeXs, 'tokens.typography.fontSizeSm': t.fontSizeSm, 'tokens.typography.fontSizeBase': t.fontSizeBase, 'tokens.typography.fontSizeLg': t.fontSizeLg, 'tokens.typography.fontSizeXl': t.fontSizeXl, 'tokens.typography.fontSize2xl': t.fontSize2xl, 'tokens.typography.fontSize3xl': t.fontSize3xl });
              }} options={[{ value: 'tight', label: 'Tight' }, { value: 'regular', label: 'Regular' }, { value: 'generous', label: 'Generous' }]} />
            </label>
            <div className="labs-slider"><Slider label="Heading weight" value={Number(typo.fontWeightBold) || 700} min={400} max={900} step={100} onChange={(v) => set('tokens.typography.fontWeightBold', v)} /></div>
            <div className="labs-slider"><Slider label="Body weight" value={Number(typo.fontWeightNormal) || 400} min={300} max={600} step={100} onChange={(v) => set('tokens.typography.fontWeightNormal', v)} /></div>
            <div className="labs-slider"><Slider label="Line height" value={parseFloat(typo.lineHeight) || 1.5} min={1.1} max={2} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => set('tokens.typography.lineHeight', String(v))} /></div>
            <div className="labs-slider"><Slider label="Letter spacing" value={parseFloat(typo.letterSpacing) || 0} min={-0.05} max={0.15} step={0.005} format={(v) => `${v.toFixed(3)}em`} onChange={(v) => set('tokens.typography.letterSpacing', `${v}em`)} /></div>
            <div className="cz-field__resets"><GenBtn path="tokens.typography" /></div>
          </WorkspaceSection>

          <WorkspaceSection title="Radius" icon={<Square size={14} />} defaultOpen={false}>
            <SectionHead path="tokens.radii" />
            <WorkspaceSegmented label="Radius preset" columns={3} value={'' as string} onChange={(g) => { const r = materializeGeometry(g as GeometryType, 'comfortable'); setMany({ 'tokens.radii.sm': r.sm, 'tokens.radii.md': r.md, 'tokens.radii.lg': r.lg, 'tokens.radii.xl': r.xl, 'tokens.radii.full': r.full }); }}
              options={[{ value: 'sharp', label: 'Sharp' }, { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }, { value: 'pill', label: 'Pill' }]} />
            <div className="labs-slider"><Slider label="Radius md" value={parseInt(draft.tokens.radii.md) || 0} min={0} max={40} format={(v) => `${v}px`} onChange={(v) => set('tokens.radii.md', `${v}px`)} /></div>
            <div className="labs-slider"><Slider label="Radius lg (cards)" value={parseInt(draft.tokens.radii.lg) || 0} min={0} max={48} format={(v) => `${v}px`} onChange={(v) => set('tokens.radii.lg', `${v}px`)} /></div>
            <div className="cz-field__resets"><GenBtn path="tokens.radii" /></div>
          </WorkspaceSection>

          <WorkspaceSection title="Shadow" icon={<Layers size={14} />} defaultOpen={false}>
            <SectionHead path="tokens.shadows" />
            <div className="cz-presets">
              {([['None', 'flat'], ['Soft', 'soft'], ['Medium', 'deep'], ['Deep', 'deep'], ['Inner', 'inset'], ['Floating', 'floating'], ['Glow', 'glowing']] as [string, DepthType][]).map(([label, d]) => (
                <button key={label} type="button" className="ws-btn ws-btn--sm" onClick={() => set('tokens.shadows', materializeDepth(d, colors))}>{label}</button>
              ))}
            </div>
            <input className="ws-input" value={draft.tokens.shadows.md} onChange={(e) => set('tokens.shadows.md', e.target.value)} aria-label="Shadow md" />
            <div className="cz-field__resets"><GenBtn path="tokens.shadows" /></div>
          </WorkspaceSection>

          <WorkspaceSection title="Border" icon={<Minus size={14} />} defaultOpen={false}>
            <SectionHead path="tokens.borders" />
            <div className="cz-presets">
              {(['none', 'subtle', 'thin', 'strong', 'dashed', 'double', 'glow'] as BorderType[]).map((b) => (
                <button key={b} type="button" className="ws-btn ws-btn--sm" onClick={() => set('tokens.borders', materializeBorder(b, colors))}>{b}</button>
              ))}
            </div>
            <div className="labs-slider"><Slider label="Width" value={parseFloat(draft.tokens.borders.width) || 0} min={0} max={6} step={0.5} format={(v) => `${v}px`} onChange={(v) => set('tokens.borders.width', `${v}px`)} /></div>
            <div className="labs-slider"><Slider label="Opacity" value={Math.round((draft.tokens.borders.opacity ?? 1) * 100)} min={0} max={100} format={(v) => `${v}%`} onChange={(v) => set('tokens.borders.opacity', v / 100)} /></div>
            <div className="cz-field"><ColorPicker label="Border colour" value={draft.tokens.borders.color.startsWith('#') || draft.tokens.borders.color.startsWith('rgb') ? draft.tokens.borders.color : colors.border} onChange={(v) => set('tokens.borders.color', v)} /></div>
            <div className="cz-field__resets"><GenBtn path="tokens.borders" /></div>
          </WorkspaceSection>

          <WorkspaceSection title="Surface" icon={<Box size={14} />} defaultOpen={false}>
            <SectionHead path="tokens.materials" />
            <div className="cz-presets">
              {(['solid', 'transparent', 'frosted', 'glass', 'elevated', 'inset', 'liquid', 'metallic'] as SurfaceType[]).map((s) => (
                <button key={s} type="button" className="ws-btn ws-btn--sm" onClick={() => { const m = materializeSurface(s, colors); setMany({ 'tokens.colors.surface': m.surface, 'tokens.colors.surfaceHover': m.surfaceHover, 'tokens.materials.backdropBlur': m.materials.backdropBlur ?? '0px', 'tokens.materials.opacity': m.materials.opacity ?? 1, 'tokens.materials.gradient': m.materials.gradient, 'tokens.materials.texture': m.materials.texture ?? 'none', 'tokens.materials.reflection': m.materials.reflection ?? false }); }}>{s}</button>
              ))}
            </div>
            <div className="labs-slider"><Slider label="Opacity" value={Math.round((draft.tokens.materials?.opacity ?? 1) * 100)} min={10} max={100} format={(v) => `${v}%`} onChange={(v) => set('tokens.materials.opacity', v / 100)} /></div>
            <div className="labs-slider"><Slider label="Blur" value={parseInt(draft.tokens.materials?.backdropBlur ?? '0') || 0} min={0} max={48} step={2} format={(v) => `${v}px`} onChange={(v) => set('tokens.materials.backdropBlur', `${v}px`)} /></div>
            <label className="ws-field"><span className="ws-field__label">Texture</span>
              <select className="ws-select" value={draft.tokens.materials?.texture ?? 'none'} onChange={(e) => set('tokens.materials.texture', e.target.value)}>
                {['none', 'noise', 'grid', 'scanline', 'dot-pattern', 'grain'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
          </WorkspaceSection>

          <WorkspaceSection title="Density" icon={<LayoutGrid size={14} />} defaultOpen={false}>
            <WorkspaceSegmented label="Density" value={String(draft.tokens.materials?.density ?? 1) as '0.85' | '1' | '1.2'} onChange={(v) => set('tokens.materials.density', Number(v))} options={[{ value: '0.85', label: 'Compact' }, { value: '1', label: 'Comfortable' }, { value: '1.2', label: 'Spacious' }]} />
          </WorkspaceSection>

          <WorkspaceSection title="Icons" icon={<Shapes size={14} />} defaultOpen={false}>
            <SectionHead path="tokens.icons" />
            <label className="ws-field"><span className="ws-field__label">Family</span>
              <select className="ws-select" value={draft.tokens.icons?.styleVariant === 'sharp' ? 'geometric' : draft.tokens.icons?.filled ? 'filled' : draft.tokens.icons?.styleVariant ?? 'outline'} onChange={(e) => set('tokens.icons', materializeIcons(e.target.value as IconType))}>
                {['outline', 'filled', 'duotone', 'geometric', 'rounded', '3d', 'pixel', 'skeuomorphic'].map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </label>
            <div className="labs-slider"><Slider label="Stroke" value={Number(draft.tokens.icons?.strokeWidth ?? 2)} min={1} max={3.5} step={0.25} onChange={(v) => set('tokens.icons.strokeWidth', v)} /></div>
          </WorkspaceSection>

          <WorkspaceSection title="Motion" icon={<Zap size={14} />} defaultOpen={false}>
            <SectionHead path="tokens.motion" />
            <WorkspaceSegmented label="Motion preset" columns={2} value={'' as string} onChange={(m) => set('tokens.motion', materializeMotion(m as MotionType))} options={[{ value: 'static', label: 'None' }, { value: 'subtle', label: 'Subtle' }, { value: 'smooth', label: 'Normal' }, { value: 'expressive', label: 'Expressive' }]} />
            <div className="labs-slider"><Slider label="Duration" value={parseInt(draft.tokens.motion.durationNormal) || 0} min={0} max={800} step={10} format={(v) => `${v}ms`} onChange={(v) => setMany({ 'tokens.motion.durationFast': `${Math.round(v * 0.6)}ms`, 'tokens.motion.durationNormal': `${v}ms`, 'tokens.motion.durationSlow': `${Math.round(v * 1.6)}ms` })} /></div>
            <input className="ws-input" value={draft.tokens.motion.easing} onChange={(e) => set('tokens.motion.easing', e.target.value)} aria-label="Easing" />
            <div className="cz-field__resets"><GenBtn path="tokens.motion" /></div>
          </WorkspaceSection>

          <WorkspaceSection title="Behaviour" icon={<MousePointerClick size={14} />} defaultOpen={false}>
            <SectionHead path="behavior" />
            {([['buttonHoverAction', 'Button hover', ['lift', 'press', 'glow', 'shift', 'invert', 'none']], ['cardElevationType', 'Card elevation', ['shadow', 'border', 'gradient-border', 'inset', 'flat']], ['focusRingStyle', 'Focus ring', ['outline', 'glow', 'solid-border', 'double-ring']]] as [keyof ComponentBehavior, string, string[]][]).map(([key, label, opts]) => (
              <label key={key} className="ws-field"><span className="ws-field__label">{label}</span>
                <select className="ws-select" value={draft.behavior?.[key] ?? opts[0]} onChange={(e) => set(`behavior.${key}`, e.target.value)}>
                  {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
            ))}
          </WorkspaceSection>

          <div className="cz-actions">
            <button type="button" className="ws-btn ws-btn--primary cz-actions__btn" onClick={openSave}>{savedFlash ? <Check size={14} /> : <Save size={14} />} {savedFlash ? 'Saved' : isCustom ? 'Save changes' : 'Save as custom style'}</button>
            <div className="cz-actions__row">
              <button type="button" className="ws-btn ws-btn--sm" onClick={resetAll} disabled={!dirty}><RotateCcw size={12} /> Reset style</button>
              <button type="button" className="ws-btn ws-btn--sm" onClick={duplicate}><Copy size={12} /> Duplicate</button>
              {isCustom && <button type="button" className="ws-btn ws-btn--sm" onClick={openSave}><Pencil size={12} /> Rename</button>}
              <button type="button" className="ws-btn ws-btn--sm" onClick={exportJson}><Download size={12} /> Export</button>
              <button type="button" className="ws-btn ws-btn--sm" onClick={share}>{copied ? <Check size={12} /> : <Link2 size={12} />} Share</button>
              {isCustom && <button type="button" className="ws-btn ws-btn--sm ws-btn--danger" onClick={() => setDeleteOpen(true)}><Trash2 size={12} /> Delete</button>}
            </div>
            <button type="button" className="cz-reset-everything" onClick={() => setResetAllOpen(true)}>Reset everything…</button>
          </div>
        </div>
      </aside>

      <section className="ws-stage" aria-label="Live preview">
        <header className="ws-stage__bar">
          <div className="ws-stage__status" aria-live="polite">
            <span className="ws-stage__dot" aria-hidden="true" />
            {draft.metadata.name} · {isCustom ? 'custom' : 'built in'}{dirty ? ' · editing' : ''}
          </div>
          <span className="labs-blurb">Every change previews across the whole app until you save or reset.</span>
        </header>
        <div className="ws-stage__body">
          <div className="labs-canvas cz-canvas">
            <div className="cz-preview-grid">
              <StylePreviewCard style={draft} size="hero" />
              <div className="cz-preview-components">
                <Tabs label="Preview sections" tabs={[{ id: 'overview', label: 'Overview' }, { id: 'forms', label: 'Forms' }, { id: 'data', label: 'Data' }]} value={previewTab} onChange={setPreviewTab} />
                {previewTab === 'overview' && (
                  <div className="cz-preview-stack">
                    <div className="lab-component-row">
                      <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="ghost">Ghost</Button>
                      <Badge variant="accent">Badge</Badge><Badge variant="success">Live</Badge>
                    </div>
                    <Alert tone="info" title="Contrast">Text on background is {draft.tokens.colors.textPrimary} on {draft.tokens.colors.bg}.</Alert>
                    <Progress label="Progress" value={64} />
                  </div>
                )}
                {previewTab === 'forms' && (
                  <div className="cz-preview-stack">
                    <Input label="Email" placeholder="alex@example.com" />
                    <Input label="Error state" defaultValue="wrong" error="Please enter a valid email." />
                    <Toggle checked onChange={() => undefined} label="Notifications" />
                    <Checkbox label="Remember me" defaultChecked />
                    <Segmented label="Density" value="b" onChange={() => undefined} options={[{ value: 'a', label: 'Day' }, { value: 'b', label: 'Week' }, { value: 'c', label: 'Month' }]} />
                  </div>
                )}
                {previewTab === 'data' && (
                  <Card><CardHeader><CardTitle>Revenue</CardTitle></CardHeader><CardBody><LineChart series={sample} height={160} /></CardBody></Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title={isCustom ? 'Save changes' : 'Save as custom style'} description="Saved styles live in your browser and appear in the style picker."
        footer={<><Button variant="ghost" onClick={() => setSaveOpen(false)}>Cancel</Button>{isCustom && !dirty && <Button variant="secondary" onClick={() => { rename(); setSaveOpen(false); }}>Rename only</Button>}<Button onClick={save}>Save</Button></>}>
        <div className="lab-input-col">
          <Input label="Style name" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
          <Textarea label="Description" value={saveDesc} onChange={(e) => setSaveDesc(e.target.value)} rows={3} />
          <Input label="Tags" value={saveTags} onChange={(e) => setSaveTags(e.target.value)} helperText="Comma separated" />
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} role="alertdialog" size="sm" title="Delete this style?" description={`${draft.metadata.name} will be removed from your library. Exports you downloaded are not affected.`}
        footer={<><Button variant="ghost" onClick={() => setDeleteOpen(false)}>Keep it</Button><Button variant="destructive" onClick={() => { deleteCustomStyle(draft.metadata.id); setDeleteOpen(false); setStyle('neumorphism'); navigate('/customizer'); }}>Delete</Button></>} />

      <Modal open={resetAllOpen} onClose={() => setResetAllOpen(false)} role="alertdialog" size="sm" title="Reset everything?" description="Removes all custom styles, favorites, history and settings from this browser. Built-in styles are untouched."
        footer={<><Button variant="ghost" onClick={() => setResetAllOpen(false)}>Cancel</Button><Button variant="destructive" onClick={resetEverything}>Reset everything</Button></>} />
    </div>
  );
};

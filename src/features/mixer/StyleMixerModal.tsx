import React, { useEffect, useMemo, useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import type { StyleDefinition } from '../../engine/types';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { getStyleDataAttributes } from '../../engine/styleAttributes';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Toggle } from '../../components/ui/Selection';
import { Tabs } from '../../components/ui/Navigation';
import { LineChart } from '../../components/charts/LineChart';
import { makeSeries } from '../../components/charts/chartUtils';
import { Shuffle, Sparkles, X, Save, Eye } from 'lucide-react';
import './StyleMixerModal.css';

type SourceKey = 'colors' | 'typography' | 'surface' | 'borders' | 'shadows' | 'radii' | 'icons' | 'motion' | 'svg';

const SOURCES: { key: SourceKey; label: string; hint: string }[] = [
  { key: 'typography', label: 'Typography', hint: 'font families, weights, scale' },
  { key: 'surface', label: 'Surface', hint: 'material, blur, texture, gradient' },
  { key: 'colors', label: 'Color', hint: 'palette and accent' },
  { key: 'borders', label: 'Border', hint: 'width, style, colour' },
  { key: 'shadows', label: 'Depth', hint: 'shadows, glow, elevation' },
  { key: 'radii', label: 'Radius', hint: 'corner geometry' },
  { key: 'icons', label: 'Icons', hint: 'stroke and family' },
  { key: 'motion', label: 'Motion', hint: 'duration, easing, behaviour' },
  { key: 'svg', label: 'SVG', hint: 'shape and pattern language' }
];

const shortName = (s: StyleDefinition) => s.metadata.name.split(/[/(]/)[0].trim();

/** Build the hybrid: each axis copied from its source style. */
function mix(sources: Record<SourceKey, StyleDefinition>, name: string): StyleDefinition {
  const c = sources.colors, t = sources.typography, sf = sources.surface, b = sources.borders, sh = sources.shadows, r = sources.radii, i = sources.icons, m = sources.motion, v = sources.svg;
  const distinct = Array.from(new Set(Object.values(sources).map(shortName)));
  return {
    metadata: {
      id: `hybrid-${Date.now()}`,
      name,
      category: 'Custom',
      description: `Hybrid of ${distinct.join(' × ')}: typography from ${shortName(t)}, surfaces from ${shortName(sf)}, colours from ${shortName(c)}, depth from ${shortName(sh)}.`,
      tags: ['hybrid', 'mixed', ...distinct.map((d) => d.toLowerCase())],
      personality: 'Experimental hybrid composition',
      bestUsedFor: ['Custom experimental projects'],
      isCustom: true,
      source: 'custom'
    },
    tokens: {
      colors: { ...c.tokens.colors, surface: sf.tokens.colors.surface, surfaceHover: sf.tokens.colors.surfaceHover ?? c.tokens.colors.surfaceHover, surfaceActive: sf.tokens.colors.surfaceActive ?? c.tokens.colors.surfaceActive },
      typography: t.tokens.typography,
      radii: r.tokens.radii,
      shadows: sh.tokens.shadows,
      borders: b.tokens.borders,
      motion: m.tokens.motion,
      materials: { ...sf.tokens.materials, density: t.tokens.materials?.density },
      icons: i.tokens.icons
    },
    svgLanguage: v.svgLanguage,
    behavior: { buttonHoverAction: m.behavior?.buttonHoverAction ?? 'lift', cardElevationType: sh.behavior?.cardElevationType ?? 'shadow', focusRingStyle: m.behavior?.focusRingStyle ?? 'outline' }
  };
}

export const StyleMixerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { availableStyles, addCustomStyle, currentStyle, setPreviewStyle } = useStyle();
  const byId = (id: string) => availableStyles.find((s) => s.metadata.id === id) ?? currentStyle;
  const [ids, setIds] = useState<Record<SourceKey, string>>(() => {
    const pick = (n: number) => (availableStyles[n % availableStyles.length] ?? currentStyle).metadata.id;
    return { typography: pick(7), surface: pick(2), colors: currentStyle.metadata.id, borders: currentStyle.metadata.id, shadows: pick(1), radii: pick(3), icons: currentStyle.metadata.id, motion: currentStyle.metadata.id, svg: pick(2) };
  });
  const [name, setName] = useState('Hybrid Style');
  const [previewing, setPreviewing] = useState(false);
  const [tab, setTab] = useState('a');
  const [toggle, setToggle] = useState(true);

  const sources = useMemo(() => Object.fromEntries(SOURCES.map((s) => [s.key, byId(ids[s.key])])) as Record<SourceKey, StyleDefinition>, [ids, availableStyles]); // eslint-disable-line react-hooks/exhaustive-deps
  const hybrid = useMemo(() => mix(sources, name), [sources, name]);
  const vars = useMemo(() => resolveStyleToCssVars(hybrid), [hybrid]);
  const series = useMemo(() => [makeSeries('Revenue', 7, 5)], []);
  const formula = Array.from(new Set([sources.typography, sources.surface, sources.colors, sources.shadows].map(shortName))).join(' × ');

  useEffect(() => { if (previewing) setPreviewStyle(hybrid); }, [previewing, hybrid, setPreviewStyle]);
  useEffect(() => () => setPreviewStyle(undefined), [setPreviewStyle]);

  const randomize = () => {
    const rnd = () => availableStyles[Math.floor(Math.random() * availableStyles.length)].metadata.id;
    setIds(Object.fromEntries(SOURCES.map((s) => [s.key, rnd()])) as Record<SourceKey, string>);
  };

  const save = () => { addCustomStyle(hybrid); onClose(); };

  return (
    <div className="mixer-modal-backdrop" onClick={onClose}>
      <div className="mixer-modal" role="dialog" aria-modal="true" aria-label="Style mixer" onClick={(e) => e.stopPropagation()}>
        <div className="mixer-modal-header">
          <div className="mixer-title">
            <Shuffle size={18} />
            <h3>Style Mixer</h3>
          </div>
          <button className="mixer-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="mixer-modal-body">
          <div className="mixer-controls-col">
            <Button variant="secondary" icon={<Sparkles size={16} />} onClick={randomize} fullWidth>Surprise me</Button>
            {SOURCES.map((s) => (
              <div key={s.key} className="mixer-select-group">
                <label htmlFor={`mix-${s.key}`}>{s.label} <span className="mixer-hint">{s.hint}</span></label>
                <select id={`mix-${s.key}`} value={ids[s.key]} onChange={(e) => setIds({ ...ids, [s.key]: e.target.value })} className="shell-select">
                  {availableStyles.map((st) => <option key={st.metadata.id} value={st.metadata.id}>{st.metadata.name}</option>)}
                </select>
              </div>
            ))}
            <div className="mixer-select-group">
              <label htmlFor="mix-name">Hybrid name</label>
              <input id="mix-name" className="shell-select mixer-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mixer-actions">
              <Button variant={previewing ? 'secondary' : 'outline'} icon={<Eye size={16} />} onClick={() => { setPreviewing((v) => !v); if (previewing) setPreviewStyle(undefined); }} fullWidth>
                {previewing ? 'Previewing across the app' : 'Preview across the app'}
              </Button>
              <Button variant="primary" icon={<Save size={16} />} onClick={save} fullWidth>Save hybrid style</Button>
            </div>
          </div>

          <div className="mixer-preview-col" style={vars as React.CSSProperties} {...getStyleDataAttributes(hybrid)}>
            <div className="mixer-formula">
              <span className="mixer-formula__label">Hybrid style</span>
              <span className="mixer-formula__value">{formula}</span>
            </div>
            <Card>
              <CardHeader><CardTitle>{name}</CardTitle><Badge variant="accent" size="sm">Hybrid</Badge></CardHeader>
              <CardBody className="mixer-sample">
                <p>{hybrid.metadata.description}</p>
                <Tabs label="Sections" tabs={[{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Tokens' }]} value={tab} onChange={setTab} />
                <div className="lab-component-row">
                  <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button>
                </div>
                <Input label="Email" placeholder="alex@example.com" />
                <Toggle checked={toggle} onChange={setToggle} label="Notifications" />
                <LineChart series={series} height={120} showLabels={false} />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

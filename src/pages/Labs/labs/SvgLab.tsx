import React, { useMemo, useState } from 'react';
import { PenTool, Sliders, Copy, Check } from 'lucide-react';
import { LabControls, useLabStatus } from '../LabsPage';
import { WorkspaceSection, WorkspaceSwitch } from '../../../components/workspace/Workspace';
import { Slider } from '../../../components/ui/Selection';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Backdrop, presetForLanguage } from '../../../components/svg/Backdrop';
import type { BackdropPreset } from '../../../components/svg/Backdrop';
import { useStyle } from '../../../hooks/useStyle';
import { deriveRecipeFromStyle } from '../../../engine/generator/generator';
import './SvgLab.css';

const PRESETS: { id: BackdropPreset; name: string; blurb: string }[] = [
  { id: 'mesh', name: 'Mesh', blurb: 'Blurred colour fields' },
  { id: 'aurora', name: 'Aurora', blurb: 'Drifting northern-light blobs' },
  { id: 'grid', name: 'Grid', blurb: 'Technical line grid' },
  { id: 'blob', name: 'Blob', blurb: 'Organic filled shapes' },
  { id: 'wave', name: 'Wave', blurb: 'Layered sine strokes' },
  { id: 'ring', name: 'Ring', blurb: 'Concentric outlines' },
  { id: 'glow', name: 'Glow', blurb: 'Soft light sources' },
  { id: 'noise', name: 'Noise', blurb: 'Fractal grain overlay' },
  { id: 'liquid', name: 'Liquid', blurb: 'Reflective molten forms' },
  { id: 'chrome', name: 'Chrome highlight', blurb: 'Specular metal bands' },
  { id: 'geometric', name: 'Geometric', blurb: 'Squares, triangles, discs' },
  { id: 'confetti', name: 'Confetti', blurb: 'Scattered particles' },
  { id: 'reticle', name: 'Reticle', blurb: 'HUD targeting marks' }
];

export const SvgLab: React.FC = () => {
  const { renderedStyle } = useStyle();
  const styleSvg = useMemo(() => deriveRecipeFromStyle(renderedStyle).svg, [renderedStyle]);
  const suggested = presetForLanguage(styleSvg);
  const [preset, setPreset] = useState<BackdropPreset>(suggested);
  const [seed, setSeed] = useState(7);
  const [intensity, setIntensity] = useState(0.6);
  const [density, setDensity] = useState(0.5);
  const [curve, setCurve] = useState(0.6);
  const [animate, setAnimate] = useState(true);
  const [copied, setCopied] = useState(false);
  useLabStatus(`${preset} · seed ${seed}`);

  const exportSvg = async () => {
    const svg = document.querySelector<SVGSVGElement>('.svg-lab__hero .ui-backdrop__svg');
    if (!svg) return;
    const markup = new XMLSerializer().serializeToString(svg);
    try { await navigator.clipboard.writeText(markup); } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <LabControls>
        <WorkspaceSection title="Preset" icon={<PenTool size={14} />}>
          <label className="ws-field"><span className="ws-field__label">Preset</span>
            <select className="ws-select" value={preset} onChange={(e) => setPreset(e.target.value as BackdropPreset)}>
              {PRESETS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <p className="ws-hint">The active style's SVG language suggests <strong>{suggested}</strong> ({styleSvg.shapeLanguage} shapes, {styleSvg.gradientType} gradients, glow {styleSvg.glowLevel}).</p>
          <button type="button" className="ws-btn" onClick={() => setPreset(suggested)}>Use style suggestion</button>
        </WorkspaceSection>
        <WorkspaceSection title="Parameters" icon={<Sliders size={14} />}>
          <div className="labs-slider"><Slider label="Seed" value={seed} min={1} max={99} onChange={setSeed} /></div>
          <div className="labs-slider"><Slider label="Intensity" value={intensity} min={0} max={1} step={0.05} format={(x) => x.toFixed(2)} onChange={setIntensity} /></div>
          <div className="labs-slider"><Slider label="Density" value={density} min={0} max={1} step={0.05} format={(x) => x.toFixed(2)} onChange={setDensity} /></div>
          <div className="labs-slider"><Slider label="Curve" value={curve} min={0} max={1} step={0.05} format={(x) => x.toFixed(2)} onChange={setCurve} /></div>
          <WorkspaceSwitch checked={animate} onChange={setAnimate} label="Animate" />
          <button type="button" className="ws-btn" onClick={exportSvg}>{copied ? <Check size={14} /> : <Copy size={14} />} Copy SVG markup</button>
        </WorkspaceSection>
      </LabControls>

      <div className="svg-lab">
        <Card className="svg-lab__hero">
          <CardHeader><CardTitle>{PRESETS.find((p) => p.id === preset)?.name}</CardTitle></CardHeader>
          <CardBody>
            <Backdrop preset={preset} seed={seed} intensity={intensity} density={density} curve={curve} animate={animate} height={280} />
          </CardBody>
        </Card>
        <div className="svg-lab__grid">
          {PRESETS.filter((p) => p.id !== preset).map((p) => (
            <button key={p.id} type="button" className="svg-lab__thumb" onClick={() => setPreset(p.id)}>
              <Backdrop preset={p.id} seed={seed} intensity={intensity} density={density} curve={curve} animate={false} height={110} />
              <span className="svg-lab__thumb-name">{p.name}</span>
              <span className="svg-lab__thumb-blurb">{p.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

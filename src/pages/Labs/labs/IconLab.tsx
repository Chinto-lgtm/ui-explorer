import React, { useState } from 'react';
import { Shapes, Sliders } from 'lucide-react';
import * as Icons from 'lucide-react';
import { LabControls, useLabStatus } from '../LabsPage';
import { WorkspaceSection, WorkspaceSegmented } from '../../../components/workspace/Workspace';
import { Slider } from '../../../components/ui/Selection';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { SideNav } from '../../../components/ui/Navigation';
import { Alert } from '../../../components/ui/Feedback';
import { useStyle } from '../../../hooks/useStyle';
import type { IconType } from '../../../engine/generator/vocab';
import { ICON_TYPES } from '../../../engine/generator/vocab';
import './IconLab.css';

const SAMPLE = ['Home', 'Search', 'Bell', 'Settings', 'Heart', 'Star', 'Mail', 'Calendar', 'Camera', 'Cloud', 'Folder', 'Lock', 'Map', 'Music', 'Zap', 'User', 'Trash2', 'Download', 'Sparkles', 'Layers'] as const;

/** Icon style is expressed as stroke, fill, join and filters; the glyphs stay the same. */
function iconProps(type: IconType, strokeWidth: number, corner: number, opacity: number) {
  const base: Record<string, unknown> = { strokeWidth, strokeLinejoin: corner > 0 ? 'round' : 'miter', strokeLinecap: corner > 0 ? 'round' : 'square', style: { opacity } };
  switch (type) {
    case 'filled': return { ...base, fill: 'currentColor', fillOpacity: 0.9 };
    case 'duotone': return { ...base, fill: 'currentColor', fillOpacity: 0.22 };
    case 'geometric': return { ...base, strokeLinejoin: 'miter', strokeLinecap: 'square', strokeWidth: strokeWidth + 0.5 };
    case 'rounded': return { ...base, strokeLinejoin: 'round', strokeLinecap: 'round', strokeWidth: Math.max(1.5, strokeWidth) };
    case 'pixel': return { ...base, strokeLinejoin: 'miter', strokeLinecap: 'butt', strokeWidth: 3, style: { opacity, imageRendering: 'pixelated', filter: 'url(#icon-pixelate)', shapeRendering: 'crispEdges' } };
    case '3d': return { ...base, fill: 'currentColor', fillOpacity: 0.85, style: { opacity, filter: 'drop-shadow(1px 2px 0 rgba(0,0,0,0.35)) drop-shadow(0 -1px 0 rgba(255,255,255,0.4))' } };
    case 'skeuomorphic': return { ...base, fill: 'currentColor', fillOpacity: 0.7, style: { opacity, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5)) drop-shadow(0 -1px 0 rgba(255,255,255,0.35))' } };
    case 'outline':
    default: return base;
  }
}

export const IconLab: React.FC = () => {
  const { resolvedCssVars: v } = useStyle();
  const [type, setType] = useState<IconType>('outline');
  const [strokeWidth, setStrokeWidth] = useState(Number(v['--icon-stroke-width']) || 2);
  const [size, setSize] = useState(24);
  const [corner, setCorner] = useState(1);
  const [weight, setWeight] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [nav, setNav] = useState('home');
  useLabStatus(`${type} · stroke ${strokeWidth} · ${size}px`);

  const props = iconProps(type, strokeWidth * weight, corner, opacity);
  const Icon = (name: (typeof SAMPLE)[number], s = size) => {
    const Comp = Icons[name] as React.ComponentType<Record<string, unknown>>;
    return <Comp size={s} {...props} />;
  };

  return (
    <>
      <LabControls>
        <WorkspaceSection title="Icon style" icon={<Shapes size={14} />}>
          <label className="ws-field"><span className="ws-field__label">Family</span>
            <select className="ws-select" value={type} onChange={(e) => setType(e.target.value as IconType)}>
              {ICON_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <WorkspaceSegmented label="Corner" value={String(corner) as '0' | '1'} onChange={(x) => setCorner(Number(x))} options={[{ value: '0', label: 'Sharp' }, { value: '1', label: 'Rounded' }]} />
        </WorkspaceSection>
        <WorkspaceSection title="Controls" icon={<Sliders size={14} />}>
          <div className="labs-slider"><Slider label="Stroke width" value={strokeWidth} min={1} max={3.5} step={0.25} onChange={setStrokeWidth} /></div>
          <div className="labs-slider"><Slider label="Size" value={size} min={12} max={48} onChange={setSize} format={(x) => `${x}px`} /></div>
          <div className="labs-slider"><Slider label="Weight" value={weight} min={0.75} max={1.5} step={0.05} onChange={setWeight} format={(x) => x.toFixed(2)} /></div>
          <div className="labs-slider"><Slider label="Opacity" value={opacity} min={0.3} max={1} step={0.05} onChange={setOpacity} format={(x) => `${Math.round(x * 100)}%`} /></div>
          <p className="ws-hint">Style default stroke: {v['--icon-stroke-width']}</p>
        </WorkspaceSection>
      </LabControls>

      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <filter id="icon-pixelate">
          <feFlood x="1" y="1" height="1" width="1" />
          <feComposite width="3" height="3" />
          <feTile result="a" />
          <feComposite in="SourceGraphic" in2="a" operator="in" />
          <feMorphology operator="dilate" radius="1" />
        </filter>
      </svg>

      <div className="icon-lab">
        <Card className="icon-lab__grid-card">
          <CardHeader><CardTitle>Glyphs</CardTitle></CardHeader>
          <CardBody>
            <div className="icon-grid">
              {SAMPLE.map((n) => (
                <div key={n} className="icon-grid__item" title={n}>
                  {Icon(n)}
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>In buttons</CardTitle></CardHeader>
          <CardBody className="lab-component-row">
            <Button icon={Icon('Download', 16)}>Download</Button>
            <Button variant="secondary" icon={Icon('Star', 16)}>Favorite</Button>
            <Button variant="outline" icon={Icon('Settings', 16)}>Settings</Button>
            <Button iconOnly aria-label="Search" icon={Icon('Search', 16)} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>In navigation</CardTitle></CardHeader>
          <CardBody>
            <SideNav items={[
              { id: 'home', label: 'Home', icon: Icon('Home', 16) },
              { id: 'mail', label: 'Inbox', icon: Icon('Mail', 16) },
              { id: 'cal', label: 'Calendar', icon: Icon('Calendar', 16) },
              { id: 'set', label: 'Settings', icon: Icon('Settings', 16) }
            ]} active={nav} onSelect={setNav} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>In cards &amp; notifications</CardTitle></CardHeader>
          <CardBody className="lab-input-col">
            <div className="icon-feature">
              <span className="icon-feature__icon">{Icon('Cloud', 22)}</span>
              <span><strong>Synced to cloud</strong><br /><span className="icon-feature__sub">Every change is backed up.</span></span>
            </div>
            <Alert tone="info" title="Weekly digest ready">Icons inside alerts pick up the tone colour.</Alert>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>In inputs</CardTitle></CardHeader>
          <CardBody className="lab-input-col">
            <Input label="Search" placeholder="Find anything" icon={Icon('Search', 16)} />
            <Input label="Email" placeholder="you@example.com" icon={Icon('Mail', 16)} />
            <Input label="Location" placeholder="City" icon={Icon('Map', 16)} iconPosition="right" />
          </CardBody>
        </Card>
      </div>
    </>
  );
};

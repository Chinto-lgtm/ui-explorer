import React, { useMemo, useState } from 'react';
import { Layers, Sliders } from 'lucide-react';
import { LabControls, useLabStatus } from '../LabsPage';
import { WorkspaceSection, WorkspaceSwitch } from '../../../components/workspace/Workspace';
import { Slider } from '../../../components/ui/Selection';
import { useStyle } from '../../../hooks/useStyle';
import { materializeSurface, materializeDepth, SURFACE_TYPES } from '../../../engine/generator/vocab';
import type { SurfaceType, DepthType } from '../../../engine/generator/vocab';
import { resolveStyleToCssVars } from '../../../engine/resolver';
import { getStyleDataAttributes } from '../../../engine/styleAttributes';
import type { StyleDefinition } from '../../../engine/types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Backdrop } from '../../../components/svg/Backdrop';
import './MaterialLab.css';

const MATERIAL_INFO: Record<SurfaceType, { name: string; blurb: string; depth: DepthType }> = {
  flat: { name: 'Flat', blurb: 'No elevation; borders and colour carry structure.', depth: 'flat' },
  paper: { name: 'Paper', blurb: 'Matte with a fine grain and a soft shadow.', depth: 'soft' },
  solid: { name: 'Solid', blurb: 'Opaque panels with a quiet shadow.', depth: 'soft' },
  elevated: { name: 'Elevated', blurb: 'Floats above the page on a long shadow.', depth: 'floating' },
  glass: { name: 'Glass', blurb: 'Heavy blur, translucent, light edge.', depth: 'glowing' },
  frosted: { name: 'Frosted glass', blurb: 'Softened background, higher opacity.', depth: 'soft' },
  acrylic: { name: 'Acrylic', blurb: 'Blur plus noise for a physical sheet.', depth: 'floating' },
  crystal: { name: 'Crystal', blurb: 'Faceted highlight over light blur.', depth: 'glowing' },
  clay: { name: 'Clay', blurb: 'Pillowy body with an inner highlight.', depth: 'physical' },
  inset: { name: 'Soft surface', blurb: 'Pressed into the page with inner shadow.', depth: 'inset' },
  metallic: { name: 'Metal', blurb: 'Vertical reflection, brushed feel.', depth: 'deep' },
  liquid: { name: 'Liquid', blurb: 'Tinted moving gradient across the panel.', depth: 'glowing' },
  transparent: { name: 'Plastic', blurb: 'Near-transparent shell with glow depth.', depth: 'glowing' },
  experimental: { name: 'Fabric-like', blurb: 'Textured, scanlined, deliberately unstable.', depth: 'deep' }
};

export const MaterialLab: React.FC = () => {
  const { currentStyle, setPreviewStyle, previewStyle } = useStyle();
  const [selected, setSelected] = useState<SurfaceType>('glass');
  const [blurBoost, setBlurBoost] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [showBackdrop, setShowBackdrop] = useState(true);
  useLabStatus(`${MATERIAL_INFO[selected].name}${previewStyle ? ' · applied to preview' : ''}`);

  /** The current style re-materialized with a given surface. */
  const styleWith = (surface: SurfaceType): StyleDefinition => {
    const colors = currentStyle.tokens.colors;
    const surf = materializeSurface(surface, colors);
    const materials = { ...surf.materials };
    if (blurBoost > 0) materials.backdropBlur = `${(parseFloat(materials.backdropBlur ?? '0') || 0) + blurBoost}px`;
    materials.opacity = Math.round(((materials.opacity ?? 1) * opacity) / 100 * 100) / 100;
    return {
      ...currentStyle,
      metadata: { ...currentStyle.metadata, id: `${currentStyle.metadata.id}-material-${surface}`, name: `${currentStyle.metadata.name} · ${MATERIAL_INFO[surface].name}` },
      tokens: {
        ...currentStyle.tokens,
        colors: { ...colors, surface: surf.surface, surfaceHover: surf.surfaceHover },
        shadows: materializeDepth(MATERIAL_INFO[surface].depth, colors),
        materials
      }
    };
  };

  const samples = useMemo(() => SURFACE_TYPES.map((s) => ({ id: s, style: styleWith(s) })), [currentStyle, blurBoost, opacity]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <LabControls>
        <WorkspaceSection title="Material" icon={<Layers size={14} />}>
          <label className="ws-field"><span className="ws-field__label">Surface</span>
            <select className="ws-select" value={selected} onChange={(e) => setSelected(e.target.value as SurfaceType)}>
              {SURFACE_TYPES.map((s) => <option key={s} value={s}>{MATERIAL_INFO[s].name}</option>)}
            </select>
          </label>
          <button type="button" className="ws-btn ws-btn--primary" onClick={() => setPreviewStyle(styleWith(selected))}>Apply to preview</button>
          <button type="button" className="ws-btn" onClick={() => setPreviewStyle(undefined)} disabled={!previewStyle}>Revert</button>
          <p className="ws-hint">Applying re-materializes the current style's surfaces and depth. Save it from the Customizer.</p>
        </WorkspaceSection>
        <WorkspaceSection title="Controls" icon={<Sliders size={14} />}>
          <div className="labs-slider"><Slider label="Extra blur" value={blurBoost} min={0} max={32} step={2} format={(x) => `${x}px`} onChange={setBlurBoost} /></div>
          <div className="labs-slider"><Slider label="Opacity" value={opacity} min={20} max={100} step={5} format={(x) => `${x}%`} onChange={setOpacity} /></div>
          <WorkspaceSwitch checked={showBackdrop} onChange={setShowBackdrop} label="Busy backdrop behind samples" />
        </WorkspaceSection>
      </LabControls>

      <div className="material-lab">
        {showBackdrop && <div className="material-lab__backdrop"><Backdrop preset="aurora" seed={5} intensity={0.8} density={0.6} animate={false} height={9999} /></div>}
        <div className="material-grid">
          {samples.map(({ id, style }) => {
            const vars = resolveStyleToCssVars(style);
            const info = MATERIAL_INFO[id];
            return (
              <div key={id} className={`material-sample ${selected === id ? 'material-sample--selected' : ''}`} style={vars as React.CSSProperties} {...getStyleDataAttributes(style)}>
                <div
                  role="button"
                  tabIndex={0}
                  className="material-sample__card ui-card"
                  onClick={() => setSelected(id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(id); } }}
                  aria-pressed={selected === id}
                >
                  <span className="material-sample__name">{info.name}</span>
                  <span className="material-sample__blurb">{info.blurb}</span>
                  <span className="material-sample__row">
                    <Button size="sm">Button</Button>
                    <Badge variant="accent" size="sm">Badge</Badge>
                  </span>
                  <span className="material-sample__specs">
                    <span>blur {vars['--backdrop-blur']}</span>
                    <span>opacity {vars['--material-opacity']}</span>
                    <span>{info.depth}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

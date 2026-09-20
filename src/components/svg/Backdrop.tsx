import React, { useId, useMemo } from 'react';
import { mulberry } from '../charts/chartUtils';
import type { GeneratedSvgLanguage, SvgShapeLanguage } from '../../engine/generator/vocab';
import './Backdrop.css';

export type BackdropPreset = 'mesh' | 'aurora' | 'grid' | 'blob' | 'wave' | 'ring' | 'glow' | 'noise' | 'liquid' | 'chrome' | 'geometric' | 'confetti' | 'reticle';

export interface BackdropProps {
  preset: BackdropPreset;
  /** Deterministic variation. */
  seed?: number;
  /** 0..1 knobs; defaults come from the preset. */
  intensity?: number;
  density?: number;
  curve?: number;
  animate?: boolean;
  className?: string;
  /** Visual height of the decoration. */
  height?: number;
}

/** Map a generated SVG language to the most representative preset. */
export function presetForLanguage(svg: GeneratedSvgLanguage): BackdropPreset {
  if (svg.gradientType === 'aurora') return 'aurora';
  if (svg.gradientType === 'mesh') return 'mesh';
  if (svg.gradientType === 'metallic' || svg.metallicReflection > 0.5) return 'chrome';
  const byShape: Record<SvgShapeLanguage, BackdropPreset> = {
    curves: 'wave', geometry: 'geometric', grid: 'grid', blobs: 'blob', lines: 'wave', reticle: 'reticle', confetti: 'confetti', liquid: 'liquid'
  };
  if (svg.noiseLevel > 0.6) return 'noise';
  if (svg.glowLevel > 0.7 && svg.shapeLanguage !== 'grid') return 'glow';
  return byShape[svg.shapeLanguage];
}

const W = 600;
const H = 240;

/**
 * Procedural decorative SVG. The generator (or a style) chooses a preset and
 * parameters; this component turns them into geometry. No raw markup is stored.
 */
export const Backdrop: React.FC<BackdropProps> = ({ preset, seed = 1, intensity = 0.6, density = 0.5, curve = 0.6, animate = true, className = '', height = H }) => {
  const id = useId();
  const rnd = useMemo(() => mulberry(seed + preset.length * 7919), [seed, preset]);
  const shapes = useMemo(() => buildShapes(preset, rnd, intensity, density, curve), [preset, rnd, intensity, density, curve]);

  return (
    <div className={`ui-backdrop ui-backdrop--${preset} ${animate ? 'ui-backdrop--animate' : ''} ${className}`} style={{ height }} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="ui-backdrop__svg">
        <defs>
          <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.9} />
            <stop offset="100%" stopColor="var(--color-accent-hover)" stopOpacity={0.4} />
          </linearGradient>
          <radialGradient id={`${id}-r`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.8} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </radialGradient>
          <linearGradient id={`${id}-chrome`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
            <stop offset="45%" stopColor="var(--color-text-tertiary)" stopOpacity={0.8} />
            <stop offset="50%" stopColor="var(--color-text-primary)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.7} />
          </linearGradient>
          <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={12 + intensity * 24} />
          </filter>
          <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={4 + intensity * 8} result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`${id}-noise`}>
            <feTurbulence type="fractalNoise" baseFrequency={0.6 + density * 0.8} numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values={`0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 ${0.08 + intensity * 0.25} 0`} />
          </filter>
          <pattern id={`${id}-grid`} width={24 + (1 - density) * 40} height={24 + (1 - density) * 40} patternUnits="userSpaceOnUse">
            <path d={`M ${24 + (1 - density) * 40} 0 L 0 0 0 ${24 + (1 - density) * 40}`} fill="none" stroke="var(--color-accent)" strokeOpacity={0.15 + intensity * 0.4} strokeWidth="1" />
          </pattern>
        </defs>

        {shapes.map((s, i) => {
          switch (s.kind) {
            case 'blob':
              return <path key={i} d={s.d} fill={s.fill === 'chrome' ? `url(#${id}-chrome)` : s.fill === 'radial' ? `url(#${id}-r)` : `url(#${id}-a)`} opacity={s.opacity} filter={s.blur ? `url(#${id}-blur)` : undefined} className="ui-backdrop__shape" style={{ animationDelay: `${i * -1.3}s` }} />;
            case 'circle':
              return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={s.fill === 'radial' ? `url(#${id}-r)` : 'var(--color-accent)'} opacity={s.opacity} filter={s.glow ? `url(#${id}-glow)` : undefined} className="ui-backdrop__shape" style={{ animationDelay: `${i * -0.7}s` }} />;
            case 'ring':
              return <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="none" stroke="var(--color-accent)" strokeWidth={s.width} strokeOpacity={s.opacity} filter={s.glow ? `url(#${id}-glow)` : undefined} className="ui-backdrop__shape" />;
            case 'path':
              return <path key={i} d={s.d} fill="none" stroke={s.fill === 'chrome' ? `url(#${id}-chrome)` : 'var(--color-accent)'} strokeWidth={s.width} strokeOpacity={s.opacity} strokeLinecap="round" filter={s.glow ? `url(#${id}-glow)` : undefined} className="ui-backdrop__shape" style={{ animationDelay: `${i * -0.9}s` }} />;
            case 'rect':
              return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.fill === 'pattern' ? `url(#${id}-grid)` : s.fill === 'noise' ? 'var(--color-text-primary)' : 'var(--color-accent)'} filter={s.fill === 'noise' ? `url(#${id}-noise)` : undefined} opacity={s.opacity} transform={s.rotate ? `rotate(${s.rotate} ${s.x + s.w / 2} ${s.y + s.h / 2})` : undefined} className="ui-backdrop__shape" />;
            case 'poly':
              return <polygon key={i} points={s.points} fill="var(--color-accent)" opacity={s.opacity} className="ui-backdrop__shape" />;
            default:
              return null;
          }
        })}
      </svg>
    </div>
  );
};

type Shape =
  | { kind: 'blob'; d: string; fill: 'linear' | 'radial' | 'chrome'; opacity: number; blur?: boolean }
  | { kind: 'circle'; cx: number; cy: number; r: number; fill: 'solid' | 'radial'; opacity: number; glow?: boolean }
  | { kind: 'ring'; cx: number; cy: number; r: number; width: number; opacity: number; glow?: boolean }
  | { kind: 'path'; d: string; width: number; opacity: number; glow?: boolean; fill?: 'accent' | 'chrome' }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; opacity: number; fill: 'solid' | 'pattern' | 'noise'; rotate?: number }
  | { kind: 'poly'; points: string; opacity: number };

function blobPath(cx: number, cy: number, r: number, rnd: () => number, wobble: number): string {
  const n = 7;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 - wobble / 2 + rnd() * wobble);
    pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % n], p0 = pts[(i - 1 + n) % n], p3 = pts[(i + 2) % n];
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return d + ' Z';
}

function wavePath(y: number, amp: number, freq: number, phase: number): string {
  let d = `M 0 ${y}`;
  for (let x = 0; x <= W; x += 10) d += ` L ${x} ${y + Math.sin((x / W) * Math.PI * 2 * freq + phase) * amp}`;
  return d;
}

function buildShapes(preset: BackdropPreset, rnd: () => number, intensity: number, density: number, curve: number): Shape[] {
  const shapes: Shape[] = [];
  const count = Math.round(2 + density * 6);
  switch (preset) {
    case 'mesh':
    case 'aurora':
      for (let i = 0; i < count; i++) {
        shapes.push({ kind: 'blob', d: blobPath(rnd() * W, rnd() * H, 60 + rnd() * 120, rnd, 0.6 * curve + 0.2), fill: i % 2 ? 'radial' : 'linear', opacity: 0.25 + intensity * 0.5, blur: true });
      }
      break;
    case 'blob':
      for (let i = 0; i < Math.max(2, count - 2); i++) {
        shapes.push({ kind: 'blob', d: blobPath(rnd() * W, rnd() * H, 40 + rnd() * 90, rnd, 0.4 + curve * 0.5), fill: 'linear', opacity: 0.35 + intensity * 0.4 });
      }
      break;
    case 'liquid':
      for (let i = 0; i < count; i++) {
        shapes.push({ kind: 'blob', d: blobPath(rnd() * W, rnd() * H, 50 + rnd() * 100, rnd, 0.8 * curve), fill: 'chrome', opacity: 0.4 + intensity * 0.4, blur: i % 3 === 0 });
      }
      break;
    case 'wave':
      for (let i = 0; i < count; i++) {
        shapes.push({ kind: 'path', d: wavePath(40 + (i / count) * (H - 80), 10 + curve * 30, 1 + rnd() * 2, rnd() * Math.PI * 2), width: 1 + intensity * 3, opacity: 0.2 + intensity * 0.5, glow: intensity > 0.6 });
      }
      break;
    case 'ring':
      for (let i = 0; i < count; i++) {
        shapes.push({ kind: 'ring', cx: W * (0.2 + rnd() * 0.6), cy: H * (0.2 + rnd() * 0.6), r: 20 + rnd() * 90, width: 1 + intensity * 4, opacity: 0.2 + intensity * 0.6, glow: intensity > 0.5 });
      }
      break;
    case 'glow':
      for (let i = 0; i < count; i++) {
        shapes.push({ kind: 'circle', cx: rnd() * W, cy: rnd() * H, r: 30 + rnd() * 80, fill: 'radial', opacity: 0.4 + intensity * 0.6, glow: true });
      }
      break;
    case 'noise':
      shapes.push({ kind: 'rect', x: 0, y: 0, w: W, h: H, opacity: 1, fill: 'noise' });
      break;
    case 'grid':
      shapes.push({ kind: 'rect', x: 0, y: 0, w: W, h: H, opacity: 1, fill: 'pattern' });
      if (intensity > 0.5) shapes.push({ kind: 'circle', cx: W * 0.7, cy: H * 0.4, r: 90, fill: 'radial', opacity: intensity * 0.6, glow: true });
      break;
    case 'chrome':
      for (let i = 0; i < count; i++) {
        shapes.push({ kind: 'blob', d: blobPath(rnd() * W, rnd() * H, 50 + rnd() * 90, rnd, 0.5 * curve), fill: 'chrome', opacity: 0.5 + intensity * 0.5 });
      }
      shapes.push({ kind: 'path', d: `M 0 ${H * 0.35} Q ${W / 2} ${H * 0.1} ${W} ${H * 0.4}`, width: 2 + intensity * 4, opacity: 0.9, fill: 'chrome' });
      break;
    case 'geometric':
      for (let i = 0; i < count; i++) {
        const x = rnd() * W, y = rnd() * H, s = 20 + rnd() * 70;
        const kind = rnd();
        if (kind < 0.4) shapes.push({ kind: 'rect', x, y, w: s, h: s, opacity: 0.25 + intensity * 0.5, fill: 'solid', rotate: Math.round(rnd() * 45) });
        else if (kind < 0.7) shapes.push({ kind: 'poly', points: `${x},${y + s} ${x + s / 2},${y} ${x + s},${y + s}`, opacity: 0.25 + intensity * 0.5 });
        else shapes.push({ kind: 'circle', cx: x, cy: y, r: s / 2, fill: 'solid', opacity: 0.25 + intensity * 0.5 });
      }
      break;
    case 'confetti':
      for (let i = 0; i < count * 5; i++) {
        const x = rnd() * W, y = rnd() * H, s = 4 + rnd() * 12;
        if (rnd() < 0.5) shapes.push({ kind: 'circle', cx: x, cy: y, r: s / 2, fill: 'solid', opacity: 0.4 + intensity * 0.5 });
        else shapes.push({ kind: 'rect', x, y, w: s, h: s * 0.5, opacity: 0.4 + intensity * 0.5, fill: 'solid', rotate: Math.round(rnd() * 180) });
      }
      break;
    case 'reticle':
      shapes.push({ kind: 'rect', x: 0, y: 0, w: W, h: H, opacity: 1, fill: 'pattern' });
      for (let i = 0; i < count; i++) {
        const cx = rnd() * W, cy = rnd() * H, r = 12 + rnd() * 40;
        shapes.push({ kind: 'ring', cx, cy, r, width: 1, opacity: 0.5 + intensity * 0.4, glow: intensity > 0.6 });
        shapes.push({ kind: 'path', d: `M ${cx - r - 8} ${cy} L ${cx - r + 4} ${cy} M ${cx + r - 4} ${cy} L ${cx + r + 8} ${cy} M ${cx} ${cy - r - 8} L ${cx} ${cy - r + 4} M ${cx} ${cy + r - 4} L ${cx} ${cy + r + 8}`, width: 1, opacity: 0.7 });
      }
      break;
    default:
      break;
  }
  return shapes;
}

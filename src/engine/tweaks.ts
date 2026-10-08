/**
 * UI Explorer — Tweaks
 * A small set of global dials (radius, borders, shadows, density, type size,
 * accent) layered over whatever style is rendered. They never change a
 * style's stored definition until the user saves the result as a new style.
 */

import type { StyleDefinition } from './types';
import { contrastRatio, hslToRgb, parseColor, rgbToHsl, toHex } from './color';

export interface Tweaks {
  /** 0 = square corners, 1 = as designed, up to 3 = much rounder (adds radius to square styles too). */
  radius: number;
  /** 0 = no borders, 1 = as designed, up to 4 = heavier (adds width to borderless styles too). */
  border: number;
  /** 0 = flat, 1 = as designed, 2 = twice the depth. */
  shadow: number;
  /** Spacing multiplier on top of the style's own density. */
  density: number;
  /** Font-size multiplier for the whole type scale. */
  type: number;
  /** Replacement accent colour, or null for the style's own. */
  accent: string | null;
}

export type NumericTweak = Exclude<keyof Tweaks, 'accent'>;

export const DEFAULT_TWEAKS: Tweaks = { radius: 1, border: 1, shadow: 1, density: 1, type: 1, accent: null };

export interface TweakDef {
  id: NumericTweak;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
}

/** The sliders the Tweaks panel shows, in order. */
export const TWEAK_DEFS: TweakDef[] = [
  { id: 'radius', label: 'Corner radius', hint: 'From square to pill. Above 100% square styles get corners too.', min: 0, max: 3, step: 0.05 },
  { id: 'border', label: 'Border width', hint: 'Above 100% borderless styles gain an outline.', min: 0, max: 4, step: 0.25 },
  { id: 'shadow', label: 'Shadow depth', hint: 'Scales offsets and blur of every shadow.', min: 0, max: 2, step: 0.05 },
  { id: 'density', label: 'Spacing', hint: 'Padding inside buttons, inputs and cards.', min: 0.6, max: 1.6, step: 0.05 },
  { id: 'type', label: 'Type size', hint: 'Every step of the type scale.', min: 0.8, max: 1.3, step: 0.025 }
];

/** Radius added per step above 100%, so square styles can be rounded too. */
const RADIUS_BASE = { sm: 4, md: 8, lg: 12, xl: 16 } as const;
const BORDER_BASE = 1;

const round = (n: number) => Math.round(n * 100) / 100;

/** Multiply every px / rem / em length in a CSS value. */
export function scaleLengths(value: string, factor: number): string {
  if (factor === 1) return value;
  return value.replace(/(-?\d*\.?\d+)(px|rem|em)\b/g, (_, n: string, unit: string) => `${round(parseFloat(n) * factor)}${unit}`);
}

/** Below 1 a length shrinks proportionally; above 1 a fixed amount per step is added, so zero can grow. */
function dial(value: string, factor: number, basePx: number): string {
  if (factor <= 1) return scaleLengths(value, factor);
  const match = /^\s*(-?\d*\.?\d+)(px|rem|em)?\s*$/.exec(value);
  if (!match) return value;
  const n = parseFloat(match[1]);
  const unit = match[2] ?? 'px';
  const px = unit === 'px' ? n : n * 16;
  return `${round(px + (factor - 1) * basePx)}px`;
}

/** A hover shade for a new accent: lighter on dark accents, darker on light ones. */
export function accentHover(hex: string): string {
  const c = parseColor(hex);
  if (!c) return hex;
  const hsl = rgbToHsl(c);
  const l = hsl.l > 55 ? hsl.l - 8 : hsl.l + 8;
  return toHex(hslToRgb({ ...hsl, l: Math.max(0, Math.min(100, l)) }));
}

/** Black or white, whichever reads better on the accent. */
export function textOn(hex: string): string {
  const white = contrastRatio('#ffffff', hex) ?? 0;
  const black = contrastRatio('#000000', hex) ?? 0;
  return white >= black ? '#ffffff' : '#000000';
}

export const isDefaultTweaks = (t: Tweaks): boolean =>
  (Object.keys(DEFAULT_TWEAKS) as (keyof Tweaks)[]).every((k) => t[k] === DEFAULT_TWEAKS[k]);

/** Accept anything from storage or a link; fall back to defaults for every unknown or out-of-range value. */
export function coerceTweaks(raw: unknown): Tweaks {
  const out: Tweaks = { ...DEFAULT_TWEAKS };
  if (!raw || typeof raw !== 'object') return out;
  const src = raw as Record<string, unknown>;
  for (const def of TWEAK_DEFS) {
    const v = src[def.id];
    if (typeof v === 'number' && Number.isFinite(v)) out[def.id] = Math.max(def.min, Math.min(def.max, v));
  }
  if (typeof src.accent === 'string' && parseColor(src.accent)) out.accent = src.accent;
  return out;
}

/** The style with the tweaks applied. Returns the same object when nothing is tweaked. */
export function applyTweaks(style: StyleDefinition, t: Tweaks): StyleDefinition {
  if (isDefaultTweaks(t)) return style;
  const { tokens } = style;
  const r = tokens.radii;
  const s = tokens.shadows;
  const ty = tokens.typography;
  const shadow = (v: string | undefined) => (v === undefined ? v : scaleLengths(v, t.shadow));
  const colors = t.accent
    ? {
        ...tokens.colors,
        accent: t.accent,
        accentHover: accentHover(t.accent),
        accentText: textOn(t.accent),
        ...(tokens.colors.glowColor ? { glowColor: t.accent } : {})
      }
    : tokens.colors;

  return {
    ...style,
    tokens: {
      ...tokens,
      colors,
      radii: {
        ...r,
        sm: dial(r.sm, t.radius, RADIUS_BASE.sm),
        md: dial(r.md, t.radius, RADIUS_BASE.md),
        lg: dial(r.lg, t.radius, RADIUS_BASE.lg),
        ...(r.xl !== undefined ? { xl: dial(r.xl, t.radius, RADIUS_BASE.xl) } : {})
      },
      shadows: {
        ...s,
        sm: shadow(s.sm)!,
        md: shadow(s.md)!,
        lg: shadow(s.lg)!,
        ...(s.inset !== undefined ? { inset: shadow(s.inset) } : {}),
        ...(s.colored !== undefined ? { colored: shadow(s.colored) } : {}),
        ...(s.glow !== undefined ? { glow: shadow(s.glow) } : {})
      },
      borders: {
        ...tokens.borders,
        width: dial(tokens.borders.width, t.border, BORDER_BASE),
        ...(t.border > 1 && tokens.borders.style === 'none' ? { style: 'solid' as const } : {})
      },
      typography: {
        ...ty,
        fontSizeXs: scaleLengths(ty.fontSizeXs, t.type),
        fontSizeSm: scaleLengths(ty.fontSizeSm, t.type),
        fontSizeBase: scaleLengths(ty.fontSizeBase, t.type),
        fontSizeLg: scaleLengths(ty.fontSizeLg, t.type),
        fontSizeXl: scaleLengths(ty.fontSizeXl, t.type),
        fontSize2xl: scaleLengths(ty.fontSize2xl, t.type),
        fontSize3xl: scaleLengths(ty.fontSize3xl, t.type)
      },
      materials: { ...tokens.materials, density: round((tokens.materials?.density ?? 1) * t.density) }
    }
  };
}

/** Range of the motion speed preference (settings.motionIntensity), shown with the tweaks. */
export const MOTION_SPEED = { min: 0.25, max: 2, step: 0.05 } as const;

/** How a tweak value reads in the panel. */
export const formatTweak = (value: number) => `${Math.round(value * 100)}%`;

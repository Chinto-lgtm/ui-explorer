/**
 * UI Explorer — Style DNA
 * A descriptive fingerprint of a style's design characteristics (not a rating),
 * a deterministic hash for duplicate detection and sharing, and a descriptive
 * similarity function that lists shared traits.
 */

import type { StyleDefinition } from '../types';
import { hexToRgb } from './vocab';

export type DnaAxis = 'typography' | 'color' | 'geometry' | 'surface' | 'depth' | 'border' | 'motion' | 'icon' | 'svg';

export const DNA_AXES: DnaAxis[] = ['typography', 'color', 'geometry', 'surface', 'depth', 'border', 'motion', 'icon', 'svg'];

/** Each axis 0..10 describing how expressive / heavy that dimension is. */
export type StyleDNA = Record<DnaAxis, number>;

const clamp10 = (n: number) => Math.max(0, Math.min(10, Math.round(n * 10) / 10));

const px = (v: string | undefined): number => {
  if (!v) return 0;
  const m = /(-?[\d.]+)px/.exec(v);
  return m ? parseFloat(m[1]) : 0;
};

const ms = (v: string | undefined): number => {
  if (!v) return 0;
  const m = /([\d.]+)(ms|s)/.exec(v);
  if (!m) return 0;
  return m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1]);
};

const saturationOf = (hex: string): number => {
  if (!hex.startsWith('#')) return 0.5;
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
};

/** Largest blur / offset found in a shadow string, as a rough "weight" of the shadow. */
const shadowWeight = (shadow: string | undefined): number => {
  if (!shadow || shadow === 'none') return 0;
  const nums = shadow.match(/-?[\d.]+px/g)?.map((n) => Math.abs(parseFloat(n))) ?? [];
  const inset = /inset/.test(shadow) ? 2 : 0;
  const hard = /\d+px \d+px 0(px)? /.test(shadow) ? 3 : 0;
  return Math.max(...nums, 0) / 4 + inset + hard;
};

export function computeStyleDNA(style: StyleDefinition): StyleDNA {
  const { tokens, svgLanguage } = style;
  const t = tokens.typography;
  const heading = t.fontFamilyHeading || t.fontFamilySans;
  const serif = /serif/i.test(heading) && !/sans-serif/i.test(heading);
  const mono = /mono/i.test(heading);
  const weight = Number(t.fontWeightBold) || 700;
  const typography = clamp10((weight - 400) / 50 + (serif ? 2 : 0) + (mono ? 2.5 : 0) + Math.abs(parseFloat(t.letterSpacing) || 0) * 40);

  const color = clamp10(saturationOf(tokens.colors.accent) * 8 + (saturationOf(tokens.colors.bg) * 6));

  const geometry = clamp10(px(tokens.radii.md) / 3);

  const blur = px(tokens.materials?.backdropBlur);
  const opacity = tokens.materials?.opacity ?? 1;
  const surface = clamp10(blur / 4 + (1 - opacity) * 8 + (tokens.materials?.gradient ? 2 : 0) + (tokens.materials?.texture && tokens.materials.texture !== 'none' ? 1.5 : 0));

  const depth = clamp10(shadowWeight(tokens.shadows.md) + (tokens.shadows.glow && tokens.shadows.glow !== 'none' ? 3 : 0));

  const border = clamp10(px(tokens.borders.width) * 2.5 + (tokens.borders.style === 'dashed' || tokens.borders.style === 'double' ? 2 : 0));

  const motion = clamp10(ms(tokens.motion.durationNormal) / 60 + Math.abs((tokens.motion.hoverScale ?? 1) - 1) * 60);

  const icon = clamp10((Number(tokens.icons?.strokeWidth) || 2) * 2.5 + (tokens.icons?.filled ? 2 : 0));

  const svg = clamp10(
    (svgLanguage?.decorativeShapes ? 3 : 0) +
    (svgLanguage?.patternOverlay ? 3 : 0) +
    (svgLanguage?.borderDecoration ? 2 : 0) +
    (svgLanguage?.cornerStyle === 'brutalist' || svgLanguage?.cornerStyle === 'bevel' ? 2 : 0)
  );

  return { typography, color, geometry, surface, depth, border, motion, icon, svg };
}

/** FNV-1a over the normalised DNA + key tokens → "XXXX-XXXX-XXXX". */
export function computeDnaHash(style: StyleDefinition): string {
  const dna = computeStyleDNA(style);
  const parts = [
    ...DNA_AXES.map((a) => dna[a].toFixed(1)),
    style.tokens.colors.bg, style.tokens.colors.accent,
    style.tokens.typography.fontFamilySans.split(',')[0].trim().toLowerCase(),
    style.tokens.radii.md, style.tokens.borders.width, style.tokens.motion.easing
  ];
  const input = parts.join('|');
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 ^= c; h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (h2 + c * 31 + (h1 & 0xff)) >>> 0;
  }
  const hex = (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

/** Euclidean distance in DNA space (0 = identical). */
export function dnaDistance(a: StyleDNA, b: StyleDNA): number {
  let sum = 0;
  for (const axis of DNA_AXES) sum += (a[axis] - b[axis]) ** 2;
  return Math.sqrt(sum);
}

export interface SimilarStyle {
  style: StyleDefinition;
  distance: number;
  shared: string[];
}

/** Human-readable traits derived from a style, used to explain similarity. */
export function describeTraits(style: StyleDefinition): string[] {
  const traits: string[] = [];
  const t = style.tokens;
  const blur = px(t.materials?.backdropBlur);
  if (blur >= 12) traits.push('glass surface');
  else if ((t.materials?.opacity ?? 1) < 1) traits.push('translucent surface');
  if (t.materials?.texture && t.materials.texture !== 'none') traits.push(`${t.materials.texture} texture`);
  if (t.materials?.gradient) traits.push('gradient surface');
  const radius = px(t.radii.md);
  if (radius === 0) traits.push('sharp corners');
  else if (radius >= 18) traits.push('large radius');
  else traits.push('soft corners');
  const bw = px(t.borders.width);
  if (bw >= 3) traits.push('strong border');
  else if (bw === 0) traits.push('no border');
  else traits.push('thin border');
  if (t.shadows.glow && t.shadows.glow !== 'none') traits.push('glow');
  if (/inset/.test(t.shadows.md)) traits.push('inset depth');
  else if (/\d+px \d+px 0/.test(t.shadows.md)) traits.push('hard offset shadow');
  else if (t.shadows.md === 'none') traits.push('flat depth');
  else traits.push('soft shadow');
  const heading = t.typography.fontFamilyHeading || t.typography.fontFamilySans;
  if (/mono/i.test(heading)) traits.push('monospace type');
  else if (/serif/i.test(heading) && !/sans-serif/i.test(heading)) traits.push('serif type');
  if (isDark(t.colors.bg)) traits.push('dark palette');
  else traits.push('light palette');
  if (ms(t.motion.durationNormal) >= 350) traits.push('expressive motion');
  else if (ms(t.motion.durationNormal) <= 120) traits.push('instant motion');
  return traits;
}

const isDark = (hex: string): boolean => {
  if (!hex.startsWith('#')) return false;
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

/** Styles that share design characteristics with the given one, closest first (not ranked by quality). */
export function findSimilarStyles(style: StyleDefinition, candidates: StyleDefinition[], limit = 4): SimilarStyle[] {
  const dna = computeStyleDNA(style);
  const traits = new Set(describeTraits(style));
  return candidates
    .filter((c) => c.metadata.id !== style.metadata.id)
    .map((c) => ({
      style: c,
      distance: dnaDistance(dna, computeStyleDNA(c)),
      shared: describeTraits(c).filter((tr) => traits.has(tr))
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/** True when two styles are effectively the same design (used for batch duplicate detection). */
export function isNearDuplicate(a: StyleDefinition, b: StyleDefinition): boolean {
  if (computeDnaHash(a) === computeDnaHash(b)) return true;
  return dnaDistance(computeStyleDNA(a), computeStyleDNA(b)) < 1.2 && a.tokens.colors.accent === b.tokens.colors.accent;
}

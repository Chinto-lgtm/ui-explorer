/**
 * Discovery facets derived from a style's tokens, so the gallery can filter
 * on what a style *is* (glass, dark, hard-shadowed…) rather than on tags alone.
 */

import type { StyleDefinition } from '../../engine/types';
import { computeStyleDNA } from '../../engine/generator/dna';
import { hexToRgb } from '../../engine/generator/vocab';

export type Material = 'glass' | 'solid' | 'textured' | 'gradient';
export type Mood = 'dark' | 'light';
export type Depth = 'flat' | 'soft' | 'hard' | 'glow' | 'inset';
export type Motion = 'instant' | 'normal' | 'expressive';
export type Complexity = 'minimal' | 'moderate' | 'rich';
export type Source = 'official' | 'community' | 'custom' | 'generated';

export interface StyleFacets {
  material: Material;
  mood: Mood;
  depth: Depth;
  motion: Motion;
  complexity: Complexity;
  source: Source;
}

export const FACET_OPTIONS: { key: keyof Omit<StyleFacets, 'source'>; label: string; values: string[] }[] = [
  { key: 'material', label: 'Material', values: ['glass', 'solid', 'textured', 'gradient'] },
  { key: 'mood', label: 'Mood', values: ['light', 'dark'] },
  { key: 'depth', label: 'Depth', values: ['flat', 'soft', 'hard', 'glow', 'inset'] },
  { key: 'motion', label: 'Motion', values: ['instant', 'normal', 'expressive'] },
  { key: 'complexity', label: 'Complexity', values: ['minimal', 'moderate', 'rich'] }
];

const px = (v?: string) => (v ? parseFloat(v) || 0 : 0);
const ms = (v?: string) => {
  const m = /([\d.]+)(ms|s)/.exec(v ?? '');
  return m ? (m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1])) : 0;
};

const isDark = (color: string): boolean => {
  if (!color.startsWith('#')) return /rgba?\(\s*(\d+)/.test(color) ? Number(/rgba?\(\s*(\d+)/.exec(color)![1]) < 128 : false;
  const [r, g, b] = hexToRgb(color);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

export function computeFacets(style: StyleDefinition): StyleFacets {
  const t = style.tokens;
  const blur = px(t.materials?.backdropBlur);
  const material: Material =
    blur >= 8 ? 'glass'
    : t.materials?.texture && t.materials.texture !== 'none' ? 'textured'
    : t.materials?.gradient || t.materials?.backgroundImage ? 'gradient'
    : 'solid';
  const mood: Mood = isDark(t.colors.bg) ? 'dark' : 'light';
  const md = t.shadows.md ?? 'none';
  const depth: Depth =
    md === 'none' ? 'flat'
    : /inset/.test(md) ? 'inset'
    : t.shadows.glow && t.shadows.glow !== 'none' ? 'glow'
    : /\d+px \d+px 0(px)? /.test(md) ? 'hard'
    : 'soft';
  const dur = ms(t.motion.durationNormal);
  const motion: Motion = dur <= 120 ? 'instant' : dur >= 350 ? 'expressive' : 'normal';
  const dna = computeStyleDNA(style);
  const richness = dna.svg + dna.surface + dna.depth + dna.border;
  const complexity: Complexity = richness < 8 ? 'minimal' : richness < 16 ? 'moderate' : 'rich';
  const source: Source =
    style.generation ? 'generated'
    : style.metadata.isCustom || style.metadata.source === 'custom' ? 'custom'
    : style.metadata.source === 'community' ? 'community'
    : 'official';
  return { material, mood, depth, motion, complexity, source };
}

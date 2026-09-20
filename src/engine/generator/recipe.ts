/**
 * UI Explorer — Style Recipe & "Why This Style?" Explanation Engine
 * Rule-based, deterministic template generator.
 */

import type { StyleDefinition } from '../types';

export interface StyleRecipe {
  seed: number;
  personality: string;
  visualFamily: string;
  colorHarmony: string;
  typography: string;
  surface: string;
  depth: string;
  geometry: string;
  motion: string;
  svg: string;
}

export function generateStyleRecipe(style: StyleDefinition, seed: number, harmony = 'Analogous'): StyleRecipe {
  const { metadata, tokens } = style;
  return {
    seed,
    personality: metadata.personality || metadata.category,
    visualFamily: metadata.category,
    colorHarmony: harmony,
    typography: tokens.typography.fontFamilySans.split(',')[0],
    surface: tokens.materials?.gradient ? 'Gradient Glass' : 'Solid Surface',
    depth: tokens.shadows.glow && tokens.shadows.glow !== 'none' ? 'Glowing Shadow' : 'Soft Elevation',
    geometry: `Radius (${tokens.radii.md})`,
    motion: `${tokens.motion.durationNormal} ${tokens.motion.easing}`,
    svg: style.svgLanguage?.cornerStyle || 'Rounded'
  };
}

export function generateWhyThisStyle(style: StyleDefinition, recipe: StyleRecipe): string[] {
  const explanations: string[] = [
    `Paired ${recipe.typography} typography with ${recipe.surface} surfaces to establish a clean ${recipe.personality.toLowerCase()} hierarchy.`,
    `Selected a ${recipe.colorHarmony} color harmony with accent color (${style.tokens.colors.accent}) to balance visual weight against the background (${style.tokens.colors.bg}).`,
    `Configured ${recipe.geometry} corners and ${recipe.depth} depth to maintain tactile element clarity across button hover states.`,
    `Integrated ${style.metadata.category} motion curve (${style.tokens.motion.easing}) to deliver smooth interface feedback.`
  ];

  return explanations;
}

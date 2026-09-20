/**
 * UI Explorer — Per-style construction defaults
 * Behaviour, material texture and SVG language for every built-in style.
 * Applied on top of each definition so a style file only needs to override
 * what makes it different. treatments.css turns these into bespoke rendering.
 */

import type { StyleDefinition, ComponentBehavior, MaterialTokens, SVGLanguage } from '../engine/types';

interface TreatmentDefaults {
  behavior: ComponentBehavior;
  texture: NonNullable<MaterialTokens['texture']>;
  svg: SVGLanguage;
}

const D = (
  hover: ComponentBehavior['buttonHoverAction'],
  card: ComponentBehavior['cardElevationType'],
  focus: ComponentBehavior['focusRingStyle'],
  texture: TreatmentDefaults['texture'],
  corner: SVGLanguage['cornerStyle'],
  decorative = false,
  pattern?: string
): TreatmentDefaults => ({
  behavior: { buttonHoverAction: hover, cardElevationType: card, focusRingStyle: focus },
  texture,
  svg: { cornerStyle: corner, decorativeShapes: decorative, patternOverlay: pattern, borderDecoration: corner === 'bevel' || corner === 'brutalist' }
});

export const TREATMENT_DEFAULTS: Record<string, TreatmentDefaults> = {
  // Morphism
  neumorphism: D('press', 'inset', 'glow', 'none', 'rounded'),
  glassmorphism: D('glow', 'gradient-border', 'glow', 'none', 'rounded', true, 'aurora'),
  claymorphism: D('press', 'inset', 'outline', 'none', 'rounded', true),
  auroramorphism: D('glow', 'gradient-border', 'glow', 'none', 'rounded', true, 'aurora'),
  'aero-glass': D('lift', 'shadow', 'glow', 'none', 'rounded', true),
  'community-aurora-glass': D('glow', 'gradient-border', 'glow', 'none', 'rounded', true, 'aurora'),

  // Modern
  'bento-grid': D('lift', 'border', 'outline', 'none', 'rounded'),
  'swiss-style': D('invert', 'border', 'solid-border', 'none', 'sharp', false, 'grid'),
  editorial: D('invert', 'border', 'solid-border', 'none', 'sharp'),
  'flat-design': D('none', 'flat', 'outline', 'none', 'rounded'),
  'material-design-3': D('lift', 'shadow', 'outline', 'none', 'rounded'),
  'fluent-design': D('lift', 'shadow', 'outline', 'noise', 'rounded'),
  'minimal-warm': D('lift', 'shadow', 'outline', 'none', 'rounded'),

  // Expressive
  'neo-brutalism': D('shift', 'shadow', 'double-ring', 'none', 'brutalist'),
  cyberpunk: D('glow', 'gradient-border', 'glow', 'scanline', 'sharp', true, 'grid'),
  vaporwave: D('glow', 'gradient-border', 'glow', 'grid', 'rounded', true, 'grid'),
  memphis: D('shift', 'shadow', 'double-ring', 'dot-pattern', 'brutalist', true, 'dots'),
  'y2k-aesthetic': D('lift', 'shadow', 'glow', 'none', 'rounded', true),
  'acid-graphics': D('invert', 'border', 'glow', 'grain', 'sharp', true, 'noise'),

  // Futuristic
  'sci-fi-hud': D('glow', 'border', 'glow', 'grid', 'bevel', false, 'grid'),
  'dark-oled': D('glow', 'border', 'glow', 'none', 'rounded'),
  'chrome-metallic': D('press', 'shadow', 'glow', 'none', 'rounded', true),

  // Retro
  'pixel-art': D('shift', 'shadow', 'solid-border', 'none', 'sharp', false, 'dots'),
  skeuomorphism: D('press', 'shadow', 'outline', 'grain', 'rounded'),
  'skeuomorphic-analog': D('press', 'inset', 'outline', 'noise', 'rounded'),

  // Artistic & minimalist
  bauhaus: D('shift', 'border', 'solid-border', 'none', 'sharp', true),
  'organic-biophilic': D('lift', 'shadow', 'outline', 'grain', 'rounded', true),
  industrial: D('press', 'border', 'solid-border', 'noise', 'sharp', false, 'grid'),
  'paper-skeuomorphic': D('lift', 'shadow', 'outline', 'grain', 'rounded'),
  'high-contrast': D('invert', 'border', 'solid-border', 'none', 'sharp'),
  monochrome: D('invert', 'border', 'solid-border', 'none', 'rounded')
};

/** Fill behaviour, texture and SVG language where a style definition leaves them out. */
export function withTreatmentDefaults(style: StyleDefinition): StyleDefinition {
  const defaults = TREATMENT_DEFAULTS[style.metadata.id];
  if (!defaults) return style;
  return {
    ...style,
    tokens: {
      ...style.tokens,
      materials: {
        ...style.tokens.materials,
        texture: style.tokens.materials?.texture ?? defaults.texture
      }
    },
    behavior: style.behavior ?? defaults.behavior,
    svgLanguage: { ...defaults.svg, ...style.svgLanguage }
  };
}

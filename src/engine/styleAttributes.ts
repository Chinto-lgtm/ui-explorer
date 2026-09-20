/**
 * UI Explorer — Style data attributes
 * Every themed container (canvas, device frame, compare panel, preview card)
 * carries the same data attributes so treatments.css can give each design
 * language bespoke construction without forking components.
 */

import type { StyleDefinition } from './types';

/** Coarse treatment family used by treatments.css for bespoke CSS. */
export type TreatmentFamily =
  | 'neumorphic' | 'glass' | 'clay' | 'aero' | 'aurora'
  | 'brutal' | 'neon' | 'chrome' | 'pixel' | 'skeuo' | 'analog' | 'memphis' | 'y2k' | 'acid'
  | 'paper' | 'hud' | 'editorial' | 'swiss' | 'material' | 'fluent' | 'oled' | 'industrial' | 'bauhaus'
  | 'organic' | 'contrast' | 'mono' | 'flat' | 'bento' | 'warm' | 'vapor' | 'generic';

const FAMILY_BY_ID: Record<string, TreatmentFamily> = {
  neumorphism: 'neumorphic',
  glassmorphism: 'glass',
  claymorphism: 'clay',
  auroramorphism: 'aurora',
  'aero-glass': 'aero',
  'community-aurora-glass': 'aurora',
  'neo-brutalism': 'brutal',
  cyberpunk: 'neon',
  vaporwave: 'vapor',
  memphis: 'memphis',
  'y2k-aesthetic': 'y2k',
  'acid-graphics': 'acid',
  'sci-fi-hud': 'hud',
  'dark-oled': 'oled',
  'chrome-metallic': 'chrome',
  'pixel-art': 'pixel',
  skeuomorphism: 'skeuo',
  'skeuomorphic-analog': 'analog',
  bauhaus: 'bauhaus',
  'organic-biophilic': 'organic',
  industrial: 'industrial',
  'paper-skeuomorphic': 'paper',
  'high-contrast': 'contrast',
  monochrome: 'mono',
  'bento-grid': 'bento',
  'swiss-style': 'swiss',
  editorial: 'editorial',
  'flat-design': 'flat',
  'material-design-3': 'material',
  'fluent-design': 'fluent',
  'minimal-warm': 'warm'
};

/** Generated and custom styles get a family from their construction. */
function inferFamily(style: StyleDefinition): TreatmentFamily {
  const recipe = style.generation?.recipe;
  if (recipe) {
    switch (recipe.surface) {
      case 'glass': case 'frosted': case 'acrylic': case 'crystal': return 'glass';
      case 'clay': return 'clay';
      case 'metallic': return 'chrome';
      case 'liquid': return 'aurora';
      case 'paper': return 'paper';
      case 'inset': return 'neumorphic';
      default: break;
    }
    if (recipe.depth === 'physical') return 'brutal';
    if (recipe.depth === 'glowing') return 'neon';
    if (recipe.icons === 'pixel') return 'pixel';
    return 'generic';
  }
  const t = style.tokens;
  const blur = parseFloat(t.materials?.backdropBlur ?? '0') || 0;
  if (blur >= 12) return 'glass';
  if (/\d+px \d+px 0/.test(t.shadows.md)) return 'brutal';
  if (t.shadows.glow && t.shadows.glow !== 'none') return 'neon';
  if (/inset/.test(t.shadows.md) && /-\d+px -\d+px/.test(t.shadows.md)) return 'neumorphic';
  return 'generic';
}

export interface StyleDataAttributes {
  'data-style': string;
  'data-family': TreatmentFamily;
  'data-texture': string;
  'data-hover': string;
  'data-focus': string;
  'data-elevation': string;
  'data-corner': string;
}

export function getStyleDataAttributes(style: StyleDefinition): StyleDataAttributes {
  const baseId = style.metadata.id.replace(/-custom(-\d+)?$/, '').replace(/-copy(-\d+)?$/, '');
  return {
    'data-style': style.metadata.id,
    'data-family': FAMILY_BY_ID[baseId] ?? inferFamily(style),
    'data-texture': style.tokens.materials?.texture ?? 'none',
    'data-hover': style.behavior?.buttonHoverAction ?? 'lift',
    'data-focus': style.behavior?.focusRingStyle ?? 'outline',
    'data-elevation': style.behavior?.cardElevationType ?? 'shadow',
    'data-corner': style.svgLanguage?.cornerStyle ?? 'rounded'
  };
}

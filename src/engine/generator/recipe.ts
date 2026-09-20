/**
 * UI Explorer — Style Recipe & "Why This Style?" Explanation Engine
 * Rule-based, deterministic template generator.
 */

import type { StyleDefinition } from '../types';
import type { SemanticRecipe } from './vocab';
import type { CoherenceReport } from './compatibility';

export interface StyleRecipe {
  seed: number;
  personality: string;
  visualFamily: string;
  colorHarmony: string;
  typography: string;
  surface: string;
  depth: string;
  geometry: string;
  border: string;
  icons: string;
  motion: string;
  svg: string;
  behavior: string;
}

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function generateStyleRecipe(style: StyleDefinition, seed: number, semantic: SemanticRecipe): StyleRecipe {
  return {
    seed,
    personality: semantic.personality,
    visualFamily: semantic.visualFamily,
    colorHarmony: semantic.harmony,
    typography: semantic.typography.headingFamily.split(',')[0],
    surface: title(semantic.surface),
    depth: title(semantic.depth),
    geometry: `${title(semantic.geometry)} (${style.tokens.radii.md})`,
    border: title(semantic.border),
    icons: title(semantic.icons),
    motion: title(semantic.motion),
    svg: `${title(semantic.svg.shapeLanguage)} shapes, ${semantic.svg.gradientType} gradients`,
    behavior: title(semantic.behavior)
  };
}

const SURFACE_WHY: Record<string, string> = {
  glass: 'translucent glass surfaces let the background colour bleed through, which reads as light and spatial',
  frosted: 'frosted surfaces soften whatever sits behind them, keeping content legible without losing depth',
  acrylic: 'acrylic surfaces add a fine noise texture under heavy blur, so panels feel like a physical material',
  crystal: 'crystal surfaces combine light blur with a diagonal highlight for a faceted, premium feel',
  clay: 'clay surfaces are opaque with a soft inner highlight, giving components a pillowy, tactile body',
  metallic: 'metallic surfaces use a vertical reflection gradient so cards read as brushed, polished panels',
  liquid: 'liquid surfaces carry a tinted accent gradient across each panel for constant gentle movement',
  paper: 'paper surfaces stay matte with a light grain, which suits long reading and editorial layouts',
  flat: 'flat surfaces remove elevation entirely so hierarchy comes from type and colour alone',
  solid: 'solid surfaces keep panels opaque and calm, letting the accent colour do the talking',
  transparent: 'near-transparent surfaces keep the interface airy and let outlines and glow define structure',
  inset: 'inset surfaces sit slightly below the page, a quiet nod to physical controls',
  elevated: 'elevated surfaces float above the page on soft shadow, the familiar card idiom',
  experimental: 'experimental surfaces mix tinted glass with scanlines for a deliberately unstable, energetic look'
};

const DEPTH_WHY: Record<string, string> = {
  flat: 'no shadows at all, so edges and borders carry every boundary',
  soft: 'soft, low-contrast shadows that suggest elevation without shouting',
  floating: 'long, diffused shadows that lift cards well clear of the page',
  deep: 'dense shadows for a dramatic, cinematic sense of depth',
  glowing: 'accent-coloured glow instead of dark shadow, so depth reads as light',
  inset: 'inner shadows that press components into the surface',
  physical: 'hard offset shadows with zero blur, a printed, physical feel'
};

const MOTION_WHY: Record<string, string> = {
  static: 'no transitions; state changes are instant and deliberate',
  subtle: 'short, quiet transitions that stay out of the way',
  smooth: 'medium-length eased transitions for a fluid feel',
  physical: 'quick transitions with a pronounced press scale, like real buttons',
  expressive: 'long, decelerating transitions that make every change feel staged',
  mechanical: 'stepped easing so movement happens in discrete clicks',
  snappy: 'fast, decisive transitions for a responsive, tool-like feel',
  elastic: 'overshooting easing so elements bounce into place'
};

export function generateWhyThisStyle(
  style: StyleDefinition,
  semantic: SemanticRecipe,
  coherence: CoherenceReport,
  repairedAxes: string[]
): string[] {
  const heading = semantic.typography.headingFamily.split(',')[0];
  const body = semantic.typography.family.split(',')[0];
  const lines: string[] = [
    `Started from a ${semantic.personality.toLowerCase()} personality in the ${semantic.visualFamily} family; every other decision was weighted against it.`,
    `Chose ${title(semantic.surface)} surfaces because ${SURFACE_WHY[semantic.surface] ?? 'they fit the personality'}.`,
    `Paired ${heading} headings${heading !== body ? ` with ${body} body text` : ''} at weight ${semantic.typography.headingWeight}, letter-spacing ${semantic.typography.letterSpacing} and a ${semantic.typography.scale} type scale.`,
    `Built a ${semantic.harmony.toLowerCase()} palette around the accent ${style.tokens.colors.accent} on a ${style.tokens.colors.bg} background.`,
    `Set ${title(semantic.geometry)} corners (${style.tokens.radii.md}) and ${semantic.border} borders (${style.tokens.borders.width} ${style.tokens.borders.style}) to match the surface.`,
    `Depth is ${semantic.depth}: ${DEPTH_WHY[semantic.depth]}.`,
    `Motion is ${semantic.motion}: ${MOTION_WHY[semantic.motion]}; component behaviour follows the ${semantic.behavior} family.`,
    `Icons are ${semantic.icons} with a ${style.tokens.icons?.strokeWidth ?? 2}px stroke; SVG graphics use ${semantic.svg.shapeLanguage} shapes with ${semantic.svg.gradientType} gradients.`
  ];

  const tensions = coherence.relations.filter((r) => r.relation < 0);
  if (tensions.length > 0) {
    lines.push(`Kept deliberate tension in ${tensions.map((t) => t.label.toLowerCase()).join(' and ')} — the personality allows it.`);
  }
  if (repairedAxes.length > 0) {
    lines.push(`Repaired ${repairedAxes.join(', ')} after the first pass produced an unusable pairing.`);
  }
  return lines;
}

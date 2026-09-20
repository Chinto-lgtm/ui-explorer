/**
 * UI Explorer — Compatibility Matrix & Coherence Evaluator
 * Numeric relationships between semantic choices. Used only to weight
 * generation and decide whether a style needs repair; never shown as a rating.
 *
 *   strong = +2, compatible = +1, neutral = 0, tension = -1, incompatible = -2
 */

import type { SemanticRecipe, SurfaceType, DepthType, BorderType, MotionType, IconType, GeometryType, RecipeAxis } from './vocab';

export type Relation = -2 | -1 | 0 | 1 | 2;

type Pair<A extends string, B extends string> = Partial<Record<A, Partial<Record<B, Relation>>>>;

const SURFACE_DEPTH: Pair<SurfaceType, DepthType> = {
  glass:        { glowing: 2, soft: 2, floating: 1, flat: 0, physical: -2, inset: -1, deep: 0 },
  frosted:      { soft: 2, floating: 1, glowing: 1, physical: -2, inset: 0 },
  acrylic:      { soft: 2, floating: 2, glowing: 1, physical: -2 },
  crystal:      { glowing: 2, floating: 1, soft: 1, physical: -2, flat: -1 },
  clay:         { physical: 1, inset: 2, soft: 2, deep: 1, glowing: -1, flat: -1 },
  inset:        { inset: 2, soft: 1, flat: 0, floating: -2, deep: -1 },
  metallic:     { deep: 2, physical: 1, glowing: 1, floating: 1, flat: -1 },
  liquid:       { glowing: 2, floating: 2, soft: 1, physical: -2 },
  paper:        { soft: 2, flat: 1, floating: 0, glowing: -2, physical: 0, inset: 0 },
  flat:         { flat: 2, soft: 1, physical: 1, floating: -1, glowing: -1, deep: -1, inset: -1 },
  solid:        { soft: 2, deep: 1, flat: 1, physical: 1, floating: 1, glowing: 0 },
  transparent:  { glowing: 2, flat: 1, floating: 0, physical: -1, inset: -1, deep: -1 },
  elevated:     { floating: 2, soft: 2, deep: 1, flat: -1, inset: -2 },
  experimental: { glowing: 1, physical: 0, deep: 0 }
};

const SURFACE_BORDER: Pair<SurfaceType, BorderType> = {
  glass:        { subtle: 2, glow: 1, thin: 0, strong: -2, double: -2, dashed: -1, none: 1 },
  frosted:      { subtle: 2, thin: 1, none: 1, strong: -2, double: -1 },
  acrylic:      { subtle: 2, thin: 1, strong: -2 },
  crystal:      { subtle: 2, glow: 2, strong: -2 },
  clay:         { none: 2, subtle: 1, strong: -1, thin: 0 },
  inset:        { none: 1, subtle: 1, strong: -1 },
  metallic:     { thin: 2, subtle: 1, double: 1, strong: 0, glow: 0, none: -1 },
  liquid:       { none: 1, subtle: 2, glow: 1, strong: -2 },
  paper:        { thin: 2, subtle: 1, dashed: 1, strong: 0, glow: -2 },
  flat:         { thin: 2, strong: 1, subtle: 1, dashed: 0, glow: -1 },
  solid:        { thin: 1, strong: 2, subtle: 1, double: 1, none: 0 },
  transparent:  { glow: 2, thin: 1, subtle: 1, strong: 0, none: -1 },
  elevated:     { none: 2, subtle: 2, thin: 1, strong: -1 },
  experimental: { glow: 2, dashed: 1, double: 1 }
};

const GEOMETRY_SURFACE: Pair<GeometryType, SurfaceType> = {
  sharp:  { flat: 2, solid: 2, paper: 1, transparent: 1, metallic: 0, glass: -1, frosted: -1, acrylic: -1, clay: -2, liquid: -1, elevated: 0 },
  small:  { paper: 2, flat: 1, solid: 1, metallic: 1, glass: 0, clay: -1 },
  medium: { solid: 1, elevated: 1, glass: 1, frosted: 1, acrylic: 1, metallic: 1, paper: 0 },
  large:  { clay: 2, glass: 1, frosted: 1, elevated: 1, liquid: 1, flat: 0, paper: -1 },
  pill:   { clay: 2, liquid: 1, elevated: 1, glass: 0, flat: -1, paper: -2, metallic: -1 }
};

const DEPTH_BORDER: Pair<DepthType, BorderType> = {
  physical: { strong: 2, thin: 1, none: -2, subtle: -1, glow: -2 },
  glowing:  { glow: 2, subtle: 1, none: 1, strong: -1, double: -1 },
  flat:     { thin: 2, strong: 1, subtle: 1, none: 0, glow: -1 },
  inset:    { none: 1, subtle: 1, strong: -1 },
  floating: { none: 2, subtle: 1, strong: -1 },
  soft:     { subtle: 2, thin: 1, none: 1, strong: 0 },
  deep:     { thin: 1, none: 1, subtle: 1, strong: 0 }
};

const ICON_SURFACE: Pair<IconType, SurfaceType> = {
  pixel:        { flat: 2, solid: 2, glass: -2, frosted: -2, acrylic: -2, liquid: -2, crystal: -2 },
  skeuomorphic: { metallic: 2, paper: 1, clay: 1, glass: -1, flat: -1 },
  geometric:    { flat: 2, solid: 1, transparent: 1, clay: -1 },
  '3d':         { clay: 2, metallic: 2, liquid: 1, flat: -1, paper: -1 },
  duotone:      { glass: 1, frosted: 1, elevated: 1 },
  rounded:      { clay: 2, elevated: 1, glass: 1, paper: 0 },
  outline:      { flat: 1, solid: 1, glass: 1, paper: 1, transparent: 1 },
  filled:       { solid: 1, elevated: 1, metallic: 1 }
};

const MOTION_DEPTH: Pair<MotionType, DepthType> = {
  static:     { flat: 2, physical: 1, glowing: -1, floating: -1 },
  mechanical: { physical: 2, flat: 1, glowing: 0, floating: -1, soft: -1 },
  elastic:    { soft: 2, floating: 1, inset: 1, flat: -1, physical: 0 },
  physical:   { physical: 2, inset: 2, deep: 1, glowing: -1 },
  expressive: { glowing: 2, floating: 2, deep: 1, flat: -1 },
  smooth:     { soft: 2, floating: 1, glowing: 1, deep: 1 },
  snappy:     { flat: 2, soft: 1, physical: 1, floating: 0 },
  subtle:     { soft: 2, flat: 1, inset: 1 }
};

const rel = <A extends string, B extends string>(table: Pair<A, B>, a: A, b: B): Relation => table[a]?.[b] ?? 0;

export function surfaceDepthRelation(s: SurfaceType, d: DepthType): Relation { return rel(SURFACE_DEPTH, s, d); }
export function surfaceBorderRelation(s: SurfaceType, b: BorderType): Relation { return rel(SURFACE_BORDER, s, b); }
export function geometrySurfaceRelation(g: GeometryType, s: SurfaceType): Relation { return rel(GEOMETRY_SURFACE, g, s); }
export function depthBorderRelation(d: DepthType, b: BorderType): Relation { return rel(DEPTH_BORDER, d, b); }
export function iconSurfaceRelation(i: IconType, s: SurfaceType): Relation { return rel(ICON_SURFACE, i, s); }
export function motionDepthRelation(m: MotionType, d: DepthType): Relation { return rel(MOTION_DEPTH, m, d); }

const isSerif = (family: string) => /serif/i.test(family) && !/sans-serif/i.test(family);
const isMono = (family: string) => /mono/i.test(family);

/** Typography ↔ surface / personality relationship. */
export function typographyRelation(headingFamily: string, surface: SurfaceType, personality: string): Relation {
  if (isMono(headingFamily)) {
    if (surface === 'transparent' || surface === 'flat' || surface === 'solid') return 2;
    if (surface === 'clay' || surface === 'liquid') return -2;
    if (personality === 'Technical' || personality === 'Futuristic') return 2;
    return -1;
  }
  if (isSerif(headingFamily)) {
    if (surface === 'paper' || surface === 'flat') return 2;
    if (personality === 'Editorial' || personality === 'Luxury') return 2;
    if (surface === 'glass' || surface === 'crystal' || surface === 'liquid') return -1;
    if (personality === 'Futuristic' || personality === 'Technical') return -2;
    return 0;
  }
  return 1;
}

/** SVG language ↔ surface. */
export function svgSurfaceRelation(recipe: SemanticRecipe): Relation {
  const { svg, surface } = recipe;
  if (svg.strokeLanguage === 'pixel' && (surface === 'glass' || surface === 'frosted' || surface === 'liquid')) return -2;
  if (svg.gradientType === 'aurora' && (surface === 'glass' || surface === 'liquid' || surface === 'transparent')) return 2;
  if (svg.gradientType === 'metallic' && surface === 'metallic') return 2;
  if (svg.shapeLanguage === 'grid' && (surface === 'transparent' || surface === 'flat')) return 2;
  if (svg.blurLevel > 0.5 && (surface === 'paper' || surface === 'flat')) return -1;
  if (svg.shapeLanguage === 'blobs' && (surface === 'clay' || surface === 'liquid')) return 2;
  return 0;
}

export interface AxisRelation {
  axis: RecipeAxis;
  label: string;
  relation: Relation;
  detail: string;
}

export interface CoherenceReport {
  /** 0..1 weighted average; internal only. */
  score: number;
  relations: AxisRelation[];
  /** The generation axis whose pairings are weakest, or null when everything is acceptable. */
  weakestAxis: RecipeAxis | null;
  weakestRelation: Relation;
}

const WEIGHTS: Record<RecipeAxis, number> = {
  colors: 1, typography: 1.2, geometry: 1, surface: 1.5, depth: 1.3, borders: 1, icons: 0.8, motion: 0.9, svg: 0.7
};

/** Evaluate every pairing of a semantic recipe. */
export function evaluateRecipe(recipe: SemanticRecipe): CoherenceReport {
  const relations: AxisRelation[] = [
    { axis: 'depth', label: 'Surface ↔ Depth', relation: surfaceDepthRelation(recipe.surface, recipe.depth), detail: `${recipe.surface} surface with ${recipe.depth} depth` },
    { axis: 'borders', label: 'Surface ↔ Border', relation: surfaceBorderRelation(recipe.surface, recipe.border), detail: `${recipe.surface} surface with ${recipe.border} border` },
    { axis: 'geometry', label: 'Geometry ↔ Surface', relation: geometrySurfaceRelation(recipe.geometry, recipe.surface), detail: `${recipe.geometry} corners on a ${recipe.surface} surface` },
    { axis: 'borders', label: 'Depth ↔ Border', relation: depthBorderRelation(recipe.depth, recipe.border), detail: `${recipe.depth} depth with ${recipe.border} border` },
    { axis: 'icons', label: 'Icons ↔ Surface', relation: iconSurfaceRelation(recipe.icons, recipe.surface), detail: `${recipe.icons} icons on ${recipe.surface}` },
    { axis: 'motion', label: 'Motion ↔ Depth', relation: motionDepthRelation(recipe.motion, recipe.depth), detail: `${recipe.motion} motion with ${recipe.depth} depth` },
    { axis: 'typography', label: 'Typography ↔ Surface', relation: typographyRelation(recipe.typography.headingFamily, recipe.surface, recipe.personality), detail: `${recipe.typography.headingFamily.split(',')[0]} on ${recipe.surface}` },
    { axis: 'svg', label: 'SVG ↔ Surface', relation: svgSurfaceRelation(recipe), detail: `${recipe.svg.shapeLanguage} shapes, ${recipe.svg.gradientType} gradients on ${recipe.surface}` },
    { axis: 'colors', label: 'Palette ↔ Personality', relation: 1, detail: `${recipe.harmony} harmony for a ${recipe.personality.toLowerCase()} personality` }
  ];

  let weighted = 0;
  let totalWeight = 0;
  for (const r of relations) {
    const w = WEIGHTS[r.axis];
    weighted += ((r.relation + 2) / 4) * w;
    totalWeight += w;
  }
  const score = Math.round((weighted / totalWeight) * 100) / 100;

  const sorted = [...relations].sort((a, b) => a.relation - b.relation);
  const worst = sorted[0];
  return {
    score,
    relations,
    weakestAxis: worst.relation < 0 ? worst.axis : null,
    weakestRelation: worst.relation
  };
}

/** Multiplier applied to a candidate's weight according to its relationships with already chosen axes. */
export function compatibilityFactor(relation: Relation, mode: 'Coherent' | 'Experimental' | 'Extreme'): number {
  if (mode === 'Extreme') return 1;
  const table: Record<Relation, number> = mode === 'Coherent'
    ? { [-2]: 0.05, [-1]: 0.35, 0: 1, 1: 1.6, 2: 2.4 }
    : { [-2]: 0.4, [-1]: 0.8, 0: 1, 1: 1.2, 2: 1.4 };
  return table[relation];
}

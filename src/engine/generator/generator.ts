/**
 * UI Explorer — Procedural Style Generator (engine 2.0)
 *
 * Pipeline: seed → personality → semantic recipe (colors, typography, geometry,
 * surface, depth, borders, icons, motion, svg, behavior) → compatibility
 * weighting per mode → repair loop → materialized tokens → identity.
 *
 * Everything is deterministic for a given (seed, mode, locks, base, version).
 */

import type { StyleDefinition, DesignTokens, StyleCategory, GenerationInfo } from '../types';
import { createSeededRandom, hashSeed } from '../random/prng';
import type { PRNG } from '../random/prng';
import { PERSONALITY_MAP } from './personalities';
import type { PersonalityType, PersonalityRules } from './personalities';
import { generateProceduralColors, evaluateAccessibility } from './colorEngine';
import type { AccessibilityMetrics } from './colorEngine';
import {
  RECIPE_AXES, SURFACE_TYPES, DEPTH_TYPES, BORDER_TYPES, ICON_TYPES, GEOMETRY_TYPES, MOTION_TYPES,
  toSurface, toDepth, toMotion, toSvgLanguage, radiusToGeometry,
  materializeSurface, materializeDepth, materializeBorder, materializeMotion, materializeIcons,
  materializeGeometry, materializeTypography, materializeSvg, materializeBehavior, motionToBehavior
} from './vocab';
import type {
  SemanticRecipe, RecipeAxis, SurfaceType, DepthType, BorderType, IconType, GeometryType, MotionType,
  TypographyChoice, GeneratedSvgLanguage, DensityType
} from './vocab';
import {
  evaluateRecipe, compatibilityFactor,
  surfaceDepthRelation, surfaceBorderRelation, geometrySurfaceRelation, depthBorderRelation,
  iconSurfaceRelation, motionDepthRelation, typographyRelation
} from './compatibility';
import type { CoherenceReport, Relation } from './compatibility';
import { generateStyleRecipe, generateWhyThisStyle } from './recipe';
import type { StyleRecipe } from './recipe';
import { computeStyleDNA, computeDnaHash, isNearDuplicate } from './dna';
import type { StyleDNA } from './dna';

export const GENERATOR_VERSION = '2.0.0';

export type GenerationMode = 'Coherent' | 'Experimental' | 'Extreme';
export type RemixStrength = 'Subtle' | 'Balanced' | 'Strong';

export type GenerationLocks = Partial<Record<RecipeAxis, boolean>>;

export interface GenerateOptions {
  seed: string | number;
  mode?: GenerationMode;
  personalityType?: PersonalityType;
  visualFamily?: string;
  /** Axes to keep from `baseStyle`. */
  locks?: GenerationLocks;
  baseStyle?: StyleDefinition;
  /** Recorded as lineage when remixing. */
  parentSeed?: number;
  parentId?: string;
}

export interface DecisionCandidate {
  value: string;
  baseWeight: number;
  factor: number;
  finalWeight: number;
  reasons: string[];
}

/** One recorded generation decision, for the debug panel and rule inspector. */
export interface DecisionTrace {
  axis: RecipeAxis | 'personality' | 'family' | 'behavior';
  chosen: string;
  locked: boolean;
  candidates: DecisionCandidate[];
}

export interface GeneratedStyleResult {
  style: StyleDefinition;
  recipe: StyleRecipe;
  semantic: SemanticRecipe;
  explanations: string[];
  seedNumber: number;
  accessibility: AccessibilityMetrics;
  coherence: CoherenceReport;
  repairedAxes: string[];
  repairIterations: number;
  trace: DecisionTrace[];
  dna: StyleDNA;
  dnaHash: string;
  mode: GenerationMode;
  locks: GenerationLocks;
  generatorVersion: string;
  fromCache: boolean;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const PERSONALITY_TYPES: PersonalityType[] = [
  'Calm', 'Professional', 'Luxury', 'Technical', 'Futuristic', 'Playful',
  'Organic', 'Editorial', 'Dark', 'Experimental', 'Energetic', 'Minimal'
];

const relationLabel = (r: Relation) => (r === 2 ? 'strong' : r === 1 ? 'compatible' : r === 0 ? 'neutral' : r === -1 ? 'tension' : 'incompatible');

/**
 * Pick from weighted options, multiplying each option's weight by its
 * compatibility with the axes already chosen. Records the full decision.
 */
function decide<T extends string>(
  prng: PRNG,
  axis: DecisionTrace['axis'],
  options: { value: T; weight: number }[],
  mode: GenerationMode,
  relations: (value: T) => { relation: Relation; reason: string }[],
  trace: DecisionTrace[]
): T {
  const candidates: DecisionCandidate[] = options.map((o) => {
    const rels = relations(o.value);
    let factor = 1;
    const reasons: string[] = [];
    for (const r of rels) {
      const f = compatibilityFactor(r.relation, mode);
      factor *= f;
      if (r.relation !== 0) reasons.push(`${r.reason}: ${relationLabel(r.relation)} (${r.relation > 0 ? '+' : ''}${r.relation})`);
    }
    return { value: o.value, baseWeight: o.weight, factor, finalWeight: o.weight * factor, reasons };
  });
  // A candidate whose every pairing is incompatible can still win in Extreme mode; in
  // Coherent mode its weight is tiny but never zero, so generation cannot dead-end.
  const chosen = prng.weightedChoice(candidates.map((c) => ({ value: c.value as T, weight: Math.max(c.finalWeight, 0.001) })));
  trace.push({ axis, chosen, locked: false, candidates });
  return chosen;
}

function lockedDecision(trace: DecisionTrace[], axis: DecisionTrace['axis'], value: string) {
  trace.push({ axis, chosen: value, locked: true, candidates: [{ value, baseWeight: 1, factor: 1, finalWeight: 1, reasons: ['kept from base style'] }] });
}

const surfaceOptions = (p: PersonalityRules) => {
  const merged = new Map<SurfaceType, number>();
  for (const s of p.surfaceWeights) merged.set(toSurface(s.surface), (merged.get(toSurface(s.surface)) ?? 0) + s.weight);
  // Every surface stays reachable so Experimental / Extreme can wander.
  for (const s of SURFACE_TYPES) if (!merged.has(s)) merged.set(s, 2);
  return Array.from(merged, ([value, weight]) => ({ value, weight }));
};

const depthOptions = (p: PersonalityRules) => {
  const merged = new Map<DepthType, number>();
  for (const d of p.depthWeights) merged.set(toDepth(d.depth), (merged.get(toDepth(d.depth)) ?? 0) + d.weight);
  for (const d of DEPTH_TYPES) if (!merged.has(d)) merged.set(d, 2);
  return Array.from(merged, ([value, weight]) => ({ value, weight }));
};

const motionOptions = (p: PersonalityRules) => {
  const merged = new Map<MotionType, number>();
  for (const m of p.motionWeights) merged.set(toMotion(m.motion), (merged.get(toMotion(m.motion)) ?? 0) + m.weight);
  for (const m of MOTION_TYPES) if (!merged.has(m)) merged.set(m, 2);
  return Array.from(merged, ([value, weight]) => ({ value, weight }));
};

const geometryOptions = (p: PersonalityRules) => {
  const merged = new Map<GeometryType, number>();
  for (const r of p.radiusWeights) merged.set(radiusToGeometry(r.radius), (merged.get(radiusToGeometry(r.radius)) ?? 0) + r.weight);
  for (const g of GEOMETRY_TYPES) if (!merged.has(g)) merged.set(g, 3);
  return Array.from(merged, ([value, weight]) => ({ value, weight }));
};

const BORDER_BASE: Record<BorderType, number> = { none: 10, subtle: 25, thin: 30, strong: 8, dashed: 3, double: 2, glow: 6 };
const BORDER_BOOSTS: Record<string, Partial<Record<BorderType, number>>> = {
  Brutalist: { strong: 60, double: 10, none: 0 }, Memphis: { strong: 45, dashed: 10 }, Industrial: { strong: 35, dashed: 12 },
  Glass: { subtle: 60, glow: 15, strong: 0 }, Liquid: { subtle: 50, none: 25, strong: 0 }, Clay: { none: 50, subtle: 20, strong: 0 },
  Cyberpunk: { glow: 45, thin: 25 }, HUD: { thin: 45, glow: 25, dashed: 8 }, Acid: { glow: 35, dashed: 15, strong: 20 },
  Editorial: { thin: 55, subtle: 10 }, Swiss: { thin: 40, strong: 20 }, Soft: { none: 35, subtle: 40, strong: 0 },
  Organic: { subtle: 40, none: 30 }, Metal: { thin: 40, double: 10 }, Digital: { strong: 30, thin: 25 }, Bento: { subtle: 45, thin: 30 }, Flat: { thin: 40, subtle: 30 }
};

/** Border preferences are derived from the personality's visual family rather than listed per personality. */
const borderOptions = (p: PersonalityRules): { value: BorderType; weight: number }[] => {
  const family = p.visualFamilies[0]?.family ?? 'Flat';
  const boost = BORDER_BOOSTS[family] ?? {};
  return BORDER_TYPES.map((b) => ({ value: b, weight: boost[b] ?? BORDER_BASE[b] }));
};

const ICON_BASE: Record<IconType, number> = { outline: 40, filled: 15, duotone: 8, geometric: 8, rounded: 15, '3d': 3, pixel: 2, skeuomorphic: 3 };
const ICON_BOOSTS: Record<string, Partial<Record<IconType, number>>> = {
  Digital: { pixel: 60, geometric: 20 }, Brutalist: { geometric: 45, outline: 30 }, Clay: { '3d': 40, rounded: 35 },
  Metal: { skeuomorphic: 35, filled: 25, '3d': 20 }, Soft: { rounded: 50 }, Organic: { rounded: 45, duotone: 15 },
  Glass: { duotone: 30, outline: 40 }, HUD: { geometric: 45, outline: 30 }, Cyberpunk: { geometric: 35, outline: 30 },
  Memphis: { geometric: 40, filled: 25 }, Editorial: { outline: 55 }, Swiss: { geometric: 35, outline: 40 }
};

const iconOptions = (p: PersonalityRules): { value: IconType; weight: number }[] => {
  const family = p.visualFamilies[0]?.family ?? 'Flat';
  const boost = ICON_BOOSTS[family] ?? {};
  return ICON_TYPES.map((i) => ({ value: i, weight: boost[i] ?? ICON_BASE[i] }));
};

const HEADING_PAIRS: Record<string, string> = {
  'Inter, sans-serif': 'Inter, sans-serif',
  'Manrope, sans-serif': 'Manrope, sans-serif',
  'DM Sans, sans-serif': 'DM Sans, sans-serif',
  'Plus Jakarta Sans, sans-serif': 'Plus Jakarta Sans, sans-serif',
  'Roboto, sans-serif': 'Roboto, sans-serif',
  'Space Grotesk, sans-serif': 'Space Grotesk, sans-serif',
  'Poppins, sans-serif': 'Poppins, sans-serif',
  'Helvetica Neue, sans-serif': 'Helvetica Neue, Arial, sans-serif',
  'Georgia, serif': 'Georgia, serif',
  'Playfair Display, serif': 'Playfair Display, serif',
  'Orbitron, sans-serif': 'Orbitron, sans-serif',
  'JetBrains Mono, monospace': 'JetBrains Mono, monospace',
  'Fira Code, monospace': 'Fira Code, monospace'
};

function chooseTypography(prng: PRNG, p: PersonalityRules, mode: GenerationMode, surface: SurfaceType, trace: DecisionTrace[]): TypographyChoice {
  const family = decide(prng, 'typography', p.typographyWeights.map((t) => ({ value: t.font, weight: t.weight })), mode,
    (font) => [{ relation: typographyRelation(font, surface, p.name), reason: `${font.split(',')[0]} on ${surface}` }], trace);
  const isSerif = /serif/i.test(family) && !/sans-serif/i.test(family);
  const isMono = /mono/i.test(family);
  // Display font: serif personalities pair a serif display with a sans body; others reuse the family.
  const headingFamily = HEADING_PAIRS[family] ?? family;
  const bodyFamily = isSerif ? (p.name === 'Editorial' ? 'Georgia, serif' : 'Inter, sans-serif') : family;
  const monoFamily = isMono ? family : 'JetBrains Mono, monospace';
  const headingWeight = isSerif ? prng.choice([600, 700]) : isMono ? prng.choice([600, 700]) : prng.weightedChoice([{ value: 600, weight: 30 }, { value: 700, weight: 50 }, { value: 800, weight: 20 }]);
  const bodyWeight = isMono ? 400 : prng.weightedChoice([{ value: 400, weight: 70 }, { value: 500, weight: 30 }]);
  const letterSpacing = isMono ? '0.02em' : p.name === 'Technical' || p.name === 'Futuristic' ? '0.04em' : p.name === 'Editorial' ? '-0.01em' : p.name === 'Minimal' ? '-0.02em' : '0';
  const lineHeight = isSerif ? '1.65' : p.name === 'Editorial' || p.name === 'Calm' ? '1.6' : '1.5';
  const scale: TypographyChoice['scale'] = p.name === 'Editorial' || p.name === 'Luxury' ? 'generous' : p.name === 'Technical' || p.name === 'Minimal' ? 'tight' : 'regular';
  return { family: bodyFamily, headingFamily, monoFamily, headingWeight, bodyWeight, letterSpacing, lineHeight, scale };
}

function chooseSvg(prng: PRNG, p: PersonalityRules, trace: DecisionTrace[]): GeneratedSvgLanguage {
  const label = prng.weightedChoice(p.svgWeights.map((s) => ({ value: s.svg, weight: s.weight })));
  const svg = toSvgLanguage(label);
  // Small deterministic jitter so two styles with the same label still differ.
  svg.glowLevel = Math.round(Math.min(1, Math.max(0, svg.glowLevel + prng.nextFloat(-0.1, 0.1))) * 100) / 100;
  svg.curveStrength = Math.round(Math.min(1, Math.max(0, svg.curveStrength + prng.nextFloat(-0.1, 0.1))) * 100) / 100;
  svg.particleDensity = Math.round(Math.min(1, Math.max(0, svg.particleDensity + prng.nextFloat(-0.05, 0.05))) * 100) / 100;
  trace.push({ axis: 'svg', chosen: label, locked: false, candidates: p.svgWeights.map((s) => ({ value: s.svg, baseWeight: s.weight, factor: 1, finalWeight: s.weight, reasons: [] })) });
  return svg;
}

/** Semantic recipe recovered from any style's tokens so official styles can be remixed. */
export function deriveRecipeFromStyle(style: StyleDefinition): SemanticRecipe {
  if (style.generation?.recipe) return style.generation.recipe;
  const t = style.tokens;
  const blur = parseFloat(t.materials?.backdropBlur ?? '0') || 0;
  const opacity = t.materials?.opacity ?? 1;
  const surface: SurfaceType =
    blur >= 24 ? 'glass' : blur >= 12 ? 'frosted' : blur > 0 ? 'acrylic' :
    t.materials?.gradient ? (t.materials.reflection ? 'metallic' : 'liquid') :
    t.materials?.texture === 'grain' ? 'paper' : opacity < 1 ? 'transparent' :
    /inset/.test(t.shadows.md) ? 'inset' : t.shadows.md === 'none' ? 'flat' : 'solid';
  const depth: DepthType =
    t.shadows.md === 'none' ? 'flat' :
    /\d+px \d+px 0/.test(t.shadows.md) ? 'physical' :
    /inset/.test(t.shadows.md) ? 'inset' :
    t.shadows.glow && t.shadows.glow !== 'none' ? 'glowing' :
    /(\d+)px/.exec(t.shadows.lg)?.[1] && parseInt(/(\d+)px/.exec(t.shadows.lg)![1], 10) >= 24 ? 'floating' : 'soft';
  const bw = parseFloat(t.borders.width) || 0;
  const border: BorderType =
    t.borders.style === 'dashed' ? 'dashed' : t.borders.style === 'double' ? 'double' :
    bw === 0 ? 'none' : bw >= 3 ? 'strong' : t.borders.color === t.colors.accent ? 'glow' : /rgba/.test(t.borders.color) ? 'subtle' : 'thin';
  const dur = parseFloat(t.motion.durationNormal) || 250;
  const motion: MotionType =
    dur === 0 ? 'static' : /steps/.test(t.motion.easing) ? 'mechanical' : /1\.56/.test(t.motion.easing) ? 'elastic' :
    dur >= 350 ? 'expressive' : dur <= 140 ? 'snappy' : dur <= 200 ? 'subtle' : 'smooth';
  const icons: IconType = t.icons?.styleVariant === 'sharp' ? 'geometric' : t.icons?.styleVariant === 'rounded' ? 'rounded' : t.icons?.filled ? 'filled' : 'outline';
  const heading = t.typography.fontFamilyHeading || t.typography.fontFamilySans;
  const typography: TypographyChoice = {
    family: t.typography.fontFamilySans,
    headingFamily: heading,
    monoFamily: t.typography.fontFamilyMono || 'JetBrains Mono, monospace',
    headingWeight: Number(t.typography.fontWeightBold) || 700,
    bodyWeight: Number(t.typography.fontWeightNormal) || 400,
    letterSpacing: t.typography.letterSpacing,
    lineHeight: t.typography.lineHeight,
    scale: 'regular'
  };
  const svg: GeneratedSvgLanguage = {
    shapeLanguage: style.svgLanguage?.cornerStyle === 'bevel' ? 'reticle' : style.svgLanguage?.cornerStyle === 'sharp' || style.svgLanguage?.cornerStyle === 'brutalist' ? 'geometry' : 'curves',
    gradientType: t.materials?.gradient ? 'linear' : 'none',
    strokeLanguage: bw >= 3 ? 'bold' : 'thin',
    glowLevel: depth === 'glowing' ? 0.8 : 0.1,
    noiseLevel: t.materials?.texture === 'noise' || t.materials?.texture === 'grain' ? 0.6 : 0,
    gridLevel: style.svgLanguage?.patternOverlay === 'grid' ? 0.7 : 0,
    particleDensity: style.svgLanguage?.decorativeShapes ? 0.5 : 0,
    curveStrength: 0.5,
    metallicReflection: t.materials?.reflection ? 0.8 : 0,
    blurLevel: blur / 32
  };
  return {
    personality: style.metadata.personality || style.metadata.category,
    visualFamily: style.metadata.category,
    harmony: 'Analogous',
    typography,
    geometry: radiusToGeometry(t.radii.md),
    density: 'comfortable',
    surface,
    depth,
    border,
    motion,
    icons,
    svg,
    behavior: motionToBehavior(motion, depth)
  };
}

/* ------------------------------------------------------------------ */
/* Naming                                                               */
/* ------------------------------------------------------------------ */

const PREFIX_GROUPS = {
  dark: ['Midnight', 'Velvet', 'Obsidian', 'Noir', 'Deep', 'Nocturne'],
  warm: ['Solar', 'Golden', 'Amber', 'Ember', 'Honey'],
  cool: ['Lunar', 'Arctic', 'Mist', 'Glacier', 'Quiet'],
  vivid: ['Electric', 'Neon', 'Vivid', 'Acid', 'Pulse'],
  calm: ['Quiet', 'Soft', 'Still', 'Linen', 'Cloud']
};

const MATERIAL_WORDS: Record<SurfaceType, string[]> = {
  glass: ['Glass', 'Pane'], frosted: ['Frost', 'Haze'], acrylic: ['Acrylic', 'Resin'], crystal: ['Crystal', 'Prism'],
  clay: ['Clay', 'Pillow'], metallic: ['Chrome', 'Steel'], liquid: ['Aurora', 'Bloom'], paper: ['Paper', 'Press'],
  flat: ['Grid', 'Plane'], solid: ['Bento', 'Forge'], transparent: ['Signal', 'Pulse'], inset: ['Relief', 'Carve'],
  elevated: ['Float', 'Drift'], experimental: ['Wave', 'Flux']
};

/** Static tables, exported so the Python engine loads the same data. */
export const GENERATOR_TABLES = { BORDER_BASE, BORDER_BOOSTS, ICON_BASE, ICON_BOOSTS, HEADING_PAIRS, PREFIX_GROUPS, MATERIAL_WORDS, PERSONALITY_TYPES };

function generateName(prng: PRNG, recipe: SemanticRecipe, colors: DesignTokens['colors']): string {
  const hex = colors.bg.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  const dark = (r * 299 + g * 587 + b * 114) / 1000 < 128;
  const ah = colors.accent.replace('#', '');
  const ar = parseInt(ah.slice(0, 2), 16), ag = parseInt(ah.slice(2, 4), 16), ab = parseInt(ah.slice(4, 6), 16);
  const sat = (Math.max(ar, ag, ab) - Math.min(ar, ag, ab)) / 255;
  const warm = ar > ab;
  const group = dark ? 'dark' : sat > 0.75 ? 'vivid' : recipe.personality === 'Calm' || recipe.personality === 'Minimal' ? 'calm' : warm ? 'warm' : 'cool';
  const prefix = prng.choice(PREFIX_GROUPS[group]);
  const material = prng.choice(MATERIAL_WORDS[recipe.surface]);
  return `${prefix} ${material}`;
}

/* ------------------------------------------------------------------ */
/* Cache                                                                */
/* ------------------------------------------------------------------ */

const CACHE_LIMIT = 200;
const cache = new Map<string, GeneratedStyleResult>();

const cacheKey = (o: GenerateOptions, seedNumber: number) =>
  JSON.stringify([GENERATOR_VERSION, seedNumber, o.mode ?? 'Coherent', o.personalityType ?? '', o.visualFamily ?? '', o.locks ?? {}, o.baseStyle?.metadata.id ?? '', o.baseStyle?.generation?.dnaHash ?? '']);

export function clearGenerationCache(): void {
  cache.clear();
}

/* ------------------------------------------------------------------ */
/* Core                                                                 */
/* ------------------------------------------------------------------ */

export function generateProceduralStyle(options: GenerateOptions): GeneratedStyleResult {
  const seedNumber = hashSeed(options.seed);
  const key = cacheKey(options, seedNumber);
  const cached = cache.get(key);
  if (cached) return { ...cached, fromCache: true };

  const prng = createSeededRandom(seedNumber);
  const mode: GenerationMode = options.mode ?? 'Coherent';
  const locks: GenerationLocks = options.locks ?? {};
  const base = options.baseStyle;
  const baseRecipe = base ? deriveRecipeFromStyle(base) : undefined;
  const isLocked = (axis: RecipeAxis) => Boolean(locks[axis] && baseRecipe);
  const trace: DecisionTrace[] = [];

  // Personality. The random draw always happens so that forcing a personality equal to the
  // one a seed would have drawn produces an identical style (share links carry the resolved value).
  const drawnPersonality = prng.choice(PERSONALITY_TYPES);
  const personalityName: PersonalityType = options.personalityType ?? drawnPersonality;
  const personality = PERSONALITY_MAP[personalityName];
  trace.push({ axis: 'personality', chosen: personalityName, locked: Boolean(options.personalityType), candidates: PERSONALITY_TYPES.map((p) => ({ value: p, baseWeight: 1, factor: 1, finalWeight: 1, reasons: [] })) });

  // Visual family
  const drawnFamily = prng.weightedChoice(personality.visualFamilies.map((f) => ({ value: f.family, weight: f.weight })));
  const visualFamily = options.visualFamily ?? drawnFamily;
  trace.push({ axis: 'family', chosen: visualFamily, locked: Boolean(options.visualFamily), candidates: personality.visualFamilies.map((f) => ({ value: f.family, baseWeight: f.weight, factor: 1, finalWeight: f.weight, reasons: [] })) });

  // Colors
  let colors: DesignTokens['colors'];
  let harmony: string;
  if (isLocked('colors') && base) {
    colors = { ...base.tokens.colors };
    harmony = baseRecipe?.harmony ?? 'Analogous';
    lockedDecision(trace, 'colors', harmony);
  } else {
    const generated = generateProceduralColors(personality, prng);
    colors = generated.colors;
    harmony = generated.harmony;
    trace.push({ axis: 'colors', chosen: `${harmony} (${colors.accent})`, locked: false, candidates: [] });
  }

  // Surface (first structural decision; others are weighted against it)
  const surface: SurfaceType = isLocked('surface') && baseRecipe
    ? (lockedDecision(trace, 'surface', baseRecipe.surface), baseRecipe.surface)
    : decide(prng, 'surface', surfaceOptions(personality), mode, () => [], trace);

  // Geometry
  const geometry: GeometryType = isLocked('geometry') && baseRecipe
    ? (lockedDecision(trace, 'geometry', baseRecipe.geometry), baseRecipe.geometry)
    : decide(prng, 'geometry', geometryOptions(personality), mode,
      (g) => [{ relation: geometrySurfaceRelation(g, surface), reason: `${g} corners on ${surface}` }], trace);
  const density: DensityType = personality.name === 'Minimal' || personality.name === 'Editorial' ? 'spacious' : personality.name === 'Technical' ? 'compact' : 'comfortable';

  // Depth
  const depth: DepthType = isLocked('depth') && baseRecipe
    ? (lockedDecision(trace, 'depth', baseRecipe.depth), baseRecipe.depth)
    : decide(prng, 'depth', depthOptions(personality), mode,
      (d) => [{ relation: surfaceDepthRelation(surface, d), reason: `${surface} surface with ${d} depth` }], trace);

  // Borders
  const border: BorderType = isLocked('borders') && baseRecipe
    ? (lockedDecision(trace, 'borders', baseRecipe.border), baseRecipe.border)
    : decide(prng, 'borders', borderOptions(personality), mode,
      (b) => [
        { relation: surfaceBorderRelation(surface, b), reason: `${surface} surface with ${b} border` },
        { relation: depthBorderRelation(depth, b), reason: `${depth} depth with ${b} border` }
      ], trace);

  // Typography
  const typography: TypographyChoice = isLocked('typography') && baseRecipe
    ? (lockedDecision(trace, 'typography', baseRecipe.typography.headingFamily), baseRecipe.typography)
    : chooseTypography(prng, personality, mode, surface, trace);

  // Icons
  const icons: IconType = isLocked('icons') && baseRecipe
    ? (lockedDecision(trace, 'icons', baseRecipe.icons), baseRecipe.icons)
    : decide(prng, 'icons', iconOptions(personality), mode,
      (i) => [{ relation: iconSurfaceRelation(i, surface), reason: `${i} icons on ${surface}` }], trace);

  // Motion
  const motion: MotionType = isLocked('motion') && baseRecipe
    ? (lockedDecision(trace, 'motion', baseRecipe.motion), baseRecipe.motion)
    : decide(prng, 'motion', motionOptions(personality), mode,
      (m) => [{ relation: motionDepthRelation(m, depth), reason: `${m} motion with ${depth} depth` }], trace);

  // SVG language
  const svg: GeneratedSvgLanguage = isLocked('svg') && baseRecipe
    ? (lockedDecision(trace, 'svg', baseRecipe.svg.shapeLanguage), baseRecipe.svg)
    : chooseSvg(prng, personality, trace);

  let semantic: SemanticRecipe = {
    personality: personalityName,
    visualFamily,
    harmony,
    typography,
    geometry,
    density,
    surface,
    depth,
    border,
    motion,
    icons,
    svg,
    behavior: motionToBehavior(motion, depth)
  };
  trace.push({ axis: 'behavior', chosen: semantic.behavior, locked: false, candidates: [] });

  // Repair loop: fix the weakest pairing by re-choosing that axis with coherent weighting.
  const repairedAxes: string[] = [];
  let coherence = evaluateRecipe(semantic);
  let repairIterations = 0;
  const repairThreshold = mode === 'Coherent' ? 0 : mode === 'Experimental' ? -1 : -2;
  while (mode !== 'Extreme' && coherence.weakestAxis && coherence.weakestRelation < repairThreshold && repairIterations < 3) {
    repairIterations += 1;
    const axis = coherence.weakestAxis;
    if (isLocked(axis)) break;
    repairedAxes.push(axis);
    const repairPrng = createSeededRandom(seedNumber + repairIterations * 1013);
    const repairTrace: DecisionTrace[] = [];
    switch (axis) {
      case 'depth':
        semantic = { ...semantic, depth: decide(repairPrng, 'depth', depthOptions(personality), 'Coherent', (d) => [{ relation: surfaceDepthRelation(semantic.surface, d), reason: 'repair' }], repairTrace) };
        break;
      case 'borders':
        semantic = { ...semantic, border: decide(repairPrng, 'borders', borderOptions(personality), 'Coherent', (b) => [{ relation: surfaceBorderRelation(semantic.surface, b), reason: 'repair' }, { relation: depthBorderRelation(semantic.depth, b), reason: 'repair' }], repairTrace) };
        break;
      case 'geometry':
        semantic = { ...semantic, geometry: decide(repairPrng, 'geometry', geometryOptions(personality), 'Coherent', (g) => [{ relation: geometrySurfaceRelation(g, semantic.surface), reason: 'repair' }], repairTrace) };
        break;
      case 'icons':
        semantic = { ...semantic, icons: decide(repairPrng, 'icons', iconOptions(personality), 'Coherent', (i) => [{ relation: iconSurfaceRelation(i, semantic.surface), reason: 'repair' }], repairTrace) };
        break;
      case 'motion':
        semantic = { ...semantic, motion: decide(repairPrng, 'motion', motionOptions(personality), 'Coherent', (m) => [{ relation: motionDepthRelation(m, semantic.depth), reason: 'repair' }], repairTrace) };
        semantic.behavior = motionToBehavior(semantic.motion, semantic.depth);
        break;
      case 'typography':
        semantic = { ...semantic, typography: chooseTypography(repairPrng, personality, 'Coherent', semantic.surface, repairTrace) };
        break;
      case 'svg':
        semantic = { ...semantic, svg: { ...semantic.svg, strokeLanguage: 'thin', blurLevel: 0.2 } };
        break;
      default:
        break;
    }
    for (const t of repairTrace) trace.push({ ...t, axis: t.axis, chosen: `${t.chosen} (repair ${repairIterations})` });
    coherence = evaluateRecipe(semantic);
  }

  // Materialize tokens
  const surfaceMat = materializeSurface(semantic.surface, colors);
  const geometryMat = materializeGeometry(semantic.geometry, semantic.density);
  const tokens: DesignTokens = {
    colors: { ...colors, surface: surfaceMat.surface, surfaceHover: surfaceMat.surfaceHover, surfaceActive: surfaceMat.surfaceHover },
    typography: materializeTypography(semantic.typography),
    radii: { sm: geometryMat.sm, md: geometryMat.md, lg: geometryMat.lg, xl: geometryMat.xl, full: geometryMat.full },
    shadows: materializeDepth(semantic.depth, colors),
    borders: materializeBorder(semantic.border, colors),
    motion: materializeMotion(semantic.motion),
    materials: surfaceMat.materials,
    icons: materializeIcons(semantic.icons)
  };

  const name = generateName(prng, semantic, colors);
  const category: StyleCategory =
    personality.name === 'Futuristic' || personality.name === 'Dark' || personality.name === 'Technical' ? 'Futuristic' :
    personality.name === 'Playful' || personality.name === 'Energetic' || personality.name === 'Experimental' ? 'Expressive' :
    personality.name === 'Minimal' || personality.name === 'Calm' ? 'Minimalist' :
    semantic.surface === 'glass' || semantic.surface === 'frosted' || semantic.surface === 'clay' || semantic.surface === 'acrylic' ? 'Morphism' : 'Modern';

  const style: StyleDefinition = {
    metadata: {
      id: `procedural-${seedNumber}`,
      name,
      category,
      description: `Generated ${personality.name.toLowerCase()} system: ${semantic.surface} surfaces, ${semantic.depth} depth, ${semantic.geometry} corners and ${semantic.motion} motion, from seed ${seedNumber}.`,
      tags: ['procedural', personality.name.toLowerCase(), harmony.toLowerCase(), semantic.surface, semantic.depth],
      personality: personality.description,
      bestUsedFor: ['Procedural experimentation', 'UI exploration'],
      isCustom: true,
      source: 'generated',
      version: GENERATOR_VERSION,
      visualCharacter: `${semantic.surface} · ${semantic.depth} · ${semantic.motion}`
    },
    tokens,
    svgLanguage: materializeSvg(semantic.svg, semantic.geometry),
    behavior: materializeBehavior(semantic.behavior, semantic.depth)
  };

  const dna = computeStyleDNA(style);
  const dnaHash = computeDnaHash(style);
  const generation: GenerationInfo = {
    seed: seedNumber,
    mode,
    personality: personalityName,
    visualFamily,
    generatorVersion: GENERATOR_VERSION,
    createdAt: new Date().toISOString(),
    recipe: semantic,
    parentSeed: options.parentSeed ?? base?.generation?.seed,
    parentId: options.parentId ?? base?.metadata.id,
    keptAxes: RECIPE_AXES.filter((a) => isLocked(a)),
    dnaHash
  };
  style.generation = generation;

  const recipe = generateStyleRecipe(style, seedNumber, semantic);
  const explanations = generateWhyThisStyle(style, semantic, coherence, repairedAxes);
  const accessibility = evaluateAccessibility(tokens.colors);

  const result: GeneratedStyleResult = {
    style, recipe, semantic, explanations, seedNumber, accessibility, coherence,
    repairedAxes, repairIterations, trace, dna, dnaHash, mode, locks, generatorVersion: GENERATOR_VERSION, fromCache: false
  };

  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value as string);
  cache.set(key, result);
  return result;
}

/* ------------------------------------------------------------------ */
/* Remix                                                                */
/* ------------------------------------------------------------------ */

export interface RemixOptions {
  base: StyleDefinition;
  seed: string | number;
  strength: RemixStrength;
  /** Axes the user explicitly wants to keep. */
  keep?: RecipeAxis[];
  mode?: GenerationMode;
}

/** Regenerate part of a style: keeps locked axes, changes a strength-dependent number of the rest. */
export function remixStyle(options: RemixOptions): GeneratedStyleResult {
  const seedNumber = hashSeed(options.seed);
  const prng = createSeededRandom(seedNumber ^ 0x5f3759df);
  const keep = new Set(options.keep ?? []);
  const open = RECIPE_AXES.filter((a) => !keep.has(a));
  const changeCount = options.strength === 'Subtle' ? Math.min(2, open.length) : options.strength === 'Balanced' ? Math.min(4, open.length) : open.length;
  // Deterministic shuffle of the open axes; the first `changeCount` get regenerated.
  const shuffled = [...open];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(prng.next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const changing = new Set(shuffled.slice(0, changeCount));
  const locks: GenerationLocks = {};
  for (const axis of RECIPE_AXES) locks[axis] = !changing.has(axis);
  const baseRecipe = deriveRecipeFromStyle(options.base);
  const personality = (Object.keys(PERSONALITY_MAP) as PersonalityType[]).includes(baseRecipe.personality as PersonalityType)
    ? (baseRecipe.personality as PersonalityType)
    : undefined;
  return generateProceduralStyle({
    seed: seedNumber,
    mode: options.mode ?? 'Coherent',
    personalityType: personality,
    locks,
    baseStyle: options.base,
    parentSeed: options.base.generation?.seed,
    parentId: options.base.metadata.id
  });
}

/* ------------------------------------------------------------------ */
/* Batch                                                                */
/* ------------------------------------------------------------------ */

/** Generate `count` candidates from a base seed, skipping near-duplicates. */
export function generateBatch(count: number, options: Omit<GenerateOptions, 'seed'> & { seed: string | number }): GeneratedStyleResult[] {
  const baseSeed = hashSeed(options.seed);
  const results: GeneratedStyleResult[] = [];
  let attempt = 0;
  while (results.length < count && attempt < count * 4) {
    const seed = (baseSeed + attempt * 7919) >>> 0;
    attempt += 1;
    const candidate = generateProceduralStyle({ ...options, seed });
    if (results.some((r) => isNearDuplicate(r.style, candidate.style))) continue;
    results.push(candidate);
  }
  return results;
}

export { PERSONALITY_TYPES };

/**
 * UI Explorer — Master Procedural Style Generator Engine
 * Pipeline: Seed -> Personality -> Colors -> Tokens -> Repair -> StyleDefinition
 */

import type { StyleDefinition, DesignTokens, StyleCategory } from '../types';
import { createSeededRandom, hashSeed } from '../random/prng';
import { PERSONALITY_MAP } from './personalities';
import type { PersonalityType } from './personalities';
import { generateProceduralColors, evaluateAccessibility } from './colorEngine';
import { repairStyleTokens } from './repair';
import { generateStyleRecipe, generateWhyThisStyle } from './recipe';
import type { StyleRecipe } from './recipe';

export type GenerationMode = 'Coherent' | 'Experimental' | 'Extreme' | 'From Seed' | 'Remix';

export interface GenerationLocks {
  colors?: boolean;
  typography?: boolean;
  geometry?: boolean;
  surface?: boolean;
  depth?: boolean;
  motion?: boolean;
  svg?: boolean;
}

export interface GenerateOptions {
  seed: string | number;
  mode?: GenerationMode;
  personalityType?: PersonalityType;
  locks?: GenerationLocks;
  baseStyle?: StyleDefinition;
}

export interface GeneratedStyleResult {
  style: StyleDefinition;
  recipe: StyleRecipe;
  explanations: string[];
  seedNumber: number;
  accessibility: ReturnType<typeof evaluateAccessibility>;
  repairedAxes: string[];
}

const NAME_PREFIXES = ['Midnight', 'Solar', 'Electric', 'Quiet', 'Velvet', 'Lunar', 'Neon', 'Cosmic', 'Aero', 'Stark'];
const NAME_SUFFIXES = ['Acrylic', 'Glass', 'Clay', 'Bento', 'Pulse', 'Aura', 'Grid', 'Forge', 'Monolith', 'Wave'];

export function generateProceduralStyle(options: GenerateOptions): GeneratedStyleResult {
  const seedNumber = hashSeed(options.seed);
  const prng = createSeededRandom(seedNumber);
  const mode = options.mode || 'Coherent';

  // Choose Personality
  const personalityTypes: PersonalityType[] = [
    'Calm', 'Professional', 'Luxury', 'Technical',
    'Futuristic', 'Playful', 'Organic', 'Editorial',
    'Dark', 'Experimental', 'Energetic', 'Minimal'
  ];
  const selectedPersonalityName = options.personalityType || prng.choice(personalityTypes);
  const personality = PERSONALITY_MAP[selectedPersonalityName];

  // Procedural Color Generation
  const { colors, harmony } = generateProceduralColors(personality, prng);

  // Typography
  const typoFont = prng.weightedChoice(personality.typographyWeights.map((t) => ({ value: t.font, weight: t.weight })));

  // Geometry
  const radiusVal = prng.weightedChoice(personality.radiusWeights.map((r) => ({ value: r.radius, weight: r.weight })));

  // Motion
  const motionType = prng.weightedChoice(personality.motionWeights.map((m) => ({ value: m.motion, weight: m.weight })));

  // Name Generation
  const prefix = prng.choice(NAME_PREFIXES);
  const suffix = prng.choice(NAME_SUFFIXES);
  const name = `${prefix} ${suffix}`;

  let tokens: DesignTokens = {
    colors,
    typography: {
      fontFamilySans: typoFont,
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '2rem',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      letterSpacing: '0',
      lineHeight: '1.5'
    },
    radii: {
      sm: '4px',
      md: radiusVal,
      lg: '20px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 4px rgba(0,0,0,0.06)',
      md: '0 4px 12px rgba(0,0,0,0.1)',
      lg: '0 8px 24px rgba(0,0,0,0.15)',
      glow: '0 0 15px ' + colors.accent
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: colors.border
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: motionType === 'Elastic' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'ease-out'
    },
    materials: {
      backdropBlur: personality.name === 'Futuristic' ? '16px' : '0px',
      opacity: 1
    }
  };

  // Apply Locks / Remix Overrides if baseStyle is provided
  if (options.locks && options.baseStyle) {
    const baseTokens = options.baseStyle.tokens;
    if (options.locks.colors) tokens.colors = baseTokens.colors;
    if (options.locks.typography) tokens.typography = baseTokens.typography;
    if (options.locks.geometry) tokens.radii = baseTokens.radii;
    if (options.locks.depth) tokens.shadows = baseTokens.shadows;
    if (options.locks.motion) tokens.motion = baseTokens.motion;
  }

  const metadata = {
    id: `procedural-${seedNumber}`,
    name,
    category: (personality.name === 'Futuristic' || personality.name === 'Dark' ? 'Futuristic' : 'Modern') as StyleCategory,
    description: `Procedurally generated ${personality.name.toLowerCase()} design system derived from seed #${seedNumber}.`,
    tags: ['procedural', personality.name.toLowerCase(), harmony.toLowerCase()],
    personality: personality.description,
    bestUsedFor: ['Procedural experimentation', 'UI exploration'],
    isCustom: true
  };

  // Repair System (unless in Extreme mode)
  let repairedAxes: string[] = [];
  if (mode !== 'Extreme') {
    const repairResult = repairStyleTokens(metadata, tokens, 3);
    tokens = repairResult.repairedTokens;
    repairedAxes = repairResult.repairedAxes;
  }

  const finalStyle: StyleDefinition = {
    metadata,
    tokens,
    svgLanguage: {
      cornerStyle: radiusVal === '0px' ? 'sharp' : 'rounded',
      decorativeShapes: true
    }
  };

  const recipe = generateStyleRecipe(finalStyle, seedNumber, harmony);
  const explanations = generateWhyThisStyle(finalStyle, recipe);
  const accessibility = evaluateAccessibility(tokens.colors);

  return {
    style: finalStyle,
    recipe,
    explanations,
    seedNumber,
    accessibility,
    repairedAxes
  };
}

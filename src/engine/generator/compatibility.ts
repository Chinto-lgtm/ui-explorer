/**
 * UI Explorer — Compatibility Matrix & Coherence Evaluator
 * Evaluates token axis pairings internally to ensure visual harmony.
 */

import type { DesignTokens, StyleMetadata } from '../types';

export interface CompatibilityScore {
  totalScore: number; // 0..100
  axisScores: {
    typographySurface: number;
    colorPersonality: number;
    geometrySurface: number;
    depthMaterial: number;
    motionBehavior: number;
  };
  weakestAxis: string | null;
}

export function evaluateCoherence(
  metadata: StyleMetadata,
  tokens: DesignTokens
): CompatibilityScore {
  let typographySurface = 2; // +2 strong to -2 incompatible
  let colorPersonality = 2;
  let geometrySurface = 2;
  let depthMaterial = 2;
  let motionBehavior = 2;

  // Rule 1: Brutalist / Sharp vs Heavy Blur
  if (tokens.radii.md === '0px' && tokens.materials?.backdropBlur && parseInt(tokens.materials.backdropBlur) > 16) {
    depthMaterial = -2; // Incompatible combination
  }

  // Rule 2: Glassmorphism vs Heavy Hard Shadow
  if (tokens.materials?.backdropBlur && tokens.shadows.sm.includes('px 0px')) {
    geometrySurface = -1;
  }

  // Rule 3: Serifs vs Neon Dystopian High Saturation
  if (tokens.typography.fontFamilyHeading?.includes('serif') && metadata.category === 'Futuristic') {
    typographySurface = 0;
  }

  const mapScore = (val: number) => Math.max(0, Math.min(100, (val + 2) * 25));

  const s1 = mapScore(typographySurface);
  const s2 = mapScore(colorPersonality);
  const s3 = mapScore(geometrySurface);
  const s4 = mapScore(depthMaterial);
  const s5 = mapScore(motionBehavior);

  const totalScore = Math.round((s1 + s2 + s3 + s4 + s5) / 5);

  const scores = [
    { axis: 'typographySurface', score: s1 },
    { axis: 'colorPersonality', score: s2 },
    { axis: 'geometrySurface', score: s3 },
    { axis: 'depthMaterial', score: s4 },
    { axis: 'motionBehavior', score: s5 }
  ];

  scores.sort((a, b) => a.score - b.score);
  const weakestAxis = scores[0].score < 70 ? scores[0].axis : null;

  return {
    totalScore,
    axisScores: {
      typographySurface: s1,
      colorPersonality: s2,
      geometrySurface: s3,
      depthMaterial: s4,
      motionBehavior: s5
    },
    weakestAxis
  };
}

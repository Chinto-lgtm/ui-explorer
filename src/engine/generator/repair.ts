/**
 * UI Explorer — Style Repair Engine
 * Targeted property repair fixing weak pairings up to max 3 iterations.
 */

import type { DesignTokens, StyleMetadata } from '../types';
import { evaluateCoherence } from './compatibility';
import type { CompatibilityScore } from './compatibility';

export function repairStyleTokens(
  metadata: StyleMetadata,
  tokens: DesignTokens,
  maxIterations = 3
): { repairedTokens: DesignTokens; finalScore: CompatibilityScore; repairedAxes: string[] } {
  let currentTokens: DesignTokens = JSON.parse(JSON.stringify(tokens));
  let score = evaluateCoherence(metadata, currentTokens);
  const repairedAxes: string[] = [];

  let iteration = 0;
  while (score.weakestAxis && iteration < maxIterations) {
    iteration++;
    const axis = score.weakestAxis;
    repairedAxes.push(axis);

    if (axis === 'depthMaterial') {
      // Fix blur conflict with sharp radii
      if (currentTokens.materials) {
        currentTokens.materials.backdropBlur = '4px';
      }
    } else if (axis === 'geometrySurface') {
      currentTokens.shadows.sm = '0 2px 8px rgba(0, 0, 0, 0.1)';
      currentTokens.shadows.md = '0 4px 16px rgba(0, 0, 0, 0.15)';
    } else if (axis === 'typographySurface') {
      currentTokens.typography.fontFamilySans = 'Inter, sans-serif';
    }

    score = evaluateCoherence(metadata, currentTokens);
  }

  return {
    repairedTokens: currentTokens,
    finalScore: score,
    repairedAxes
  };
}

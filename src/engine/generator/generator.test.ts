import { describe, expect, it } from 'vitest';
import {
  generateProceduralStyle, remixStyle, generateBatch, deriveRecipeFromStyle, clearGenerationCache, GENERATOR_VERSION
} from './generator';
import { RECIPE_AXES } from './vocab';
import { computeDnaHash, computeStyleDNA, findSimilarStyles, isNearDuplicate } from './dna';
import { evaluateRecipe } from './compatibility';
import { registry } from '../registry';
import { allStyles } from '../../styles';

describe('Procedural generator 2.0', () => {
  it('is deterministic for the same seed, mode and locks', () => {
    clearGenerationCache();
    const a = generateProceduralStyle({ seed: 847291, mode: 'Coherent' });
    clearGenerationCache();
    const b = generateProceduralStyle({ seed: 847291, mode: 'Coherent' });
    expect(a.style.metadata.name).toBe(b.style.metadata.name);
    expect(a.style.tokens).toEqual(b.style.tokens);
    expect(a.dnaHash).toBe(b.dnaHash);
    expect(a.style.generation?.generatorVersion).toBe(GENERATOR_VERSION);
  });

  it('serves repeated requests from the cache', () => {
    clearGenerationCache();
    const first = generateProceduralStyle({ seed: 12345 });
    const second = generateProceduralStyle({ seed: 12345 });
    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(true);
  });

  it('varies surface, depth, borders and motion across seeds, not only colours', () => {
    const results = Array.from({ length: 40 }, (_, i) => generateProceduralStyle({ seed: 1000 + i * 37, mode: 'Coherent' }));
    const shadows = new Set(results.map((r) => r.style.tokens.shadows.md));
    const borders = new Set(results.map((r) => r.style.tokens.borders.width));
    const surfaces = new Set(results.map((r) => r.semantic.surface));
    const motions = new Set(results.map((r) => r.style.tokens.motion.easing));
    const blurs = new Set(results.map((r) => r.style.tokens.materials?.backdropBlur ?? '0px'));
    expect(shadows.size).toBeGreaterThan(8);
    expect(borders.size).toBeGreaterThan(2);
    expect(surfaces.size).toBeGreaterThan(5);
    expect(motions.size).toBeGreaterThan(3);
    expect(blurs.size).toBeGreaterThan(2);
  });

  it('keeps locked axes from the base style', () => {
    const base = generateProceduralStyle({ seed: 555 });
    const next = generateProceduralStyle({
      seed: 999, baseStyle: base.style,
      locks: { colors: true, typography: true, surface: true, depth: true }
    });
    expect(next.style.tokens.colors.accent).toBe(base.style.tokens.colors.accent);
    expect(next.style.tokens.typography.fontFamilyHeading).toBe(base.style.tokens.typography.fontFamilyHeading);
    expect(next.semantic.surface).toBe(base.semantic.surface);
    expect(next.semantic.depth).toBe(base.semantic.depth);
  });

  it('remix changes more axes as strength increases', () => {
    const base = generateProceduralStyle({ seed: 2024 });
    const count = (s: 'Subtle' | 'Balanced' | 'Strong') => {
      const r = remixStyle({ base: base.style, seed: 77, strength: s });
      return RECIPE_AXES.filter((a) => !r.locks[a]).length;
    };
    expect(count('Subtle')).toBe(2);
    expect(count('Balanced')).toBe(4);
    expect(count('Strong')).toBe(RECIPE_AXES.length);
  });

  it('remix records lineage and keeps explicitly kept axes', () => {
    const base = generateProceduralStyle({ seed: 31337 });
    const r = remixStyle({ base: base.style, seed: 4, strength: 'Strong', keep: ['colors'] });
    expect(r.style.generation?.parentSeed).toBe(base.seedNumber);
    expect(r.style.tokens.colors.accent).toBe(base.style.tokens.colors.accent);
  });

  it('can remix an official style by deriving its semantic recipe', () => {
    const glass = registry.get('glassmorphism') ?? allStyles[0];
    const recipe = deriveRecipeFromStyle(glass);
    expect(['glass', 'frosted', 'acrylic']).toContain(recipe.surface);
    const r = remixStyle({ base: glass, seed: 9, strength: 'Subtle', keep: ['surface', 'colors'] });
    expect(r.semantic.surface).toBe(recipe.surface);
  });

  it('generates a batch without near duplicates', () => {
    const batch = generateBatch(10, { seed: 4242, mode: 'Experimental' });
    expect(batch.length).toBe(10);
    for (let i = 0; i < batch.length; i++) {
      for (let j = i + 1; j < batch.length; j++) {
        expect(isNearDuplicate(batch[i].style, batch[j].style)).toBe(false);
      }
    }
  });

  it('Coherent mode never ships an incompatible pairing while Extreme may', () => {
    const coherent = Array.from({ length: 30 }, (_, i) => generateProceduralStyle({ seed: 5000 + i, mode: 'Coherent' }));
    for (const r of coherent) expect(r.coherence.weakestRelation).toBeGreaterThanOrEqual(-1);
    const extreme = Array.from({ length: 30 }, (_, i) => generateProceduralStyle({ seed: 5000 + i, mode: 'Extreme' }));
    expect(extreme.every((r) => r.repairIterations === 0)).toBe(true);
  });

  it('records a decision trace with weights and reasons', () => {
    const r = generateProceduralStyle({ seed: 77777 });
    const depth = r.trace.find((t) => t.axis === 'depth');
    expect(depth).toBeDefined();
    expect(depth!.candidates.length).toBeGreaterThan(3);
    expect(depth!.candidates.some((c) => c.reasons.length > 0)).toBe(true);
  });

  it('produces DNA hashes in the documented format and detects similar styles', () => {
    const r = generateProceduralStyle({ seed: 31415 });
    expect(r.dnaHash).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(computeDnaHash(r.style)).toBe(r.dnaHash);
    const dna = computeStyleDNA(r.style);
    for (const v of Object.values(dna)) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(10); }
    const similar = findSimilarStyles(r.style, registry.getAll(), 3);
    expect(similar.length).toBe(3);
    expect(similar[0].distance).toBeLessThanOrEqual(similar[2].distance);
  });

  it('evaluates coherence between 0 and 1', () => {
    const r = generateProceduralStyle({ seed: 8 });
    const report = evaluateRecipe(r.semantic);
    expect(report.score).toBeGreaterThan(0);
    expect(report.score).toBeLessThanOrEqual(1);
    expect(report.relations.length).toBe(9);
  });
});

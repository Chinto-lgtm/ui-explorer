/**
 * Exports the procedural engine's static tables and a set of reference
 * generations so the Python engine (tools/style-engine) shares one source of
 * truth with the browser engine.
 *
 *   npm run engine:data
 *
 * Writes:
 *   tools/style-engine/style_engine/data/engine-data.json   — personalities, vocab labels, compatibility tables
 *   tools/style-engine/tests/fixtures/ts-reference.json     — full TS output for a set of seeds/modes
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PERSONALITY_MAP } from '../src/engine/generator/personalities';
import { SURFACE_LABELS, DEPTH_LABELS, MOTION_LABELS, SVG_LABELS, RECIPE_AXES, SURFACE_TYPES, DEPTH_TYPES, BORDER_TYPES, MOTION_TYPES, ICON_TYPES, GEOMETRY_TYPES } from '../src/engine/generator/vocab';
import { PAIR_TABLES, AXIS_WEIGHTS, COMPATIBILITY_FACTORS } from '../src/engine/generator/compatibility';
import { GENERATOR_TABLES, GENERATOR_VERSION, generateProceduralStyle } from '../src/engine/generator/generator';
import type { GenerationMode } from '../src/engine/generator/generator';

const root = resolve(import.meta.dirname ?? '.', '..');
const dataDir = resolve(root, 'tools/style-engine/style_engine/data');
const fixtureDir = resolve(root, 'tools/style-engine/tests/fixtures');
mkdirSync(dataDir, { recursive: true });
mkdirSync(fixtureDir, { recursive: true });

const engineData = {
  generatorVersion: GENERATOR_VERSION,
  personalities: PERSONALITY_MAP,
  vocab: {
    recipeAxes: RECIPE_AXES,
    surfaceTypes: SURFACE_TYPES, depthTypes: DEPTH_TYPES, borderTypes: BORDER_TYPES,
    motionTypes: MOTION_TYPES, iconTypes: ICON_TYPES, geometryTypes: GEOMETRY_TYPES,
    surfaceLabels: SURFACE_LABELS, depthLabels: DEPTH_LABELS, motionLabels: MOTION_LABELS, svgLabels: SVG_LABELS
  },
  compatibility: { tables: PAIR_TABLES, axisWeights: AXIS_WEIGHTS, factors: COMPATIBILITY_FACTORS },
  generator: GENERATOR_TABLES
};
writeFileSync(resolve(dataDir, 'engine-data.json'), JSON.stringify(engineData, null, 2) + '\n');

const seeds: (string | number)[] = [847291, 1, 12345, 999999, 'aurora', 'neon-arcade', 424242, 77];
const modes: GenerationMode[] = ['Coherent', 'Experimental', 'Extreme'];
const reference = seeds.flatMap((seed) => modes.map((mode) => {
  const res = generateProceduralStyle({ seed, mode });
  const { generation, ...rest } = res.style;
  const { createdAt: _createdAt, ...gen } = generation!;
  return {
    seed, mode,
    seedNumber: res.seedNumber,
    dnaHash: res.dnaHash,
    semantic: res.semantic,
    repairedAxes: res.repairedAxes,
    coherenceScore: res.coherence.score,
    accessibility: res.accessibility,
    style: { ...rest, generation: gen }
  };
}));
writeFileSync(resolve(fixtureDir, 'ts-reference.json'), JSON.stringify({ generatorVersion: GENERATOR_VERSION, cases: reference }, null, 2) + '\n');

console.log(`engine-data.json: ${Object.keys(PERSONALITY_MAP).length} personalities; ts-reference.json: ${reference.length} cases`);

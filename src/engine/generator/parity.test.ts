/**
 * TypeScript ↔ Python consistency.
 *
 * The browser engine is the source of truth. The Python engine in
 * tools/style-engine must reproduce the same StyleDefinition for the same
 * seed. The heavy check lives in Python (tests/test_parity.py against
 * fixtures exported by `npm run engine:data`); this test runs the Python CLI
 * directly when an interpreter is available and is skipped otherwise.
 */

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { generateProceduralStyle, GENERATOR_VERSION } from './generator';
import type { GenerationMode } from './generator';

const engineDir = resolve(process.cwd(), 'tools/style-engine');

function runPython(args: string[]): string | null {
  for (const bin of ['python', 'python3', 'py']) {
    const res = spawnSync(bin, ['-m', 'style_engine', ...args], { cwd: engineDir, encoding: 'utf8', timeout: 30000 });
    if (res.status === 0 && res.stdout) return res.stdout;
  }
  return null;
}

const pythonAvailable = runPython(['--help']) !== null;

const stripCreatedAt = (style: ReturnType<typeof generateProceduralStyle>['style']) => {
  const { generation, ...rest } = style;
  const { createdAt: _createdAt, ...gen } = generation!;
  return { ...rest, generation: gen };
};

describe('Python engine parity', () => {
  it('exported fixtures are from the current generator version', () => {
    const fixture = JSON.parse(readFileSync(resolve(engineDir, 'tests/fixtures/ts-reference.json'), 'utf8'));
    expect(fixture.generatorVersion).toBe(GENERATOR_VERSION);
    expect(fixture.cases.length).toBeGreaterThan(0);
    // The fixtures must still describe what the TS engine produces today.
    for (const c of fixture.cases.slice(0, 6)) {
      const res = generateProceduralStyle({ seed: c.seed, mode: c.mode as GenerationMode });
      expect(res.dnaHash).toBe(c.dnaHash);
      expect(stripCreatedAt(res.style)).toEqual(c.style);
    }
  });

  it.skipIf(!pythonAvailable)('the Python CLI reproduces the same style for the same seed', () => {
    for (const [seed, mode] of [[847291, 'Coherent'], ['aurora', 'Experimental'], [77, 'Extreme']] as [string | number, GenerationMode][]) {
      const out = runPython(['generate', '--seed', String(seed), '--mode', mode, '--json']);
      expect(out, 'python output').not.toBeNull();
      const py = JSON.parse(out!);
      const ts = stripCreatedAt(generateProceduralStyle({ seed, mode }).style);
      expect(py).toEqual(ts);
    }
  });
});

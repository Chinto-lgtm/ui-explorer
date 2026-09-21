import { describe, it, expect } from 'vitest';
import { deepMerge, resolveInheritance } from '../../engine/inherit';
import { checkStyleCompleteness } from '../../engine/validator';
import { validateStyleDefinition } from '../../engine/validate';
import { communityPackages, communityStyles, officialStyles, allStyles } from '../index';
import { communityProblems } from './loader';
import { cyberpunk } from '../expressive';
import registryIndex from '../../../styles/community/index.json';

describe('community registry', () => {
  it('loads every package listed in styles/community/index.json without problems', () => {
    expect(communityProblems).toEqual([]);
    expect(communityPackages.map((p) => p.style.metadata.id).sort()).toEqual(registryIndex.map((e) => e.id).sort());
    expect(allStyles.length).toBe(officialStyles.length + communityStyles.length);
  });

  it('marks community styles with provenance and keeps the raw source', () => {
    for (const pkg of communityPackages) {
      expect(pkg.style.metadata.source).toBe('community');
      expect(pkg.style.metadata.author).toBeTruthy();
      expect(pkg.style.metadata.license).toBeTruthy();
      expect(pkg.path.startsWith('styles/community/')).toBe(true);
      expect(JSON.parse(pkg.source).metadata.id).toBe(pkg.style.metadata.id);
    }
  });

  it('resolves `extends` so an override-only package inherits the rest of its parent', () => {
    const neon = communityPackages.find((p) => p.style.metadata.id === 'community-retro-cyber')!;
    expect(neon.extends).toBe('cyberpunk');
    expect(neon.style.tokens.colors.accent).toBe('#ff2bd6');
    expect(neon.style.tokens.typography.fontFamilySans).toBe(cyberpunk.tokens.typography.fontFamilySans);
    expect(neon.style.tokens.motion).toEqual(cyberpunk.tokens.motion);
    expect(neon.style.metadata.relatedStyles).toContain('cyberpunk');
  });

  it('every official style carries documentation fields', () => {
    for (const s of officialStyles) {
      expect(s.metadata.source).toBe('official');
      expect(s.metadata.visualCharacter, s.metadata.id).toBeTruthy();
      expect(s.metadata.avoidWhen?.length, s.metadata.id).toBeGreaterThan(0);
      expect(s.metadata.principles?.length, s.metadata.id).toBeGreaterThan(0);
    }
  });
});

describe('inheritance', () => {
  it('deep-merges objects and replaces arrays and primitives', () => {
    const merged = deepMerge({ a: { b: 1, c: [1, 2] }, d: 'x' }, { a: { c: [3] }, d: 'y' });
    expect(merged).toEqual({ a: { b: 1, c: [3] }, d: 'y' });
  });

  it('leaves files alone when the parent is unknown', () => {
    const file = { extends: 'nope', metadata: { id: 'x' } } as never;
    expect(resolveInheritance(file, () => undefined)).toBe(file);
  });
});

describe('completeness check', () => {
  it('reports every system for a fully specified built-in style', () => {
    const report = checkStyleCompleteness(officialStyles.find((s) => s.metadata.id === 'cyberpunk')!);
    expect(report.checks.length).toBe(11);
    expect(report.checks.filter((c) => !c.ok)).toEqual([]);
    expect(report.componentDepth).toBeGreaterThan(30);
  });
});

describe('range and safety validation', () => {
  const base = () => JSON.parse(JSON.stringify(cyberpunk));

  it('accepts every built-in and community style', () => {
    for (const s of allStyles) expect(validateStyleDefinition(s).missing, s.metadata.id).toEqual([]);
  });

  it('rejects values outside the safe ranges', () => {
    const s = base();
    s.tokens.radii.md = '900px';
    s.tokens.motion.durationNormal = '9s';
    s.tokens.materials = { backdropBlur: '500px', opacity: 4 };
    const result = validateStyleDefinition(s);
    expect(result.missing).toEqual(expect.arrayContaining([
      expect.stringContaining('tokens.radii.md out of range'),
      expect.stringContaining('tokens.motion.durationNormal out of range'),
      expect.stringContaining('tokens.materials.backdropBlur out of range'),
      expect.stringContaining('tokens.materials.opacity out of range')
    ]));
  });

  it('rejects CSS that could execute or load remote content', () => {
    for (const bad of ['url(https://evil.example/x.png)', 'expression(alert(1))', 'red; } body { display: none', '<script>alert(1)</script>', 'javascript:alert(1)']) {
      const s = base();
      s.tokens.colors.accent = bad;
      expect(validateStyleDefinition(s).missing.some((m) => m.includes('unsafe')), bad).toBe(true);
    }
    const s = base();
    s.metadata.description = 'Nice <script>alert(1)</script>';
    expect(validateStyleDefinition(s).missing).toContain('metadata.description contains unsafe content');
  });
});

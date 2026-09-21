/**
 * Guards the single source of truth: no chrome stylesheet or chrome component
 * may carry a literal colour. Everything must come from src/theme.css.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
};

// Chrome = the tool around the preview. src/components/ui, charts, svg, preview and src/styles are style-driven and excluded.
const CHROME_DIRS = ['src/components/layout', 'src/components/workspace', 'src/pages', 'src/features'];
const CHROME_FILES = ['src/App.css', 'src/index.css'];
// Icon treatments (3D / skeuomorphic shading) are black-and-white drop shadows rendered inside the
// styled preview — part of the icon style, not of the chrome.
const ALLOW = new Set(['src/pages/Labs/labs/IconLab.tsx']);

const COLOUR = /#[0-9a-f]{3,8}\b|rgba?\(\s*\d/i;
const DECLARATION = /(?:^|[\s{;"'`(])(?:background|color|border|outline|fill|stroke|box-shadow|stop-color|stopColor)[a-z-]*\s*[:=]/i;

const files = [...CHROME_DIRS.flatMap((d) => walk(join(root, d))), ...CHROME_FILES.map((f) => join(root, f))]
  .filter((f) => /\.(css|tsx?)$/.test(f) && !/\.test\.tsx?$/.test(f))
  .map((f) => relative(root, f).split('\\').join('/'))
  .filter((f) => !ALLOW.has(f));

describe('chrome theme is a single source of truth', () => {
  it('finds chrome files to check', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it.each(files)('%s has no literal colours', (file) => {
    const offending = readFileSync(join(root, file), 'utf8').split('\n')
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      .filter(({ line }) => !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*'))
      // Only CSS-like declarations are checked; data (style definitions, presets, colour parsing) legitimately holds hex.
      .filter(({ line }) => DECLARATION.test(line))
      .filter(({ line }) => COLOUR.test(line.replace(/var\([^)]*\)/g, '')));
    expect(offending.map((o) => `${o.n}: ${o.line}`)).toEqual([]);
  });

  it('theme.css declares every token the chrome and the docs use', () => {
    const theme = readFileSync(join(root, 'src/theme.css'), 'utf8');
    const declared = new Set([...theme.matchAll(/--chrome-[a-z0-9-]+(?=\s*:)/g)].map((m) => m[0]));
    const used = new Set<string>();
    const sources = [...files, 'docs/.vitepress/theme/custom.css'];
    for (const f of sources) for (const m of readFileSync(join(root, f), 'utf8').matchAll(/var\((--chrome-[a-z0-9-]+)/g)) used.add(m[1]);
    expect([...used].filter((u) => !declared.has(u))).toEqual([]);
  });
});

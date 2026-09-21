import { describe, it, expect } from 'vitest';
import { exportStyle, exportSemanticTokens, EXPORT_FORMATS } from './exporters';
import { validateStyleDefinition } from './validate';
import { allStyles } from '../styles';

describe('exports', () => {
  const style = allStyles.find((s) => s.metadata.id === 'glassmorphism')!;

  it('are deterministic for every format', () => {
    for (const f of EXPORT_FORMATS) expect(exportStyle(style, f.id)).toBe(exportStyle(style, f.id));
  });

  it('semantic tokens follow the predictable structure', () => {
    const t = exportSemanticTokens(style) as Record<string, Record<string, unknown>>;
    expect(Object.keys(t.color)).toEqual(expect.arrayContaining(['background', 'surface', 'text', 'textMuted', 'primary', 'accent', 'success', 'warning', 'error']));
    expect(t.radius).toHaveProperty('md');
    expect(t.shadow).toHaveProperty('md');
    expect(t.motion).toHaveProperty('fast');
    expect(t.font).toHaveProperty('family');
  });

  it('css and theme exports declare the resolved variables', () => {
    expect(exportStyle(style, 'css')).toMatch(/--color-accent: #/);
    const theme = exportStyle(style, 'theme');
    expect(theme).toContain(':root {');
    expect(theme).toContain('backdrop-filter: blur(');
    expect(theme).toContain('prefers-reduced-motion');
  });

  it('svg export is a standalone document rendered from the tokens', () => {
    const svg = exportStyle(style, 'svg');
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg).toContain(style.tokens.colors.accent);
    expect(svg).not.toContain('<script');
  });

  it('package export round-trips through the validator', () => {
    const pkg = JSON.parse(exportStyle(style, 'package'));
    expect(pkg.generation).toBeUndefined();
    expect(validateStyleDefinition(pkg).ok).toBe(true);
  });
});

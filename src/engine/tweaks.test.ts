import { describe, it, expect } from 'vitest';
import { DEFAULT_TWEAKS, applyTweaks, coerceTweaks, isDefaultTweaks, scaleLengths, textOn } from './tweaks';
import { allStyles } from '../styles';
import type { StyleDefinition } from './types';

const base = allStyles[0];
const withTokens = (patch: (s: StyleDefinition) => void): StyleDefinition => {
  const copy: StyleDefinition = JSON.parse(JSON.stringify(base));
  patch(copy);
  return copy;
};

describe('tweaks', () => {
  it('leaves a style untouched when nothing is tweaked', () => {
    expect(applyTweaks(base, DEFAULT_TWEAKS)).toBe(base);
    expect(isDefaultTweaks(DEFAULT_TWEAKS)).toBe(true);
  });

  it('scales every length in a value', () => {
    expect(scaleLengths('0 4px 12px rgba(0,0,0,.2), inset 0 1px 0 #fff', 2)).toBe('0 8px 24px rgba(0,0,0,.2), inset 0 2px 0 #fff');
    expect(scaleLengths('0.5rem', 0.5)).toBe('0.25rem');
  });

  it('shrinks radii below 100% and rounds square styles above it', () => {
    const square = withTokens((s) => { s.tokens.radii = { sm: '0px', md: '0', lg: '0px', full: '9999px' }; });
    const rounded = applyTweaks(square, { ...DEFAULT_TWEAKS, radius: 2 });
    expect(rounded.tokens.radii.md).toBe('8px');
    expect(rounded.tokens.radii.full).toBe('9999px');
    const soft = withTokens((s) => { s.tokens.radii = { sm: '4px', md: '12px', lg: '20px', full: '9999px' }; });
    expect(applyTweaks(soft, { ...DEFAULT_TWEAKS, radius: 0.5 }).tokens.radii.md).toBe('6px');
    expect(applyTweaks(soft, { ...DEFAULT_TWEAKS, radius: 0 }).tokens.radii.lg).toBe('0px');
  });

  it('gives borderless styles an outline when borders are turned up', () => {
    const borderless = withTokens((s) => { s.tokens.borders = { width: '0px', style: 'none', color: '#000' }; });
    const out = applyTweaks(borderless, { ...DEFAULT_TWEAKS, border: 3 });
    expect(out.tokens.borders.width).toBe('2px');
    expect(out.tokens.borders.style).toBe('solid');
  });

  it('scales type, spacing and shadows', () => {
    const s = withTokens((x) => { x.tokens.typography.fontSizeBase = '16px'; x.tokens.shadows.md = '0 4px 10px #0003'; x.tokens.materials = { density: 1 }; });
    const out = applyTweaks(s, { ...DEFAULT_TWEAKS, type: 1.25, density: 0.8, shadow: 0 });
    expect(out.tokens.typography.fontSizeBase).toBe('20px');
    expect(out.tokens.materials?.density).toBe(0.8);
    expect(out.tokens.shadows.md).toBe('0 0px 0px #0003');
  });

  it('swaps the accent with a readable text colour and a hover shade', () => {
    const out = applyTweaks(base, { ...DEFAULT_TWEAKS, accent: '#fde047' });
    expect(out.tokens.colors.accent).toBe('#fde047');
    expect(out.tokens.colors.accentText).toBe('#000000');
    expect(out.tokens.colors.accentHover).not.toBe('#fde047');
    expect(textOn('#1e3a8a')).toBe('#ffffff');
  });

  it('clamps stored values and ignores junk', () => {
    expect(coerceTweaks({ radius: 99, type: 'big', accent: 'not a colour', shadow: 0.5 })).toEqual({ ...DEFAULT_TWEAKS, radius: 3, shadow: 0.5 });
    expect(coerceTweaks(null)).toEqual(DEFAULT_TWEAKS);
  });
});

/**
 * UI Explorer — Procedural Color Generation & Accessibility Engine
 * Generates harmonized color palettes and calculates WCAG contrast metrics.
 */

import type { PRNG } from '../random/prng';
import type { PersonalityRules } from './personalities';
import type { ColorTokens } from '../types';

export type HarmonyType =
  | 'Monochromatic'
  | 'Analogous'
  | 'Complementary'
  | 'Split-Complementary'
  | 'Triadic';

export interface AccessibilityMetrics {
  textPrimaryRatio: number;
  textSecondaryRatio: number;
  accentRatio: number;
  wcagRating: 'AAA' | 'AA' | 'AA Large' | 'Fail';
}

/** Converts HSL values (h: 0..360, s: 0..100, l: 0..100) to HEX string. */
export function hslToHex(h: number, s: number, l: number): string {
  const hNorm = ((h % 360) + 360) % 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;
  if (hNorm < 60) { r = c; g = x; b = 0; }
  else if (hNorm < 120) { r = x; g = c; b = 0; }
  else if (hNorm < 180) { r = 0; g = c; b = x; }
  else if (hNorm < 240) { r = 0; g = x; b = c; }
  else if (hNorm < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Calculates WCAG relative luminance of a HEX color. */
export function getLuminance(hex: string): number {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/** Calculates contrast ratio between two HEX colors (1..21). */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function evaluateAccessibility(colors: ColorTokens): AccessibilityMetrics {
  const textPrimaryRatio = getContrastRatio(colors.bg, colors.textPrimary);
  const textSecondaryRatio = getContrastRatio(colors.bg, colors.textSecondary);
  const accentRatio = getContrastRatio(colors.bg, colors.accent);

  let wcagRating: 'AAA' | 'AA' | 'AA Large' | 'Fail' = 'Fail';
  if (textPrimaryRatio >= 7.0) {
    wcagRating = 'AAA';
  } else if (textPrimaryRatio >= 4.5) {
    wcagRating = 'AA';
  } else if (textPrimaryRatio >= 3.0) {
    wcagRating = 'AA Large';
  }

  return {
    textPrimaryRatio,
    textSecondaryRatio,
    accentRatio,
    wcagRating
  };
}

export function generateProceduralColors(personality: PersonalityRules, prng: PRNG): { colors: ColorTokens; harmony: HarmonyType } {
  // Select Base Hue according to personality preferences
  const huePref = prng.weightedChoice(
    personality.huePreferences.map((p) => ({ value: p, weight: p.weight }))
  );
  const baseHue = prng.nextInt(huePref.hueMin, huePref.hueMax);

  // Harmony selection
  const harmonies: { value: HarmonyType; weight: number }[] = [
    { value: 'Analogous', weight: 40 },
    { value: 'Monochromatic', weight: 25 },
    { value: 'Complementary', weight: 15 },
    { value: 'Split-Complementary', weight: 10 },
    { value: 'Triadic', weight: 10 }
  ];
  const harmony = prng.weightedChoice(harmonies);

  let accentHue = baseHue;
  if (harmony === 'Complementary') {
    accentHue = (baseHue + 180) % 360;
  } else if (harmony === 'Analogous') {
    accentHue = (baseHue + 30) % 360;
  } else if (harmony === 'Split-Complementary') {
    accentHue = (baseHue + 150) % 360;
  } else if (harmony === 'Triadic') {
    accentHue = (baseHue + 120) % 360;
  }

  const isDark = prng.next() < personality.darkBgProbability;
  const sat = prng.nextInt(personality.saturationRange[0], personality.saturationRange[1]);

  let bgHex: string;
  let surfaceHex: string;
  let surfaceHoverHex: string;
  let textPrimaryHex: string;
  let textSecondaryHex: string;
  let textTertiaryHex: string;
  let borderHex: string;

  if (isDark) {
    const bgLight = prng.nextInt(4, 12);
    bgHex = hslToHex(baseHue, Math.floor(sat * 0.3), bgLight);
    surfaceHex = hslToHex(baseHue, Math.floor(sat * 0.25), bgLight + 6);
    surfaceHoverHex = hslToHex(baseHue, Math.floor(sat * 0.25), bgLight + 12);

    textPrimaryHex = '#f8fafc';
    textSecondaryHex = '#94a3b8';
    textTertiaryHex = '#64748b';
    borderHex = hslToHex(baseHue, Math.floor(sat * 0.2), bgLight + 16);
  } else {
    const bgLight = prng.nextInt(94, 99);
    bgHex = hslToHex(baseHue, Math.floor(sat * 0.15), bgLight);
    surfaceHex = hslToHex(baseHue, Math.floor(sat * 0.1), bgLight - 4);
    surfaceHoverHex = hslToHex(baseHue, Math.floor(sat * 0.1), bgLight - 8);

    textPrimaryHex = '#0f172a';
    textSecondaryHex = '#475569';
    textTertiaryHex = '#94a3b8';
    borderHex = hslToHex(baseHue, Math.floor(sat * 0.2), bgLight - 14);
  }

  const accentSat = Math.min(100, sat + 30);
  const accentLight = isDark ? 60 : 45;
  const accentHex = hslToHex(accentHue, accentSat, accentLight);
  const accentHoverHex = hslToHex(accentHue, accentSat, isDark ? 70 : 35);

  const colors: ColorTokens = {
    bg: bgHex,
    surface: surfaceHex,
    surfaceHover: surfaceHoverHex,
    surfaceActive: surfaceHoverHex,
    textPrimary: textPrimaryHex,
    textSecondary: textSecondaryHex,
    textTertiary: textTertiaryHex,
    border: borderHex,
    borderHover: accentHex,
    accent: accentHex,
    accentHover: accentHoverHex,
    accentText: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    shadowColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.08)',
    glowColor: accentHex
  };

  return { colors, harmony };
}

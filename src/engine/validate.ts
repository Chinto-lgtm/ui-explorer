/**
 * UI Explorer — Style Definition Validator
 * Checks that an imported or stored object is a usable StyleDefinition and
 * reports every missing or malformed field so the message is actionable.
 */

import type { StyleDefinition } from './types';

export interface ValidationResult {
  ok: boolean;
  /** Dot paths of missing or invalid fields, e.g. "tokens.colors.accent". */
  missing: string[];
  /** Non-fatal problems that were repaired or ignored. */
  warnings: string[];
}

const REQUIRED_STRINGS: Record<string, string[]> = {
  'metadata': ['id', 'name', 'category', 'description'],
  'tokens.colors': ['bg', 'surface', 'textPrimary', 'textSecondary', 'textTertiary', 'border', 'accent', 'accentHover'],
  'tokens.typography': [
    'fontFamilySans', 'fontSizeXs', 'fontSizeSm', 'fontSizeBase', 'fontSizeLg', 'fontSizeXl',
    'fontSize2xl', 'fontSize3xl', 'letterSpacing', 'lineHeight'
  ],
  'tokens.radii': ['sm', 'md', 'lg', 'full'],
  'tokens.shadows': ['sm', 'md', 'lg'],
  'tokens.borders': ['width', 'style', 'color'],
  'tokens.motion': ['durationFast', 'durationNormal', 'durationSlow', 'easing']
};

const REQUIRED_NUMERIC: Record<string, string[]> = {
  'tokens.typography': ['fontWeightNormal', 'fontWeightMedium', 'fontWeightBold']
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Safe numeric ranges for generated or imported values (px / ms / unitless).
 * Anything outside is reported as invalid so a package cannot render absurd or broken CSS.
 */
export const PROPERTY_RANGES: { path: RegExp; min: number; max: number; unit: 'px' | 'ms' | '' }[] = [
  { path: /^tokens\.radii\.(sm|md|lg|xl)$/, min: 0, max: 64, unit: 'px' },
  { path: /^tokens\.borders\.width$/, min: 0, max: 12, unit: 'px' },
  { path: /^tokens\.materials\.backdropBlur$/, min: 0, max: 60, unit: 'px' },
  { path: /^tokens\.materials\.opacity$/, min: 0, max: 1, unit: '' },
  { path: /^tokens\.motion\.duration(Fast|Normal|Slow)$/, min: 0, max: 1000, unit: 'ms' },
  { path: /^tokens\.motion\.(hoverScale|activeScale)$/, min: 0.5, max: 1.5, unit: '' },
  { path: /^tokens\.typography\.fontWeight(Normal|Medium|Bold)$/, min: 100, max: 900, unit: '' },
  { path: /^tokens\.icons\.strokeWidth$/, min: 0.5, max: 4, unit: '' }
];

/** CSS that could execute, load remote content or break out of a value. Packages are data, never code. */
const UNSAFE_VALUE = /(<\s*\/?\s*(script|iframe|object|embed|svg|img|style)\b|javascript:|expression\s*\(|url\s*\(|@import|behavior\s*:|-moz-binding|on[a-z]+\s*=|[;{}])/i;

const numeric = (v: unknown, unit: string): number | null => {
  if (typeof v === 'number') return v;
  if (typeof v !== 'string') return null;
  const m = /^\s*(-?[\d.]+)\s*([a-z%]*)\s*$/i.exec(v);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  if (unit === 'ms' && m[2] === 's') return n * 1000;
  if (unit && m[2] && m[2] !== unit) return null;
  return n;
};

/** Walk a token tree and collect `path: value` pairs for range and safety checks. */
function walkTokens(obj: unknown, prefix: string, out: [string, unknown][]) {
  if (!isRecord(obj)) return;
  for (const [k, v] of Object.entries(obj)) {
    const path = `${prefix}.${k}`;
    if (isRecord(v)) walkTokens(v, path, out);
    else out.push([path, v]);
  }
}

/** Range and safety problems in a style; each entry is a dot path with a reason. */
export function checkRangesAndSafety(candidate: Record<string, unknown>): string[] {
  const problems: string[] = [];
  const entries: [string, unknown][] = [];
  walkTokens(candidate.tokens, 'tokens', entries);
  walkTokens(candidate.customCssVars, 'customCssVars', entries);
  walkTokens(candidate.metadata, 'metadata', entries);
  for (const [path, value] of entries) {
    if (typeof value === 'string') {
      if (path.startsWith('metadata.') ? /<\s*\/?\s*script|javascript:/i.test(value) : UNSAFE_VALUE.test(value)) problems.push(`${path} contains unsafe content`);
    }
    const range = PROPERTY_RANGES.find((r) => r.path.test(path));
    if (!range) continue;
    const n = numeric(value, range.unit);
    if (n === null) { if (value !== undefined) problems.push(`${path} is not a ${range.unit || 'number'} value`); continue; }
    if (n < range.min || n > range.max) problems.push(`${path} out of range (${range.min}–${range.max}${range.unit})`);
  }
  return problems;
}

const getPath = (root: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, key) => (isRecord(acc) ? acc[key] : undefined), root);

export function validateStyleDefinition(candidate: unknown): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(candidate)) {
    return { ok: false, missing: ['(root object)'], warnings };
  }

  for (const [group, keys] of Object.entries(REQUIRED_STRINGS)) {
    const obj = getPath(candidate, group);
    if (!isRecord(obj)) {
      missing.push(group);
      continue;
    }
    for (const key of keys) {
      const v = obj[key];
      if (typeof v !== 'string' || v.trim() === '') missing.push(`${group}.${key}`);
    }
  }

  for (const [group, keys] of Object.entries(REQUIRED_NUMERIC)) {
    const obj = getPath(candidate, group);
    if (!isRecord(obj)) continue; // already reported above
    for (const key of keys) {
      const v = obj[key];
      if (!(typeof v === 'number' || (typeof v === 'string' && v.trim() !== ''))) missing.push(`${group}.${key}`);
    }
  }

  missing.push(...checkRangesAndSafety(candidate));

  const tags = getPath(candidate, 'metadata.tags');
  if (!Array.isArray(tags)) warnings.push('metadata.tags defaulted to []');
  const best = getPath(candidate, 'metadata.bestUsedFor');
  if (!Array.isArray(best)) warnings.push('metadata.bestUsedFor defaulted to []');

  return { ok: missing.length === 0, missing, warnings };
}

/** Validate and normalise optional metadata arrays so downstream code can rely on them. */
export function coerceStyleDefinition(candidate: unknown): StyleDefinition | null {
  const result = validateStyleDefinition(candidate);
  if (!result.ok) return null;
  const style = candidate as StyleDefinition;
  return {
    ...style,
    metadata: {
      ...style.metadata,
      tags: Array.isArray(style.metadata.tags) ? style.metadata.tags : [],
      bestUsedFor: Array.isArray(style.metadata.bestUsedFor) ? style.metadata.bestUsedFor : [],
      personality: typeof style.metadata.personality === 'string' ? style.metadata.personality : ''
    }
  };
}

/** Human-readable message in the format the import dialog shows. */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.ok) return '';
  return `Invalid style.\nMissing or invalid:\n${result.missing.map((m) => `  ${m}`).join('\n')}`;
}

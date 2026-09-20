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

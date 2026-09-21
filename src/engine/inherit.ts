/**
 * UI Explorer — Style inheritance
 * A style file may declare `extends: "<style id>"` and only override what
 * differs; the base is deep-merged underneath at load time.
 */

import type { StyleDefinition } from './types';

export interface StyleFile extends Partial<StyleDefinition> {
  extends?: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Deep merge: objects merge recursively, arrays and primitives from `override` replace. */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isRecord(base) || !isRecord(override)) return (override === undefined ? base : (override as T));
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    out[key] = isRecord(value) && isRecord(base[key]) ? deepMerge(base[key], value) : value;
  }
  return out as T;
}

/** Resolve `extends` against a lookup of known styles. Missing bases fall through unchanged. */
export function resolveInheritance(file: StyleFile, lookup: (id: string) => StyleDefinition | undefined): StyleFile {
  if (!file.extends) return file;
  const base = lookup(file.extends);
  if (!base) return file;
  const { extends: parent, ...rest } = file;
  const merged = deepMerge(base, rest) as StyleFile;
  // Provenance is kept for the docs and the relationship map.
  merged.metadata = { ...merged.metadata!, relatedStyles: Array.from(new Set([...(merged.metadata?.relatedStyles ?? []), parent])) };
  return merged;
}

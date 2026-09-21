/**
 * UI Explorer — Shareable style links
 * Built-in styles share by id; custom styles carry their definition in the URL
 * as compact base64url JSON (no server, no huge HTML).
 */

import type { StyleDefinition } from './types';
import { absoluteUrl } from '../config/app';
import { coerceStyleDefinition } from './validate';

const toBase64Url = (s: string): string =>
  btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const fromBase64Url = (s: string): string =>
  decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4))));

/** Produce the `style` query value for a style. */
export function encodeStyleParam(style: StyleDefinition, isBuiltIn: boolean): string {
  if (isBuiltIn) return style.metadata.id;
  const payload = {
    metadata: style.metadata,
    tokens: style.tokens,
    svgLanguage: style.svgLanguage,
    behavior: style.behavior,
    customCssVars: style.customCssVars,
    generation: style.generation ? { seed: style.generation.seed, mode: style.generation.mode, personality: style.generation.personality, generatorVersion: style.generation.generatorVersion } : undefined
  };
  return `j.${toBase64Url(JSON.stringify(payload))}`;
}

export function buildShareUrl(style: StyleDefinition, isBuiltIn: boolean, path = '/'): string {
  return `${absoluteUrl(path)}?style=${encodeURIComponent(encodeStyleParam(style, isBuiltIn))}`;
}

export type DecodedShare = { kind: 'id'; id: string } | { kind: 'style'; style: StyleDefinition } | { kind: 'invalid'; reason: string };

export function decodeStyleParam(value: string): DecodedShare {
  if (!value.startsWith('j.')) return { kind: 'id', id: value };
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(value.slice(2)));
    const style = coerceStyleDefinition(parsed);
    if (!style) return { kind: 'invalid', reason: 'The shared style is missing required tokens.' };
    return { kind: 'style', style: { ...style, metadata: { ...style.metadata, isCustom: true, source: style.metadata.source ?? 'custom' } } };
  } catch {
    return { kind: 'invalid', reason: 'The share link could not be decoded.' };
  }
}

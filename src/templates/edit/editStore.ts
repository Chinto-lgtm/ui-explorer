/**
 * Template edits: text a visitor rewrote and landing sections they hid or
 * moved, per template screen. Kept in this browser (localStorage) and
 * exportable as a small JSON file. The templates' source is never changed;
 * edits are laid over the rendered screen (see applyEdits.ts).
 */

import { useSyncExternalStore } from 'react';

export interface SectionEdits {
  /** Section indices (original order) in the order they should appear. */
  order: number[];
  /** Section indices that are hidden. */
  hidden: number[];
}

export interface ScreenEdits {
  /** Text overrides keyed by `${original text}#${occurrence}`. */
  text: Record<string, string>;
  sections?: SectionEdits;
}

export interface EditsDoc {
  app: 'ui-explorer';
  kind: 'template-edits';
  version: 1;
  screens: Record<string, ScreenEdits>;
}

export const EDITS_STORAGE_KEY = 'ui_explorer_template_edits';

const empty = (): EditsDoc => ({ app: 'ui-explorer', kind: 'template-edits', version: 1, screens: {} });

/** The desktop and phone landing templates are one website, so they share their edits. */
export const editScope = (family: string) => (family.startsWith('landing') ? 'landing' : family);
export const screenKey = (family: string, screen: string) => `${editScope(family)}/${screen}`;
export const textKey = (original: string, occurrence: number) => `${original}#${occurrence}`;

const isIntArray = (v: unknown): v is number[] => Array.isArray(v) && v.every((n) => Number.isInteger(n) && n >= 0 && n < 200);

/** Accepts a stored or imported document; drops anything malformed. Returns null when nothing usable is left. */
export function coerceEdits(raw: unknown): EditsDoc | null {
  if (!raw || typeof raw !== 'object') return null;
  const src = raw as { screens?: unknown };
  if (!src.screens || typeof src.screens !== 'object') return null;
  const out = empty();
  for (const [key, value] of Object.entries(src.screens as Record<string, unknown>)) {
    if (!/^[a-z-]+\/[a-z-]+$/.test(key) || !value || typeof value !== 'object') continue;
    const v = value as { text?: unknown; sections?: unknown };
    const text: Record<string, string> = {};
    if (v.text && typeof v.text === 'object') {
      for (const [k, t] of Object.entries(v.text as Record<string, unknown>)) {
        if (typeof t === 'string' && k.length < 600 && t.length < 2000) text[k] = t;
      }
    }
    let sections: SectionEdits | undefined;
    const s = v.sections as { order?: unknown; hidden?: unknown } | undefined;
    if (s && isIntArray(s.order) && isIntArray(s.hidden)) sections = { order: s.order, hidden: s.hidden };
    if (Object.keys(text).length || sections) out.screens[key] = sections ? { text, sections } : { text };
  }
  return out;
}

function load(): EditsDoc {
  try {
    const raw = localStorage.getItem(EDITS_STORAGE_KEY);
    return (raw && coerceEdits(JSON.parse(raw))) || empty();
  } catch {
    return empty();
  }
}

let doc: EditsDoc = load();
const listeners = new Set<() => void>();

function commit(next: EditsDoc) {
  // Drop screens that no longer change anything.
  for (const [k, s] of Object.entries(next.screens)) {
    const sectionsChanged = s.sections && (s.sections.hidden.length > 0 || s.sections.order.some((n, i) => n !== i));
    if (!Object.keys(s.text).length && !sectionsChanged) delete next.screens[k];
    else if (!sectionsChanged) delete s.sections;
  }
  doc = next;
  try { localStorage.setItem(EDITS_STORAGE_KEY, JSON.stringify(doc)); } catch { /* storage full or unavailable */ }
  listeners.forEach((l) => l());
}

const clone = (): EditsDoc => JSON.parse(JSON.stringify(doc));

export const editStore = {
  get: (): EditsDoc => doc,
  screen: (key: string): ScreenEdits | undefined => doc.screens[key],
  setText(key: string, tKey: string, text: string | null) {
    const next = clone();
    const s = next.screens[key] ?? { text: {} };
    if (text === null) delete s.text[tKey]; else s.text[tKey] = text;
    next.screens[key] = s;
    commit(next);
  },
  setSections(key: string, sections: SectionEdits) {
    const next = clone();
    next.screens[key] = { ...(next.screens[key] ?? { text: {} }), sections };
    commit(next);
  },
  resetScreen(key: string) {
    const next = clone();
    delete next.screens[key];
    commit(next);
  },
  resetAll() { commit(empty()); },
  /** Replaces every edit with an imported document. Returns false if the file holds nothing usable. */
  import(raw: unknown): boolean {
    const parsed = coerceEdits(raw);
    if (!parsed) return false;
    commit(parsed);
    return true;
  },
  export: (): string => JSON.stringify(doc, null, 2),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  /** Re-reads storage (tests, another tab). */
  reload() { doc = load(); listeners.forEach((l) => l()); }
};

export const useEdits = (): EditsDoc => useSyncExternalStore(editStore.subscribe, editStore.get, editStore.get);

/** How many changes a screen carries, for badges and summaries. */
export function countEdits(s: ScreenEdits | undefined) {
  if (!s) return { text: 0, hidden: 0, moved: false };
  return {
    text: Object.keys(s.text).length,
    hidden: s.sections?.hidden.length ?? 0,
    moved: Boolean(s.sections?.order.some((n, i) => n !== i))
  };
}

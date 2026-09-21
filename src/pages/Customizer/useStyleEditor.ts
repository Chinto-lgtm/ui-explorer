import { useCallback, useEffect, useState } from 'react';
import type { StyleDefinition } from '../../engine/types';

const HISTORY_LIMIT = 100;

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** Set a nested value by dot path on a cloned object. */
export function setPath<T extends object>(obj: T, path: string, value: unknown): T {
  const next = clone(obj);
  const parts = path.split('.');
  let cursor: Record<string, unknown> = next as unknown as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (typeof cursor[key] !== 'object' || cursor[key] === null) cursor[key] = {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
  return next;
}

export function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (typeof acc === 'object' && acc !== null ? (acc as Record<string, unknown>)[key] : undefined), obj);
}

interface EditorState {
  base: StyleDefinition;
  draft: StyleDefinition;
  past: StyleDefinition[];
  future: StyleDefinition[];
}

const fresh = (base: StyleDefinition): EditorState => ({ base, draft: clone(base), past: [], future: [] });

/**
 * Editable copy of a style with undo / redo, dirty tracking and per-path reset
 * against the base the editor was opened with.
 */
export function useStyleEditor(base: StyleDefinition) {
  const [state, setState] = useState<EditorState>(() => fresh(base));

  /** Re-open the editor on a different base (e.g. header switched style). */
  const reset = useCallback((next: StyleDefinition) => setState(fresh(next)), []);

  useEffect(() => {
    setState((s) => (s.base.metadata.id === base.metadata.id ? s : fresh(base)));
  }, [base]);

  const commit = useCallback((updater: (prev: StyleDefinition) => StyleDefinition) => {
    setState((s) => ({ ...s, draft: updater(s.draft), past: [...s.past.slice(-(HISTORY_LIMIT - 1)), s.draft], future: [] }));
  }, []);

  const set = useCallback((path: string, value: unknown) => commit((prev) => setPath(prev, path, value)), [commit]);
  const setMany = useCallback((patch: Record<string, unknown>) => commit((prev) => Object.entries(patch).reduce((acc, [k, v]) => setPath(acc, k, v), prev)), [commit]);
  const replace = useCallback((next: StyleDefinition) => commit(() => clone(next)), [commit]);

  const undo = useCallback(() => setState((s) => {
    if (s.past.length === 0) return s;
    const prev = s.past[s.past.length - 1];
    return { ...s, draft: prev, past: s.past.slice(0, -1), future: [s.draft, ...s.future] };
  }), []);

  const redo = useCallback(() => setState((s) => {
    if (s.future.length === 0) return s;
    const [next, ...rest] = s.future;
    return { ...s, draft: next, past: [...s.past, s.draft], future: rest };
  }), []);

  const resetPath = useCallback((path: string) => {
    setState((s) => ({ ...s, draft: setPath(s.draft, path, clone(getPath(s.base, path))), past: [...s.past, s.draft], future: [] }));
  }, []);

  const resetSection = resetPath;
  const resetAll = useCallback(() => setState((s) => ({ ...s, draft: clone(s.base), past: [...s.past, s.draft], future: [] })), []);

  const dirty = JSON.stringify(state.draft) !== JSON.stringify(state.base);
  const isChanged = useCallback((path: string) => JSON.stringify(getPath(state.draft, path)) !== JSON.stringify(getPath(state.base, path)), [state.draft, state.base]);

  return {
    draft: state.draft, base: state.base, dirty, isChanged,
    set, setMany, replace, undo, redo, resetPath, resetSection, resetAll, reset,
    canUndo: state.past.length > 0, canRedo: state.future.length > 0
  };
}

import { createContext, useCallback, useContext, useEffect } from 'react';

/**
 * Shared state for the Components page's deep-dive sections.
 *
 * A section renders once per device frame (three times when comparing styles),
 * but its settings must be one set: the sidebar drives every frame. Settings are
 * therefore kept above the frames and read with useLabState. Only the primary
 * frame renders the sidebar controls and reports the status line.
 */

export interface LabShared {
  values: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  controlsHost: HTMLElement | null;
  setStatus: (text: string) => void;
}

export const LabSharedContext = createContext<LabShared>({ values: {}, set: () => undefined, controlsHost: null, setStatus: () => undefined });
export const LabFrameContext = createContext<{ primary: boolean }>({ primary: true });

/** Like useState, but shared by every frame showing the same section. Keys are namespaced by the section. */
export function useLabState<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const { values, set } = useContext(LabSharedContext);
  const value = (key in values ? values[key] : initial) as T;
  const update = useCallback((next: T | ((prev: T) => T)) => {
    set(key, typeof next === 'function' ? (next as (prev: T) => T)(value) : next);
  }, [key, set, value]);
  return [value, update];
}

/** A short status line ("40 rows · ready") shown in the stage bar. */
export const useLabStatus = (text: string) => {
  const { setStatus } = useContext(LabSharedContext);
  const { primary } = useContext(LabFrameContext);
  useEffect(() => { if (primary) setStatus(text); }, [text, setStatus, primary]);
};

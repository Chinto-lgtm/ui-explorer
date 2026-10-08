import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { COMPARE_PARAM } from '../config/routes';
import { useStyle } from './useStyle';
import type { StyleDefinition } from '../engine/types';

export const COMPARE_SLOTS = ['A', 'B', 'C'] as const;

/**
 * Three-style comparison shared by every page that offers it. State lives in
 * `?compare=a,b,c`: present means on, unknown or missing ids fall back to the
 * current style followed by the next two styles.
 */
export function useCompare() {
  const [params, setParams] = useSearchParams();
  const { availableStyles, currentStyle, renderStyle } = useStyle();
  const on = params.has(COMPARE_PARAM) || params.get('view') === 'compare';
  const raw = params.get(COMPARE_PARAM) ?? '';

  const ids = useMemo(() => {
    const fromUrl = raw.split(',').filter((id) => availableStyles.some((s) => s.metadata.id === id));
    const others = availableStyles.map((s) => s.metadata.id).filter((id) => id !== currentStyle.metadata.id);
    const defaults = [currentStyle.metadata.id, others[0], others[1]];
    return COMPARE_SLOTS.map((_, i) => fromUrl[i] ?? defaults[i] ?? currentStyle.metadata.id);
  }, [raw, availableStyles, currentStyle]);

  const styles: StyleDefinition[] = useMemo(
    () => ids.map((id) => availableStyles.find((s) => s.metadata.id === id) ?? currentStyle),
    [ids, availableStyles, currentStyle]
  );

  /** Each slot painted like the main canvas: tweaks and motion settings applied. */
  const frames = useMemo(() => styles.map(renderStyle), [styles, renderStyle]);

  const setOn = useCallback((next: boolean) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      if (p.get('view') === 'compare') p.delete('view');
      if (next) p.set(COMPARE_PARAM, ids.join(',')); else p.delete(COMPARE_PARAM);
      return p;
    }, { replace: true });
  }, [ids, setParams]);

  const setSlot = useCallback((index: number, id: string) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set(COMPARE_PARAM, ids.map((x, i) => (i === index ? id : x)).join(','));
      return p;
    }, { replace: true });
  }, [ids, setParams]);

  return { on, ids, styles, frames, setOn, setSlot };
}

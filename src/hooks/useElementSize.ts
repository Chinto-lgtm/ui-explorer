import { useLayoutEffect, useState } from 'react';

export interface Size {
  width: number;
  height: number;
}

/**
 * The content-box size of an element (padding excluded), kept current with a
 * ResizeObserver and rounded down to whole pixels. Unchanged sizes do not
 * re-render, so sub-pixel jitter cannot start a resize loop.
 */
export function useElementSize(el: HTMLElement | null): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const cs = getComputedStyle(el);
      const width = Math.floor(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
      const height = Math.floor(el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom));
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return size;
}

import { useEffect, useRef, useState } from 'react';

export interface ChartStyleInfo {
  /** Curves are smooth unless the active style's corner language is sharp/brutalist/bevel. */
  smooth: boolean;
  /** Glow filter on strokes when the style defines a glow shadow. */
  glow: boolean;
  /** Stepped, pixel-like rendering for pixel styles. */
  stepped: boolean;
}

const read = (el: HTMLElement | null): ChartStyleInfo => {
  const host = el?.closest<HTMLElement>('[data-style]') ?? null;
  const corner = host?.dataset.corner ?? 'rounded';
  const family = host?.dataset.family ?? 'generic';
  const glowVar = host ? getComputedStyle(host).getPropertyValue('--shadow-glow').trim() : 'none';
  return {
    smooth: !(corner === 'sharp' || corner === 'brutalist' || corner === 'bevel'),
    glow: glowVar !== '' && glowVar !== 'none',
    stepped: family === 'pixel'
  };
};

/**
 * Reads the active style's SVG language from the nearest themed container.
 * Charts call this so their geometry follows the design language automatically.
 */
export function useChartStyle(): ChartStyleInfo & { ref: React.RefObject<HTMLDivElement | null> } {
  const ref = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<ChartStyleInfo>({ smooth: true, glow: false, stepped: false });

  useEffect(() => {
    const update = () => setInfo(read(ref.current));
    update();
    const host = ref.current?.closest<HTMLElement>('[data-style]');
    if (!host || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(update);
    observer.observe(host, { attributes: true, attributeFilter: ['data-style', 'data-corner', 'data-family', 'style'] });
    return () => observer.disconnect();
  }, []);

  return { ...info, ref };
}

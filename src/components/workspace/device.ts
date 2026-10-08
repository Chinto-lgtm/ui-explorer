export type DeviceKind = 'browser' | 'tablet' | 'phone';

/** Extra size each device adds around its screen, in CSS px at 100%. Pages use these to fit frames to a stage. */
export const DEVICE_CHROME = {
  browserBar: 38,
  /** A phone browser shows an OS status row plus an address bar. */
  phoneBrowserBar: 78,
  phoneBezel: 12,
  tabletBezel: 14
} as const;

/** Outer size of a device around a screen of the given size (borders included). */
export function deviceOuterSize(kind: DeviceKind, screen: { width: number; height: number }) {
  if (kind === 'browser') return { width: screen.width + 2, height: screen.height + DEVICE_CHROME.browserBar + 2 };
  const bezel = kind === 'phone' ? DEVICE_CHROME.phoneBezel : DEVICE_CHROME.tabletBezel;
  return { width: screen.width + bezel * 2 + 2, height: screen.height + bezel * 2 + 2 };
}

/** Space between frames shown side by side, and the caption above each compare frame (CSS px). */
export const FRAME_GAP = 24;
export const FRAME_LABEL = 34;

/**
 * Pixels left free when frames are fitted to a stage. Fitting to the exact
 * pixel lets sub-pixel rounding overflow the stage; the stage then shows
 * scrollbars, shrinks, refits smaller, drops the scrollbars, grows, refits
 * larger… and the frame visibly jumps back and forth. The slack breaks that loop.
 */
export const FIT_SLACK = 4;

/** Smallest zoom a frame is shown at. */
export const MIN_FRAME_SCALE = 0.08;

export interface FitOptions {
  /** Frames side by side. */
  count?: number;
  /** Frames carry a caption (compare slots). */
  labelled?: boolean;
  /** Also fit the height (fixed-size devices). Browser frames that stretch to the stage height fit by width only. */
  fitHeight?: boolean;
}

/** Usable stage size for fitted frames: the measured size minus slack and captions. */
export function fitArea(stage: { width: number; height: number }, { count = 1, labelled = false }: FitOptions = {}) {
  return {
    width: Math.max(0, stage.width - FIT_SLACK - FRAME_GAP * (count - 1)),
    height: Math.max(0, stage.height - FIT_SLACK - (labelled ? FRAME_LABEL : 0))
  };
}

/**
 * The zoom that fits `count` frames of `outer` size into the stage. Never
 * above 1, and rounded down so the result can only ever be a little smaller
 * than the space, never larger.
 */
export function fitScale(stage: { width: number; height: number }, outer: { width: number; height: number }, options: FitOptions = {}): number {
  const { count = 1, fitHeight = true } = options;
  const area = fitArea(stage, options);
  const byWidth = area.width / (outer.width * count);
  const byHeight = fitHeight ? area.height / outer.height : Infinity;
  const scale = Math.min(1, byWidth, byHeight);
  return Math.max(MIN_FRAME_SCALE, Math.floor(scale * 1000) / 1000);
}

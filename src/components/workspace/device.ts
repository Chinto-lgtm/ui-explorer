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

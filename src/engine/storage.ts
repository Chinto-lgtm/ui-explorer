/**
 * UI Explorer — Local persistence
 * Thin, failure-tolerant wrappers around localStorage. Every read returns a
 * fallback instead of throwing, so a corrupted entry can never break startup.
 */

export const STORAGE_KEYS = {
  styleId: 'ui_explorer_style_id',
  customStyles: 'ui_explorer_custom_styles',
  favorites: 'ui_explorer_favorites',
  recentStyles: 'ui_explorer_recent_styles',
  recentColors: 'ui_explorer_recent_colors',
  settings: 'ui_explorer_settings',
  compare: 'ui_explorer_compare',
  generatorHistory: 'ui_explorer_generator_history',
  onboarded: 'ui_explorer_onboarded'
} as const;

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or unavailable — persistence is best effort */
  }
}

export function readString(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* best effort */
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* best effort */
  }
}

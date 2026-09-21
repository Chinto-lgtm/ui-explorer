/** App-level constants shared across pages and the shell. */

declare const __APP_VERSION__: string;

/** Release version, injected from package.json at build time (see vite.config.ts). */
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0-dev';

/** Base path the app is served from ("/" locally, "/ui-explorer/" on GitHub Pages), without the trailing slash. */
export const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Absolute URL for an in-app path, honouring the base path. */
export const absoluteUrl = (path: string) => `${typeof window !== 'undefined' ? window.location.origin : ''}${BASE_PATH}${path}`;

export const GITHUB_REPO_URL = 'https://github.com/Chinto-lgtm/ui-explorer';

/** Documentation site, built from docs/ and published next to the app under /docs/. */
export const DOCS_URL = `${BASE_PATH}/docs/`;

/** Set to "1" once the first-launch welcome has been dismissed. */
export const ONBOARDING_STORAGE_KEY = 'ui_explorer_onboarded';

export const hasCompletedOnboarding = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
};

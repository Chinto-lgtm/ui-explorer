/** App-level constants shared across pages and the shell. */

export const APP_VERSION = '0.1.0';

export const GITHUB_REPO_URL = 'https://github.com/Chinto-lgtm/ui-explorer';

/** Set to "1" once the first-launch welcome has been dismissed. */
export const ONBOARDING_STORAGE_KEY = 'ui_explorer_onboarded';

export const hasCompletedOnboarding = (): boolean => {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
};

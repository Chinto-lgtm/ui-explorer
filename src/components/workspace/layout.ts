import { createContext, useContext, useSyncExternalStore } from 'react';

/** Below this width the workspace panel becomes a drawer over the stage. */
export const NARROW_QUERY = '(max-width: 1023px)';

const noop = () => () => undefined;

/** Live result of a media query; false where matchMedia is unavailable (tests, old browsers). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? (cb) => { const mql = window.matchMedia(query); mql.addEventListener('change', cb); return () => mql.removeEventListener('change', cb); }
      : noop,
    () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false),
    () => false
  );
}

export interface WorkspaceLayout {
  /** The left panel is showing (docked on wide screens, as a drawer on narrow ones). */
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  narrow: boolean;
  panelId: string;
}

export const WorkspaceLayoutContext = createContext<WorkspaceLayout>({
  panelOpen: true,
  setPanelOpen: () => undefined,
  narrow: false,
  panelId: 'ws-panel'
});

export const useWorkspaceLayout = () => useContext(WorkspaceLayoutContext);

export const PANEL_STORAGE_KEY = 'ui_explorer_panel_collapsed';

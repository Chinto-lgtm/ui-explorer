import { createContext, useContext } from 'react';
import type { ToolId } from '../../config/routes';

export interface ToolsApi {
  activeTool: ToolId | null;
  openTool: (id: ToolId, extra?: Record<string, string>) => void;
  closeTool: () => void;
  toggleTool: (id: ToolId) => void;
  isInspecting: boolean;
  toggleCompare: () => void;
}

export const ToolsContext = createContext<ToolsApi>({
  activeTool: null,
  openTool: () => undefined,
  closeTool: () => undefined,
  toggleTool: () => undefined,
  isInspecting: false,
  toggleCompare: () => undefined
});

/** Open, close and query the shell's tools (Tweaks, Anatomy, Mixer, Diff, Export…) from anywhere in the app. */
export const useTools = () => useContext(ToolsContext);

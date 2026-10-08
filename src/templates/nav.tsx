import { createContext, useContext } from 'react';
import type { ComponentType, ReactNode } from 'react';

export type FamilyId = 'landing-desktop' | 'landing-mobile' | 'app';

export interface ScreenDef {
  id: string;
  name: string;
  /** Flow group shown as a heading in the screen list and the flow board. */
  group: string;
  description: string;
  Component: ComponentType;
}

export interface FamilyDef {
  id: FamilyId;
  name: string;
  short: string;
  description: string;
  /** Device the family renders in. */
  device: 'browser' | 'phone';
  /** True device size in CSS px. */
  width: number;
  height: number;
  /** Fake address shown in the browser frame. */
  host?: string;
  /** Shared chrome around every screen (site header and footer, app tab bar). */
  Layout: ComponentType<{ children: ReactNode }>;
  screens: ScreenDef[];
}

export interface TemplateNav {
  family: FamilyId;
  screen: string;
  /** Go to another screen of the same template. */
  go: (screen: string) => void;
  /** False in the flow board, where thumbnails are not interactive. */
  interactive: boolean;
}

export const TemplateNavContext = createContext<TemplateNav>({ family: 'landing-desktop', screen: 'home', go: () => undefined, interactive: false });

export const useTemplateNav = () => useContext(TemplateNavContext);

/**
 * UI Explorer — the single source of truth for pages and tools.
 *
 * The router, the sidebar, the command palette, the header and the landing
 * page all read these lists. Add a page or a tool here and it appears
 * everywhere it should; nothing else keeps its own copy.
 */

import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Palette, LayoutTemplate, Component, Wand2, Sliders, Shuffle, GitCompareArrows, Download, GitPullRequest,
  Eye, Crosshair, Keyboard, SlidersHorizontal, Search
} from 'lucide-react';

export type PageId = 'styles' | 'templates' | 'components' | 'generator' | 'customizer';

export interface PageRoute {
  id: PageId;
  /** Base path, used for links. */
  path: string;
  /** Router pattern including optional segments. */
  pattern: string;
  label: string;
  icon: LucideIcon;
  group: 'Explore' | 'Create';
  /** One line shown in the palette, the landing page and page headers. */
  description: string;
  /** Extra words the command palette matches. */
  keywords: string;
  load: () => Promise<{ default: ComponentType }>;
}

export const PAGES: PageRoute[] = [
  {
    id: 'styles',
    path: '/styles',
    pattern: '/styles/:styleId?/:tab?',
    label: 'Styles',
    icon: Palette,
    group: 'Explore',
    description: 'Every design style as a live preview, with filters, a relationship map and full docs.',
    keywords: 'gallery browse styles community official map relationships docs',
    load: () => import('../pages/Styles/StylesPage').then((m) => ({ default: m.StylesPage }))
  },
  {
    id: 'templates',
    path: '/templates',
    pattern: '/templates/:family?/:screen?',
    label: 'Templates',
    icon: LayoutTemplate,
    group: 'Explore',
    description: 'A landing site and a 17-screen app, fully clickable and editable, in any style.',
    keywords: 'templates landing website app screens orbit mobile desktop',
    load: () => import('../pages/Templates/TemplatesPage').then((m) => ({ default: m.TemplatesPage }))
  },
  {
    id: 'components',
    path: '/components',
    pattern: '/components/:section?',
    label: 'Components',
    icon: Component,
    group: 'Explore',
    description: 'Every building block in every state: foundations, components, data, motion, materials, icons and SVG.',
    keywords: 'components lab buttons inputs charts table motion material icons svg viewport labs',
    load: () => import('../pages/ComponentsLab/ComponentsLabPage').then((m) => ({ default: m.ComponentsLabPage }))
  },
  {
    id: 'generator',
    path: '/generator',
    pattern: '/generator',
    label: 'Generator',
    icon: Wand2,
    group: 'Create',
    description: 'Seed in, coherent style out. Lock axes, remix and share the exact result.',
    keywords: 'generate create new style seed random procedural remix',
    load: () => import('../pages/Generator/GeneratorPage').then((m) => ({ default: m.GeneratorPage }))
  },
  {
    id: 'customizer',
    path: '/customizer',
    pattern: '/customizer/:section?',
    label: 'Customizer',
    icon: Sliders,
    group: 'Create',
    description: 'Edit every token with a real colour picker, contrast checks and undo.',
    keywords: 'customizer edit tokens colours typography radius shadow',
    load: () => import('../pages/Customizer/CustomizerPage').then((m) => ({ default: m.CustomizerPage }))
  }
];

/** Where the app starts when someone leaves the landing page for the first time. */
export const APP_HOME = '/styles';

export const pageById = (id: PageId): PageRoute => PAGES.find((p) => p.id === id)!;

/* ---------------------------------------------------------------- */
/* Tools: panels and modes that work on top of any page              */
/* ---------------------------------------------------------------- */

export type ToolId = 'tweaks' | 'anatomy' | 'inspect' | 'mixer' | 'diff' | 'export' | 'contribute' | 'shortcuts' | 'search';

export interface ToolDef {
  id: ToolId;
  label: string;
  icon: LucideIcon;
  description: string;
  /** Shown in menus and the shortcuts sheet. */
  shortcut?: string;
  keywords: string;
  /** Opened with ?tool=<id>, so it can be linked to and survives a refresh. */
  linkable: boolean;
}

export const TOOLS: ToolDef[] = [
  { id: 'tweaks', label: 'Tweaks', icon: SlidersHorizontal, description: 'Sliders for radius, spacing, depth, borders, type and speed on any page.', shortcut: 'Ctrl+.', keywords: 'tweak sliders radius spacing shadow density accent quick edit', linkable: true },
  { id: 'anatomy', label: 'Anatomy', icon: Eye, description: 'Read every value that makes the current style look the way it does.', shortcut: 'Ctrl+Shift+A', keywords: 'anatomy tokens why explain', linkable: true },
  { id: 'inspect', label: 'Inspect', icon: Crosshair, description: 'Click any element to see the tokens behind it.', shortcut: 'Ctrl+Shift+X', keywords: 'inspect inspector click element tokens', linkable: false },
  { id: 'mixer', label: 'Mixer', icon: Shuffle, description: 'Typography from one style, surfaces from another.', keywords: 'mixer remix hybrid combine', linkable: true },
  { id: 'diff', label: 'Diff', icon: GitCompareArrows, description: 'Every token that differs between two styles.', shortcut: 'Ctrl+Shift+D', keywords: 'diff differences tokens two styles', linkable: true },
  { id: 'export', label: 'Export & import', icon: Download, description: 'CSS variables, JSON tokens, theme CSS, or import a style file.', shortcut: 'Ctrl+Shift+E', keywords: 'export import json css download tokens', linkable: true },
  { id: 'contribute', label: 'Contribute', icon: GitPullRequest, description: 'Package a style for the community registry.', keywords: 'contribute package community github pull request', linkable: true },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard, description: 'Every keyboard shortcut.', shortcut: '?', keywords: 'keyboard shortcuts keys help', linkable: true },
  { id: 'search', label: 'Search', icon: Search, description: 'Jump to any page, style, tool or token.', shortcut: 'Ctrl+K', keywords: 'search command palette jump', linkable: false }
];

export const toolById = (id: ToolId): ToolDef => TOOLS.find((t) => t.id === id)!;

export const isToolId = (id: string | null | undefined): id is ToolId => TOOLS.some((t) => t.id === id);

/* ---------------------------------------------------------------- */
/* Compare: one convention for every page that compares styles       */
/* ---------------------------------------------------------------- */

/**
 * Pages that can show the same content in three styles read `?compare=a,b,c`
 * (an empty value means "pick for me"). The header's Compare button turns it
 * on where the page supports it, and otherwise opens Templates in compare.
 */
export const COMPARE_PARAM = 'compare';

export function compareHref(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  const on = params.has(COMPARE_PARAM);
  if (pathname.startsWith('/templates') || pathname.startsWith('/components')) {
    if (on) params.delete(COMPARE_PARAM); else params.set(COMPARE_PARAM, '');
    params.delete('view');
    const qs = params.toString().replace(/compare=(&|$)/, 'compare$1');
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }
  return '/templates/landing-desktop/home?compare';
}

export const supportsCompare = (pathname: string) => pathname.startsWith('/templates') || pathname.startsWith('/components');

/** The last app page the visitor used, so the landing page can send them back to it. */
export const LAST_ROUTE_KEY = 'ui_explorer_last_route';

import React, { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AnatomyPanel } from '../../features/anatomy/AnatomyPanel';
import { StyleMixerModal } from '../../features/mixer/StyleMixerModal';
import { ExportModal } from '../../features/export/ExportModal';
import { ContributionPackageModal } from '../../features/export/ContributionPackageModal';
import { CommandPalette } from '../../features/search/CommandPalette';
import { ShortcutsPanel } from '../../features/shortcuts/ShortcutsPanel';
import { StyleDiffModal } from '../../features/diff/StyleDiffModal';
import { TokenInspector } from '../../features/inspector/TokenInspector';
import { TweaksPanel } from '../../features/tweaks/TweaksPanel';
import { useStyle } from '../../hooks/useStyle';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { getStyleDataAttributes } from '../../engine/styleAttributes';
import { decodeStyleParam } from '../../engine/share';
import { LAST_ROUTE_KEY, compareHref, isToolId } from '../../config/routes';
import type { ToolId } from '../../config/routes';
import { ToolsContext } from './tools';
import './AppShell.css';

export interface AppShellProps {
  children: ReactNode;
}

/** Fired by the Ctrl+S shortcut; pages that can save (Customizer) listen for it. */
export const SAVE_EVENT = 'ui-explorer:save';

const RAIL_KEY = 'ui_explorer_rail_collapsed';
const readRail = () => { try { return localStorage.getItem(RAIL_KEY) === '1'; } catch { return false; } };

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { resolvedCssVars, renderedStyle, settings, setStyle, addCustomStyle } = useStyle();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(readRail);
  const toggleRail = () => setRailCollapsed((v) => {
    try { localStorage.setItem(RAIL_KEY, v ? '0' : '1'); } catch { /* storage unavailable */ }
    return !v;
  });

  // The open tool lives in the URL (?tool=mixer), so tools can be linked to and Back closes them.
  const toolParam = searchParams.get('tool');
  const activeTool: ToolId | null = isToolId(toolParam) ? toolParam : null;

  const openTool = useCallback((id: ToolId, extra?: Record<string, string>) => {
    if (id === 'search') { setIsCmdPaletteOpen(true); return; }
    if (id === 'inspect') { setIsInspecting((v) => !v); return; }
    const next = new URLSearchParams(searchParams);
    next.set('tool', id);
    if (extra) Object.entries(extra).forEach(([k, v]) => next.set(k, v));
    navigate(`${location.pathname}?${next.toString()}`);
  }, [searchParams, navigate, location.pathname]);

  const closeTool = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      ['tool', 'a', 'b'].forEach((k) => next.delete(k));
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const toggleTool = useCallback((id: ToolId) => {
    if (activeTool === id) closeTool(); else openTool(id);
  }, [activeTool, closeTool, openTool]);

  // Shared style links: ?style=<id> or ?style=j.<encoded definition>. Applied once, then dropped from the address.
  useEffect(() => {
    const shared = searchParams.get('style');
    if (!shared) return;
    const decoded = decodeStyleParam(shared);
    if (decoded.kind === 'id') setStyle(decoded.id);
    else if (decoded.kind === 'style') addCustomStyle(decoded.style);
    const next = new URLSearchParams(searchParams);
    next.delete('style');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Other surfaces (the styles gallery) ask for a diff of a specific pair.
  useEffect(() => {
    const onOpenDiff = (e: Event) => {
      const { a, b } = (e as CustomEvent<{ a?: string; b?: string }>).detail ?? {};
      openTool('diff', Object.fromEntries(Object.entries({ a, b }).filter(([, v]) => v)) as Record<string, string>);
    };
    window.addEventListener('ui-explorer:open-diff', onOpenDiff);
    return () => window.removeEventListener('ui-explorer:open-diff', onOpenDiff);
  }, [openTool]);

  // Close the mobile drawer whenever the route changes, and remember the page for the landing page's "back" button.
  useEffect(() => {
    setIsSidebarOpen(false);
    try { localStorage.setItem(LAST_ROUTE_KEY, location.pathname); } catch { /* storage unavailable */ }
  }, [location.pathname]);

  const toggleCompare = useCallback(() => navigate(compareHref(location.pathname, location.search)), [navigate, location.pathname, location.search]);

  useKeyboardShortcut({ key: 'k', ctrlKey: true }, () => setIsCmdPaletteOpen(true));
  useKeyboardShortcut({ key: 'e', ctrlKey: true }, () => navigate('/customizer'));
  useKeyboardShortcut({ key: 'c', ctrlKey: true, shiftKey: true }, toggleCompare, [toggleCompare]);
  useKeyboardShortcut({ key: 'a', ctrlKey: true, shiftKey: true }, () => toggleTool('anatomy'), [toggleTool]);
  useKeyboardShortcut({ key: 'e', ctrlKey: true, shiftKey: true }, () => openTool('export'), [openTool]);
  useKeyboardShortcut({ key: 's', ctrlKey: true }, () => window.dispatchEvent(new CustomEvent(SAVE_EVENT)));
  useKeyboardShortcut({ key: 'x', ctrlKey: true, shiftKey: true }, () => setIsInspecting((v) => !v));
  useKeyboardShortcut({ key: 'd', ctrlKey: true, shiftKey: true }, () => openTool('diff'), [openTool]);
  useKeyboardShortcut({ key: '.', ctrlKey: true }, () => toggleTool('tweaks'), [toggleTool]);

  // "?" opens the shortcut reference unless the user is typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      e.preventDefault();
      openTool('shortcuts');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openTool]);

  // Escape closes the topmost layer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isCmdPaletteOpen) setIsCmdPaletteOpen(false);
      else if (activeTool) closeTool();
      else if (isSidebarOpen) setIsSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCmdPaletteOpen, activeTool, closeTool, isSidebarOpen]);

  // Templates theme each frame themselves (three styles at once in compare). The canvas must not carry
  // the current style's treatment attributes there, or its descendant rules would leak into every frame.
  const themedCanvas = !location.pathname.startsWith('/templates');

  const tools = { activeTool, openTool, closeTool, toggleTool, isInspecting, toggleCompare };

  return (
    <ToolsContext.Provider value={tools}>
      <div className={`shell-root ${railCollapsed ? 'shell-root--rail' : ''}`}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          isSidebarOpen={isSidebarOpen}
        />

        <div className="shell-body">
          {isSidebarOpen && <div className="shell-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />}
          <Sidebar isOpen={isSidebarOpen} collapsed={railCollapsed} onToggleCollapsed={toggleRail} />

          <main className="shell-content" id="main-content" tabIndex={-1}>
            <div className="style-preview-canvas" style={resolvedCssVars as React.CSSProperties} {...(themedCanvas ? getStyleDataAttributes(renderedStyle) : {})} data-experimental={settings.experimental ? '1' : undefined}>
              {children}
            </div>
          </main>

          {activeTool === 'anatomy' && <AnatomyPanel onClose={closeTool} />}
          {activeTool === 'tweaks' && <TweaksPanel onClose={closeTool} />}
        </div>

        {activeTool === 'mixer' && <StyleMixerModal onClose={closeTool} />}
        {activeTool === 'export' && <ExportModal onClose={closeTool} />}
        {activeTool === 'contribute' && <ContributionPackageModal onClose={closeTool} />}
        {activeTool === 'shortcuts' && <ShortcutsPanel onClose={closeTool} />}
        {activeTool === 'diff' && <StyleDiffModal onClose={closeTool} initialA={searchParams.get('a') ?? undefined} initialB={searchParams.get('b') ?? undefined} />}
        <TokenInspector active={isInspecting} onClose={() => setIsInspecting(false)} onOpenAnatomy={() => openTool('anatomy')} />
        {isCmdPaletteOpen && <CommandPalette onClose={() => setIsCmdPaletteOpen(false)} />}
      </div>
    </ToolsContext.Provider>
  );
};

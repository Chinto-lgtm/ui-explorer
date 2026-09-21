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
import { CompareView } from '../../features/compare/CompareView';
import { StyleDiffModal } from '../../features/diff/StyleDiffModal';
import { TokenInspector } from '../../features/inspector/TokenInspector';
import { useStyle } from '../../hooks/useStyle';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { getStyleDataAttributes } from '../../engine/styleAttributes';
import { decodeStyleParam } from '../../engine/share';
import './AppShell.css';

export interface AppShellProps {
  children: ReactNode;
}

/** Fired by the Ctrl+S shortcut; pages that can save (Customizer) listen for it. */
export const SAVE_EVENT = 'ui-explorer:save';

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { resolvedCssVars, renderedStyle, isCompareActive, setIsCompareActive, settings, setStyle, addCustomStyle } = useStyle();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isAnatomyOpen, setIsAnatomyOpen] = useState(false);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isContribOpen, setIsContribOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);

  // Shared style links: ?style=<id> or ?style=j.<encoded definition>.
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

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setIsSidebarOpen(false); }, [location.pathname]);

  const toggleCompare = useCallback(() => setIsCompareActive(!isCompareActive), [isCompareActive, setIsCompareActive]);

  useKeyboardShortcut({ key: 'k', ctrlKey: true }, () => setIsCmdPaletteOpen(true));
  useKeyboardShortcut({ key: 'e', ctrlKey: true }, () => navigate('/customizer'));
  useKeyboardShortcut({ key: 'c', ctrlKey: true, shiftKey: true }, toggleCompare, [toggleCompare]);
  useKeyboardShortcut({ key: 'a', ctrlKey: true, shiftKey: true }, () => setIsAnatomyOpen((v) => !v));
  useKeyboardShortcut({ key: 'e', ctrlKey: true, shiftKey: true }, () => setIsExportOpen(true));
  useKeyboardShortcut({ key: 's', ctrlKey: true }, () => window.dispatchEvent(new CustomEvent(SAVE_EVENT)));
  useKeyboardShortcut({ key: 'x', ctrlKey: true, shiftKey: true }, () => setIsInspecting((v) => !v));
  useKeyboardShortcut({ key: 'd', ctrlKey: true, shiftKey: true }, () => setIsDiffOpen(true));

  // "?" opens the shortcut reference unless the user is typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      e.preventDefault();
      setIsShortcutsOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Escape closes the topmost overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isCmdPaletteOpen) setIsCmdPaletteOpen(false);
      else if (isDiffOpen) setIsDiffOpen(false);
      else if (isShortcutsOpen) setIsShortcutsOpen(false);
      else if (isExportOpen) setIsExportOpen(false);
      else if (isMixerOpen) setIsMixerOpen(false);
      else if (isContribOpen) setIsContribOpen(false);
      else if (isSidebarOpen) setIsSidebarOpen(false);
      else if (isAnatomyOpen) setIsAnatomyOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCmdPaletteOpen, isShortcutsOpen, isExportOpen, isMixerOpen, isContribOpen, isSidebarOpen, isAnatomyOpen, isDiffOpen]);

  return (
    <div className="shell-root">
      <Header
        onOpenCommandPalette={() => setIsCmdPaletteOpen(true)}
        onToggleAnatomy={() => setIsAnatomyOpen(!isAnatomyOpen)}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        onToggleInspect={() => setIsInspecting((v) => !v)}
        isSidebarOpen={isSidebarOpen}
        isAnatomyOpen={isAnatomyOpen}
        isInspecting={isInspecting}
      />

      <div className="shell-body">
        {isSidebarOpen && <div className="shell-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />}
        <Sidebar
          isOpen={isSidebarOpen}
          onOpenMixer={() => setIsMixerOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenContribution={() => setIsContribOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenDiff={() => setIsDiffOpen(true)}
        />

        <main className="shell-content" id="main-content">
          {/* Main preview area applies current style resolved CSS variables */}
          {isCompareActive ? (
            <CompareView onOpenDiff={() => setIsDiffOpen(true)} />
          ) : (
            <div className="style-preview-canvas" style={resolvedCssVars as React.CSSProperties} {...getStyleDataAttributes(renderedStyle)} data-experimental={settings.experimental ? '1' : undefined}>
              {children}
            </div>
          )}
        </main>

        {isAnatomyOpen && <AnatomyPanel onClose={() => setIsAnatomyOpen(false)} />}
      </div>

      {isMixerOpen && <StyleMixerModal onClose={() => setIsMixerOpen(false)} />}
      {isExportOpen && <ExportModal onClose={() => setIsExportOpen(false)} />}
      {isContribOpen && <ContributionPackageModal onClose={() => setIsContribOpen(false)} />}
      {isShortcutsOpen && <ShortcutsPanel onClose={() => setIsShortcutsOpen(false)} />}
      {isDiffOpen && <StyleDiffModal onClose={() => setIsDiffOpen(false)} />}
      <TokenInspector active={isInspecting} onClose={() => setIsInspecting(false)} onOpenAnatomy={() => setIsAnatomyOpen(true)} />
      {isCmdPaletteOpen && (
        <CommandPalette
          onClose={() => setIsCmdPaletteOpen(false)}
          actions={{
            openAnatomy: () => setIsAnatomyOpen(true),
            openExport: () => setIsExportOpen(true),
            openMixer: () => setIsMixerOpen(true),
            openShortcuts: () => setIsShortcutsOpen(true),
            openDiff: () => setIsDiffOpen(true),
            toggleInspect: () => setIsInspecting((v) => !v),
            toggleCompare
          }}
        />
      )}
    </div>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AnatomyPanel } from '../../features/anatomy/AnatomyPanel';
import { StyleMixerModal } from '../../features/mixer/StyleMixerModal';
import { ExportModal } from '../../features/export/ExportModal';
import { ContributionPackageModal } from '../../features/export/ContributionPackageModal';
import { CommandPalette } from '../../features/search/CommandPalette';
import { ShortcutsPanel } from '../../features/shortcuts/ShortcutsPanel';
import { CompareView } from '../../features/compare/CompareView';
import { useStyle } from '../../hooks/useStyle';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { getStyleDataAttributes } from '../../engine/styleAttributes';
import './AppShell.css';

export interface AppShellProps {
  children: ReactNode;
}

/** Fired by the Ctrl+S shortcut; pages that can save (Customizer) listen for it. */
export const SAVE_EVENT = 'ui-explorer:save';

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { resolvedCssVars, renderedStyle, isCompareActive, setIsCompareActive, settings } = useStyle();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAnatomyOpen, setIsAnatomyOpen] = useState(false);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isContribOpen, setIsContribOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setIsSidebarOpen(false); }, [location.pathname]);

  const toggleCompare = useCallback(() => setIsCompareActive(!isCompareActive), [isCompareActive, setIsCompareActive]);

  useKeyboardShortcut({ key: 'k', ctrlKey: true }, () => setIsCmdPaletteOpen(true));
  useKeyboardShortcut({ key: 'e', ctrlKey: true }, () => navigate('/customizer'));
  useKeyboardShortcut({ key: 'c', ctrlKey: true, shiftKey: true }, toggleCompare, [toggleCompare]);
  useKeyboardShortcut({ key: 'a', ctrlKey: true, shiftKey: true }, () => setIsAnatomyOpen((v) => !v));
  useKeyboardShortcut({ key: 'e', ctrlKey: true, shiftKey: true }, () => setIsExportOpen(true));
  useKeyboardShortcut({ key: 's', ctrlKey: true }, () => window.dispatchEvent(new CustomEvent(SAVE_EVENT)));

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
      else if (isShortcutsOpen) setIsShortcutsOpen(false);
      else if (isExportOpen) setIsExportOpen(false);
      else if (isMixerOpen) setIsMixerOpen(false);
      else if (isContribOpen) setIsContribOpen(false);
      else if (isSidebarOpen) setIsSidebarOpen(false);
      else if (isAnatomyOpen) setIsAnatomyOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCmdPaletteOpen, isShortcutsOpen, isExportOpen, isMixerOpen, isContribOpen, isSidebarOpen, isAnatomyOpen]);

  return (
    <div className="shell-root">
      <Header
        onOpenCommandPalette={() => setIsCmdPaletteOpen(true)}
        onToggleAnatomy={() => setIsAnatomyOpen(!isAnatomyOpen)}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
        isSidebarOpen={isSidebarOpen}
        isAnatomyOpen={isAnatomyOpen}
      />

      <div className="shell-body">
        {isSidebarOpen && <div className="shell-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />}
        <Sidebar
          isOpen={isSidebarOpen}
          onOpenMixer={() => setIsMixerOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenContribution={() => setIsContribOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        <main className="shell-content" id="main-content">
          {/* Main preview area applies current style resolved CSS variables */}
          {isCompareActive ? (
            <CompareView />
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
      {isCmdPaletteOpen && (
        <CommandPalette
          onClose={() => setIsCmdPaletteOpen(false)}
          actions={{
            openAnatomy: () => setIsAnatomyOpen(true),
            openExport: () => setIsExportOpen(true),
            openMixer: () => setIsMixerOpen(true),
            openShortcuts: () => setIsShortcutsOpen(true),
            toggleCompare
          }}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AnatomyPanel } from '../../features/anatomy/AnatomyPanel';
import { StyleMixerModal } from '../../features/mixer/StyleMixerModal';
import { ExportModal } from '../../features/export/ExportModal';
import { ContributionPackageModal } from '../../features/export/ContributionPackageModal';
import { CommandPalette } from '../../features/search/CommandPalette';
import { CompareView } from '../../features/compare/CompareView';
import { useStyle } from '../../hooks/useStyle';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import './AppShell.css';

export interface AppShellProps {
  children: ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { resolvedCssVars, isCompareActive } = useStyle();
  const [isAnatomyOpen, setIsAnatomyOpen] = useState(false);
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isContribOpen, setIsContribOpen] = useState(false);
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for search palette
  useKeyboardShortcut({ key: 'k', ctrlKey: true }, () => setIsCmdPaletteOpen(true));

  return (
    <div className="shell-root">
      <Header
        onOpenCommandPalette={() => setIsCmdPaletteOpen(true)}
        onToggleAnatomy={() => setIsAnatomyOpen(!isAnatomyOpen)}
      />

      <div className="shell-body">
        <Sidebar
          onOpenMixer={() => setIsMixerOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenContribution={() => setIsContribOpen(true)}
        />

        <main className="shell-content">
          {/* Main preview area applies current style resolved CSS variables */}
          {isCompareActive ? (
            <CompareView />
          ) : (
            <div className="style-preview-canvas" style={resolvedCssVars as React.CSSProperties}>
              {children}
            </div>
          )}
        </main>

        {isAnatomyOpen && <AnatomyPanel onClose={() => setIsAnatomyOpen(false)} />}
      </div>

      {isMixerOpen && <StyleMixerModal onClose={() => setIsMixerOpen(false)} />}
      {isExportOpen && <ExportModal onClose={() => setIsExportOpen(false)} />}
      {isContribOpen && <ContributionPackageModal onClose={() => setIsContribOpen(false)} />}
      {isCmdPaletteOpen && <CommandPalette onClose={() => setIsCmdPaletteOpen(false)} />}
    </div>
  );
};

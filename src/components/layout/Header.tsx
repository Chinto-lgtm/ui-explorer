import React from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { Columns3, Search, Menu, X, Crosshair, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { BrandLockup } from './BrandMark';
import { StylePicker } from './StylePicker';
import { contrastRatio } from '../../engine/color';
import { useStyle } from '../../hooks/useStyle';
import { COMPARE_PARAM, PAGES, supportsCompare } from '../../config/routes';
import { useTools } from './tools';
import './AppShell.css';

export interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentStyle, isTweaked } = useStyle();
  const { activeTool, openTool, toggleTool, isInspecting, toggleCompare } = useTools();
  const { pathname, search } = useLocation();
  const page = PAGES.find((p) => matchPath({ path: p.path, end: false }, pathname));
  const isCompareActive = new URLSearchParams(search).has(COMPARE_PARAM);
  const isTweaksOpen = activeTool === 'tweaks';

  // Experimental styles may fail WCAG on purpose; the problem is surfaced, not corrected.
  const textContrast = contrastRatio(currentStyle.tokens.colors.textPrimary, currentStyle.tokens.colors.bg);
  const lowContrast = textContrast !== null && textContrast < 4.5 ? textContrast : null;

  return (
    <header className="shell-header">
      <div className="shell-header__brand">
        <button
          type="button"
          className="shell-menu-btn"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isSidebarOpen}
          aria-controls="shell-sidebar"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/" className="shell-header__logo" aria-label="UI Explorer home">
          <BrandLockup size={28} className="shell-header__lockup" />
        </Link>
        {page && (
          <span className="shell-crumb">
            <span className="shell-crumb__sep" aria-hidden="true">/</span>
            <page.icon size={15} aria-hidden="true" />
            <span className="shell-crumb__label">{page.label}</span>
          </span>
        )}
      </div>

      <div className="shell-header__center">
        <button className="shell-search-btn" onClick={() => openTool('search')} aria-label="Search styles, components and commands">
          <Search size={16} />
          <span className="shell-search-btn__text">Search styles, pages, tools…</span>
          <kbd>Ctrl K</kbd>
        </button>
      </div>

      <div className="shell-header__actions">
        <button type="button" className="shell-icon-btn shell-icon-btn--mobile-only" onClick={() => openTool('search')} aria-label="Search">
          <Search size={18} />
        </button>

        <StylePicker />

        {lowContrast !== null && (
          <button
            type="button"
            className="shell-contrast-warning"
            onClick={() => toggleTool('anatomy')}
            title={`Low text contrast: ${lowContrast.toFixed(1)}:1 (WCAG AA needs 4.5:1). Open Style Anatomy for details.`}
            aria-label={`Accessibility warning: text contrast ${lowContrast.toFixed(1)} to 1. Open Style Anatomy.`}
          >
            <AlertTriangle size={14} /> <span>{lowContrast.toFixed(1)}:1</span>
          </button>
        )}

        <span className="shell-header__divider" aria-hidden="true" />

        <button
          type="button"
          className={`shell-btn ${isTweaksOpen ? 'shell-btn--active' : ''}`}
          onClick={() => toggleTool('tweaks')}
          title="Tweaks: radius, spacing, shadows, accent and motion (Ctrl+.)"
          aria-pressed={isTweaksOpen}
        >
          <SlidersHorizontal size={17} />
          <span>Tweaks</span>
          {isTweaked && <span className="shell-btn__dot" aria-label="(tweaked)" />}
        </button>

        <button
          type="button"
          className={`shell-btn ${isCompareActive ? 'shell-btn--active' : ''}`}
          onClick={toggleCompare}
          title={supportsCompare(pathname) ? 'Compare three styles side by side (Ctrl+Shift+C)' : 'Open a template in compare (Ctrl+Shift+C)'}
          aria-pressed={isCompareActive}
        >
          <Columns3 size={17} />
          <span>Compare</span>
        </button>

        <button
          type="button"
          className={`shell-btn ${isInspecting ? 'shell-btn--active' : ''}`}
          onClick={() => openTool('inspect')}
          title="Token Inspector: hover anything to see its tokens (Ctrl+Shift+X)"
          aria-pressed={isInspecting}
        >
          <Crosshair size={17} />
          <span>Inspect</span>
        </button>
      </div>
    </header>
  );
};

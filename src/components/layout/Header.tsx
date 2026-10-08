import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Columns, Search, Sliders, Menu, X, Star, Crosshair, AlertTriangle } from 'lucide-react';
import { BrandLockup } from './BrandMark';
import { contrastRatio } from '../../engine/color';
import { useStyle } from '../../hooks/useStyle';
import { APP_VERSION } from '../../config/app';
import { COMPARE_PARAM } from '../../config/routes';
import { useTools } from './tools';
import './AppShell.css';

export interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { currentStyle, setStyle, availableStyles, favoriteIds, toggleFavorite } = useStyle();
  const { activeTool, openTool, toggleTool, isInspecting, toggleCompare } = useTools();
  const { search } = useLocation();
  const isCompareActive = new URLSearchParams(search).has(COMPARE_PARAM);
  const isAnatomyOpen = activeTool === 'anatomy';
  const onOpenCommandPalette = () => openTool('search');
  const onToggleAnatomy = () => toggleTool('anatomy');
  const onToggleInspect = () => openTool('inspect');

  const favorites = availableStyles.filter((s) => favoriteIds.includes(s.metadata.id));
  const others = availableStyles.filter((s) => !favoriteIds.includes(s.metadata.id));
  const isFav = favoriteIds.includes(currentStyle.metadata.id);
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
        <span className="shell-header__badge">v{APP_VERSION}</span>
      </div>

      <div className="shell-header__center">
        <button className="shell-search-btn" onClick={onOpenCommandPalette} aria-label="Search styles, components and commands">
          <Search size={16} />
          <span className="shell-search-btn__text">Search styles, components...</span>
          <kbd>Ctrl+K</kbd>
        </button>
      </div>

      <div className="shell-header__actions">
        <button
          type="button"
          className="shell-icon-btn shell-icon-btn--mobile-only"
          onClick={onOpenCommandPalette}
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        {/* Style Selector */}
        <div className="shell-style-selector">
          <label htmlFor="style-select" className="shell-style-label">Style:</label>
          <select
            id="style-select"
            value={currentStyle.metadata.id}
            onChange={(e) => setStyle(e.target.value)}
            className="shell-select"
            aria-label="Active style"
          >
            {favorites.length > 0 && (
              <optgroup label="Favorites">
                {favorites.map((s) => (
                  <option key={s.metadata.id} value={s.metadata.id}>
                    {s.metadata.name} ({s.metadata.category})
                  </option>
                ))}
              </optgroup>
            )}
            {others.map((s) => (
              <option key={s.metadata.id} value={s.metadata.id}>
                {s.metadata.name} ({s.metadata.category})
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`shell-icon-btn ${isFav ? 'shell-icon-btn--active' : ''}`}
            onClick={() => toggleFavorite(currentStyle.metadata.id)}
            aria-pressed={isFav}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star size={16} fill={isFav ? 'currentColor' : 'none'} />
          </button>
          {lowContrast !== null && (
            <button
              type="button"
              className="shell-contrast-warning"
              onClick={onToggleAnatomy}
              title={`Low text contrast: ${lowContrast.toFixed(1)}:1 (WCAG AA needs 4.5:1). Open Style Anatomy for details.`}
              aria-label={`Accessibility warning: text contrast ${lowContrast.toFixed(1)} to 1. Open Style Anatomy.`}
            >
              <AlertTriangle size={14} /> {lowContrast.toFixed(1)}:1
            </button>
          )}
        </div>

        {/* Compare Toggle */}
        <button
          className={`shell-btn ${isCompareActive ? 'shell-btn--active' : ''}`}
          onClick={toggleCompare}
          title="Compare Mode (Ctrl+Shift+C)"
          aria-pressed={isCompareActive}
        >
          <Columns size={18} />
          <span>Compare</span>
        </button>

        {/* Inspect mode */}
        <button
          className={`shell-btn ${isInspecting ? 'shell-btn--active' : ''}`}
          onClick={onToggleInspect}
          title="Token Inspector (Ctrl+Shift+X)"
          aria-pressed={isInspecting}
        >
          <Crosshair size={18} />
          <span>Inspect</span>
        </button>

        {/* Anatomy Toggle */}
        <button
          className={`shell-btn ${isAnatomyOpen ? 'shell-btn--active' : ''}`}
          onClick={onToggleAnatomy}
          title="Style Anatomy Inspector (Ctrl+Shift+A)"
          aria-pressed={isAnatomyOpen}
        >
          <Sliders size={18} />
          <span>Anatomy</span>
        </button>
      </div>
    </header>
  );
};

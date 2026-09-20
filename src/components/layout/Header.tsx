import React from 'react';
import { Columns, Sparkles, Search, Sliders, Menu, X, Star } from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { APP_VERSION } from '../../config/app';
import './AppShell.css';

export interface HeaderProps {
  onOpenCommandPalette: () => void;
  onToggleAnatomy: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isAnatomyOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette, onToggleAnatomy, onToggleSidebar, isSidebarOpen, isAnatomyOpen }) => {
  const { currentStyle, setStyle, availableStyles, isCompareActive, setIsCompareActive, favoriteIds, toggleFavorite } = useStyle();

  const favorites = availableStyles.filter((s) => favoriteIds.includes(s.metadata.id));
  const others = availableStyles.filter((s) => !favoriteIds.includes(s.metadata.id));
  const isFav = favoriteIds.includes(currentStyle.metadata.id);

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
        <div className="shell-header__logo">
          <Sparkles className="shell-header__logo-icon" size={20} />
          <span className="shell-header__title">UI Explorer</span>
        </div>
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
        </div>

        {/* Compare Toggle */}
        <button
          className={`shell-btn ${isCompareActive ? 'shell-btn--active' : ''}`}
          onClick={() => setIsCompareActive(!isCompareActive)}
          title="Compare Mode (Ctrl+Shift+C)"
          aria-pressed={isCompareActive}
        >
          <Columns size={18} />
          <span>Compare</span>
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

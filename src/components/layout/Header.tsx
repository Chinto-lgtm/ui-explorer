import React from 'react';
import { Columns, Sparkles, Search, Sliders } from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import './AppShell.css';

export interface HeaderProps {
  onOpenCommandPalette: () => void;
  onToggleAnatomy: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandPalette, onToggleAnatomy }) => {
  const { currentStyle, setStyle, availableStyles, isCompareActive, setIsCompareActive } = useStyle();

  return (
    <header className="shell-header">
      <div className="shell-header__brand">
        <div className="shell-header__logo">
          <Sparkles className="shell-header__logo-icon" size={20} />
          <span className="shell-header__title">UI Explorer</span>
        </div>
        <span className="shell-header__badge">v0.1.0</span>
      </div>

      <div className="shell-header__center">
        <button className="shell-search-btn" onClick={onOpenCommandPalette}>
          <Search size={16} />
          <span>Search styles, components...</span>
          <kbd>Ctrl+K</kbd>
        </button>
      </div>

      <div className="shell-header__actions">
        {/* Style Selector */}
        <div className="shell-style-selector">
          <label htmlFor="style-select" className="shell-style-label">Style:</label>
          <select
            id="style-select"
            value={currentStyle.metadata.id}
            onChange={(e) => setStyle(e.target.value)}
            className="shell-select"
          >
            {availableStyles.map((s) => (
              <option key={s.metadata.id} value={s.metadata.id}>
                {s.metadata.name} ({s.metadata.category})
              </option>
            ))}
          </select>
        </div>

        {/* Compare Toggle */}
        <button
          className={`shell-btn ${isCompareActive ? 'shell-btn--active' : ''}`}
          onClick={() => setIsCompareActive(!isCompareActive)}
          title="Compare Mode"
        >
          <Columns size={18} />
          <span>Compare</span>
        </button>

        {/* Anatomy Toggle */}
        <button className="shell-btn" onClick={onToggleAnatomy} title="Style Anatomy Inspector">
          <Sliders size={18} />
          <span>Anatomy</span>
        </button>
      </div>
    </header>
  );
};

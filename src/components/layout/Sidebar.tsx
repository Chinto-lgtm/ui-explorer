import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Component, Database, Sliders, Wand2, Shuffle, Download,
  GitPullRequest, Info, Keyboard, Star, GitCompareArrows, Palette, BookOpen
} from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { DOCS_URL } from '../../config/app';
import './AppShell.css';

export interface SidebarProps {
  isOpen: boolean;
  onOpenMixer: () => void;
  onOpenExport: () => void;
  onOpenContribution?: () => void;
  onOpenShortcuts: () => void;
  onOpenDiff: () => void;
}

const PAGES = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/styles', label: 'Styles', icon: <Palette size={18} /> },
  { to: '/generator', label: 'Style Generator', icon: <Wand2 size={18} /> },
  { to: '/components', label: 'Components Lab', icon: <Component size={18} /> },
  { to: '/data', label: 'Labs', icon: <Database size={18} /> },
  { to: '/customizer', label: 'Style Customizer', icon: <Sliders size={18} /> }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onOpenMixer, onOpenExport, onOpenContribution, onOpenShortcuts, onOpenDiff }) => {
  const { availableStyles, favoriteIds, setStyle, currentStyle } = useStyle();
  const favorites = availableStyles.filter((s) => favoriteIds.includes(s.metadata.id));

  return (
    <aside className={`shell-sidebar ${isOpen ? 'shell-sidebar--open' : ''}`} id="shell-sidebar" aria-label="Main navigation">
      <nav className="shell-nav">
        <div className="shell-nav__section">
          <span className="shell-nav__heading">Pages</span>
          {PAGES.map((p) => (
            <NavLink
              key={p.to}
              to={p.to}
              end={p.to === '/'}
              className={({ isActive }) => `shell-nav__link ${isActive ? 'shell-nav__link--active' : ''}`}
            >
              {p.icon}
              <span>{p.label}</span>
            </NavLink>
          ))}
        </div>

        {favorites.length > 0 && (
          <div className="shell-nav__section">
            <span className="shell-nav__heading">Favorites</span>
            {favorites.map((s) => (
              <button
                key={s.metadata.id}
                type="button"
                className={`shell-nav__action ${currentStyle.metadata.id === s.metadata.id ? 'shell-nav__link--active' : ''}`}
                onClick={() => setStyle(s.metadata.id)}
              >
                <Star size={16} />
                <span className="shell-nav__truncate">{s.metadata.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="shell-nav__section">
          <span className="shell-nav__heading">Tools & Open Source</span>
          <button className="shell-nav__action" onClick={onOpenMixer}>
            <Shuffle size={18} />
            <span>Style Mixer</span>
          </button>
          <button className="shell-nav__action" onClick={onOpenDiff}>
            <GitCompareArrows size={18} />
            <span>Style Diff</span>
          </button>
          <button className="shell-nav__action" onClick={onOpenExport}>
            <Download size={18} />
            <span>Export & Import</span>
          </button>
          {onOpenContribution && (
            <button className="shell-nav__action" onClick={onOpenContribution}>
              <GitPullRequest size={18} />
              <span>Contribute Package</span>
            </button>
          )}
          <button className="shell-nav__action" onClick={onOpenShortcuts}>
            <Keyboard size={18} />
            <span>Keyboard Shortcuts</span>
          </button>
          <a className="shell-nav__link" href={DOCS_URL} target="_blank" rel="noreferrer">
            <BookOpen size={18} />
            <span>Documentation</span>
          </a>
          <NavLink
            to="/welcome"
            className={({ isActive }) => `shell-nav__link ${isActive ? 'shell-nav__link--active' : ''}`}
          >
            <Info size={18} />
            <span>About UI Explorer</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

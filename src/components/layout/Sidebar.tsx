import React from 'react';
import { NavLink } from 'react-router-dom';
import { Star, BookOpen, Home } from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { DOCS_URL } from '../../config/app';
import { PAGES, TOOLS } from '../../config/routes';
import { useTools } from './tools';
import './AppShell.css';

export interface SidebarProps {
  isOpen: boolean;
}

const GROUPS = ['Explore', 'Create'] as const;
/** Tools that open from the sidebar; Inspect, Anatomy and Search live in the header. */
const SIDEBAR_TOOLS = TOOLS.filter((t) => ['tweaks', 'mixer', 'diff', 'export', 'contribute', 'shortcuts'].includes(t.id));

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { availableStyles, favoriteIds, setStyle, currentStyle } = useStyle();
  const { activeTool, toggleTool } = useTools();
  const favorites = availableStyles.filter((s) => favoriteIds.includes(s.metadata.id));

  return (
    <aside className={`shell-sidebar ${isOpen ? 'shell-sidebar--open' : ''}`} id="shell-sidebar" aria-label="Main navigation">
      <nav className="shell-nav">
        {GROUPS.map((group) => (
          <div key={group} className="shell-nav__section">
            <span className="shell-nav__heading">{group}</span>
            {PAGES.filter((p) => p.group === group).map((p) => (
              <NavLink key={p.id} to={p.path} title={p.description} className={({ isActive }) => `shell-nav__link ${isActive ? 'shell-nav__link--active' : ''}`}>
                <p.icon size={18} />
                <span>{p.label}</span>
              </NavLink>
            ))}
          </div>
        ))}

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
          <span className="shell-nav__heading">Tools</span>
          {SIDEBAR_TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`shell-nav__action ${activeTool === t.id ? 'shell-nav__link--active' : ''}`}
              aria-pressed={activeTool === t.id}
              title={t.shortcut ? `${t.description} (${t.shortcut})` : t.description}
              onClick={() => toggleTool(t.id)}
            >
              <t.icon size={18} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="shell-nav__section">
          <span className="shell-nav__heading">Project</span>
          <a className="shell-nav__link" href={DOCS_URL} target="_blank" rel="noreferrer">
            <BookOpen size={18} />
            <span>Documentation</span>
          </a>
          <NavLink to="/" end className="shell-nav__link">
            <Home size={18} />
            <span>About UI Explorer</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

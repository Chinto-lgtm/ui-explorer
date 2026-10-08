import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { SPRING_SNAPPY } from '../../motion/presets';
import { BookOpen, Home, Star, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { DOCS_URL, GITHUB_REPO_URL, APP_VERSION } from '../../config/app';
import { PAGES, TOOLS } from '../../config/routes';
import { useTools } from './tools';
import { StyleDots } from './StylePicker';
import './AppShell.css';

export interface SidebarProps {
  /** Drawer state on narrow screens. */
  isOpen: boolean;
  /** Icon-only rail on wide screens. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const GROUPS = ['Explore', 'Create'] as const;

/** The highlight behind the active item; it glides from item to item (one per group of items). */
const Indicator: React.FC<{ id: string }> = ({ id }) => (
  <motion.span layoutId={id} className="shell-nav__indicator" transition={SPRING_SNAPPY} aria-hidden="true" />
);
/** Every tool except Search, which lives in the header. */
const RAIL_TOOLS = TOOLS.filter((t) => t.id !== 'search');

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, collapsed, onToggleCollapsed }) => {
  const { availableStyles, favoriteIds, setStyle, currentStyle } = useStyle();
  const { activeTool, toggleTool, isInspecting } = useTools();
  const favorites = availableStyles.filter((s) => favoriteIds.includes(s.metadata.id));
  const toolActive = (id: string) => (id === 'inspect' ? isInspecting : activeTool === id);

  return (
    <aside
      className={`shell-sidebar ${isOpen ? 'shell-sidebar--open' : ''} ${collapsed ? 'shell-sidebar--collapsed' : ''}`}
      id="shell-sidebar"
      aria-label="Main navigation"
    >
      <nav className="shell-nav">
        {GROUPS.map((group) => (
          <div key={group} className="shell-nav__section">
            <span className="shell-nav__heading">{group}</span>
            {PAGES.filter((p) => p.group === group).map((p) => (
              <NavLink
                key={p.id}
                to={p.path}
                title={collapsed ? `${p.label}: ${p.description}` : p.description}
                className={({ isActive }) => `shell-nav__link ${isActive ? 'shell-nav__link--active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <Indicator id="rail-page" />}
                    <p.icon size={18} className="shell-nav__icon" />
                    <span className="shell-nav__label">{p.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="shell-nav__section">
          <span className="shell-nav__heading">Tools</span>
          {RAIL_TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`shell-nav__action ${toolActive(t.id) ? 'shell-nav__link--active' : ''}`}
              aria-pressed={toolActive(t.id)}
              title={t.shortcut ? `${t.label}: ${t.description} (${t.shortcut})` : `${t.label}: ${t.description}`}
              onClick={() => toggleTool(t.id)}
            >
              {toolActive(t.id) && t.id !== 'inspect' && <Indicator id="rail-tool" />}
              <t.icon size={18} className="shell-nav__icon" />
              <span className="shell-nav__label">{t.label}</span>
              {t.shortcut && <kbd className="shell-nav__kbd">{t.shortcut.replace('Ctrl+', '⌃').replace('Shift+', '⇧')}</kbd>}
            </button>
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
                title={s.metadata.name}
              >
                <StyleDots style={s} />
                <span className="shell-nav__label shell-nav__truncate">{s.metadata.name}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="shell-sidebar__foot">
        <a className="shell-nav__link" href={DOCS_URL} target="_blank" rel="noreferrer" title="Documentation">
          <BookOpen size={18} className="shell-nav__icon" />
          <span className="shell-nav__label">Documentation</span>
        </a>
        <a className="shell-nav__link" href={GITHUB_REPO_URL} target="_blank" rel="noreferrer" title="Free and open source: star it on GitHub">
          <Star size={18} className="shell-nav__icon" />
          <span className="shell-nav__label">Star on GitHub</span>
        </a>
        <NavLink to="/" end className="shell-nav__link" title="About UI Explorer">
          <Home size={18} className="shell-nav__icon" />
          <span className="shell-nav__label">About <span className="shell-nav__version">v{APP_VERSION}</span></span>
        </NavLink>
        <button
          type="button"
          className="shell-nav__action shell-sidebar__collapse"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={18} className="shell-nav__icon" /> : <PanelLeftClose size={18} className="shell-nav__icon" />}
          <span className="shell-nav__label">Collapse</span>
        </button>
      </div>
    </aside>
  );
};

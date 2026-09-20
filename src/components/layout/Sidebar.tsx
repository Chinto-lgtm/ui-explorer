import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Component, Database, Sliders, Wand2, Shuffle, Download, GitPullRequest } from 'lucide-react';
import './AppShell.css';

export interface SidebarProps {
  onOpenMixer: () => void;
  onOpenExport: () => void;
  onOpenContribution?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenMixer, onOpenExport, onOpenContribution }) => {
  return (
    <aside className="shell-sidebar">
      <nav className="shell-nav">
        <div className="shell-nav__section">
          <span className="shell-nav__heading">Pages</span>
          <NavLink
            to="/"
            className={({ isActive }) => `shell-nav__link ${isActive ? 'shell-nav__link--active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/generator"
            className={({ isActive }) => `shell-nav__link ${isActive ? 'shell-nav__link--active' : ''}`}
          >
            <Wand2 size={18} />
            <span>Style Generator</span>
          </NavLink>

          <NavLink
            to="/components"
            className={({ isActive }) => `shell-nav__link ${isActive ? 'shell-nav__link--active' : ''}`}
          >
            <Component size={18} />
            <span>Components Lab</span>
          </NavLink>

          <NavLink
            to="/data"
            className={({ isActive }) => `shell-nav__link ${isActive ? 'shell-nav__link--active' : ''}`}
          >
            <Database size={18} />
            <span>Data & Interaction</span>
          </NavLink>

          <NavLink
            to="/customizer"
            className={({ isActive }) => `shell-nav__link ${isActive ? 'shell-nav__link--active' : ''}`}
          >
            <Sliders size={18} />
            <span>Style Customizer</span>
          </NavLink>
        </div>

        <div className="shell-nav__section">
          <span className="shell-nav__heading">Tools & Open Source</span>
          <button className="shell-nav__action" onClick={onOpenMixer}>
            <Shuffle size={18} />
            <span>Style Mixer</span>
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
        </div>
      </nav>
    </aside>
  );
};

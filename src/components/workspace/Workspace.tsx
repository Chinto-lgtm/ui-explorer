import React, { useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { SPRING_SNAPPY } from '../../motion/presets';
import { SectionRouteContext, sectionSlug } from './sectionRoute';
import { NARROW_QUERY, PANEL_STORAGE_KEY, WorkspaceLayoutContext, useMediaQuery, useWorkspaceLayout } from './layout';
import '../layout/Workspace.css';

const readCollapsed = () => { try { return localStorage.getItem(PANEL_STORAGE_KEY) === '1'; } catch { return false; } };

/**
 * The one page layout of the app: a settings panel on the left and a preview
 * stage on the right. The panel can be hidden on wide screens (remembered
 * across pages) and becomes a drawer on narrow ones.
 */
export const Workspace: React.FC<{ className?: string; children: ReactNode }> = ({ className = '', children }) => {
  const narrow = useMediaQuery(NARROW_QUERY);
  const panelId = useId();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const panelOpen = narrow ? drawerOpen : !collapsed;

  const setPanelOpen = useCallback((open: boolean) => {
    if (narrow) { setDrawerOpen(open); return; }
    setCollapsed(!open);
    try { localStorage.setItem(PANEL_STORAGE_KEY, open ? '0' : '1'); } catch { /* storage unavailable */ }
  }, [narrow]);

  // The drawer closes on Escape without closing anything else.
  useEffect(() => {
    if (!narrow || !drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopImmediatePropagation(); setDrawerOpen(false); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [narrow, drawerOpen]);

  const value = useMemo(() => ({ panelOpen, setPanelOpen, narrow, panelId }), [panelOpen, setPanelOpen, narrow, panelId]);
  return (
    <WorkspaceLayoutContext.Provider value={value}>
      <div className={`ws-workspace ${panelOpen ? '' : 'ws-workspace--panel-hidden'} ${narrow ? 'ws-workspace--narrow' : ''} ${className}`}>
        {narrow && drawerOpen && <div className="ws-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}
        {children}
      </div>
    </WorkspaceLayoutContext.Provider>
  );
};

/** The left panel: page title, a scrolling body of sections, and an optional pinned footer. */
export const WorkspacePanel: React.FC<{
  title: ReactNode;
  subtitle?: ReactNode;
  label: string;
  /** Small buttons next to the title (undo, redo). */
  headerActions?: ReactNode;
  /** Pinned below the scrolling body (primary actions). */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}> = ({ title, subtitle, label, headerActions, footer, className = '', children }) => {
  const { panelOpen, setPanelOpen, narrow, panelId } = useWorkspaceLayout();
  return (
    <aside id={panelId} className={`ws-settings ${className}`} aria-label={label} hidden={!panelOpen && !narrow ? true : undefined} data-open={panelOpen ? '' : undefined}>
      <div className="ws-settings__header">
        <div className="ws-settings__titles">
          <h1 className="ws-title">{title}</h1>
          {subtitle && <p className="ws-subtitle">{subtitle}</p>}
        </div>
        {headerActions && <div className="ws-settings__actions">{headerActions}</div>}
        <button type="button" className="ws-icon-btn" onClick={() => setPanelOpen(false)} aria-label={narrow ? 'Close panel' : 'Hide panel'} title={narrow ? 'Close panel' : 'Hide panel'}>
          {narrow ? <X size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
      <div className="ws-settings__scroll">{children}</div>
      {footer && <div className="ws-settings__footer">{footer}</div>}
    </aside>
  );
};

/** The stage: a bar (panel toggle, status, actions) above the page's own preview body. */
export const WorkspaceStage: React.FC<{
  label: string;
  /** Live status line with the green dot. */
  status?: ReactNode;
  /** Custom content for the left of the bar, in place of the status line. */
  start?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}> = ({ label, status, start, actions, className = '', children }) => {
  const { panelOpen, setPanelOpen, narrow, panelId } = useWorkspaceLayout();
  return (
    <section className={`ws-stage ${className}`} aria-label={label}>
      <header className="ws-stage__bar">
        {(!panelOpen || narrow) && (
          <button type="button" className="ws-icon-btn ws-stage__panel-btn" onClick={() => setPanelOpen(!panelOpen)} aria-expanded={panelOpen} aria-controls={panelId} aria-label="Show panel" title="Show panel">
            <PanelLeftOpen size={16} />
          </button>
        )}
        {start ?? (status !== undefined && (
          <div className="ws-stage__status" aria-live="polite">
            <span className="ws-stage__dot" aria-hidden="true" />
            <span className="ws-stage__status-text">{status}</span>
          </div>
        ))}
        {actions && <div className="ws-stage__actions">{actions}</div>}
      </header>
      {children}
    </section>
  );
};

/** Search field used at the top of a panel. */
export const WorkspaceSearch: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string; label: string }> = ({ value, onChange, placeholder, label }) => (
  <div className="ws-search">
    <Search size={14} className="ws-search__icon" aria-hidden="true" />
    <input type="search" className="ws-search__input" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
    {value && <button type="button" className="ws-search__clear" onClick={() => onChange('')} aria-label="Clear search"><X size={12} /></button>}
  </div>
);

/** Collapsible settings group. Native <details> keeps keyboard and screen-reader behaviour. */
export const WorkspaceSection: React.FC<{ title: string; icon: ReactNode; defaultOpen?: boolean; children: ReactNode }> = ({
  title, icon, defaultOpen = true, children
}) => {
  const route = useContext(SectionRouteContext);
  const slug = sectionSlug(title);
  const isActive = route?.active === slug;
  const ref = useRef<HTMLDetailsElement>(null);
  // A section named in the URL scrolls into view once, when the page opens on it.
  useEffect(() => { if (isActive) ref.current?.scrollIntoView?.({ block: 'start' }); }, [isActive]);
  return (
    <details
      ref={ref}
      className="ws-section"
      id={route ? `section-${slug}` : undefined}
      open={route?.active ? isActive : defaultOpen}
      onToggle={(e) => { if (route && (e.currentTarget as HTMLDetailsElement).open && !isActive) route.onOpen(slug); }}
    >
      <summary className="ws-section__summary">
        <span className="ws-section__icon">{icon}</span>
        <span className="ws-section__title">{title}</span>
        <ChevronDown size={14} className="ws-section__chevron" aria-hidden="true" />
      </summary>
      <div className="ws-section__body">{children}</div>
    </details>
  );
};

/** Native checkbox visually rendered as a switch. */
export const WorkspaceSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: ReactNode; disabled?: boolean }> = ({
  checked, onChange, label, disabled
}) => (
  <label className="ws-switch">
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    <span className="ws-switch__track" aria-hidden="true"><span className="ws-switch__thumb" /></span>
    <span className="ws-switch__text">{label}</span>
  </label>
);

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  title?: string;
}

/** Exclusive choice rendered as a segmented control with aria-pressed buttons. */
export function WorkspaceSegmented<T extends string>({ value, options, onChange, label, columns }: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (v: T) => void;
  label: string;
  columns?: number;
}) {
  const pillId = useId();
  return (
    <div className="ws-segmented" role="group" aria-label={label} style={columns ? { gridTemplateColumns: `repeat(${columns}, 1fr)` } : undefined}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`ws-segmented__btn ${value === o.value ? 'ws-segmented__btn--active' : ''}`}
          aria-pressed={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
        >
          {value === o.value && <motion.span layoutId={pillId} className="ws-segmented__pill" transition={SPRING_SNAPPY} aria-hidden="true" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

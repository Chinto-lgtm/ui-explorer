import React, { useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { ChevronRight, ChevronLeft, Check, MoreHorizontal } from 'lucide-react';
import './Navigation.css';

/* ---------------------------------------------------------------- */
/* Tabs                                                               */
/* ---------------------------------------------------------------- */

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
  label: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, value, onChange, variant = 'underline', label, className = '' }) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
    if (!(e.key in keys) && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    let next = index;
    if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    else {
      for (let i = 0; i < tabs.length; i++) {
        next = (next + keys[e.key] + tabs.length) % tabs.length;
        if (!tabs[next].disabled) break;
      }
    }
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div className={`ui-tabs ui-tabs--${variant} ${className}`} role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button
          key={t.id}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          aria-controls={`panel-${t.id}`}
          tabIndex={value === t.id ? 0 : -1}
          disabled={t.disabled}
          className={`ui-tab ${value === t.id ? 'ui-tab--active' : ''}`}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {t.icon && <span className="ui-tab__icon">{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* Breadcrumbs                                                        */
/* ---------------------------------------------------------------- */

export interface Crumb {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

export const Breadcrumbs: React.FC<{ items: Crumb[]; className?: string }> = ({ items, className = '' }) => (
  <nav className={`ui-breadcrumbs ${className}`} aria-label="Breadcrumb">
    <ol className="ui-breadcrumbs__list">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <li key={i} className="ui-breadcrumbs__item">
            {last ? (
              <span className="ui-breadcrumbs__current" aria-current="page">{item.label}</span>
            ) : (
              <a className="ui-breadcrumbs__link" href={item.href ?? '#'} onClick={(e) => { if (item.onClick) { e.preventDefault(); item.onClick(); } else if (!item.href) e.preventDefault(); }}>
                {item.label}
              </a>
            )}
            {!last && <ChevronRight size={14} className="ui-breadcrumbs__sep" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  </nav>
);

/* ---------------------------------------------------------------- */
/* Pagination                                                         */
/* ---------------------------------------------------------------- */

export interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  siblings?: number;
  className?: string;
}

function pageRange(page: number, count: number, siblings: number): (number | 'gap')[] {
  const range: (number | 'gap')[] = [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(count - 1, page + siblings);
  range.push(1);
  if (start > 2) range.push('gap');
  for (let p = start; p <= end; p++) range.push(p);
  if (end < count - 1) range.push('gap');
  if (count > 1) range.push(count);
  return range;
}

export const Pagination: React.FC<PaginationProps> = ({ page, pageCount, onChange, siblings = 1, className = '' }) => (
  <nav className={`ui-pagination ${className}`} aria-label="Pagination">
    <button type="button" className="ui-pagination__btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
      <ChevronLeft size={16} />
    </button>
    {pageRange(page, pageCount, siblings).map((p, i) =>
      p === 'gap' ? (
        <span key={`gap-${i}`} className="ui-pagination__gap" aria-hidden="true"><MoreHorizontal size={14} /></span>
      ) : (
        <button
          key={p}
          type="button"
          className={`ui-pagination__btn ${p === page ? 'ui-pagination__btn--active' : ''}`}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      )
    )}
    <button type="button" className="ui-pagination__btn" disabled={page >= pageCount} onClick={() => onChange(page + 1)} aria-label="Next page">
      <ChevronRight size={16} />
    </button>
  </nav>
);

/* ---------------------------------------------------------------- */
/* Stepper                                                            */
/* ---------------------------------------------------------------- */

export interface Step {
  label: string;
  description?: string;
}

export const Stepper: React.FC<{ steps: Step[]; current: number; onStepClick?: (i: number) => void; className?: string }> = ({ steps, current, onStepClick, className = '' }) => {
  const id = useId();
  return (
    <ol className={`ui-stepper ${className}`} aria-label="Progress">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={i} className={`ui-stepper__step ui-stepper__step--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <button
              type="button"
              className="ui-stepper__marker"
              onClick={() => onStepClick?.(i)}
              disabled={!onStepClick}
              aria-describedby={`${id}-${i}`}
              aria-label={`Step ${i + 1}: ${s.label}`}
            >
              {state === 'done' ? <Check size={14} strokeWidth={3} /> : i + 1}
            </button>
            <span className="ui-stepper__text" id={`${id}-${i}`}>
              <span className="ui-stepper__label">{s.label}</span>
              {s.description && <span className="ui-stepper__desc">{s.description}</span>}
            </span>
            {i < steps.length - 1 && <span className="ui-stepper__line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
};

/* ---------------------------------------------------------------- */
/* Navbar + SideNav samples                                           */
/* ---------------------------------------------------------------- */

export interface NavItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export const Navbar: React.FC<{ brand: ReactNode; items: NavItem[]; active: string; onSelect: (id: string) => void; actions?: ReactNode; className?: string }> = ({ brand, items, active, onSelect, actions, className = '' }) => (
  <nav className={`ui-navbar ${className}`} aria-label="Primary">
    <span className="ui-navbar__brand">{brand}</span>
    <ul className="ui-navbar__list">
      {items.map((it) => (
        <li key={it.id}>
          <button type="button" className={`ui-navbar__link ${active === it.id ? 'ui-navbar__link--active' : ''}`} aria-current={active === it.id ? 'page' : undefined} onClick={() => onSelect(it.id)}>
            {it.icon}{it.label}{it.badge}
          </button>
        </li>
      ))}
    </ul>
    {actions && <span className="ui-navbar__actions">{actions}</span>}
  </nav>
);

export const SideNav: React.FC<{ items: NavItem[]; active: string; onSelect: (id: string) => void; heading?: string; className?: string }> = ({ items, active, onSelect, heading, className = '' }) => (
  <nav className={`ui-sidenav ${className}`} aria-label={heading ?? 'Section'}>
    {heading && <span className="ui-sidenav__heading">{heading}</span>}
    <ul className="ui-sidenav__list">
      {items.map((it) => (
        <li key={it.id}>
          <button type="button" className={`ui-sidenav__link ${active === it.id ? 'ui-sidenav__link--active' : ''}`} aria-current={active === it.id ? 'page' : undefined} onClick={() => onSelect(it.id)}>
            {it.icon}<span className="ui-sidenav__label">{it.label}</span>{it.badge}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

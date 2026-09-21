import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Overlay.css';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Finds the nearest themed container so portalled overlays inherit the active style. */
function useThemeHost(anchor: React.RefObject<HTMLElement | null>): HTMLElement | null {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const el = anchor.current?.closest<HTMLElement>('[data-style]') ?? null;
    // The portal target is a DOM lookup that only exists after mount, so this is a genuine
    // external-system sync; the functional update keeps it to a single extra render.
    // eslint-disable-next-line react/set-state-in-effect
    setHost((prev) => (prev === el ? prev : el));
  }, [anchor]);
  return host;
}

/** Traps Tab inside a container and restores focus when it unmounts. */
function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    const first = container?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? container)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !container) return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [active, containerRef]);
}

/* ---------------------------------------------------------------- */
/* Modal / Dialog                                                     */
/* ---------------------------------------------------------------- */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Dialog variant: no close button, keyboard-only dismissal through the footer actions. */
  role?: 'dialog' | 'alertdialog';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, description, children, footer, size = 'md', role = 'dialog', className = '' }) => {
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const host = useThemeHost(anchor);
  useFocusTrap(open, panel);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  return (
    <>
      <span ref={anchor} hidden />
      {open && host && createPortal(
        <div className="ui-overlay-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && role === 'dialog') onClose(); }}>
          <div
            ref={panel}
            className={`ui-modal ui-modal--${size} ${className}`}
            role={role}
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            aria-describedby={description ? `${id}-desc` : undefined}
            tabIndex={-1}
          >
            <div className="ui-modal__header">
              <div>
                <h2 className="ui-modal__title" id={`${id}-title`}>{title}</h2>
                {description && <p className="ui-modal__desc" id={`${id}-desc`}>{description}</p>}
              </div>
              {role === 'dialog' && (
                <button type="button" className="ui-modal__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
              )}
            </div>
            {children && <div className="ui-modal__body">{children}</div>}
            {footer && <div className="ui-modal__footer">{footer}</div>}
          </div>
        </div>,
        host
      )}
    </>
  );
};

/* ---------------------------------------------------------------- */
/* Drawer                                                             */
/* ---------------------------------------------------------------- */

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children?: ReactNode;
  side?: 'left' | 'right' | 'bottom';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, children, side = 'right', className = '' }) => {
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const host = useThemeHost(anchor);
  useFocusTrap(open, panel);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  return (
    <>
      <span ref={anchor} hidden />
      {open && host && createPortal(
        <div className="ui-overlay-backdrop ui-overlay-backdrop--drawer" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <div ref={panel} className={`ui-drawer ui-drawer--${side} ${className}`} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1}>
            <div className="ui-drawer__header">
              <h2 className="ui-drawer__title" id={`${id}-title`}>{title}</h2>
              <button type="button" className="ui-modal__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="ui-drawer__body">{children}</div>
          </div>
        </div>,
        host
      )}
    </>
  );
};

/* ---------------------------------------------------------------- */
/* Tooltip                                                            */
/* ---------------------------------------------------------------- */

export const Tooltip: React.FC<{ content: ReactNode; children: React.ReactElement; side?: 'top' | 'bottom' }> = ({ content, children, side = 'top' }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const child = React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
    'aria-describedby': open ? id : undefined,
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false)
  });
  return (
    <span className="ui-tooltip-host">
      {child}
      {open && <span role="tooltip" id={id} className={`ui-tooltip ui-tooltip--${side}`}>{content}</span>}
    </span>
  );
};

/* ---------------------------------------------------------------- */
/* Popover                                                            */
/* ---------------------------------------------------------------- */

export const Popover: React.FC<{ trigger: React.ReactElement; children: ReactNode; title?: ReactNode; align?: 'start' | 'end' }> = ({ trigger, children, title, align = 'start' }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const child = React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': id,
    onClick: () => setOpen((v) => !v)
  });

  return (
    <span className="ui-popover-host" ref={rootRef}>
      {child}
      {open && (
        <div ref={panelRef} id={id} role="dialog" className={`ui-popover ui-popover--${align}`}>
          {title && <div className="ui-popover__title">{title}</div>}
          <div className="ui-popover__body">{children}</div>
        </div>
      )}
    </span>
  );
};

/* ---------------------------------------------------------------- */
/* Menu (dropdown + context menu)                                     */
/* ---------------------------------------------------------------- */

export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export type MenuEntry = MenuItem | 'separator';

const MenuList: React.FC<{ items: MenuEntry[]; onClose: () => void; labelledBy?: string }> = ({ items, onClose, labelledBy }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const enabled = items.map((it, i) => ({ it, i })).filter(({ it }) => it !== 'separator' && !(it as MenuItem).disabled);

  useEffect(() => { listRef.current?.focus(); }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const pos = enabled.findIndex((x) => x.i === active);
      const nextPos = e.key === 'ArrowDown' ? (pos + 1) % enabled.length : (pos - 1 + enabled.length) % enabled.length;
      setActive(enabled[nextPos]?.i ?? 0);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const it = items[active];
      if (it && it !== 'separator') { it.onSelect?.(); onClose(); }
    } else if (e.key === 'Escape') {
      e.preventDefault(); onClose();
    }
  };

  return (
    <div ref={listRef} className="ui-menu" role="menu" tabIndex={-1} aria-labelledby={labelledBy} onKeyDown={onKeyDown}>
      {items.map((it, i) =>
        it === 'separator' ? (
          <div key={`sep-${i}`} className="ui-menu__separator" role="separator" />
        ) : (
          <button
            key={it.id}
            type="button"
            role="menuitem"
            disabled={it.disabled}
            className={`ui-menu__item ${i === active ? 'ui-menu__item--active' : ''} ${it.danger ? 'ui-menu__item--danger' : ''}`}
            onMouseEnter={() => setActive(i)}
            onClick={() => { it.onSelect?.(); onClose(); }}
            tabIndex={-1}
          >
            {it.icon && <span className="ui-menu__icon">{it.icon}</span>}
            <span className="ui-menu__label">{it.label}</span>
            {it.shortcut && <kbd className="ui-menu__shortcut">{it.shortcut}</kbd>}
          </button>
        )
      )}
    </div>
  );
};

export const DropdownMenu: React.FC<{ trigger: React.ReactElement; items: MenuEntry[]; align?: 'start' | 'end' }> = ({ trigger, items, align = 'start' }) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const child = React.cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
    id: `${id}-trigger`,
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    onClick: () => setOpen((v) => !v),
    onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); } }
  });

  return (
    <span className={`ui-menu-host ui-menu-host--${align}`} ref={rootRef}>
      {child}
      {open && <MenuList items={items} onClose={close} labelledBy={`${id}-trigger`} />}
    </span>
  );
};

/** Wrap any element; right-click (or Shift+F10) opens the menu at the pointer. */
export const ContextMenu: React.FC<{ items: MenuEntry[]; children: ReactNode; className?: string }> = ({ items, children, className = '' }) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setPos(null), []);

  useEffect(() => {
    if (!pos) return;
    const onDoc = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setPos(null); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [pos]);

  return (
    <div
      ref={rootRef}
      className={`ui-context-host ${className}`}
      onContextMenu={(e) => {
        e.preventDefault();
        const rect = rootRef.current!.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onKeyDown={(e) => { if (e.key === 'F10' && e.shiftKey) { e.preventDefault(); setPos({ x: 12, y: 12 }); } }}
      tabIndex={0}
    >
      {children}
      {pos && (
        <div className="ui-context-anchor" style={{ left: pos.x, top: pos.y }}>
          <MenuList items={items} onClose={close} />
        </div>
      )}
    </div>
  );
};

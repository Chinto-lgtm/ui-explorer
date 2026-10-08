import React, { useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, Wifi, Signal, BatteryFull, Check, CheckCheck } from 'lucide-react';
import { Avatar } from './DataDisplay';
import './Mobile.css';

/* ---------------------------------------------------------------- */
/* Status bar (decorative device chrome drawn with the style tokens)  */
/* ---------------------------------------------------------------- */

export const StatusBar: React.FC<{ time?: string; className?: string }> = ({ time = '9:41', className = '' }) => (
  <div className={`ui-statusbar ${className}`} aria-hidden="true">
    <span className="ui-statusbar__time">{time}</span>
    <span className="ui-statusbar__icons">
      <Signal size={14} strokeWidth={2.5} />
      <Wifi size={14} strokeWidth={2.5} />
      <BatteryFull size={18} strokeWidth={2} />
    </span>
  </div>
);

/* ---------------------------------------------------------------- */
/* App bar                                                            */
/* ---------------------------------------------------------------- */

export interface AppBarProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Renders a back button as the leading control. */
  onBack?: () => void;
  leading?: ReactNode;
  actions?: ReactNode;
  /** small: one row; center: centred title; large: big title under the controls. */
  variant?: 'small' | 'center' | 'large';
  className?: string;
}

export const AppBar: React.FC<AppBarProps> = ({ title, subtitle, onBack, leading, actions, variant = 'small', className = '' }) => {
  const lead = onBack
    ? <button type="button" className="ui-appbar__btn" onClick={onBack} aria-label="Back"><ChevronLeft size={22} /></button>
    : leading;
  const heading = (
    <span className="ui-appbar__titles">
      <span className="ui-appbar__title">{title}</span>
      {subtitle && <span className="ui-appbar__subtitle">{subtitle}</span>}
    </span>
  );
  return (
    <header className={`ui-appbar ui-appbar--${variant} ${className}`}>
      <div className="ui-appbar__row">
        {lead && <span className="ui-appbar__leading">{lead}</span>}
        {variant !== 'large' ? heading : <span className="ui-appbar__spacer" />}
        {actions && <span className="ui-appbar__actions">{actions}</span>}
      </div>
      {variant === 'large' && heading}
    </header>
  );
};

/* ---------------------------------------------------------------- */
/* Bottom tab bar                                                     */
/* ---------------------------------------------------------------- */

export interface TabBarItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number | string;
}

export interface TabBarProps {
  items: TabBarItem[];
  active: string;
  onSelect: (id: string) => void;
  /** Optional raised action in the middle of the bar. */
  center?: { icon: ReactNode; label: string; onClick: () => void };
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({ items, active, onSelect, center, className = '' }) => {
  const half = Math.ceil(items.length / 2);
  const renderItem = (it: TabBarItem) => (
    <li key={it.id} className="ui-tabbar__cell">
      <button
        type="button"
        className={`ui-tabbar__item ${active === it.id ? 'ui-tabbar__item--active' : ''}`}
        aria-current={active === it.id ? 'page' : undefined}
        onClick={() => onSelect(it.id)}
      >
        <span className="ui-tabbar__icon" aria-hidden="true">
          {it.icon}
          {it.badge !== undefined && <span className="ui-tabbar__badge">{it.badge}</span>}
        </span>
        <span className="ui-tabbar__label">{it.label}</span>
      </button>
    </li>
  );
  return (
    <nav className={`ui-tabbar ${center ? 'ui-tabbar--with-center' : ''} ${className}`} aria-label="Tabs">
      <ul className="ui-tabbar__list">
        {(center ? items.slice(0, half) : items).map(renderItem)}
        {center && (
          <li className="ui-tabbar__cell">
            <button type="button" className="ui-tabbar__center" onClick={center.onClick} aria-label={center.label}>{center.icon}</button>
          </li>
        )}
        {center && items.slice(half).map(renderItem)}
      </ul>
    </nav>
  );
};

/* ---------------------------------------------------------------- */
/* Chat bubble                                                        */
/* ---------------------------------------------------------------- */

export interface ChatBubbleProps {
  from: 'me' | 'them';
  children: ReactNode;
  time?: string;
  /** Delivery state of my messages. */
  status?: 'sent' | 'delivered' | 'read';
  /** Name of the other person; shows their avatar next to the bubble. */
  author?: string;
  /** Consecutive bubble from the same sender: no avatar, tighter corner. */
  grouped?: boolean;
  className?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ from, children, time, status, author, grouped = false, className = '' }) => (
  <div className={`ui-chat ui-chat--${from} ${grouped ? 'ui-chat--grouped' : ''} ${className}`}>
    {from === 'them' && author && (grouped ? <span className="ui-chat__avatar-space" /> : <Avatar name={author} size="sm" />)}
    <div className="ui-chat__bubble">
      <div className="ui-chat__content">{children}</div>
      {(time || status) && (
        <div className="ui-chat__meta">
          {time && <time>{time}</time>}
          {from === 'me' && status && (
            <span className={`ui-chat__status ui-chat__status--${status}`} aria-label={status}>
              {status === 'sent' ? <Check size={12} /> : <CheckCheck size={12} />}
            </span>
          )}
        </div>
      )}
    </div>
  </div>
);

/* ---------------------------------------------------------------- */
/* PIN / one-time code input                                          */
/* ---------------------------------------------------------------- */

export interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  onComplete?: (value: string) => void;
  label?: string;
  error?: string;
  /** Hide digits like a password. */
  mask?: boolean;
  disabled?: boolean;
  className?: string;
}

export const PinInput: React.FC<PinInputProps> = ({ value, onChange, length = 6, onComplete, label, error, mask = false, disabled, className = '' }) => {
  const id = useId();
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const commit = (next: string) => {
    const clean = next.replace(/\D/g, '').slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
    return clean;
  };

  const onInput = (i: number, raw: string) => {
    let typed = raw.replace(/\D/g, '');
    if (!typed) return;
    // A filled box that was not selected receives "old + new"; keep only the new digit.
    if (typed.length === 2 && digits[i]) typed = typed[0] === digits[i] ? typed[1] : typed[0];
    // Typing (or autofill) into a box replaces from that position onwards.
    const clean = commit(value.slice(0, i) + typed + value.slice(i + typed.length));
    refs.current[Math.min(clean.length, length - 1)]?.focus();
  };

  // A full code replaces everything; a fragment is written from the focused box onwards.
  const onPaste = (i: number, text: string, e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = text.replace(/\D/g, '');
    if (!pasted) return;
    const clean = commit(pasted.length >= length ? pasted : value.slice(0, i) + pasted);
    refs.current[Math.min(clean.length, length - 1)]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) commit(value.slice(0, i) + value.slice(i + 1));
      else if (i > 0) { commit(value.slice(0, i - 1) + value.slice(i)); refs.current[i - 1]?.focus(); }
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    else if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
  };

  return (
    <div className={`ui-pin ${error ? 'ui-pin--error' : ''} ${className}`} role="group" aria-labelledby={label ? `${id}-label` : undefined}>
      {label && <span className="ui-input-label" id={`${id}-label`}>{label}</span>}
      <div className="ui-pin__boxes">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className={`ui-pin__box ${d ? 'ui-pin__box--filled' : ''}`}
            type={mask ? 'password' : 'text'}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={length}
            value={d}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={error ? true : undefined}
            onChange={(e) => onInput(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            onPaste={(e) => onPaste(i, e.clipboardData.getData('text'), e)}
          />
        ))}
      </div>
      {error && <span className="ui-input-error">{error}</span>}
    </div>
  );
};

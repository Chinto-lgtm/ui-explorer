import React from 'react';
import type { ReactNode } from 'react';
import './DataDisplay.css';

/* ---------------------------------------------------------------- */
/* Avatar                                                             */
/* ---------------------------------------------------------------- */

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'away' | 'offline';
  /** Deterministic hue so the same name always gets the same colour. */
  className?: string;
}

const hueFor = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
};

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', status, className = '' }) => {
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className={`ui-avatar ui-avatar--${size} ${className}`} style={{ '--avatar-hue': hueFor(name) } as React.CSSProperties} aria-label={name} role="img">
      {initials}
      {status && <span className={`ui-avatar__status ui-avatar__status--${status}`} aria-hidden="true" />}
    </span>
  );
};

export const AvatarGroup: React.FC<{ names: string[]; max?: number; size?: AvatarProps['size'] }> = ({ names, max = 4, size = 'sm' }) => (
  <span className="ui-avatar-group">
    {names.slice(0, max).map((n) => <Avatar key={n} name={n} size={size} />)}
    {names.length > max && <span className={`ui-avatar ui-avatar--${size} ui-avatar--more`}>+{names.length - max}</span>}
  </span>
);

/* ---------------------------------------------------------------- */
/* List                                                               */
/* ---------------------------------------------------------------- */

export interface ListItemProps {
  leading?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}

export const List: React.FC<{ items: ListItemProps[]; className?: string; dividers?: boolean }> = ({ items, className = '', dividers = true }) => (
  <ul className={`ui-list ${dividers ? 'ui-list--dividers' : ''} ${className}`} role={items.some((i) => i.onClick) ? 'listbox' : 'list'}>
    {items.map((item, i) => {
      const Tag = item.onClick ? 'button' : 'div';
      return (
        <li key={i} role={item.onClick ? 'option' : undefined} aria-selected={item.onClick ? item.selected : undefined}>
          <Tag type={item.onClick ? 'button' : undefined} className={`ui-list__item ${item.onClick ? 'ui-list__item--interactive' : ''} ${item.selected ? 'ui-list__item--selected' : ''}`} onClick={item.onClick}>
            {item.leading && <span className="ui-list__leading">{item.leading}</span>}
            <span className="ui-list__text">
              <span className="ui-list__title">{item.title}</span>
              {item.description && <span className="ui-list__desc">{item.description}</span>}
            </span>
            {item.trailing && <span className="ui-list__trailing">{item.trailing}</span>}
          </Tag>
        </li>
      );
    })}
  </ul>
);

/* ---------------------------------------------------------------- */
/* Timeline / Activity feed                                           */
/* ---------------------------------------------------------------- */

export interface TimelineEvent {
  title: ReactNode;
  description?: ReactNode;
  time: string;
  icon?: ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'error';
}

export const Timeline: React.FC<{ events: TimelineEvent[]; className?: string }> = ({ events, className = '' }) => (
  <ol className={`ui-timeline ${className}`}>
    {events.map((e, i) => (
      <li key={i} className={`ui-timeline__event ui-timeline__event--${e.tone ?? 'default'}`}>
        <span className="ui-timeline__marker" aria-hidden="true">{e.icon}</span>
        <div className="ui-timeline__body">
          <div className="ui-timeline__head">
            <span className="ui-timeline__title">{e.title}</span>
            <time className="ui-timeline__time">{e.time}</time>
          </div>
          {e.description && <div className="ui-timeline__desc">{e.description}</div>}
        </div>
      </li>
    ))}
  </ol>
);

export interface ActivityItem {
  user: string;
  action: ReactNode;
  target?: ReactNode;
  time: string;
}

export const ActivityFeed: React.FC<{ items: ActivityItem[]; className?: string }> = ({ items, className = '' }) => (
  <ul className={`ui-activity ${className}`}>
    {items.map((it, i) => (
      <li key={i} className="ui-activity__item">
        <Avatar name={it.user} size="sm" />
        <span className="ui-activity__text">
          <strong>{it.user}</strong> {it.action} {it.target && <em className="ui-activity__target">{it.target}</em>}
        </span>
        <time className="ui-activity__time">{it.time}</time>
      </li>
    ))}
  </ul>
);

/* ---------------------------------------------------------------- */
/* Stat tile                                                          */
/* ---------------------------------------------------------------- */

export const Stat: React.FC<{ label: string; value: ReactNode; delta?: string; positive?: boolean; children?: ReactNode }> = ({ label, value, delta, positive = true, children }) => (
  <div className="ui-stat">
    <div className="ui-stat__head">
      <span className="ui-stat__label">{label}</span>
      {delta && <span className={`ui-stat__delta ${positive ? 'ui-stat__delta--up' : 'ui-stat__delta--down'}`}>{delta}</span>}
    </div>
    <div className="ui-stat__value">{value}</div>
    {children}
  </div>
);

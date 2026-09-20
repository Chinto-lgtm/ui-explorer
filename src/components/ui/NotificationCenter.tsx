import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info, MessageSquare, Cpu, X, Check } from 'lucide-react';
import { Avatar } from './DataDisplay';
import { Button } from './Button';
import { Popover } from './Overlay';
import './NotificationCenter.css';

export type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'message' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  time: string;
  read: boolean;
  /** Person the notification is from; shown as an avatar instead of an icon. */
  from?: string;
  action?: { label: string; onClick: () => void };
}

const ICON: Record<NotificationType, ReactNode> = {
  success: <CheckCircle2 size={16} />,
  warning: <AlertTriangle size={16} />,
  error: <XCircle size={16} />,
  info: <Info size={16} />,
  message: <MessageSquare size={16} />,
  system: <Cpu size={16} />
};

export interface NotificationCenterProps {
  items: Notification[];
  onChange: (items: Notification[]) => void;
  /** Render as a panel (default) or as a bell button with a popover. */
  mode?: 'panel' | 'popover';
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ items, onChange, mode = 'panel', className = '' }) => {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const unread = items.filter((n) => !n.read).length;
  const shown = tab === 'unread' ? items.filter((n) => !n.read) : items;

  const markRead = (id: string, read = true) => onChange(items.map((n) => (n.id === id ? { ...n, read } : n)));
  const markAll = () => onChange(items.map((n) => ({ ...n, read: true })));
  const dismiss = (id: string) => onChange(items.filter((n) => n.id !== id));

  const panel = (
    <div className={`ui-notifications ${className}`} aria-label="Notifications">
      <div className="ui-notifications__head">
        <div className="ui-notifications__title">
          <Bell size={16} />
          <span>Notifications</span>
          {unread > 0 && <span className="ui-notifications__count" aria-label={`${unread} unread`}>{unread}</span>}
        </div>
        <div className="ui-notifications__tabs" role="tablist" aria-label="Filter notifications">
          <button type="button" role="tab" aria-selected={tab === 'all'} className={`ui-notifications__tab ${tab === 'all' ? 'ui-notifications__tab--active' : ''}`} onClick={() => setTab('all')}>All</button>
          <button type="button" role="tab" aria-selected={tab === 'unread'} className={`ui-notifications__tab ${tab === 'unread' ? 'ui-notifications__tab--active' : ''}`} onClick={() => setTab('unread')}>Unread</button>
        </div>
        <Button size="sm" variant="ghost" icon={<Check size={14} />} onClick={markAll} disabled={unread === 0}>Mark all as read</Button>
      </div>

      <ul className="ui-notifications__list">
        {shown.length === 0 && <li className="ui-notifications__empty">You're all caught up.</li>}
        {shown.map((n) => (
          <li key={n.id} className={`ui-notification ui-notification--${n.type} ${n.read ? '' : 'ui-notification--unread'}`}>
            <span className="ui-notification__lead" aria-hidden="true">
              {n.from ? <Avatar name={n.from} size="sm" /> : <span className="ui-notification__icon">{ICON[n.type]}</span>}
            </span>
            <button type="button" className="ui-notification__body" onClick={() => markRead(n.id, !n.read)} aria-label={`${n.title}. ${n.read ? 'Mark as unread' : 'Mark as read'}`}>
              <span className="ui-notification__title">{n.title}</span>
              {n.description && <span className="ui-notification__desc">{n.description}</span>}
              <span className="ui-notification__meta">
                <time>{n.time}</time>
                {!n.read && <span className="ui-notification__dot" aria-hidden="true" />}
              </span>
            </button>
            <span className="ui-notification__side">
              {n.action && <Button size="sm" variant="outline" onClick={n.action.onClick}>{n.action.label}</Button>}
              <button type="button" className="ui-notification__close" onClick={() => dismiss(n.id)} aria-label={`Dismiss ${n.title}`}><X size={14} /></button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  if (mode === 'panel') return panel;

  return (
    <Popover align="end" trigger={
      <button type="button" className="ui-notifications__bell" aria-label={`Notifications, ${unread} unread`}>
        <Bell size={18} />
        {unread > 0 && <span className="ui-notifications__badge">{unread}</span>}
      </button>
    }>
      {panel}
    </Popover>
  );
};

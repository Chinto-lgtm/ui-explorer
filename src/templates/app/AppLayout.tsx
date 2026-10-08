import React from 'react';
import type { ReactNode } from 'react';
import { Home, Wallet, Plus, MessageCircle, User } from 'lucide-react';
import { StatusBar, TabBar } from '../../components/ui/Mobile';
import { useTemplateNav } from '../nav';
import { CHATS } from '../content';
import './app.css';

/** Which tab is highlighted for each screen; screens not listed hide the tab bar. */
const TAB_FOR: Record<string, string> = {
  home: 'home', explore: 'home', notifications: 'home', goal: 'home',
  wallet: 'wallet',
  messages: 'messages',
  profile: 'profile', settings: 'profile', states: 'profile'
};

const unread = CHATS.reduce((n, c) => n + c.unread, 0);

/** Device chrome of the Orbit app: status bar, the screen, and the bottom tab bar. */
export const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { screen, go } = useTemplateNav();
  const tab = TAB_FOR[screen];
  return (
    <div className="oa">
      <StatusBar />
      <div className="oa-screen">{children}</div>
      {tab && (
        <TabBar
          active={tab}
          onSelect={go}
          center={{ icon: <Plus size={24} />, label: 'New goal', onClick: () => go('create') }}
          items={[
            { id: 'home', label: 'Home', icon: <Home size={20} /> },
            { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} /> },
            { id: 'messages', label: 'Chats', icon: <MessageCircle size={20} />, badge: unread || undefined },
            { id: 'profile', label: 'Profile', icon: <User size={20} /> }
          ]}
        />
      )}
    </div>
  );
};

/** One app screen: a fixed top bar, a scrolling body and an optional fixed footer. */
export const AppScreen: React.FC<{ bar?: ReactNode; footer?: ReactNode; children: ReactNode; className?: string }> = ({ bar, footer, children, className = '' }) => (
  <>
    {bar}
    <div className={`oa-scroll tpl-scroll ${className}`}>{children}</div>
    {footer && <div className="oa-footer">{footer}</div>}
  </>
);

/** Small section heading with an optional action on the right. */
export const SectionTitle: React.FC<{ children: ReactNode; action?: ReactNode }> = ({ children, action }) => (
  <div className="oa-section-title">
    <h2>{children}</h2>
    {action}
  </div>
);

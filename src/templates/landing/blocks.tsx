import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Home, PieChart, Plus, Bell, User, Send, ArrowDownLeft, ArrowRight } from 'lucide-react';
import { StatusBar, AppBar, TabBar } from '../../components/ui/Mobile';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/DataDisplay';
import { Progress, useToast } from '../../components/ui/Feedback';
import { Sparkline } from '../../components/charts/RadialCharts';
import { Backdrop } from '../../components/svg/Backdrop';
import { useTemplateNav } from '../nav';
import { BUDGETS, SPARK, TRANSACTIONS, USER, money } from '../content';

export const SectionHead: React.FC<{ eyebrow?: string; title: ReactNode; lead?: ReactNode; center?: boolean }> = ({ eyebrow, title, lead, center }) => (
  <div className={`ls-head ${center ? 'ls-head--center' : ''}`}>
    {eyebrow && <span className="ls-eyebrow">{eyebrow}</span>}
    <h2 className="ls-h2">{title}</h2>
    {lead && <p className="ls-lead">{lead}</p>}
  </div>
);

export const PageHero: React.FC<{ eyebrow?: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }> = ({ eyebrow, title, lead, children }) => (
  <section className="ls-page-hero">
    <div className="ls-container ls-page-hero__inner">
      {eyebrow && <span className="ls-eyebrow">{eyebrow}</span>}
      <h1 className="ls-h1 ls-h1--page">{title}</h1>
      {lead && <p className="ls-lead">{lead}</p>}
      {children}
    </div>
  </section>
);

/** The Orbit app drawn inside a phone on the marketing site, built from the mobile components. */
export const PhoneMock: React.FC = () => {
  const [tab, setTab] = useState('home');
  return (
    <div className="tpl-phone-mock ls-phone" aria-label="Orbit app preview">
      <StatusBar />
      <AppBar
        variant="small"
        leading={<Avatar name={USER.name} size="sm" status="online" />}
        title={`Hi, ${USER.first}`}
        subtitle="Thursday, 14 Aug"
        actions={<span className="ls-phone__bell"><Bell size={18} /></span>}
      />
      <div className="ls-phone__body">
        <Card className="ls-phone__balance" variant="elevated">
          <span className="tpl-faint ls-phone__label">Total balance</span>
          <strong className="ls-phone__amount tpl-num">$11,820.40</strong>
          <span className="tpl-positive ls-phone__delta">+ $830 this month</span>
          <Sparkline values={SPARK} height={46} />
        </Card>
        <div className="ls-phone__actions">
          <span><Send size={16} />Send</span>
          <span><ArrowDownLeft size={16} />Request</span>
          <span><Plus size={16} />Top up</span>
        </div>
        <div className="ls-phone__budgets">
          {BUDGETS.slice(0, 2).map((b) => (
            <Progress key={b.label} size="sm" label={b.label} value={b.spent} max={b.limit} tone={b.spent > b.limit * 0.9 ? 'warning' : 'accent'} />
          ))}
        </div>
        <div className="ls-phone__tx">
          {TRANSACTIONS.slice(0, 3).map((t) => (
            <div key={t.id} className="ls-phone__tx-row">
              <span className="ls-phone__tx-name">{t.merchant}</span>
              <span className={`tpl-num ${t.amount > 0 ? 'tpl-positive' : ''}`}>{money(t.amount, true)}</span>
            </div>
          ))}
        </div>
      </div>
      <TabBar
        active={tab}
        onSelect={setTab}
        items={[
          { id: 'home', label: 'Home', icon: <Home size={18} /> },
          { id: 'stats', label: 'Stats', icon: <PieChart size={18} /> },
          { id: 'inbox', label: 'Inbox', icon: <Bell size={18} />, badge: 2 },
          { id: 'me', label: 'Me', icon: <User size={18} /> }
        ]}
      />
    </div>
  );
};

/** Closing call to action used at the bottom of several pages. */
export const CtaBand: React.FC<{ title?: string; text?: string }> = ({ title = 'Start saving in two minutes', text = 'Free forever for budgets and two goals. No card needed.' }) => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  return (
    <section className="ls-section">
      <div className="ls-container">
        <div className="ls-cta">
          <Backdrop fit="cover" preset="aurora" seed={7} intensity={0.7} className="ls-cta__art" />
          <div className="ls-cta__body">
            <h2 className="ls-h2">{title}</h2>
            <p className="ls-lead">{text}</p>
            <form className="ls-cta__form" onSubmit={(e) => { e.preventDefault(); toast({ tone: 'success', title: 'Check your inbox', description: `We sent a sign-up link to ${email || 'your email'}.` }); setEmail(''); }}>
              <Input aria-label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit" icon={<ArrowRight size={16} />} iconPosition="right">Get started</Button>
            </form>
            <button type="button" className="ls-link" onClick={() => go('pricing')}>Compare plans</button>
          </div>
        </div>
      </div>
    </section>
  );
};

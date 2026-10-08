import React, { useState } from 'react';
import {
  Wallet, Target, LineChart as LineIcon, ShieldCheck, LayoutDashboard, ArrowLeftRight, CreditCard, PieChart,
  Settings, LogOut, User, Download, Flag, Copy, Snowflake, Eye, Repeat, CalendarClock, MousePointerClick
} from 'lucide-react';
import { Breadcrumbs, Tabs, SideNav } from '../../../components/ui/Navigation';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Selection';
import { ColorPicker } from '../../../components/ui/ColorPicker';
import { Progress, ProgressRing, useToast } from '../../../components/ui/Feedback';
import { Stat, ActivityFeed, Avatar, List, Timeline } from '../../../components/ui/DataDisplay';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { DropdownMenu, ContextMenu } from '../../../components/ui/Overlay';
import { NotificationCenter } from '../../../components/ui/NotificationCenter';
import type { Notification } from '../../../components/ui/NotificationCenter';
import { Chip } from '../../../components/ui/Content';
import { LineChart } from '../../../components/charts/LineChart';
import { BarChart } from '../../../components/charts/BarChart';
import { DonutChart, RadialChart, ScatterChart } from '../../../components/charts/RadialCharts';
import { useTemplateNav } from '../../nav';
import { useNarrow } from '../viewport';
import { PageHero, SectionHead, CtaBand } from '../blocks';
import { ACTIVITY, BUDGETS, CATEGORIES, GOALS, NET_WORTH, SCATTER, SPENDING_BY_MONTH, TRANSACTIONS, USER, money } from '../../content';
import type { Transaction } from '../../content';

const AREAS = [
  { id: 'budgets', label: 'Budgets', icon: <Wallet size={14} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={14} /> },
  { id: 'insights', label: 'Insights', icon: <LineIcon size={14} /> },
  { id: 'security', label: 'Security', icon: <ShieldCheck size={14} /> }
];

const DEMO_NAV = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight size={16} /> },
  { id: 'cards', label: 'Cards', icon: <CreditCard size={16} /> },
  { id: 'insights', label: 'Insights', icon: <PieChart size={16} /> }
];

const BANKS = ['Chase', 'Barclays', 'Revolut', 'Monzo', 'ING', 'Santander', 'BNP Paribas', 'Wells Fargo', 'HSBC', 'Nubank', 'N26', 'Citi'];

const MONTH = [
  { time: 'Day 1', title: 'Payday', description: '10% moves to goals before you see it.', tone: 'success' as const },
  { time: 'Day 9', title: 'Gentle nudge', description: 'Eating out is at 80% — Orbit suggests a cheaper week.', tone: 'warning' as const },
  { time: 'Day 16', title: 'Bill spotted', description: 'A subscription price rose by $3. One tap to cancel.', tone: 'default' as const },
  { time: 'Day 30', title: 'Month wrapped', description: '$412 saved, two budgets under, one goal funded.', tone: 'accent' as const }
];

const INITIAL_NOTES: Notification[] = [
  { id: 'n1', type: 'success', title: 'Japan trip is 69% funded', description: 'You are three weeks ahead of plan.', time: '2m', read: false },
  { id: 'n2', type: 'message', title: 'Alex sent you $24', description: 'For the concert tickets', time: '1h', read: false, from: 'Alex Kim' },
  { id: 'n3', type: 'warning', title: 'Fun budget is over', description: '$120 of $100 spent this month.', time: '3h', read: true }
];

const ProductDemo: React.FC = () => {
  const { toast } = useToast();
  const narrow = useNarrow();
  const [section, setSection] = useState('overview');
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [cardColor, setCardColor] = useState('#6d5efc');
  const [frozen, setFrozen] = useState(false);

  const columns: Column<Transaction>[] = [
    { id: 'merchant', header: 'Merchant', cell: (r) => <span className="tpl-row"><Avatar name={r.merchant} size="sm" />{r.merchant}</span>, sortValue: (r) => r.merchant },
    { id: 'category', header: 'Category', cell: (r) => r.category, sortValue: (r) => r.category },
    { id: 'date', header: 'Date', cell: (r) => r.date, defaultHidden: narrow },
    { id: 'status', header: 'Status', cell: (r) => <Badge size="sm" variant={r.status === 'Completed' ? 'success' : r.status === 'Pending' ? 'warning' : 'outline'}>{r.status}</Badge>, defaultHidden: narrow },
    { id: 'amount', header: 'Amount', align: 'right', cell: (r) => <span className={`tpl-num ${r.amount > 0 ? 'tpl-positive' : ''}`}>{money(r.amount, true)}</span>, sortValue: (r) => r.amount }
  ];

  const rowMenu = [
    { id: 'receipt', label: 'Download receipt', icon: <Download size={14} />, onSelect: () => toast({ title: 'Receipt downloaded', tone: 'success' }) },
    { id: 'split', label: 'Split with a friend', icon: <Repeat size={14} />, onSelect: () => toast({ title: 'Split request sent', tone: 'success' }) },
    { id: 'copy', label: 'Copy reference', icon: <Copy size={14} />, onSelect: () => toast({ title: 'Reference copied' }) },
    'separator' as const,
    { id: 'dispute', label: 'Report a problem', icon: <Flag size={14} />, danger: true, onSelect: () => toast({ title: 'We are on it', description: 'Support will reply within the hour.', tone: 'warning' }) }
  ];

  return (
    <Card className="ls-demo">
      <div className="ls-demo__top">
        <span className="ls-demo__title"><span className="ls-dot" /> Live demo · nothing here is real money</span>
        <span className="tpl-row">
          <NotificationCenter mode="popover" items={notes} onChange={setNotes} />
          <DropdownMenu
            align="end"
            trigger={<button type="button" className="ls-demo__me" aria-label="Account menu" data-opens="DropdownMenu"><Avatar name={USER.name} size="sm" status="online" /></button>}
            items={[
              { id: 'profile', label: 'Profile', icon: <User size={14} /> },
              { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
              'separator',
              { id: 'out', label: 'Sign out', icon: <LogOut size={14} />, onSelect: () => toast({ title: 'Signed out of the demo' }) }
            ]}
          />
        </span>
      </div>
      <div className="ls-demo__body">
        <SideNav heading="Orbit" items={DEMO_NAV} active={section} onSelect={setSection} className="ls-demo__nav" />
        <div className="ls-demo__main">
          {section === 'overview' && (
            <div className="tpl-stack">
              <div className="ls-grid ls-grid--3">
                <Card variant="flat"><Stat label="Balance" value="$11,820" delta="+7.6%" /></Card>
                <Card variant="flat"><Stat label="Spent in August" value="$1,760" delta="−14%" positive /></Card>
                <Card variant="flat"><Stat label="Saved" value="$7,790" delta="+$830" /></Card>
              </div>
              <div className="ls-split ls-split--top ls-split--wide">
                <Card variant="flat">
                  <CardHeader><CardTitle>Net worth</CardTitle></CardHeader>
                  <CardBody><LineChart data={NET_WORTH} height={190} area /></CardBody>
                </Card>
                <Card variant="flat">
                  <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
                  <CardBody><ActivityFeed items={ACTIVITY} /></CardBody>
                </Card>
              </div>
            </div>
          )}
          {section === 'transactions' && (
            <div className="tpl-stack">
              <p className="ls-demo__hint"><MousePointerClick size={14} /> Right-click (or long-press) the table for quick actions.</p>
              <ContextMenu items={rowMenu}>
                <DataTable
                  caption="Transactions"
                  columns={columns}
                  rows={TRANSACTIONS}
                  rowKey={(r) => r.id}
                  searchable={(r) => `${r.merchant} ${r.category}`}
                  filter={{ label: 'Status', value: (r) => r.status, options: ['Completed', 'Pending', 'Refunded'] }}
                  pageSize={5}
                  rowActions={() => rowMenu}
                />
              </ContextMenu>
            </div>
          )}
          {section === 'cards' && (
            <div className="ls-split ls-split--top">
              <div className="ls-card-preview" style={{ '--card-color': cardColor } as React.CSSProperties} data-frozen={frozen || undefined}>
                <span className="ls-card-preview__brand">Orbit</span>
                <span className="ls-card-preview__chip" aria-hidden="true" />
                <span className="ls-card-preview__number tpl-num">•••• •••• •••• 4821</span>
                <span className="ls-card-preview__name">{USER.name}</span>
                {frozen && <span className="ls-card-preview__frozen"><Snowflake size={16} /> Frozen</span>}
              </div>
              <div className="tpl-stack">
                <ColorPicker label="Card colour" value={cardColor} onChange={setCardColor} allowAlpha={false} />
                <Toggle checked={frozen} onChange={(v) => { setFrozen(v); toast({ title: v ? 'Card frozen' : 'Card unfrozen', tone: v ? 'info' : 'success' }); }} label="Freeze card" />
                <Button variant="secondary" icon={<Eye size={16} />} onClick={() => toast({ title: 'Card details', description: 'Shown for 30 seconds in the real app.' })}>Show card details</Button>
              </div>
            </div>
          )}
          {section === 'insights' && (
            <div className="ls-split ls-split--top">
              <Card variant="flat">
                <CardHeader><CardTitle>Where it went</CardTitle></CardHeader>
                <CardBody className="ls-center"><DonutChart data={CATEGORIES} size={180} centerLabel="August" /></CardBody>
              </Card>
              <Card variant="flat">
                <CardHeader><CardTitle>Purchases by size and day</CardTitle></CardHeader>
                <CardBody><ScatterChart points={SCATTER} height={210} /></CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export const FeaturesPage: React.FC = () => {
  const { go } = useTemplateNav();
  const [area, setArea] = useState('budgets');
  const [protections, setProtections] = useState({ biometrics: true, gambling: false, travel: true });

  return (
    <>
      <PageHero eyebrow="Features" title="A calmer way to run your money" lead="Budgets, goals, insights and security that work together — and stay out of the way until they matter.">
        <Breadcrumbs items={[{ label: 'Home', onClick: () => go('home') }, { label: 'Features' }]} />
      </PageHero>

      <section className="ls-section ls-section--tight">
        <div className="ls-container tpl-stack">
          <Tabs label="Feature areas" variant="pills" tabs={AREAS} value={area} onChange={setArea} />
          <div className="ls-split ls-split--top" role="tabpanel" id={`panel-${area}`}>
            {area === 'budgets' && (
              <>
                <div className="tpl-stack">
                  <h2 className="ls-h2">Budgets that bend instead of break</h2>
                  <p className="ls-lead">Orbit sets limits from your real spending and moves them as life changes. You get a heads-up at 80%, never a scolding at 120%.</p>
                  <div className="tpl-row tpl-row--wrap"><Badge variant="success">Auto-adjusting</Badge><Badge variant="outline">Weekly or monthly</Badge></div>
                </div>
                <Card>
                  <CardHeader><CardTitle>August budgets</CardTitle></CardHeader>
                  <CardBody className="tpl-stack">
                    {BUDGETS.map((b) => (
                      <Progress key={b.label} label={`${b.label} · ${money(b.spent)} of ${money(b.limit)}`} value={Math.min(b.spent, b.limit)} max={b.limit} tone={b.spent > b.limit ? 'error' : b.spent > b.limit * 0.85 ? 'warning' : 'success'} />
                    ))}
                  </CardBody>
                </Card>
              </>
            )}
            {area === 'goals' && (
              <>
                <div className="tpl-stack">
                  <h2 className="ls-h2">Goals that fund themselves</h2>
                  <p className="ls-lead">Round-ups, salary rules and one-off boosts flow into each goal. Share a goal and save together.</p>
                  <div className="tpl-row tpl-row--wrap">
                    {GOALS.map((g) => (
                      <div key={g.id} className="ls-goal">
                        <ProgressRing value={Math.round((g.saved / g.target) * 100)} size={64} strokeWidth={7} label={g.name} tone={g.saved / g.target > 0.7 ? 'success' : 'accent'} />
                        <span className="ls-goal__name">{g.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Card>
                  <CardHeader><CardTitle>Progress across goals</CardTitle></CardHeader>
                  <CardBody className="ls-center"><RadialChart data={GOALS.map((g) => ({ label: g.name, value: Math.round((g.saved / g.target) * 100) }))} size={220} max={100} /></CardBody>
                </Card>
              </>
            )}
            {area === 'insights' && (
              <>
                <div className="tpl-stack">
                  <h2 className="ls-h2">See the trend, not just the total</h2>
                  <p className="ls-lead">Net worth over time, spending by month and the categories that quietly grow — explained in plain words.</p>
                  <Card variant="flat"><LineChart data={NET_WORTH} height={160} /></Card>
                </div>
                <Card>
                  <CardHeader><CardTitle>Spending by month</CardTitle></CardHeader>
                  <CardBody><BarChart data={SPENDING_BY_MONTH} height={220} /></CardBody>
                </Card>
              </>
            )}
            {area === 'security' && (
              <>
                <div className="tpl-stack">
                  <h2 className="ls-h2">Protection you control</h2>
                  <p className="ls-lead">Every safety feature is a switch you can flip from your phone — no calls, no waiting.</p>
                </div>
                <Card>
                  <List
                    items={[
                      { leading: <span className="tpl-icon-chip"><ShieldCheck size={18} /></span>, title: 'Biometric sign-in', description: 'Face or fingerprint for every payment', trailing: <Toggle checked={protections.biometrics} onChange={(v) => setProtections({ ...protections, biometrics: v })} label={<span className="tpl-sr">Biometric sign-in</span>} /> },
                      { leading: <span className="tpl-icon-chip"><Snowflake size={18} /></span>, title: 'Gambling block', description: 'Decline gambling merchants for 48h+', trailing: <Toggle checked={protections.gambling} onChange={(v) => setProtections({ ...protections, gambling: v })} label={<span className="tpl-sr">Gambling block</span>} /> },
                      { leading: <span className="tpl-icon-chip"><CalendarClock size={18} /></span>, title: 'Travel mode', description: 'Location-aware fraud checks abroad', trailing: <Toggle checked={protections.travel} onChange={(v) => setProtections({ ...protections, travel: v })} label={<span className="tpl-sr">Travel mode</span>} /> }
                    ]}
                  />
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="ls-section ls-section--tint">
        <div className="ls-container">
          <SectionHead center eyebrow="Try it" title="Click around the real thing" lead="An interactive slice of the Orbit web app. Switch sections, sort the table, open the bell, design a card." />
          <ProductDemo />
        </div>
      </section>

      <section className="ls-section">
        <div className="ls-container ls-split ls-split--top">
          <div className="tpl-stack">
            <SectionHead eyebrow="A month with Orbit" title="What actually happens after you sign up" />
            <Timeline events={MONTH} />
          </div>
          <div className="tpl-stack">
            <SectionHead eyebrow="Connections" title="Works with 12,000+ banks" lead="Read-only links through regulated providers. Disconnect any time." />
            <div className="tpl-row tpl-row--wrap">
              {BANKS.map((b) => <Chip key={b} size="sm">{b}</Chip>)}
              <Chip size="sm" onClick={() => go('contact')}>Missing yours? Tell us</Chip>
            </div>
          </div>
        </div>
      </section>

      <CtaBand title="Ready to try it for real?" />
    </>
  );
};

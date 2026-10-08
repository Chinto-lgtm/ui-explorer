import React, { useState } from 'react';
import {
  Bell, Send, ArrowDownLeft, Plus, Split, Search, Info, ChevronRight, Compass, LayoutDashboard, Wallet, Target,
  MessageCircle, Settings, HelpCircle, LogOut, Sparkles, SearchX, Menu
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { SideNav } from '../../../components/ui/Navigation';
import { Drawer, Tooltip } from '../../../components/ui/Overlay';
import { Progress, ProgressRing, Skeleton, EmptyState, useToast } from '../../../components/ui/Feedback';
import { Avatar, ActivityFeed, List } from '../../../components/ui/DataDisplay';
import { NotificationCenter } from '../../../components/ui/NotificationCenter';
import type { Notification } from '../../../components/ui/NotificationCenter';
import { Carousel, ChipGroup, Testimonial } from '../../../components/ui/Content';
import { AppBar } from '../../../components/ui/Mobile';
import { Sparkline } from '../../../components/charts/RadialCharts';
import { useTemplateNav } from '../../nav';
import { AppScreen, SectionTitle } from '../AppLayout';
import { ACTIVITY, BUDGETS, GOALS, OFFERS, OFFER_TAGS, SPARK, TESTIMONIALS, USER, money } from '../../content';

const MENU = [
  { id: 'home', label: 'Home', icon: <LayoutDashboard size={18} /> },
  { id: 'wallet', label: 'Wallet', icon: <Wallet size={18} /> },
  { id: 'goal', label: 'Goals', icon: <Target size={18} /> },
  { id: 'explore', label: 'Discover', icon: <Compass size={18} /> },
  { id: 'messages', label: 'Chats', icon: <MessageCircle size={18} />, badge: <Badge size="sm" variant="error">3</Badge> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  { id: 'states', label: 'Help & status', icon: <HelpCircle size={18} /> }
];

export const HomeScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [menu, setMenu] = useState(false);
  const [sheet, setSheet] = useState<null | 'send'>(null);
  const navigate = (id: string) => { setMenu(false); go(id); };

  return (
    <AppScreen
      bar={(
        <AppBar
          variant="large"
          leading={<button type="button" className="oa-icon-btn" onClick={() => setMenu(true)} aria-label="Open menu" data-opens="Drawer SideNav"><Menu size={22} /></button>}
          title={`Good morning, ${USER.first}`}
          subtitle="Thursday, 14 August"
          actions={(
            <>
              <button type="button" className="oa-icon-btn oa-bell" onClick={() => go('notifications')} aria-label="Notifications, 2 unread"><Bell size={20} /><span className="oa-bell__dot" /></button>
              <button type="button" className="oa-avatar-btn" onClick={() => go('profile')} aria-label="Profile"><Avatar name={USER.name} size="sm" status="online" /></button>
            </>
          )}
        />
      )}
    >
      <Card variant="elevated" className="oa-balance">
        <div className="tpl-row tpl-row--between">
          <span className="tpl-faint">Total balance</span>
          <Badge size="sm" variant="success">+7.6%</Badge>
        </div>
        <strong className="oa-balance__amount tpl-num">$11,820.40</strong>
        <Sparkline values={SPARK} height={48} />
        <span className="tpl-faint oa-small">+ $830 since last month</span>
      </Card>

      <div className="oa-actions">
        <button type="button" onClick={() => setSheet('send')} data-opens="Drawer"><span><Send size={18} /></span>Send</button>
        <button type="button" onClick={() => toast({ title: 'Request link copied', description: 'Share it with anyone.', tone: 'success' })}><span><ArrowDownLeft size={18} /></span>Request</button>
        <button type="button" onClick={() => go('wallet')}><span><Plus size={18} /></span>Top up</button>
        <button type="button" onClick={() => toast({ title: 'Split a bill', description: 'Pick a transaction in Wallet to split it.' })}><span><Split size={18} /></span>Split</button>
      </div>

      <SectionTitle action={<button type="button" className="oa-link" onClick={() => go('create')}>New goal</button>}>Your goals</SectionTitle>
      <Carousel
        label="Goals"
        slidesPerView={1.35}
        showArrows={false}
        slides={GOALS.map((g) => {
          const pct = Math.round((g.saved / g.target) * 100);
          return (
            <Card key={g.id} hoverable className="oa-goal-card" onClick={() => go('goal')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') go('goal'); }}>
              <ProgressRing value={pct} size={56} strokeWidth={6} label={g.name} tone={pct > 70 ? 'success' : 'accent'} />
              <div className="tpl-stack tpl-stack--tight">
                <strong>{g.name}</strong>
                <span className="tpl-faint oa-small tpl-num">{money(g.saved)} of {money(g.target)}</span>
              </div>
            </Card>
          );
        })}
      />

      <SectionTitle action={<button type="button" className="oa-link" onClick={() => go('wallet')}>See all</button>}>Budgets this month</SectionTitle>
      <Card className="tpl-stack">
        {BUDGETS.slice(0, 3).map((b) => (
          <Progress key={b.label} size="sm" label={b.label} value={Math.min(b.spent, b.limit)} max={b.limit} tone={b.spent > b.limit * 0.9 ? 'warning' : 'accent'} />
        ))}
      </Card>

      <Card className="oa-discover" hoverable onClick={() => go('explore')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') go('explore'); }}>
        <span className="tpl-icon-chip"><Sparkles size={18} /></span>
        <span className="tpl-grow"><strong>Discover</strong><br /><span className="tpl-faint oa-small">A 4.6% vault and 6 more ways to grow</span></span>
        <ChevronRight size={18} />
      </Card>

      <SectionTitle>Activity</SectionTitle>
      <Card><ActivityFeed items={ACTIVITY} /></Card>

      <Drawer open={menu} onClose={() => setMenu(false)} side="left" title={<span className="tpl-row"><Avatar name={USER.name} size="sm" />{USER.name}</span>}>
        <div className="tpl-stack">
          <SideNav heading="Orbit" items={MENU} active="home" onSelect={navigate} />
          <Button variant="ghost" icon={<LogOut size={16} />} onClick={() => navigate('welcome')}>Sign out</Button>
        </div>
      </Drawer>

      <Drawer open={sheet === 'send'} onClose={() => setSheet(null)} side="bottom" title="Send money">
        <div className="tpl-stack">
          <List items={['Alex Kim', 'Maya Chen', 'Jordan Okafor'].map((n) => ({ leading: <Avatar name={n} size="md" />, title: n, description: 'On Orbit · free and instant', trailing: <ChevronRight size={16} />, onClick: () => { setSheet(null); toast({ tone: 'success', title: `Paying ${n.split(' ')[0]}`, description: 'Enter an amount in the real app.' }); } }))} />
        </div>
      </Drawer>
    </AppScreen>
  );
};

export const ExploreScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  // Changing a filter pretends to load, so the skeleton state is part of the screen.
  const key = `${query}|${tags.join(',')}`;
  const [shown, setShown] = useState(key);
  const loading = key !== shown;
  React.useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => setShown(key), 500);
    return () => window.clearTimeout(id);
  }, [key, loading]);

  const q = query.trim().toLowerCase();
  const results = OFFERS.filter((o) => (tags.length === 0 || tags.includes(o.tag)) && (!q || `${o.title} ${o.text}`.toLowerCase().includes(q)));

  return (
    <AppScreen
      bar={(
        <AppBar
          title="Discover"
          onBack={() => go('home')}
          actions={(
            <Tooltip content="Offers are picked from your spending, not paid placements" side="bottom">
              <button type="button" className="oa-icon-btn" aria-label="How offers are chosen"><Info size={18} /></button>
            </Tooltip>
          )}
        />
      )}
    >
      <Input aria-label="Search offers" placeholder="Search vaults, cards, perks…" icon={<Search size={16} />} value={query} onChange={(e) => setQuery(e.target.value)} />
      <ChipGroup label="Filter offers" scroll size="sm" value={tags} onChange={setTags} options={OFFER_TAGS.map((t) => ({ value: t, label: t }))} />
      {loading ? (
        <div className="tpl-stack" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="tpl-row"><Skeleton circle width={40} height={40} /><div className="tpl-grow tpl-stack tpl-stack--tight"><Skeleton width="60%" height={14} /><Skeleton width="85%" height={12} /></div></div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState icon={<SearchX size={28} />} title="Nothing matches" description="Try a different word or clear the filters." action={<Button variant="secondary" size="sm" onClick={() => { setQuery(''); setTags([]); }}>Clear filters</Button>} />
      ) : (
        <List
          items={results.map((o, i) => ({
            leading: <span className="tpl-icon-chip">{[<Sparkles key="s" size={18} />, <Target key="t" size={18} />, <Wallet key="w" size={18} />][i % 3]}</span>,
            title: <span className="tpl-row">{o.title}{o.badge && <Badge size="sm" variant={o.badge === 'New' ? 'accent' : o.badge === 'Plus' ? 'warning' : 'success'}>{o.badge}</Badge>}</span>,
            description: o.text,
            trailing: <ChevronRight size={16} />,
            onClick: () => toast({ title: o.title, description: 'Opens the offer details in the real app.' })
          }))}
        />
      )}
      <SectionTitle>From the community</SectionTitle>
      <Testimonial {...TESTIMONIALS[0]} />
    </AppScreen>
  );
};

const NOTES: Notification[] = [
  { id: 'a1', type: 'success', title: 'Japan trip reached 69%', description: 'You are three weeks ahead of plan.', time: '2m', read: false },
  { id: 'a2', type: 'message', title: 'Alex sent you $24', description: 'For the concert tickets', time: '1h', read: false, from: 'Alex Kim' },
  { id: 'a3', type: 'warning', title: 'Fun budget is over', description: '$120 of $100 spent this month.', time: '3h', read: true },
  { id: 'a4', type: 'info', title: 'New statement ready', description: 'Your July statement is in Wallet.', time: 'Yesterday', read: true },
  { id: 'a5', type: 'system', title: 'Signed in on a new device', description: 'iPad · Lisbon. Not you? Freeze your account.', time: 'Mon', read: true },
  { id: 'a6', type: 'error', title: 'Card payment declined', description: 'Sneaker Lab · card was frozen at the time.', time: 'Sun', read: true }
];

export const NotificationsScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const [items, setItems] = useState(NOTES);
  return (
    <AppScreen bar={<AppBar title="Notifications" onBack={() => go('home')} actions={<Button variant="ghost" size="sm" onClick={() => setItems(items.map((n) => ({ ...n, read: true })))}>Read all</Button>} />}>
      <NotificationCenter items={items} onChange={setItems} className="oa-notes" />
      {items.length === 0 && <EmptyState title="All caught up" description="New notifications will show up here." />}
    </AppScreen>
  );
};

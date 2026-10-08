import React, { useState } from 'react';
import {
  Settings, ChevronRight, Shield, CreditCard, Users, HelpCircle, Sparkles, LogOut, Globe, Star, WifiOff,
  ServerCrash, RefreshCw, Inbox
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Breadcrumbs } from '../../../components/ui/Navigation';
import { Toggle, Select, Radio, Slider, Segmented } from '../../../components/ui/Selection';
import { Modal, Drawer } from '../../../components/ui/Overlay';
import { Alert, Skeleton, Spinner, EmptyState, Progress, useToast } from '../../../components/ui/Feedback';
import { Avatar, AvatarGroup, List, Stat } from '../../../components/ui/DataDisplay';
import { Accordion, PricingCard, Rating } from '../../../components/ui/Content';
import { AppBar } from '../../../components/ui/Mobile';
import { RadialChart } from '../../../components/charts/RadialCharts';
import { useTemplateNav } from '../../nav';
import { AppScreen, SectionTitle } from '../AppLayout';
import { CURRENCIES, FAQ, GOALS, LANGUAGES, PLANS, USER } from '../../content';

export const ProfileScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const plus = PLANS[1];
  return (
    <AppScreen bar={<AppBar title="Profile" actions={<button type="button" className="oa-icon-btn" aria-label="Settings" onClick={() => go('settings')}><Settings size={20} /></button>} />}>
      <div className="oa-profile">
        <Avatar name={USER.name} size="lg" status="online" />
        <strong className="oa-profile__name">{USER.name}</strong>
        <span className="tpl-faint">{USER.handle} · member since 2022</span>
        <Badge variant="outline" size="sm">Free plan</Badge>
      </div>
      <div className="oa-grid-3">
        <Stat label="Saved" value="$7.8k" />
        <Stat label="Goals" value="3" />
        <Stat label="Streak" value="14w" />
      </div>
      <Card>
        <CardHeader><CardTitle>Goals at a glance</CardTitle></CardHeader>
        <CardBody className="oa-center"><RadialChart data={GOALS.map((g) => ({ label: g.name, value: Math.round((g.saved / g.target) * 100) }))} size={190} max={100} /></CardBody>
      </Card>
      <SectionTitle>Household</SectionTitle>
      <Card className="tpl-row">
        <AvatarGroup names={['Sam Rivera', 'Alex Kim', 'Maya Chen', 'Jordan Okafor', 'Lucía Moreno']} max={3} size="md" />
        <span className="tpl-grow tpl-muted oa-small">Flat 4B wallet · 5 people</span>
        <Button size="sm" variant="secondary" onClick={() => go('messages')}>Open</Button>
      </Card>
      <List
        items={[
          { leading: <span className="tpl-icon-chip"><CreditCard size={18} /></span>, title: 'Cards and accounts', trailing: <ChevronRight size={16} />, onClick: () => go('wallet') },
          { leading: <span className="tpl-icon-chip"><Shield size={18} /></span>, title: 'Security', description: 'Face ID on', trailing: <ChevronRight size={16} />, onClick: () => go('settings') },
          { leading: <span className="tpl-icon-chip"><Users size={18} /></span>, title: 'Invite friends', description: 'You both get $10', trailing: <ChevronRight size={16} />, onClick: () => toast({ title: 'Invite link copied', tone: 'success' }) },
          { leading: <span className="tpl-icon-chip"><HelpCircle size={18} /></span>, title: 'Help and app status', trailing: <ChevronRight size={16} />, onClick: () => go('states') }
        ]}
      />
      <SectionTitle>Upgrade</SectionTitle>
      <PricingCard
        featured
        name={plus.name}
        price={`$${plus.monthly}`}
        period="/ month"
        description={plus.description}
        badge={<Badge variant="accent" size="sm"><Sparkles size={12} /> 30 days free</Badge>}
        features={plus.features.slice(1, 4)}
        cta={<Button onClick={() => toast({ title: 'Plus trial started', description: 'Enjoy unlimited goals.', tone: 'success' })}>Try Plus free</Button>}
      />
      <Card className="oa-rate">
        <span className="tpl-grow"><strong>Enjoying Orbit?</strong><br /><span className="tpl-faint oa-small">Tap a star to rate us</span></span>
        <Rating value={rating} onChange={(v) => { setRating(v); toast({ title: `Thanks for ${v} star${v > 1 ? 's' : ''}!`, tone: 'success' }); }} size={22} label="Rate Orbit" />
      </Card>
    </AppScreen>
  );
};

export const SettingsScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState({ push: true, email: false, faceId: true, roundUps: true });
  const [currency, setCurrency] = useState<string | null>('usd');
  const [theme, setTheme] = useState('system');
  const [textSize, setTextSize] = useState(100);
  const [language, setLanguage] = useState('en');
  const [langSheet, setLangSheet] = useState(false);
  const [signOut, setSignOut] = useState(false);
  const set = (k: keyof typeof prefs) => (v: boolean) => { setPrefs({ ...prefs, [k]: v }); toast({ title: 'Saved', tone: 'success', duration: 1500 }); };

  return (
    <AppScreen bar={<AppBar title="Settings" subtitle={<Breadcrumbs items={[{ label: 'Profile', onClick: () => go('profile') }, { label: 'Settings' }]} />} onBack={() => go('profile')} />}>
      <SectionTitle>Notifications</SectionTitle>
      <Card className="tpl-stack">
        <Toggle checked={prefs.push} onChange={set('push')} label="Push notifications" />
        <Toggle checked={prefs.email} onChange={set('email')} label="Monthly email summary" />
      </Card>
      <SectionTitle>Security and saving</SectionTitle>
      <Card className="tpl-stack">
        <Toggle checked={prefs.faceId} onChange={set('faceId')} label="Approve payments with Face ID" />
        <Toggle checked={prefs.roundUps} onChange={set('roundUps')} label="Round up card purchases" />
      </Card>
      <SectionTitle>Display</SectionTitle>
      <Card className="tpl-stack">
        <Select label="Main currency" value={currency} onChange={setCurrency} options={CURRENCIES} />
        <fieldset className="oa-fieldset">
          <legend className="ui-input-label">Appearance</legend>
          <Radio name="theme" label="Match my phone" checked={theme === 'system'} onChange={() => setTheme('system')} />
          <Radio name="theme" label="Light" checked={theme === 'light'} onChange={() => setTheme('light')} />
          <Radio name="theme" label="Dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} />
        </fieldset>
        <Slider label="Text size" value={textSize} onChange={setTextSize} min={80} max={140} step={10} format={(v) => `${v}%`} />
        <p className="oa-preview-text" style={{ fontSize: `${textSize}%` }}>This is how text will look in Orbit.</p>
      </Card>
      <List items={[{ leading: <span className="tpl-icon-chip"><Globe size={18} /></span>, title: 'Language', description: LANGUAGES.find((l) => l.value === language)?.label, trailing: <ChevronRight size={16} />, onClick: () => setLangSheet(true) }]} />
      <SectionTitle>Help</SectionTitle>
      <Accordion items={FAQ.slice(0, 3)} />
      <Button variant="destructive" fullWidth icon={<LogOut size={16} />} onClick={() => setSignOut(true)} data-opens="Modal">Sign out</Button>
      <p className="tpl-faint oa-small oa-center">Orbit 4.12.0 (demo)</p>

      <Drawer open={langSheet} onClose={() => setLangSheet(false)} side="bottom" title="Language">
        <List items={LANGUAGES.map((l) => ({ title: l.label, selected: l.value === language, trailing: l.value === language ? <Star size={14} /> : undefined, onClick: () => { setLanguage(l.value); setLangSheet(false); } }))} />
      </Drawer>
      <Modal
        open={signOut}
        onClose={() => setSignOut(false)}
        size="sm"
        role="alertdialog"
        title="Sign out of Orbit?"
        description="You'll need your password or Face ID to get back in."
        footer={<><Button variant="ghost" onClick={() => setSignOut(false)}>Cancel</Button><Button variant="destructive" onClick={() => { setSignOut(false); go('welcome'); }}>Sign out</Button></>}
      />
    </AppScreen>
  );
};

type SystemState = 'loading' | 'empty' | 'error' | 'offline';

export const StatesScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [state, setState] = useState<SystemState>('loading');
  return (
    <AppScreen bar={<AppBar title="App states" subtitle="Loading, empty, error and offline" onBack={() => go('profile')} />}>
      <Segmented label="State" value={state} onChange={setState} options={[{ value: 'loading', label: 'Loading' }, { value: 'empty', label: 'Empty' }, { value: 'error', label: 'Error' }, { value: 'offline', label: 'Offline' }]} className="oa-full" size="sm" />
      {state === 'loading' && (
        <div className="tpl-stack" aria-busy="true">
          <span className="tpl-row tpl-muted"><Spinner size={16} label="Loading" /> Fetching your accounts…</span>
          <Progress value={0} indeterminate label="Syncing with your bank" />
          <Card className="tpl-stack"><Skeleton width="40%" height={14} /><Skeleton height={32} /><Skeleton height={48} /></Card>
          {Array.from({ length: 3 }, (_, i) => <div key={i} className="tpl-row"><Skeleton circle width={40} height={40} /><div className="tpl-grow tpl-stack tpl-stack--tight"><Skeleton width="55%" height={14} /><Skeleton width="80%" height={12} /></div></div>)}
        </div>
      )}
      {state === 'empty' && (
        <Card><EmptyState icon={<Inbox size={28} />} title="No transactions yet" description="Make your first card payment or add money to see it here." action={<Button size="sm" onClick={() => go('wallet')}>Add money</Button>} /></Card>
      )}
      {state === 'error' && (
        <div className="tpl-stack">
          <Alert tone="error" title="We couldn't load your balance" action={<Button size="sm" variant="secondary" icon={<RefreshCw size={14} />} onClick={() => { setState('loading'); toast({ title: 'Retrying…' }); }}>Try again</Button>}>
            Your bank is not responding. Your money is safe.
          </Alert>
          <Card><EmptyState icon={<ServerCrash size={28} />} title="Something went wrong on our side" description="We have been notified. Reference: ORB-4821." /></Card>
        </div>
      )}
      {state === 'offline' && (
        <div className="tpl-stack">
          <Alert tone="warning" title="You're offline">Showing balances from 09:12. Payments will send when you reconnect.</Alert>
          <Card><EmptyState icon={<WifiOff size={28} />} title="No connection" description="Check Wi-Fi or mobile data." action={<Button size="sm" variant="secondary" onClick={() => setState('loading')}>Retry</Button>} /></Card>
        </div>
      )}
      <Alert tone="success" title="All systems normal" onClose={() => toast({ title: 'Status updates hidden' })}>Card payments, transfers and bank syncing are working.</Alert>
    </AppScreen>
  );
};

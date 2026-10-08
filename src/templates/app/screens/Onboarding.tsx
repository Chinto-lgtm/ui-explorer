import React, { useState } from 'react';
import { Wallet, Target, ShieldCheck, Mail, Phone, Lock, ScanFace, Bell, MapPin, MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Segmented, Combobox, Toggle, Checkbox } from '../../../components/ui/Selection';
import { Alert, Spinner, useToast } from '../../../components/ui/Feedback';
import { List } from '../../../components/ui/DataDisplay';
import { Carousel } from '../../../components/ui/Content';
import { AppBar, PinInput } from '../../../components/ui/Mobile';
import { Backdrop } from '../../../components/svg/Backdrop';
import { useTemplateNav } from '../../nav';
import { Media } from '../../shared/Media';
import { OrbitMark } from '../../shared/Logo';
import { AppScreen } from '../AppLayout';
import { BRAND, COUNTRIES, USER } from '../../content';

export const SplashScreen: React.FC = () => {
  const { go } = useTemplateNav();
  return (
    <AppScreen className="oa-splash">
      <Backdrop fit="cover" preset="glow" seed={2} intensity={0.8} className="oa-splash__art" />
      <div className="oa-splash__brand">
        <OrbitMark size={72} />
        <span className="oa-splash__name">{BRAND.name}</span>
        <span className="tpl-muted">{BRAND.tagline}</span>
      </div>
      <div className="oa-splash__foot">
        <span className="tpl-row tpl-muted"><Spinner size={16} label="Securing your connection" /> Securing your connection…</span>
        <Button fullWidth size="lg" onClick={() => go('welcome')}>Continue</Button>
      </div>
    </AppScreen>
  );
};

const SLIDES = [
  { seed: 1, icon: <Wallet size={22} />, title: 'Budgets that adapt', text: 'Limits learn from your month and nudge you before you overspend.' },
  { seed: 3, icon: <Target size={22} />, title: 'Goals on autopilot', text: 'Round-ups and rules quietly fund the things you care about.' },
  { seed: 6, icon: <ShieldCheck size={22} />, title: 'Safe by design', text: 'Face ID, instant card freeze and read-only bank links.' }
];

export const WelcomeScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const [slide, setSlide] = useState(0);
  return (
    <AppScreen
      className="oa-welcome"
      footer={(
        <div className="tpl-stack tpl-stack--tight">
          {slide < SLIDES.length - 1
            ? <Button fullWidth size="lg" icon={<ArrowRight size={18} />} iconPosition="right" onClick={() => setSlide(slide + 1)}>Next</Button>
            : <Button fullWidth size="lg" onClick={() => go('signin')}>Create account</Button>}
          <Button fullWidth variant="ghost" onClick={() => go('signin')}>I already have an account</Button>
        </div>
      )}
    >
      <div className="tpl-row tpl-row--between">
        <OrbitMark size={28} />
        <button type="button" className="oa-link" onClick={() => go('signin')}>Skip</button>
      </div>
      <Carousel
        label="Introduction"
        index={slide}
        onIndexChange={setSlide}
        showArrows={false}
        slides={SLIDES.map((s) => (
          <div key={s.title} className="oa-slide">
            <Media seed={s.seed} label={s.title} ratio="1 / 1" icon={s.icon} />
            <h1 className="oa-h1">{s.title}</h1>
            <p className="tpl-muted">{s.text}</p>
          </div>
        ))}
      />
    </AppScreen>
  );
};

export const SignInScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState(USER.email);
  const [country, setCountry] = useState<string | null>('united-states');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [faceId, setFaceId] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'email' && password.length < 6) { setError('Use at least 6 characters. Any password works in this demo.'); return; }
    if (method === 'phone' && phone.replace(/\D/g, '').length < 7) { setError('Enter a phone number with at least 7 digits.'); return; }
    setError(null);
    setBusy(true);
    window.setTimeout(() => { setBusy(false); go('verify'); }, 800);
  };

  return (
    <AppScreen bar={<AppBar variant="large" title="Welcome back" subtitle="Sign in to Orbit" onBack={() => go('welcome')} />}>
      <form className="oa-form" onSubmit={submit}>
        <Segmented label="Sign in with" value={method} onChange={(m) => { setMethod(m); setError(null); }} options={[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }]} className="oa-full" />
        {method === 'email' ? (
          <>
            <Input label="Email" type="email" icon={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Input label="Password" type="password" icon={<Lock size={16} />} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </>
        ) : (
          <>
            <Combobox label="Country" options={COUNTRIES} value={country} onChange={setCountry} placeholder="Search countries…" />
            <Input label="Phone number" type="tel" icon={<Phone size={16} />} placeholder="555 0134 221" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          </>
        )}
        <Toggle checked={faceId} onChange={setFaceId} label={<span className="tpl-row"><ScanFace size={16} /> Use Face ID next time</span>} />
        {error && <Alert tone="error">{error}</Alert>}
        <Button type="submit" size="lg" fullWidth isLoading={busy}>Continue</Button>
        <div className="oa-divider"><span>or</span></div>
        <Button type="button" variant="secondary" fullWidth onClick={() => toast({ title: 'Sign in with Apple', description: 'Opens the system sheet in the real app.' })}>Continue with Apple</Button>
        <button type="button" className="oa-link oa-center" onClick={() => toast({ title: 'Reset link sent', tone: 'success', description: `Check ${email}.` })}>Forgot password?</button>
      </form>
    </AppScreen>
  );
};

export const VerifyScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const verify = (value: string) => {
    if (value === '000000') { setError('That code has expired. Try any other 6 digits.'); return; }
    setError(undefined);
    setBusy(true);
    window.setTimeout(() => { setBusy(false); go('permissions'); }, 700);
  };

  return (
    <AppScreen
      bar={<AppBar variant="large" title="Enter your code" subtitle="Sent by SMS to •••• 21" onBack={() => go('signin')} />}
      footer={<Button fullWidth size="lg" disabled={code.length < 6 || busy} isLoading={busy} onClick={() => verify(code)}>Verify</Button>}
    >
      <p className="tpl-muted oa-p">We sent a 6-digit code to keep your account safe. It expires in 10 minutes.</p>
      <PinInput label="Verification code" value={code} onChange={(v) => { setCode(v); setError(undefined); }} onComplete={verify} error={error} disabled={busy} />
      {busy && <span className="tpl-row tpl-muted"><Spinner size={16} label="Checking code" /> Checking…</span>}
      <div className="tpl-row tpl-row--between oa-p">
        <span className="tpl-faint">Didn't get it?</span>
        <button type="button" className="oa-link" onClick={() => toast({ title: 'New code sent', tone: 'success' })}>Resend code</button>
      </div>
    </AppScreen>
  );
};

export const PermissionsScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const [perms, setPerms] = useState({ notifications: true, faceId: true, location: false, messages: true });
  const [terms, setTerms] = useState(false);
  const set = (key: keyof typeof perms) => (v: boolean) => setPerms({ ...perms, [key]: v });

  return (
    <AppScreen
      bar={<AppBar variant="large" title="Almost there" subtitle="Choose what Orbit can do. Change it any time." />}
      footer={<Button fullWidth size="lg" disabled={!terms} onClick={() => go('home')}>Finish setup</Button>}
    >
      <List
        items={[
          { leading: <span className="tpl-icon-chip"><Bell size={18} /></span>, title: 'Notifications', description: 'Budget nudges and payments', trailing: <Toggle checked={perms.notifications} onChange={set('notifications')} label={<span className="tpl-sr">Notifications</span>} /> },
          { leading: <span className="tpl-icon-chip"><ScanFace size={18} /></span>, title: 'Face ID', description: 'Unlock and approve payments', trailing: <Toggle checked={perms.faceId} onChange={set('faceId')} label={<span className="tpl-sr">Face ID</span>} /> },
          { leading: <span className="tpl-icon-chip"><MapPin size={18} /></span>, title: 'Location', description: 'Smarter fraud checks abroad', trailing: <Toggle checked={perms.location} onChange={set('location')} label={<span className="tpl-sr">Location</span>} /> },
          { leading: <span className="tpl-icon-chip"><MessageSquare size={18} /></span>, title: 'Support messages', description: 'Replies from our team', trailing: <Toggle checked={perms.messages} onChange={set('messages')} label={<span className="tpl-sr">Support messages</span>} /> }
        ]}
      />
      <Alert tone="info" title="Your data stays yours">Orbit never sells data. Bank connections are read-only.</Alert>
      <Checkbox label="I agree to the Terms and Privacy Policy" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
    </AppScreen>
  );
};

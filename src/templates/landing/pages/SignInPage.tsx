import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowLeft, Apple, Globe, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { Tabs } from '../../../components/ui/Navigation';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Toggle } from '../../../components/ui/Selection';
import { Button } from '../../../components/ui/Button';
import { Alert, Spinner, useToast } from '../../../components/ui/Feedback';
import { PinInput } from '../../../components/ui/Mobile';
import { Testimonial } from '../../../components/ui/Content';
import { Backdrop } from '../../../components/svg/Backdrop';
import { useTemplateNav } from '../../nav';
import { Logo } from '../../shared/Logo';
import { TESTIMONIALS, USER } from '../../content';

type Step = 'form' | 'code' | 'done';

export const SignInPage: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [mode, setMode] = useState('signin');
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState(USER.email);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setError(password.length < 6 ? 'Passwords are at least 6 characters. Try any 6 or more.' : 'That email does not look right.');
      return;
    }
    setError(null);
    setBusy(true);
    window.setTimeout(() => { setBusy(false); setStep('code'); }, 900);
  };

  const verify = (value: string) => {
    if (value === '000000') { setCodeError('That code has expired. Any other 6 digits will work.'); return; }
    setCodeError(undefined);
    setBusy(true);
    window.setTimeout(() => { setBusy(false); setStep('done'); }, 800);
  };

  return (
    <section className="ls-auth">
      <div className="ls-container ls-auth__grid">
        <Card className="ls-auth__card">
          {step === 'form' && (
            <form className="ls-form" onSubmit={submit}>
              <Logo />
              <Tabs label="Account" variant="enclosed" value={mode} onChange={(m) => { setMode(m); setError(null); }} tabs={[{ id: 'signin', label: 'Sign in' }, { id: 'signup', label: 'Create account' }]} />
              <div className="ls-auth__social">
                <Button type="button" variant="secondary" icon={<Apple size={16} />} onClick={() => toast({ title: 'Apple sign-in', description: 'Opens the Apple sheet in the real product.' })}>Apple</Button>
                <Button type="button" variant="secondary" icon={<Globe size={16} />} onClick={() => toast({ title: 'Google sign-in', description: 'Opens the Google sheet in the real product.' })}>Google</Button>
              </div>
              <div className="ls-divider"><span>or with email</span></div>
              {mode === 'signup' && <Input label="Your name" icon={<UserIcon size={16} />} value={name} onChange={(e) => setName(e.target.value)} placeholder="Sam Rivera" />}
              <Input label="Email" type="email" icon={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <Input label="Password" type="password" icon={<Lock size={16} />} value={password} onChange={(e) => setPassword(e.target.value)} helperText={mode === 'signup' ? 'At least 6 characters' : undefined} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              <div className="tpl-row tpl-row--between">
                <Toggle size="sm" checked={remember} onChange={setRemember} label="Remember me" />
                {mode === 'signin' && <button type="button" className="ls-link" onClick={() => toast({ title: 'Reset link sent', description: `Check ${email}.`, tone: 'success' })}>Forgot password?</button>}
              </div>
              {error && <Alert tone="error" title="We couldn't sign you in">{error}</Alert>}
              <Button type="submit" size="lg" fullWidth isLoading={busy}>{mode === 'signin' ? 'Sign in' : 'Create free account'}</Button>
              <p className="tpl-faint ls-auth__fine">By continuing you agree to the Terms and Privacy Policy. This is a demo: nothing is sent.</p>
            </form>
          )}

          {step === 'code' && (
            <div className="ls-form">
              <button type="button" className="ls-back" onClick={() => setStep('form')}><ArrowLeft size={16} /> Back</button>
              <span className="tpl-icon-chip"><ShieldCheck size={20} /></span>
              <h1 className="ls-h2">Check your phone</h1>
              <p className="tpl-muted">We sent a 6-digit code to the number ending in 21. Enter it below.</p>
              <PinInput label="Verification code" value={code} onChange={(v) => { setCode(v); setCodeError(undefined); }} onComplete={verify} error={codeError} disabled={busy} />
              {busy ? (
                <div className="tpl-row tpl-muted"><Spinner size={18} label="Checking code" /> Checking…</div>
              ) : (
                <Button fullWidth disabled={code.length < 6} onClick={() => verify(code)}>Verify</Button>
              )}
              <button type="button" className="ls-link" onClick={() => toast({ title: 'New code sent', tone: 'success' })}>Send a new code</button>
            </div>
          )}

          {step === 'done' && (
            <div className="ls-form ls-auth__done">
              <CheckCircle2 size={44} className="tpl-positive" />
              <h1 className="ls-h2">{mode === 'signin' ? `Welcome back, ${USER.first}` : 'Your account is ready'}</h1>
              <p className="tpl-muted">Everything else happens in the app. Scan the code in your email, or keep exploring the site.</p>
              <Button fullWidth onClick={() => go('home')}>Back to the homepage</Button>
              <Button fullWidth variant="ghost" onClick={() => { setStep('form'); setCode(''); setPassword(''); }}>Sign out</Button>
            </div>
          )}
        </Card>

        <div className="ls-auth__aside">
          <Backdrop fit="cover" preset="aurora" seed={21} intensity={0.75} className="ls-auth__art" />
          <div className="ls-auth__quote">
            <Testimonial variant="card" {...TESTIMONIALS[1]} />
          </div>
        </div>
      </div>
    </section>
  );
};

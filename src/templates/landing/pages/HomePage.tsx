import React, { useState } from 'react';
import { ArrowRight, PlayCircle, Wallet, Target, LineChart as LineIcon, Users, ShieldCheck, Zap, Info, Lock, Fingerprint, Snowflake, Play } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Stat, AvatarGroup } from '../../../components/ui/DataDisplay';
import { Stepper } from '../../../components/ui/Navigation';
import { Slider } from '../../../components/ui/Selection';
import { Tooltip } from '../../../components/ui/Overlay';
import { Carousel, Rating, Testimonial } from '../../../components/ui/Content';
import { ChatBubble } from '../../../components/ui/Mobile';
import { Waveform } from '../../../components/charts/RadialCharts';
import { Backdrop } from '../../../components/svg/Backdrop';
import { useTemplateNav } from '../../nav';
import { useNarrow } from '../viewport';
import { PhoneMock, SectionHead, CtaBand } from '../blocks';
import { BRAND, FEATURES, PRESS, STATS, STEPS, TESTIMONIALS, WAVE, money } from '../../content';

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  budgets: <Wallet size={20} />, goals: <Target size={20} />, insights: <LineIcon size={20} />,
  shared: <Users size={20} />, security: <ShieldCheck size={20} />, transfers: <Zap size={20} />
};

const STEP_DETAIL = [
  'Pick your bank from 12,000 supported institutions. Orbit gets read-only access — it can never move money from your bank.',
  'Orbit reads three months of history and drafts budgets that match how you actually live. Adjust anything with a drag.',
  'Turn on round-ups and rules like “move 10% of every paycheque”. Money flows to your goals automatically.',
  'Your savings line climbs while you get on with life. Orbit only speaks up when something needs you.'
];

export const HomePage: React.FC = () => {
  const { go } = useTemplateNav();
  const narrow = useNarrow();
  const [step, setStep] = useState(2);
  const [spend, setSpend] = useState(1800);
  const [percent, setPercent] = useState(5);
  const yearly = Math.round(spend * 12 * (percent / 100) + spend * 0.02 * 12);

  return (
    <>
      {/* Hero */}
      <section className="ls-hero">
        <Backdrop fit="cover" preset="mesh" seed={3} intensity={0.45} className="ls-hero__art" />
        <div className="ls-container ls-hero__grid">
          <div className="ls-hero__copy">
            <Badge variant="outline"><span className="tpl-accent">●</span> Shared wallets are here</Badge>
            <h1 className="ls-h1">{BRAND.tagline}.</h1>
            <p className="ls-lead">{BRAND.pitch}</p>
            <div className="ls-actions">
              <Button size="lg" icon={<ArrowRight size={18} />} iconPosition="right" onClick={() => go('signin')}>Get started free</Button>
              <Button size="lg" variant="secondary" icon={<PlayCircle size={18} />} onClick={() => go('features')}>See how it works</Button>
            </div>
            <div className="ls-proof">
              <AvatarGroup names={['Maya Chen', 'Jordan Okafor', 'Lucía Moreno', 'Theo Becker', 'Ana Duarte', 'Kenji Watanabe']} max={4} />
              <div className="ls-proof__text">
                <Rating value={4.9} size={14} label="Average rating" showValue />
                <span className="tpl-faint">from 86,000 reviews</span>
              </div>
            </div>
          </div>
          <div className="ls-hero__visual">
            <PhoneMock />
          </div>
        </div>
      </section>

      {/* Press strip */}
      <section className="ls-press" aria-label="As featured in">
        <div className="ls-container ls-press__row">
          <span className="ls-press__label">As featured in</span>
          {PRESS.map((p) => <span key={p} className="ls-press__logo">{p}</span>)}
        </div>
      </section>

      {/* Features */}
      <section className="ls-section">
        <div className="ls-container">
          <SectionHead center eyebrow="Features" title="Everything your money needs, nothing it doesn't" lead="Six tools that work together quietly in the background." />
          <div className="ls-grid ls-grid--3">
            {FEATURES.map((f) => (
              <Card key={f.id} hoverable className="ls-feature">
                <span className="tpl-icon-chip">{FEATURE_ICONS[f.id]}</span>
                <h3 className="ls-h3">
                  {f.title}
                  {f.id === 'security' && (
                    <Tooltip content="Audited yearly by an independent security firm">
                      <button type="button" className="ls-info" aria-label="About our security"><Info size={14} /></button>
                    </Tooltip>
                  )}
                </h3>
                <p className="tpl-muted">{f.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="ls-section ls-section--tint" aria-label="Orbit in numbers">
        <div className="ls-container ls-grid ls-grid--4">
          {STATS.map((s) => <Card key={s.label} variant="flat" className="ls-stat"><Stat label={s.label} value={s.value} delta={s.delta} /></Card>)}
        </div>
      </section>

      {/* How it works */}
      <section className="ls-section">
        <div className="ls-container">
          <SectionHead center eyebrow="How it works" title="From sign-up to savings in four steps" />
          <Card className="ls-steps">
            <Stepper steps={STEPS} current={step} onStepClick={setStep} className={narrow ? 'ls-stepper--compact' : ''} />
            <div className="ls-steps__detail">
              <Badge variant="accent" size="sm">Step {step + 1}</Badge>
              <p>{STEP_DETAIL[step]}</p>
              <div className="ls-actions">
                <Button variant="secondary" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
                <Button size="sm" disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>Next step</Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Savings calculator */}
      <section className="ls-section ls-section--tint">
        <div className="ls-container ls-split">
          <SectionHead eyebrow="Calculator" title="How much could Orbit save you?" lead="Drag the sliders. Round-ups plus one simple rule add up faster than you think." />
          <Card className="ls-calc">
            <Slider label="Monthly spending" value={spend} onChange={setSpend} min={500} max={6000} step={100} format={(v) => money(v)} />
            <Slider label="Save from every paycheque" value={percent} onChange={setPercent} min={0} max={20} format={(v) => `${v}%`} />
            <div className="ls-calc__result">
              <Stat label="Saved in a year" value={<span className="tpl-num">{money(yearly)}</span>} delta="Estimate" />
              <Button onClick={() => go('signin')} icon={<ArrowRight size={16} />} iconPosition="right">Start saving</Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="ls-section">
        <div className="ls-container">
          <SectionHead center eyebrow="Loved by savers" title="People who stopped dreading payday" />
          <Carousel
            label="Testimonials"
            slidesPerView={narrow ? 1.08 : 3}
            showArrows={!narrow}
            slides={TESTIMONIALS.map((t) => <Testimonial key={t.name} quote={t.quote} name={t.name} role={t.role} rating={t.rating} className="ls-quote" />)}
          />
        </div>
      </section>

      {/* Security and support */}
      <section className="ls-section ls-section--tint">
        <div className="ls-container ls-split">
          <div className="tpl-stack">
            <SectionHead eyebrow="Security" title="Safe by design, human when it matters" lead="Your money sits with regulated partner banks. Your questions reach real people in minutes." />
            <ul className="ls-checks">
              <li><Lock size={16} /> Read-only bank connections</li>
              <li><Fingerprint size={16} /> Face ID and fingerprint sign-in</li>
              <li><Snowflake size={16} /> Freeze any card in one tap</li>
            </ul>
            <div><Button variant="outline" onClick={() => go('features')}>Explore security</Button></div>
          </div>
          <Card className="ls-chat">
            <div className="ls-chat__head"><span className="ls-dot" /> Orbit Support · replies in ~3 min</div>
            <ChatBubble from="me" time="09:12" status="read">I think my card was charged twice at the grocery store.</ChatBubble>
            <ChatBubble from="them" author="Diego Alvarez" time="09:14">Found it — the second charge was a pre-authorisation. It drops off tonight, nothing to do.</ChatBubble>
            <ChatBubble from="them" author="Diego Alvarez" grouped time="09:14">
              <span className="ls-voice"><Play size={14} /><span className="tpl-grow"><Waveform samples={WAVE} height={26} progress={0.35} animate={false} /></span>0:14</span>
            </ChatBubble>
            <ChatBubble from="me" time="09:15" status="delivered">That was fast. Thank you!</ChatBubble>
          </Card>
        </div>
      </section>

      <CtaBand />
    </>
  );
};

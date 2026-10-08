import React, { useState } from 'react';
import { Sparkles, GraduationCap, Info } from 'lucide-react';
import { Segmented, Toggle, Radio, Checkbox } from '../../../components/ui/Selection';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Overlay';
import { Alert, useToast } from '../../../components/ui/Feedback';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { Accordion, PricingCard } from '../../../components/ui/Content';
import { useTemplateNav } from '../../nav';
import { PageHero, SectionHead, CtaBand } from '../blocks';
import { COMPARE, FAQ, PLANS } from '../../content';
import type { CompareRow } from '../../content';

const COLUMNS: Column<CompareRow>[] = [
  { id: 'feature', header: 'Feature', cell: (r) => <strong>{r.feature}</strong> },
  { id: 'free', header: 'Free', cell: (r) => r.free, align: 'center' },
  { id: 'plus', header: 'Plus', cell: (r) => r.plus, align: 'center' },
  { id: 'family', header: 'Family', cell: (r) => r.family, align: 'center' }
];

export const PricingPage: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [student, setStudent] = useState(false);
  const [trial, setTrial] = useState<string | null>(null);
  const [trialBilling, setTrialBilling] = useState('yearly');
  const [agree, setAgree] = useState(false);

  const price = (plan: (typeof PLANS)[number]) => {
    const base = billing === 'monthly' ? plan.monthly : plan.yearly / 12;
    const value = student ? base / 2 : base;
    return value === 0 ? '$0' : `$${value % 1 ? value.toFixed(2) : value}`;
  };

  const trialPlan = PLANS.find((p) => p.id === trial);

  return (
    <>
      <PageHero eyebrow="Pricing" title="Simple, fair pricing" lead="Start free. Upgrade when automation and shared wallets are worth it to you. Cancel in two taps.">
        <div className="ls-pricing-controls">
          <Segmented
            label="Billing period"
            value={billing}
            onChange={setBilling}
            options={[{ value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: <span className="tpl-row">Yearly <Badge size="sm" variant="success">−17%</Badge></span> }]}
          />
          <Toggle checked={student} onChange={setStudent} label={<span className="tpl-row"><GraduationCap size={16} /> Student pricing (50% off)</span>} />
        </div>
      </PageHero>

      <section className="ls-section ls-section--tight">
        <div className="ls-container ls-grid ls-grid--3 ls-plans">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              price={price(plan)}
              period={plan.monthly === 0 ? 'forever' : billing === 'monthly' ? '/ month' : '/ month, billed yearly'}
              description={plan.description}
              features={plan.features}
              featured={plan.featured}
              badge={plan.featured ? <Badge variant="accent" size="sm"><Sparkles size={12} /> Most popular</Badge> : undefined}
              cta={plan.monthly === 0
                ? <Button variant="secondary" onClick={() => go('signin')}>Start free</Button>
                : <Button variant={plan.featured ? 'primary' : 'outline'} onClick={() => setTrial(plan.id)} data-opens="Modal">Try {plan.name} free for 30 days</Button>}
            />
          ))}
        </div>
        <div className="ls-container">
          <Alert tone="info" title="Prices in US dollars">Local taxes may apply. Family includes up to six members; each gets their own card and app.</Alert>
        </div>
      </section>

      <section className="ls-section">
        <div className="ls-container">
          <SectionHead center eyebrow="Compare" title="Every plan, side by side" />
          <DataTable caption="Plan comparison" columns={COLUMNS} rows={COMPARE} rowKey={(r) => r.id} selectable={false} pageSize={10} />
        </div>
      </section>

      <section className="ls-section ls-section--tint">
        <div className="ls-container ls-split ls-split--top">
          <div className="tpl-stack">
            <SectionHead eyebrow="FAQ" title="Questions, answered" lead="Still unsure? Our team replies in minutes." />
            <div><Button variant="secondary" onClick={() => go('contact')}>Contact us</Button></div>
          </div>
          <Accordion items={FAQ} defaultOpen={['safe']} />
        </div>
      </section>

      <CtaBand />

      <Modal
        open={trial !== null}
        onClose={() => setTrial(null)}
        title={`Start your ${trialPlan?.name ?? ''} trial`}
        description="30 days free. We remind you three days before it ends."
        footer={(
          <>
            <Button variant="ghost" onClick={() => setTrial(null)}>Not now</Button>
            <Button
              disabled={!agree}
              onClick={() => { setTrial(null); setAgree(false); toast({ tone: 'success', title: `${trialPlan?.name} trial started`, description: 'Download the app to finish setting up.' }); }}
            >
              Start free trial
            </Button>
          </>
        )}
      >
        <div className="tpl-stack">
          <div className="tpl-stack tpl-stack--tight" role="radiogroup" aria-label="Billing after the trial">
            <Radio name="trial-billing" label="Yearly" description={`$${trialPlan?.yearly ?? 0} a year — two months free`} checked={trialBilling === 'yearly'} onChange={() => setTrialBilling('yearly')} />
            <Radio name="trial-billing" label="Monthly" description={`$${trialPlan?.monthly ?? 0} a month`} checked={trialBilling === 'monthly'} onChange={() => setTrialBilling('monthly')} />
          </div>
          <Card variant="flat" className="ls-note"><Info size={16} /> No charge today. Cancel any time in Settings.</Card>
          <Checkbox label="I agree to the terms and the trial reminder email" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        </div>
      </Modal>
    </>
  );
};

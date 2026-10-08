import React, { useState } from 'react';
import { MoreVertical, Pencil, Share2, Trash2, Plane, PiggyBank, Plus, CheckCircle2, CalendarDays, UserPlus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Input, Textarea } from '../../../components/ui/Input';
import { Tabs, Stepper } from '../../../components/ui/Navigation';
import { Select, MultiSelect, Slider, Segmented, Radio, Toggle } from '../../../components/ui/Selection';
import { Drawer, Modal, DropdownMenu } from '../../../components/ui/Overlay';
import { ProgressRing, EmptyState, useToast } from '../../../components/ui/Feedback';
import { Stat, Avatar, AvatarGroup, List, Timeline } from '../../../components/ui/DataDisplay';
import { Chip } from '../../../components/ui/Content';
import { AppBar } from '../../../components/ui/Mobile';
import { LineChart } from '../../../components/charts/LineChart';
import { Backdrop } from '../../../components/svg/Backdrop';
import { useTemplateNav } from '../../nav';
import { Media } from '../../shared/Media';
import { AppScreen } from '../AppLayout';
import { GOALS, GOAL_HISTORY, money } from '../../content';

const GOAL = GOALS[0];

const DEPOSITS = [
  { time: 'Aug 14', title: 'Round-ups', description: '+$12.40 from 9 purchases', tone: 'accent' as const },
  { time: 'Aug 10', title: 'Alex added $50', description: 'Shared goal contribution', tone: 'success' as const },
  { time: 'Aug 01', title: 'Payday rule', description: '+$200 · 10% of salary', tone: 'success' as const },
  { time: 'Jul 18', title: 'Boost', description: '+$100 one-off', tone: 'default' as const }
];

export const GoalScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [amount, setAmount] = useState(50);
  const [source, setSource] = useState('main');
  const [saved, setSaved] = useState(GOAL.saved);
  const pct = Math.min(100, Math.round((saved / GOAL.target) * 100));

  return (
    <AppScreen
      bar={(
        <AppBar
          variant="center"
          title={GOAL.name}
          subtitle={`Due ${GOAL.due}`}
          onBack={() => go('home')}
          actions={(
            <DropdownMenu
              align="end"
              trigger={<button type="button" className="oa-icon-btn" aria-label="Goal actions" data-opens="DropdownMenu Modal"><MoreVertical size={20} /></button>}
              items={[
                { id: 'edit', label: 'Edit goal', icon: <Pencil size={14} />, onSelect: () => go('create') },
                { id: 'share', label: 'Invite someone', icon: <Share2 size={14} />, onSelect: () => toast({ title: 'Invite link copied', tone: 'success' }) },
                'separator',
                { id: 'delete', label: 'Delete goal', icon: <Trash2 size={14} />, danger: true, onSelect: () => setConfirm(true) }
              ]}
            />
          )}
        />
      )}
      footer={<Button fullWidth size="lg" icon={<Plus size={18} />} onClick={() => setSheet(true)} data-opens="Drawer">Add money</Button>}
    >
      <div className="oa-goal-hero">
        <Media seed={2} label="Mount Fuji at sunrise" ratio="16 / 10" icon={<Plane size={22} />} />
        <div className="oa-goal-hero__ring"><ProgressRing value={pct} size={84} strokeWidth={8} label="Goal progress" tone={pct > 70 ? 'success' : 'accent'} /></div>
      </div>
      <Tabs label="Goal sections" variant="pills" value={tab} onChange={setTab} tabs={[{ id: 'overview', label: 'Overview' }, { id: 'history', label: 'History' }, { id: 'members', label: 'Members' }]} className="oa-full" />
      {tab === 'overview' && (
        <>
          <div className="oa-grid-2">
            <Card variant="flat"><Stat label="Saved" value={<span className="tpl-num">{money(saved)}</span>} delta={`${pct}%`} /></Card>
            <Card variant="flat"><Stat label="To go" value={<span className="tpl-num">{money(Math.max(0, GOAL.target - saved))}</span>} /></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Saving over time</CardTitle></CardHeader>
            <CardBody><LineChart data={GOAL_HISTORY} height={170} area /></CardBody>
          </Card>
          <div className="tpl-row tpl-row--wrap">
            <Chip size="sm" icon={<CalendarDays size={12} />}>On track for {GOAL.due}</Chip>
            <Chip size="sm">$200 / month rule</Chip>
            <Chip size="sm">Round-ups on</Chip>
          </div>
        </>
      )}
      {tab === 'history' && <Card><Timeline events={DEPOSITS} /></Card>}
      {tab === 'members' && (
        <>
          <div className="tpl-row"><AvatarGroup names={GOAL.members} size="md" /><span className="tpl-muted">{GOAL.members.length} people saving together</span></div>
          <List items={GOAL.members.map((m, i) => ({ leading: <Avatar name={m} size="md" />, title: m, description: i === 0 ? 'Owner · $2,210 added' : 'Member · $550 added', trailing: i === 0 ? <Badge size="sm">You</Badge> : undefined }))} />
          <Button variant="secondary" icon={<UserPlus size={16} />} onClick={() => toast({ title: 'Invite link copied', tone: 'success' })}>Invite someone</Button>
        </>
      )}

      <Drawer open={sheet} onClose={() => setSheet(false)} side="bottom" title="Add money to Japan trip">
        <div className="tpl-stack">
          <div className="oa-amount tpl-num">{money(amount)}</div>
          <Slider label="Amount" value={amount} onChange={setAmount} min={5} max={500} step={5} format={(v) => money(v)} />
          <Segmented label="From" value={source} onChange={setSource} options={[{ value: 'main', label: 'Main account' }, { value: 'vault', label: 'Vault' }]} className="oa-full" />
          <Button fullWidth onClick={() => { setSaved(saved + amount); setSheet(false); toast({ tone: 'success', title: `${money(amount)} added`, description: `${GOAL.name} is now ${Math.min(100, Math.round(((saved + amount) / GOAL.target) * 100))}% funded.` }); }}>Add {money(amount)}</Button>
        </div>
      </Drawer>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        role="alertdialog"
        size="sm"
        title="Delete this goal?"
        description={`${money(saved)} moves back to your main account. This cannot be undone.`}
        footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>Keep it</Button><Button variant="destructive" onClick={() => { setConfirm(false); toast({ title: 'Goal deleted', tone: 'warning', action: { label: 'Undo', onClick: () => undefined } }); go('home'); }}>Delete</Button></>}
      />
    </AppScreen>
  );
};

const CATEGORY_OPTIONS = [
  { value: 'travel', label: 'Travel', description: 'Trips and holidays' },
  { value: 'safety', label: 'Safety net', description: 'Emergency fund' },
  { value: 'home', label: 'Home', description: 'Deposit, furniture, repairs' },
  { value: 'things', label: 'Things', description: 'Bikes, laptops, gifts' }
];

export const CreateGoalScreen: React.FC = () => {
  const { go } = useTemplateNav();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Lisbon weekend');
  const [category, setCategory] = useState<string | null>('travel');
  const [target, setTarget] = useState(800);
  const [date, setDate] = useState('2025-12-12');
  const [frequency, setFrequency] = useState('weekly');
  const [roundUps, setRoundUps] = useState(true);
  const [members, setMembers] = useState<string[]>(['alex']);
  const [note, setNote] = useState('');
  const perWeek = Math.ceil(target / 17);
  const canNext = step !== 0 || (name.trim().length > 0 && category !== null);

  return (
    <AppScreen
      bar={<AppBar title="New goal" subtitle={`Step ${step + 1} of 3`} onBack={() => (step === 0 ? go('home') : setStep(step - 1))} />}
      footer={(
        <div className="oa-footer-row">
          {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 2
            ? <Button className="tpl-grow" disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</Button>
            : <Button className="tpl-grow" onClick={() => go('created')}>Create goal</Button>}
        </div>
      )}
    >
      <Stepper current={step} onStepClick={(i) => i < step && setStep(i)} steps={[{ label: 'Name' }, { label: 'Plan' }, { label: 'Review' }]} className="oa-stepper" />
      {step === 0 && (
        <div className="oa-form">
          <Input label="What are you saving for?" value={name} onChange={(e) => setName(e.target.value)} error={name.trim() ? undefined : 'Give your goal a name'} />
          <Select label="Category" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
          <Media seed={7} label="Goal cover" ratio="16 / 9" icon={<PiggyBank size={22} />} />
        </div>
      )}
      {step === 1 && (
        <div className="oa-form">
          <div className="oa-amount tpl-num">{money(target)}</div>
          <Slider label="Target" value={target} onChange={setTarget} min={100} max={5000} step={50} format={(v) => money(v)} />
          <Input label="Target date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <fieldset className="oa-fieldset">
            <legend className="ui-input-label">Save automatically</legend>
            <Radio name="freq" label="Every week" description={`About ${money(perWeek)} a week`} checked={frequency === 'weekly'} onChange={() => setFrequency('weekly')} />
            <Radio name="freq" label="Every payday" description={`About ${money(perWeek * 4)} a month`} checked={frequency === 'payday'} onChange={() => setFrequency('payday')} />
            <Radio name="freq" label="Only when I add money" checked={frequency === 'manual'} onChange={() => setFrequency('manual')} />
          </fieldset>
          <Toggle checked={roundUps} onChange={setRoundUps} label="Add round-ups from card purchases" />
        </div>
      )}
      {step === 2 && (
        <div className="oa-form">
          <Card className="oa-review">
            <span className="tpl-faint oa-small">{CATEGORY_OPTIONS.find((c) => c.value === category)?.label}</span>
            <strong className="oa-review__name">{name}</strong>
            <span className="tpl-num">{money(target)} by {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="tpl-faint oa-small">{frequency === 'manual' ? 'Manual top-ups' : frequency === 'weekly' ? `${money(perWeek)} every week` : `${money(perWeek * 4)} every payday`}{roundUps ? ' + round-ups' : ''}</span>
          </Card>
          <MultiSelect label="Save together with" placeholder="Just me" value={members} onChange={setMembers} options={[{ value: 'alex', label: 'Alex Kim' }, { value: 'maya', label: 'Maya Chen' }, { value: 'jordan', label: 'Jordan Okafor' }]} />
          <Textarea label="Note (optional)" rows={3} placeholder="Why this matters to you" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      )}
    </AppScreen>
  );
};

export const GoalCreatedScreen: React.FC = () => {
  const { go } = useTemplateNav();
  return (
    <AppScreen
      className="oa-success"
      footer={(
        <div className="tpl-stack tpl-stack--tight">
          <Button fullWidth size="lg" onClick={() => go('goal')}>View goal</Button>
          <Button fullWidth variant="ghost" onClick={() => go('home')}>Back to home</Button>
        </div>
      )}
    >
      <Backdrop fit="cover" preset="confetti" seed={4} intensity={0.8} className="oa-success__art" />
      <EmptyState icon={<CheckCircle2 size={32} />} title="Goal created" description="Lisbon weekend is set up. The first $47 moves on Monday." />
      <Card className="oa-grid-2 oa-success__stats">
        <Stat label="Target" value="$800" />
        <Stat label="Weekly" value="$47" delta="auto" />
      </Card>
    </AppScreen>
  );
};

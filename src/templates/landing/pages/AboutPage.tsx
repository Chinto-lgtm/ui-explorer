import React from 'react';
import { Heart, Lock, Scale, ChevronRight, MapPin, HelpCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Stat, Avatar, AvatarGroup, List, Timeline } from '../../../components/ui/DataDisplay';
import { Popover } from '../../../components/ui/Overlay';
import { useToast } from '../../../components/ui/Feedback';
import { Backdrop } from '../../../components/svg/Backdrop';
import { useTemplateNav } from '../../nav';
import { Media } from '../../shared/Media';
import { SectionHead, CtaBand } from '../blocks';
import { HISTORY, TEAM, VALUES } from '../../content';

const VALUE_ICONS = [<Heart key="h" size={18} />, <Lock key="l" size={18} />, <Scale key="s" size={18} />];

const ROLES = [
  { title: 'Senior iOS Engineer', team: 'Mobile', place: 'Lisbon or remote' },
  { title: 'Product Designer, Growth', team: 'Design', place: 'Remote (EU)' },
  { title: 'Fraud Data Scientist', team: 'Risk', place: 'London' },
  { title: 'Customer Specialist (Spanish)', team: 'Support', place: 'Madrid' }
];

export const AboutPage: React.FC = () => {
  const { go } = useTemplateNav();
  const { toast } = useToast();
  return (
    <>
      <section className="ls-about-hero">
        <Backdrop preset="blob" seed={12} intensity={0.6} className="ls-about-hero__art" />
        <div className="ls-container ls-about-hero__inner">
          <span className="ls-eyebrow">About Orbit</span>
          <h1 className="ls-h1 ls-h1--page">We build calm software for the most stressful thing people manage.</h1>
          <p className="ls-lead">Orbit started as a shared spreadsheet between two friends in Lisbon. Today 2.4 million people use it to plan, save and stop worrying.</p>
        </div>
      </section>

      <section className="ls-section ls-section--tight">
        <div className="ls-container ls-grid ls-grid--4">
          <Card variant="flat" className="ls-stat"><Stat label="People" value="140" delta="in 9 countries" /></Card>
          <Card variant="flat" className="ls-stat"><Stat label="Savers" value="2.4M" delta="+38% YoY" /></Card>
          <Card variant="flat" className="ls-stat"><Stat label="Countries served" value="31" /></Card>
          <Card variant="flat" className="ls-stat"><Stat label="Support reply" value="3 min" delta="median" /></Card>
        </div>
      </section>

      <section className="ls-section">
        <div className="ls-container ls-split ls-split--top">
          <div className="tpl-stack">
            <SectionHead eyebrow="Our story" title="Five years, one idea: money should feel lighter" />
            <Media seed={4} label="The Orbit team at work" ratio="4 / 3" icon={<Heart size={22} />} />
          </div>
          <Timeline events={HISTORY} />
        </div>
      </section>

      <section className="ls-section ls-section--tint">
        <div className="ls-container">
          <SectionHead center eyebrow="Team" title="The people behind Orbit" lead="A small team with backgrounds in banking, design and public health." />
          <div className="ls-grid ls-grid--4">
            {TEAM.map((p) => (
              <Card key={p.name} className="ls-person" hoverable>
                <Avatar name={p.name} size="lg" />
                <strong>{p.name}</strong>
                <span className="tpl-faint">{p.role}</span>
              </Card>
            ))}
          </div>
          <div className="ls-team-more">
            <AvatarGroup names={['Ines Costa', 'Marek Novak', 'Aisha Bello', 'Leo Martin', 'Yuki Sato', 'Omar Haddad', 'Sofia Rossi']} max={5} size="md" />
            <span className="tpl-muted">and 130 more across Lisbon, London, Madrid and remote.</span>
          </div>
        </div>
      </section>

      <section className="ls-section">
        <div className="ls-container ls-split ls-split--top">
          <div className="tpl-stack">
            <SectionHead eyebrow="Values" title="What we will not compromise on" />
            <List items={VALUES.map((v, i) => ({ leading: <span className="tpl-icon-chip">{VALUE_ICONS[i]}</span>, title: v.title, description: v.description }))} />
          </div>
          <div className="tpl-stack">
            <SectionHead
              eyebrow="Careers"
              title={(
                <span className="tpl-row tpl-row--wrap">
                  We are hiring <Badge variant="accent">{ROLES.length} open roles</Badge>
                </span>
              )}
            />
            <List
              items={ROLES.map((r) => ({
                title: r.title,
                description: <span className="tpl-row"><MapPin size={12} /> {r.place} · {r.team}</span>,
                trailing: <ChevronRight size={16} />,
                onClick: () => toast({ title: r.title, description: 'Applications open in the real site. This is a demo.' })
              }))}
            />
            <div className="tpl-row tpl-row--wrap">
              <Popover title="Remote at Orbit" trigger={<Button variant="ghost" size="sm" icon={<HelpCircle size={14} />} data-opens="Popover">How remote works</Button>}>
                Most roles are remote within ±3 hours of Lisbon. We meet in person twice a year and cover every trip.
              </Popover>
              <Button variant="secondary" size="sm" onClick={() => go('contact')}>Talk to us</Button>
            </div>
          </div>
        </div>
      </section>

      <CtaBand title="Come save with us" text="Join 2.4 million people who stopped dreading payday." />
    </>
  );
};

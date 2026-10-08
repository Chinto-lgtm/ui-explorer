import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Accordion, Chip, ChipGroup, Carousel, Rating, PricingCard, Testimonial } from '../../../components/ui/Content';
import { Sparkles, Shield, Zap, Tag, HelpCircle, Wallet, Leaf, Plane } from 'lucide-react';
import type { SectionProps } from './types';

const FAQ = [
  { id: 'tokens', icon: <HelpCircle size={16} />, title: 'What is a design token?', content: 'A named value — a colour, radius, shadow or duration — that every component reads instead of a hard-coded number.' },
  { id: 'switch', icon: <HelpCircle size={16} />, title: 'Why does everything change when I switch style?', content: 'Each style is a complete token system with its own construction rules, so components are rebuilt rather than recoloured.' },
  { id: 'export', icon: <HelpCircle size={16} />, title: 'Can I use a style in my own project?', content: 'Yes. Export it as CSS variables or JSON tokens from the Export panel.' }
];

const SLIDES = [
  { icon: <Wallet size={22} />, title: 'Budgets', text: 'Set a limit, get a nudge before you hit it.' },
  { icon: <Leaf size={22} />, title: 'Round-ups', text: 'Spare change quietly grows into savings.' },
  { icon: <Plane size={22} />, title: 'Goals', text: 'Save for the trip, the bike, the deposit.' },
  { icon: <Shield size={22} />, title: 'Security', text: 'Freeze a card in one tap from anywhere.' }
];

export const ContentSection: React.FC<SectionProps> = ({ disabled }) => {
  const [filters, setFilters] = useState<string[]>(['design']);
  const [tags, setTags] = useState(['React', 'Tokens', 'Motion']);
  const [rating, setRating] = useState(4);

  return (
    <div className="lab-grid lab-grid--wide">
      <Card>
        <CardHeader><CardTitle>Accordion</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Accordion items={FAQ} defaultOpen={['tokens']} />
          <Accordion variant="separated" multiple items={FAQ.slice(0, 2).map((f) => ({ ...f, id: `s-${f.id}` }))} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Chips</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <ChipGroup
            label="Filter articles"
            value={filters}
            onChange={setFilters}
            options={[
              { value: 'design', label: 'Design' },
              { value: 'engineering', label: 'Engineering' },
              { value: 'product', label: 'Product' },
              { value: 'research', label: 'Research' }
            ]}
          />
          <div className="lab-component-row">
            {tags.map((t) => <Chip key={t} icon={<Tag size={12} />} onRemove={disabled ? undefined : () => setTags((prev) => prev.filter((x) => x !== t))}>{t}</Chip>)}
            {tags.length === 0 && <Button size="sm" variant="ghost" onClick={() => setTags(['React', 'Tokens', 'Motion'])}>Restore tags</Button>}
          </div>
          <div className="lab-component-row">
            <Chip size="sm" icon={<Zap size={12} />}>Small chip</Chip>
            <Chip size="sm" disabled onClick={() => undefined}>Disabled</Chip>
          </div>
        </CardBody>
      </Card>

      <Card className="lab-span-2">
        <CardHeader><CardTitle>Carousel</CardTitle></CardHeader>
        <CardBody>
          <Carousel
            label="Features"
            slidesPerView={2.2}
            slides={SLIDES.map((s) => (
              <Card key={s.title} variant="flat" className="lab-input-col">
                <span style={{ color: 'var(--color-accent)' }}>{s.icon}</span>
                <strong>{s.title}</strong>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>{s.text}</span>
              </Card>
            ))}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rating</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Rating value={4.6} showValue label="App Store rating" />
          <Rating value={rating} onChange={disabled ? undefined : setRating} size={24} label="Rate this style" showValue />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Testimonial</CardTitle></CardHeader>
        <CardBody>
          <Testimonial
            variant="plain"
            rating={5}
            quote="We replaced three internal kits with one token system. Switching brands is now a config change."
            name="Priya Raman"
            role="Design Systems Lead"
          />
        </CardBody>
      </Card>

      <div className="lab-span-2 lab-grid">
        <PricingCard
          name="Starter"
          price="$0"
          period="/ month"
          description="For trying things out."
          features={[{ label: '3 styles' }, { label: 'JSON export' }, { label: 'Team library', included: false }]}
          cta={<Button variant="secondary" disabled={disabled}>Start free</Button>}
        />
        <PricingCard
          featured
          name="Pro"
          price="$12"
          period="/ month"
          badge={<Badge variant="accent" size="sm"><Sparkles size={12} /> Popular</Badge>}
          description="For product teams."
          features={[{ label: 'Unlimited styles' }, { label: 'CSS + JSON export' }, { label: 'Team library' }]}
          cta={<Button disabled={disabled}>Upgrade</Button>}
        />
      </div>
    </div>
  );
};

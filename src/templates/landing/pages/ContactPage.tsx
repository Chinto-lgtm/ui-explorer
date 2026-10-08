import React, { useState } from 'react';
import { Mail, MessageCircle, MapPin, CalendarDays, Send } from 'lucide-react';
import { Input, Textarea } from '../../../components/ui/Input';
import { Select, Combobox, Radio, Checkbox, Segmented } from '../../../components/ui/Selection';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Overlay';
import { Alert, useToast } from '../../../components/ui/Feedback';
import { Accordion } from '../../../components/ui/Content';
import { Backdrop } from '../../../components/svg/Backdrop';
import { PageHero } from '../blocks';
import { COUNTRIES, FAQ } from '../../content';

const TOPICS = [
  { value: 'support', label: 'I need help with my account' },
  { value: 'sales', label: 'Orbit for my team or family' },
  { value: 'press', label: 'Press and partnerships' }
];

const TEAM_SIZES = [
  { value: '1', label: 'Just me' },
  { value: '2-6', label: '2–6 people' },
  { value: '7-50', label: '7–50 people' },
  { value: '50+', label: 'More than 50' }
];

export const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState<string | null>('portugal');
  const [size, setSize] = useState<string | null>(null);
  const [topic, setTopic] = useState('support');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [demo, setDemo] = useState(false);
  const [slot, setSlot] = useState('10:00');

  const emailError = touched && !/^\S+@\S+\.\S+$/.test(email) ? 'Enter an email we can reply to' : undefined;
  const messageError = touched && message.trim().length < 10 ? 'Tell us a little more (10+ characters)' : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!/^\S+@\S+\.\S+$/.test(email) || message.trim().length < 10 || !consent) return;
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSent(true);
      toast({ tone: 'success', title: 'Message sent', description: 'We usually reply within 3 minutes.' });
    }, 900);
  };

  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to a human" lead="Real people, real answers. Support is open every day from 7am to midnight." />

      <section className="ls-section ls-section--tight">
        <div className="ls-container ls-split ls-split--top ls-split--wide">
          <Card>
            <CardHeader><CardTitle>Send us a message</CardTitle></CardHeader>
            <CardBody>
              {sent ? (
                <div className="tpl-stack">
                  <Alert tone="success" title={`Thanks${name ? `, ${name.split(' ')[0]}` : ''}! We got your message.`} onClose={() => { setSent(false); setMessage(''); setTouched(false); }}>
                    A reply is on its way to {email}. You can close this to send another.
                  </Alert>
                </div>
              ) : (
                <form className="ls-form" onSubmit={submit} noValidate>
                  <div className="ls-form__row">
                    <Input label="Full name" placeholder="Sam Rivera" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={emailError} success={touched && !emailError && email !== ''} autoComplete="email" />
                  </div>
                  <div className="ls-form__row">
                    <Combobox label="Country" placeholder="Search countries…" options={COUNTRIES} value={country} onChange={setCountry} />
                    <Select label="Household or team size" placeholder="Choose…" options={TEAM_SIZES} value={size} onChange={setSize} />
                  </div>
                  <fieldset className="ls-fieldset">
                    <legend className="ui-input-label">What is this about?</legend>
                    {TOPICS.map((t) => <Radio key={t.value} name="contact-topic" label={t.label} checked={topic === t.value} onChange={() => setTopic(t.value)} />)}
                  </fieldset>
                  <Textarea label="Message" rows={5} placeholder="How can we help?" value={message} onChange={(e) => setMessage(e.target.value)} error={messageError} helperText={`${message.length}/1000`} maxLength={1000} />
                  <Checkbox label="Orbit may reply by email about this message" description="We never use it for marketing." checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  {touched && !consent && <Alert tone="warning">Please allow us to reply by email.</Alert>}
                  <div className="ls-actions">
                    <Button type="submit" isLoading={sending} icon={<Send size={16} />}>Send message</Button>
                    <Button type="button" variant="ghost" onClick={() => setDemo(true)} data-opens="Modal">Book a demo instead</Button>
                  </div>
                </form>
              )}
            </CardBody>
          </Card>

          <div className="tpl-stack">
            <Card className="ls-contact">
              <span className="tpl-icon-chip"><MessageCircle size={18} /></span>
              <div><strong>Live chat</strong><p className="tpl-muted">In the app, under Help. Median reply: 3 minutes.</p></div>
            </Card>
            <Card className="ls-contact">
              <span className="tpl-icon-chip"><Mail size={18} /></span>
              <div><strong>hello@orbit.money</strong><p className="tpl-muted">For anything that is not urgent.</p></div>
            </Card>
            <Card className="ls-contact ls-contact--map">
              <Backdrop fit="cover" preset="grid" seed={5} intensity={0.5} density={0.7} className="ls-map" />
              <span className="ls-map__pin"><MapPin size={20} /></span>
              <div className="ls-map__label"><strong>Lisbon HQ</strong><span className="tpl-faint">Rua do Ouro 120, 1100-062</span></div>
            </Card>
            <Accordion variant="separated" items={FAQ.slice(0, 3)} />
          </div>
        </div>
      </section>

      <Modal
        open={demo}
        onClose={() => setDemo(false)}
        title="Book a 20-minute demo"
        description="For households and teams of six or more."
        footer={(
          <>
            <Button variant="ghost" onClick={() => setDemo(false)}>Cancel</Button>
            <Button icon={<CalendarDays size={16} />} onClick={() => { setDemo(false); toast({ tone: 'success', title: 'Demo booked', description: `See you at ${slot}. A calendar invite is on its way.` }); }}>Confirm</Button>
          </>
        )}
      >
        <div className="tpl-stack">
          <Input label="Date" type="date" defaultValue="2025-09-04" />
          <Segmented label="Time" value={slot} onChange={setSlot} options={['09:30', '10:00', '14:00', '16:30'].map((t) => ({ value: t, label: t }))} />
        </div>
      </Modal>
    </>
  );
};

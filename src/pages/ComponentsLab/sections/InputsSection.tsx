import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Input, Textarea } from '../../../components/ui/Input';
import { Search, Mail, Link2 } from 'lucide-react';
import type { SectionProps } from './types';

export const InputsSection: React.FC<SectionProps> = ({ disabled }) => {
  const [email, setEmail] = useState('');
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [amount, setAmount] = useState('42');

  return (
    <div className="lab-grid">
      <Card>
        <CardHeader><CardTitle>Text fields</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Input label="Full name" placeholder="Alex Rivera" helperText="Shown on your profile." disabled={disabled} />
          <Input label="Search library" type="search" placeholder="Type to search…" icon={<Search size={16} />} disabled={disabled} />
          <Input
            label="Email address"
            type="email"
            placeholder="alex@example.com"
            icon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            success={email.length > 0 && emailOk}
            error={email.length > 0 && !emailOk ? 'Enter a valid email address.' : undefined}
            disabled={disabled}
          />
          <Input label="Website" type="url" placeholder="https://" icon={<Link2 size={16} />} disabled={disabled} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Password, number &amp; date</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Input label="Password" type="password" placeholder="At least 8 characters" defaultValue="hunter2!!" disabled={disabled} />
          <Input label="Quantity" type="number" min={0} max={100} value={amount} onChange={(e) => setAmount(e.target.value)} disabled={disabled} />
          <Input label="Launch date" type="date" defaultValue="2026-09-20" disabled={disabled} />
          <Input label="Reminder" type="time" defaultValue="09:30" disabled={disabled} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>States</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Input label="Empty" placeholder="Nothing here yet" disabled={disabled} />
          <Input label="Filled" defaultValue="A value someone typed" disabled={disabled} />
          <Input label="Error" defaultValue="not-an-email" error="Please enter a valid format." disabled={disabled} />
          <Input label="Success" defaultValue="alex@example.com" success disabled={disabled} />
          <Input label="Read only" defaultValue="ORD-2026-0917" readOnly />
          <Input label="Disabled" defaultValue="Unavailable" disabled />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Textarea</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Textarea label="Project description" placeholder="Describe your design tokens or style requirements…" disabled={disabled} />
          <Textarea label="Notes" defaultValue="Ship the glass variant first, then revisit motion." helperText="Markdown is not supported." disabled={disabled} />
        </CardBody>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Checkbox, Radio, Toggle, Slider, Segmented, Select, MultiSelect, Combobox } from '../../../components/ui/Selection';
import type { SectionProps } from './types';

const PLANS = [
  { value: 'starter', label: 'Starter', description: 'For trying things out' },
  { value: 'team', label: 'Team', description: 'Shared workspaces and roles' },
  { value: 'enterprise', label: 'Enterprise', description: 'SSO, audit log, SLA' },
  { value: 'legacy', label: 'Legacy', disabled: true }
];

const FONTS = ['Inter', 'Manrope', 'DM Sans', 'Space Grotesk', 'Plus Jakarta Sans', 'IBM Plex Sans', 'Poppins', 'Georgia', 'JetBrains Mono'].map((f) => ({ value: f.toLowerCase().replace(/\s+/g, '-'), label: f }));

export const SelectionSection: React.FC<SectionProps> = ({ disabled }) => {
  const [checks, setChecks] = useState({ a: true, b: false, c: false });
  const [radio, setRadio] = useState('monthly');
  const [notify, setNotify] = useState(true);
  const [compact, setCompact] = useState(false);
  const [volume, setVolume] = useState(64);
  const [blur, setBlur] = useState(16);
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [plan, setPlan] = useState<string | null>('team');
  const [tags, setTags] = useState<string[]>(['inter', 'manrope']);
  const [font, setFont] = useState<string | null>(null);

  const allOn = Object.values(checks).every(Boolean);
  const someOn = Object.values(checks).some(Boolean);

  return (
    <div className="lab-grid">
      <Card>
        <CardHeader><CardTitle>Checkbox &amp; radio</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Checkbox
            label="Select all"
            checked={allOn}
            indeterminate={someOn && !allOn}
            onChange={(e) => setChecks({ a: e.target.checked, b: e.target.checked, c: e.target.checked })}
            disabled={disabled}
          />
          <div className="lab-indent">
            <Checkbox label="Email digest" description="Once a week, on Monday." checked={checks.a} onChange={(e) => setChecks({ ...checks, a: e.target.checked })} disabled={disabled} />
            <Checkbox label="Product updates" checked={checks.b} onChange={(e) => setChecks({ ...checks, b: e.target.checked })} disabled={disabled} />
            <Checkbox label="Security alerts" checked={checks.c} onChange={(e) => setChecks({ ...checks, c: e.target.checked })} disabled={disabled} />
          </div>
          <div className="lab-divider" />
          <Radio name="billing" value="monthly" label="Monthly" description="Cancel any time" checked={radio === 'monthly'} onChange={() => setRadio('monthly')} disabled={disabled} />
          <Radio name="billing" value="yearly" label="Yearly" description="Two months free" checked={radio === 'yearly'} onChange={() => setRadio('yearly')} disabled={disabled} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Toggle &amp; slider</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Toggle checked={notify} onChange={setNotify} label="Push notifications" disabled={disabled} />
          <Toggle checked={compact} onChange={setCompact} label="Compact mode" size="sm" disabled={disabled} />
          <Slider label="Volume" value={volume} onChange={setVolume} disabled={disabled} />
          <Slider label="Backdrop blur" value={blur} min={0} max={40} step={2} format={(v) => `${v}px`} onChange={setBlur} disabled={disabled} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Segmented control</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Segmented
            label="Density"
            value={density}
            onChange={setDensity}
            options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfortable' }, { value: 'spacious', label: 'Spacious' }]}
          />
          <Segmented
            label="Range"
            size="sm"
            value="30d"
            onChange={() => undefined}
            options={[{ value: '7d', label: '7d' }, { value: '30d', label: '30d' }, { value: '90d', label: '90d' }, { value: 'all', label: 'All', disabled: true }]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Select, multi-select &amp; combobox</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Select label="Plan" options={PLANS} value={plan} onChange={setPlan} disabled={disabled} />
          <MultiSelect label="Fonts in this system" options={FONTS} value={tags} onChange={setTags} disabled={disabled} />
          <Combobox label="Find a font" options={FONTS} value={font} onChange={setFont} placeholder="Start typing…" disabled={disabled} />
        </CardBody>
      </Card>
    </div>
  );
};

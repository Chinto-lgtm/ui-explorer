import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Tabs, Breadcrumbs, Pagination, Stepper, Navbar, SideNav } from '../../../components/ui/Navigation';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Sparkles, LayoutDashboard, Component, Database, Sliders, Bell, Palette, Type, Box } from 'lucide-react';
import type { SectionProps } from './types';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={14} /> },
  { id: 'tokens', label: 'Tokens', icon: <Palette size={14} /> },
  { id: 'type', label: 'Typography', icon: <Type size={14} /> },
  { id: 'archived', label: 'Archived', disabled: true }
];

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'components', label: 'Components', icon: <Component size={16} /> },
  { id: 'data', label: 'Data', icon: <Database size={16} />, badge: <Badge variant="accent" size="sm">3</Badge> },
  { id: 'settings', label: 'Settings', icon: <Sliders size={16} /> }
];

export const NavigationSection: React.FC<SectionProps> = () => {
  const [tab, setTab] = useState('overview');
  const [pill, setPill] = useState('overview');
  const [page, setPage] = useState(3);
  const [step, setStep] = useState(1);
  const [nav, setNav] = useState('components');

  return (
    <div className="lab-grid lab-grid--wide">
      <Card className="lab-span-2">
        <CardHeader><CardTitle>Navbar</CardTitle></CardHeader>
        <CardBody>
          <Navbar
            brand={<><Sparkles size={18} /> Atlas</>}
            items={NAV}
            active={nav}
            onSelect={setNav}
            actions={<><Button iconOnly aria-label="Notifications" variant="ghost" size="sm" icon={<Bell size={16} />} /><Button size="sm">Upgrade</Button></>}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sidebar</CardTitle></CardHeader>
        <CardBody>
          <SideNav heading="Workspace" items={[...NAV, { id: 'library', label: 'Library', icon: <Box size={16} /> }]} active={nav} onSelect={setNav} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tabs</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Tabs label="Underline tabs" tabs={TABS} value={tab} onChange={setTab} />
          <Tabs label="Pill tabs" variant="pills" tabs={TABS.slice(0, 3)} value={pill} onChange={setPill} />
          <Tabs label="Enclosed tabs" variant="enclosed" tabs={TABS.slice(0, 3)} value={pill} onChange={setPill} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Breadcrumbs &amp; pagination</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Breadcrumbs items={[{ label: 'Library' }, { label: 'Styles' }, { label: 'Morphism' }, { label: 'Glassmorphism' }]} />
          <Pagination page={page} pageCount={12} onChange={setPage} />
        </CardBody>
      </Card>

      <Card className="lab-span-2">
        <CardHeader><CardTitle>Stepper</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Stepper
            current={step}
            onStepClick={setStep}
            steps={[
              { label: 'Choose style', description: 'Pick a base' },
              { label: 'Customize', description: 'Tune tokens' },
              { label: 'Review', description: 'Check contrast' },
              { label: 'Export', description: 'JSON or CSS' }
            ]}
          />
          <div className="lab-component-row">
            <Button variant="secondary" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
            <Button size="sm" onClick={() => setStep((s) => Math.min(3, s + 1))} disabled={step === 3}>Continue</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Drawer } from '../../../components/ui/Overlay';
import { Toggle } from '../../../components/ui/Selection';
import { Waveform } from '../../../components/charts/RadialCharts';
import { StatusBar, AppBar, TabBar, ChatBubble, PinInput } from '../../../components/ui/Mobile';
import { Home, Search, Bell, User, Plus, MoreVertical, Share2, Play } from 'lucide-react';
import type { SectionProps } from './types';

const TABS = [
  { id: 'home', label: 'Home', icon: <Home size={20} /> },
  { id: 'search', label: 'Search', icon: <Search size={20} /> },
  { id: 'inbox', label: 'Inbox', icon: <Bell size={20} />, badge: 3 },
  { id: 'me', label: 'Profile', icon: <User size={20} /> }
];

const WAVE = Array.from({ length: 36 }, (_, i) => 0.25 + Math.abs(Math.sin(i * 0.7)) * 0.7);

export const MobileSection: React.FC<SectionProps> = ({ disabled }) => {
  const [tab, setTab] = useState('home');
  const [tab2, setTab2] = useState('search');
  const [code, setCode] = useState('4821');
  const [sheet, setSheet] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(true);

  return (
    <div className="lab-grid lab-grid--wide">
      <Card>
        <CardHeader><CardTitle>Status bar &amp; app bars</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <StatusBar />
          <AppBar title="Messages" subtitle="3 unread" onBack={() => undefined} actions={<Button variant="ghost" size="sm" iconOnly aria-label="More" icon={<MoreVertical size={18} />} />} />
          <AppBar variant="center" title="Details" onBack={() => undefined} actions={<Button variant="ghost" size="sm" iconOnly aria-label="Share" icon={<Share2 size={18} />} />} />
          <AppBar variant="large" title="Good morning, Sam" actions={<Button variant="ghost" size="sm" iconOnly aria-label="Notifications" icon={<Bell size={18} />} />} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bottom tab bar</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <TabBar items={TABS} active={tab} onSelect={setTab} />
          <TabBar items={TABS} active={tab2} onSelect={setTab2} center={{ icon: <Plus size={22} />, label: 'Create', onClick: () => setSheet(true) }} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Chat bubbles</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <ChatBubble from="them" author="Alex Kim" time="09:12">Did the new tokens land?</ChatBubble>
          <ChatBubble from="them" author="Alex Kim" grouped time="09:12">The cards look different on my phone.</ChatBubble>
          <ChatBubble from="me" time="09:14" status="read">Yes — every component reads them now.</ChatBubble>
          <ChatBubble from="me" time="09:15" status="delivered">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 180 }}>
              <Play size={16} />
              <span style={{ flex: 1 }}><Waveform samples={WAVE} height={28} progress={0.4} animate={false} /></span>
              0:14
            </span>
          </ChatBubble>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Code input &amp; bottom sheet</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <PinInput label="Verification code" value={code} onChange={setCode} disabled={disabled} />
          <PinInput label="PIN (masked)" length={4} mask value="12" onChange={() => undefined} error="Two digits left" disabled={disabled} />
          <Button variant="secondary" onClick={() => setSheet(true)} disabled={disabled}>Open bottom sheet</Button>
          <Drawer open={sheet} onClose={() => setSheet(false)} side="bottom" title="Download settings">
            <div className="lab-input-col">
              <Toggle checked={wifiOnly} onChange={setWifiOnly} label="Download on Wi-Fi only" />
              <Button fullWidth onClick={() => setSheet(false)}>Done</Button>
            </div>
          </Drawer>
        </CardBody>
      </Card>
    </div>
  );
};

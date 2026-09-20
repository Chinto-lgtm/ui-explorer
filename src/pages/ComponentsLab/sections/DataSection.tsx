import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Avatar, AvatarGroup, List, Timeline, ActivityFeed, Stat } from '../../../components/ui/DataDisplay';
import { LineChart } from '../../../components/charts/LineChart';
import { BarChart } from '../../../components/charts/BarChart';
import { GitCommit, Rocket, AlertTriangle, CheckCircle2, ChevronRight, FileText, Folder } from 'lucide-react';
import type { SectionProps } from './types';

export const CardsSection: React.FC<SectionProps> = () => (
  <div className="lab-grid">
    <Card variant="default" hoverable>
      <CardHeader><CardTitle>Default hoverable</CardTitle><Badge variant="accent" size="sm">Live</Badge></CardHeader>
      <CardBody>Standard surface container responding to active token variables. Hover to see the style's lift or shift.</CardBody>
    </Card>
    <Card variant="outlined">
      <CardHeader><CardTitle>Outlined</CardTitle></CardHeader>
      <CardBody>Card with explicit accent border styling.</CardBody>
    </Card>
    <Card variant="elevated">
      <CardHeader><CardTitle>Elevated</CardTitle></CardHeader>
      <CardBody>Card with the style's large shadow.</CardBody>
    </Card>
    <Card variant="flat">
      <CardHeader><CardTitle>Flat</CardTitle></CardHeader>
      <CardBody>No shadow at all; borders carry the edge.</CardBody>
    </Card>
    <Card>
      <CardHeader><CardTitle>Stat tile</CardTitle></CardHeader>
      <CardBody><Stat label="Monthly revenue" value="$128,450" delta="+14.2%" /></CardBody>
    </Card>
    <Card>
      <CardHeader><CardTitle>With actions</CardTitle></CardHeader>
      <CardBody>
        <p>Cards can end in an action row that inherits the button language.</p>
        <div className="lab-component-row" style={{ marginTop: '0.75rem' }}>
          <Button size="sm">Primary</Button>
          <Button size="sm" variant="ghost">Later</Button>
        </div>
      </CardBody>
    </Card>
  </div>
);

export const BadgesSection: React.FC<SectionProps> = () => (
  <div className="lab-grid">
    <Card>
      <CardHeader><CardTitle>Badges &amp; status tags</CardTitle></CardHeader>
      <CardBody className="lab-component-row">
        <Badge variant="default">Default</Badge>
        <Badge variant="accent">Accent</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="error">Error</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="accent" size="sm">Small</Badge>
      </CardBody>
    </Card>
    <Card>
      <CardHeader><CardTitle>Avatars</CardTitle></CardHeader>
      <CardBody className="lab-component-row">
        <Avatar name="Sophia Martinez" size="sm" status="online" />
        <Avatar name="Marcus Vance" status="away" />
        <Avatar name="Amara Okafor" size="lg" status="offline" />
        <AvatarGroup names={['Sophia Martinez', 'Marcus Vance', 'Amara Okafor', 'Lucas Meyer', 'Chloe Dubois', 'Ravi Patel']} />
      </CardBody>
    </Card>
  </div>
);

export const ListsSection: React.FC<SectionProps> = () => {
  const [selected, setSelected] = useState('tokens');
  return (
    <div className="lab-grid">
      <Card>
        <CardHeader><CardTitle>List</CardTitle></CardHeader>
        <CardBody>
          <List
            items={[
              { leading: <Folder size={16} />, title: 'Styles', description: '30 built in, 2 custom', trailing: <ChevronRight size={16} />, onClick: () => setSelected('styles'), selected: selected === 'styles' },
              { leading: <FileText size={16} />, title: 'Tokens', description: 'colors, typography, radii…', trailing: <Badge size="sm" variant="accent">62</Badge>, onClick: () => setSelected('tokens'), selected: selected === 'tokens' },
              { leading: <FileText size={16} />, title: 'Exports', description: 'JSON and CSS', trailing: <ChevronRight size={16} />, onClick: () => setSelected('exports'), selected: selected === 'exports' }
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
        <CardBody>
          <Timeline
            events={[
              { title: 'Style generated', description: 'Seed 847291, Coherent mode', time: '09:12', icon: <GitCommit />, tone: 'accent' },
              { title: 'Contrast warning', description: 'Secondary text 3.2:1 on surface', time: '09:14', icon: <AlertTriangle />, tone: 'warning' },
              { title: 'Repaired', description: 'Text colour adjusted to 4.6:1', time: '09:15', icon: <CheckCircle2 />, tone: 'success' },
              { title: 'Exported to CSS', time: '09:20', icon: <Rocket /> }
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Activity feed</CardTitle></CardHeader>
        <CardBody>
          <ActivityFeed
            items={[
              { user: 'Sophia Martinez', action: 'remixed', target: 'Glassmorphism', time: '2m' },
              { user: 'Marcus Vance', action: 'favorited', target: 'Neo Brutalism', time: '18m' },
              { user: 'Amara Okafor', action: 'exported tokens from', target: 'Neon Clay', time: '1h' },
              { user: 'Lucas Meyer', action: 'contributed', target: 'Aurora Glass', time: '3h' }
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export const ChartsSection: React.FC<SectionProps> = () => (
  <div className="lab-grid">
    <Card>
      <CardHeader><CardTitle>Line chart</CardTitle></CardHeader>
      <CardBody>
        <LineChart data={[{ label: 'Mon', value: 30 }, { label: 'Tue', value: 75 }, { label: 'Wed', value: 45 }, { label: 'Thu', value: 90 }, { label: 'Fri', value: 120 }]} />
      </CardBody>
    </Card>
    <Card>
      <CardHeader><CardTitle>Bar chart</CardTitle></CardHeader>
      <CardBody>
        <BarChart data={[{ label: 'Q1', value: 450 }, { label: 'Q2', value: 620 }, { label: 'Q3', value: 810 }, { label: 'Q4', value: 950 }]} />
      </CardBody>
    </Card>
  </div>
);

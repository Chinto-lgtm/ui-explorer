import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert, Progress, ProgressRing, Skeleton, Spinner, EmptyState, useToast, useInterval } from '../../../components/ui/Feedback';
import { Inbox, Plus } from 'lucide-react';
import type { SectionProps } from './types';

export const FeedbackSection: React.FC<SectionProps> = ({ disabled }) => {
  const { toast } = useToast();
  const [upload, setUpload] = useState(0);
  const [running, setRunning] = useState(false);
  const [alerts, setAlerts] = useState({ info: true, success: true, warning: true, error: true });

  useInterval(() => {
    setUpload((v) => {
      if (v >= 100) { setRunning(false); return 100; }
      return v + 4;
    });
  }, running ? 120 : null);

  return (
    <div className="lab-grid">
      <Card>
        <CardHeader><CardTitle>Toast &amp; notification</CardTitle></CardHeader>
        <CardBody className="lab-component-row">
          <Button size="sm" onClick={() => toast({ tone: 'success', title: 'Style saved', description: 'Neon Clay is now in your library.' })} disabled={disabled}>Success toast</Button>
          <Button size="sm" variant="secondary" onClick={() => toast({ tone: 'info', title: 'Export ready', description: 'tokens.json (2.1 KB)', action: { label: 'Download', onClick: () => undefined } })} disabled={disabled}>With action</Button>
          <Button size="sm" variant="outline" onClick={() => toast({ tone: 'warning', title: 'Low contrast', description: 'Text on surface is 3.1:1.' })} disabled={disabled}>Warning</Button>
          <Button size="sm" variant="destructive" onClick={() => toast({ tone: 'error', title: 'Import failed', description: 'tokens.colors.accent is missing.', duration: 7000 })} disabled={disabled}>Error</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Alerts</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          {alerts.info && <Alert tone="info" title="Heads up" onClose={() => setAlerts({ ...alerts, info: false })}>Generated styles are kept locally until you save them.</Alert>}
          {alerts.success && <Alert tone="success" title="Contrast passes AAA" onClose={() => setAlerts({ ...alerts, success: false })}>Text on background is 12.4:1.</Alert>}
          {alerts.warning && <Alert tone="warning" title="Experimental mode" onClose={() => setAlerts({ ...alerts, warning: false })} action={<Button size="sm" variant="outline">Turn off</Button>}>Blur and glow are boosted beyond the style's own tokens.</Alert>}
          {alerts.error && <Alert tone="error" title="Import failed" onClose={() => setAlerts({ ...alerts, error: false })}>Missing: tokens.typography.fontFamilySans</Alert>}
          {!Object.values(alerts).some(Boolean) && <Button size="sm" variant="secondary" onClick={() => setAlerts({ info: true, success: true, warning: true, error: true })}>Reset alerts</Button>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <Progress label="Upload" value={upload} />
          <div className="lab-component-row">
            <Button size="sm" onClick={() => { setUpload(0); setRunning(true); }} disabled={disabled || running}>Start upload</Button>
            <Button size="sm" variant="ghost" onClick={() => { setRunning(false); setUpload(0); }} disabled={disabled}>Reset</Button>
          </div>
          <Progress label="Storage" value={72} tone="warning" size="sm" />
          <Progress label="Syncing" value={0} indeterminate showValue={false} />
          <div className="lab-component-row">
            <ProgressRing value={upload} label="Upload ring" />
            <ProgressRing value={88} tone="success" size={56} strokeWidth={6} label="Health" />
            <ProgressRing value={34} tone="error" size={56} strokeWidth={6} label="Errors" />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Loading &amp; skeleton</CardTitle></CardHeader>
        <CardBody className="lab-input-col">
          <div className="lab-component-row">
            <Spinner size={16} /><Spinner size={24} /><Spinner size={32} />
            <Button size="sm" isLoading>Saving</Button>
          </div>
          <div className="lab-skeleton-card">
            <Skeleton circle width={40} height={40} />
            <div className="lab-skeleton-lines">
              <Skeleton width="60%" />
              <Skeleton width="90%" height="0.75rem" />
              <Skeleton width="40%" height="0.75rem" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Empty state</CardTitle></CardHeader>
        <CardBody>
          <EmptyState
            icon={<Inbox size={28} />}
            title="No custom styles yet"
            description="Generate a style from a seed or duplicate one you like, then tune it in the Customizer."
            action={<Button size="sm" icon={<Plus size={14} />} disabled={disabled}>Create a style</Button>}
          />
        </CardBody>
      </Card>
    </div>
  );
};

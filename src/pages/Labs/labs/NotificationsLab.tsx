import React, { useState } from 'react';
import { BellRing, Plus } from 'lucide-react';
import { LabControls, useLabStatus } from '../LabsPage';
import { WorkspaceSection, WorkspaceSegmented } from '../../../components/workspace/Workspace';
import { NotificationCenter } from '../../../components/ui/NotificationCenter';
import type { Notification, NotificationType } from '../../../components/ui/NotificationCenter';
import { useToast } from '../../../components/ui/Feedback';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';

const SEED: Notification[] = [
  { id: 'n1', type: 'success', title: 'Export complete', description: 'Theme tokens exported as JSON.', time: '2m ago', read: false },
  { id: 'n2', type: 'message', title: 'Sophia Martinez commented', description: '"Can we try the frosted variant on the checkout card?"', time: '9m ago', read: false, from: 'Sophia Martinez', action: { label: 'Reply', onClick: () => undefined } },
  { id: 'n3', type: 'warning', title: 'Contrast notice', description: 'Secondary text is 3.1:1 on the surface colour.', time: '15m ago', read: false, action: { label: 'Fix', onClick: () => undefined } },
  { id: 'n4', type: 'error', title: 'Import failed', description: 'tokens.typography.fontFamilySans is missing.', time: '1h ago', read: true },
  { id: 'n5', type: 'info', title: 'New community style', description: 'Aurora Glass was accepted into the registry.', time: '3h ago', read: true, from: 'Lucas Meyer' },
  { id: 'n6', type: 'system', title: 'Storage almost full', description: 'Local history keeps the last 50 generations.', time: 'Yesterday', read: true }
];

const TYPES: NotificationType[] = ['success', 'warning', 'error', 'info', 'message', 'system'];

export const NotificationsLab: React.FC = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Notification[]>(SEED);
  const [mode, setMode] = useState<'panel' | 'popover'>('panel');
  const [counter, setCounter] = useState(7);
  const unread = items.filter((n) => !n.read).length;
  useLabStatus(`${items.length} notifications · ${unread} unread`);

  const add = (type: NotificationType) => {
    const id = `n${counter}`;
    setCounter((c) => c + 1);
    const titles: Record<NotificationType, string> = { success: 'Style saved', warning: 'Low contrast', error: 'Sync failed', info: 'Tip: press ? for shortcuts', message: 'Marcus Vance mentioned you', system: 'Update installed' };
    setItems((prev) => [{ id, type, title: titles[type], description: 'Added from the lab controls.', time: 'now', read: false, from: type === 'message' ? 'Marcus Vance' : undefined }, ...prev]);
    toast({ tone: type === 'message' || type === 'system' ? 'info' : type, title: titles[type], description: 'Also shown as a toast.' });
  };

  return (
    <>
      <LabControls>
        <WorkspaceSection title="Notification center" icon={<BellRing size={14} />}>
          <WorkspaceSegmented label="Presentation" value={mode} onChange={setMode} options={[{ value: 'panel', label: 'Panel' }, { value: 'popover', label: 'Bell popover' }]} />
          <div className="labs-btn-grid">
            {TYPES.map((t) => (
              <button key={t} type="button" className="ws-btn ws-btn--sm" onClick={() => add(t)}><Plus size={12} /> {t}</button>
            ))}
          </div>
          <button type="button" className="ws-btn" onClick={() => setItems(SEED)}>Reset</button>
        </WorkspaceSection>
      </LabControls>

      {mode === 'panel' ? (
        <div className="labs-notifications">
          <NotificationCenter items={items} onChange={setItems} />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Application header</CardTitle>
            <NotificationCenter mode="popover" items={items} onChange={setItems} />
          </CardHeader>
          <CardBody>The bell shows the unread counter; open it to read, mark, act on or dismiss notifications without leaving the page.</CardBody>
        </Card>
      )}
    </>
  );
};

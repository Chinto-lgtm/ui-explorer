import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal, Drawer, Tooltip, Popover, ContextMenu } from '../../../components/ui/Overlay';
import { Info, Copy, Trash2, Pencil, Star } from 'lucide-react';
import type { SectionProps } from './types';

export const OverlaysSection: React.FC<SectionProps> = ({ disabled }) => {
  const [modal, setModal] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState<'right' | 'left' | 'bottom' | null>(null);

  return (
    <div className="lab-grid">
      <Card>
        <CardHeader><CardTitle>Modal &amp; dialog</CardTitle></CardHeader>
        <CardBody className="lab-component-row">
          <Button onClick={() => setModal(true)} disabled={disabled}>Open modal</Button>
          <Button variant="destructive" onClick={() => setDialog(true)} disabled={disabled}>Delete style…</Button>
          <Modal
            open={modal}
            onClose={() => setModal(false)}
            title="Rename style"
            description="The name is shown in the style picker and in exports."
            footer={<><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button onClick={() => setModal(false)}>Save name</Button></>}
          >
            <Input label="Style name" defaultValue="Neon Clay" />
          </Modal>
          <Modal
            open={dialog}
            onClose={() => setDialog(false)}
            role="alertdialog"
            size="sm"
            title="Delete this style?"
            description="This removes Neon Clay from your library. Exports you downloaded are not affected."
            footer={<><Button variant="ghost" onClick={() => setDialog(false)}>Keep it</Button><Button variant="destructive" onClick={() => setDialog(false)}>Delete</Button></>}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Drawer</CardTitle></CardHeader>
        <CardBody className="lab-component-row">
          <Button variant="secondary" onClick={() => setDrawer('right')} disabled={disabled}>From right</Button>
          <Button variant="secondary" onClick={() => setDrawer('left')} disabled={disabled}>From left</Button>
          <Button variant="secondary" onClick={() => setDrawer('bottom')} disabled={disabled}>Bottom sheet</Button>
          <Drawer open={drawer !== null} onClose={() => setDrawer(null)} side={drawer ?? 'right'} title="Filter styles">
            <div className="lab-input-col">
              <Input label="Search" placeholder="Name or tag" />
              <Input label="Author" placeholder="Anyone" />
              <Button fullWidth onClick={() => setDrawer(null)}>Apply filters</Button>
            </div>
          </Drawer>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tooltip &amp; popover</CardTitle></CardHeader>
        <CardBody className="lab-component-row">
          <Tooltip content="Add to favorites">
            <Button iconOnly aria-label="Favorite" variant="outline" icon={<Star size={16} />} disabled={disabled} />
          </Tooltip>
          <Tooltip content="Shown below the trigger" side="bottom">
            <Button variant="ghost" disabled={disabled}>Hover me</Button>
          </Tooltip>
          <Popover title="About this token" trigger={<Button variant="secondary" icon={<Info size={16} />} disabled={disabled}>Token details</Button>}>
            <p><code>--radius-md</code> controls buttons, inputs and menus. Cards use <code>--radius-lg</code>.</p>
            <div className="lab-component-row" style={{ marginTop: '0.75rem' }}>
              <Button size="sm">Copy value</Button>
              <Button size="sm" variant="ghost">Open Anatomy</Button>
            </div>
          </Popover>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Context menu</CardTitle></CardHeader>
        <CardBody>
          <ContextMenu
            items={[
              { id: 'edit', label: 'Rename', icon: <Pencil size={14} />, shortcut: 'F2' },
              { id: 'copy', label: 'Duplicate', icon: <Copy size={14} />, shortcut: 'Ctrl+D' },
              'separator',
              { id: 'delete', label: 'Delete', icon: <Trash2 size={14} />, danger: true }
            ]}
          >
            <div className="lab-context-target">Right-click here (or focus and press Shift+F10)</div>
          </ContextMenu>
        </CardBody>
      </Card>
    </div>
  );
};

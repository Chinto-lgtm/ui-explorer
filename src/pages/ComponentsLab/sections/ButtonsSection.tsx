import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { DropdownMenu } from '../../../components/ui/Overlay';
import { Sparkles, Heart, Bell, Plus, ChevronDown, Copy, Download, Trash2, Settings, Check } from 'lucide-react';
import type { SectionProps } from './types';

export const ButtonsSection: React.FC<SectionProps> = ({ disabled, loading }) => {
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle');
  const flash = (state: 'success' | 'error') => { setResult(state); window.setTimeout(() => setResult('idle'), 1400); };
  const common = { disabled, isLoading: loading };

  return (
    <div className="lab-grid">
      <Card>
        <CardHeader><CardTitle>Variants</CardTitle></CardHeader>
        <CardBody className="lab-component-row">
          <Button variant="primary" {...common}>Primary</Button>
          <Button variant="secondary" {...common}>Secondary</Button>
          <Button variant="outline" {...common}>Outline</Button>
          <Button variant="ghost" {...common}>Ghost</Button>
          <Button variant="destructive" {...common}>Destructive</Button>
          <Button variant="success" {...common}>Success</Button>
          <Button variant="floating" icon={<Sparkles size={16} />} disabled={disabled}>Floating</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Sizes, icons &amp; icon-only</CardTitle></CardHeader>
        <CardBody className="lab-component-row">
          <Button size="sm" icon={<Heart size={14} />} {...common}>Small</Button>
          <Button size="md" icon={<Sparkles size={16} />} {...common}>Medium</Button>
          <Button size="lg" icon={<Bell size={18} />} {...common}>Large</Button>
          <Button size="md" icon={<Plus size={16} />} iconPosition="right" variant="secondary" {...common}>Trailing icon</Button>
          <Button iconOnly aria-label="Add" icon={<Plus size={16} />} {...common} />
          <Button iconOnly aria-label="Settings" variant="outline" icon={<Settings size={16} />} {...common} />
          <Button iconOnly aria-label="Favorite" variant="ghost" icon={<Heart size={16} />} {...common} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Result states</CardTitle></CardHeader>
        <CardBody className="lab-component-row">
          <Button state={result} icon={result === 'success' ? <Check size={16} /> : undefined} onClick={() => flash('success')} disabled={disabled}>
            {result === 'success' ? 'Saved' : 'Save changes'}
          </Button>
          <Button variant="secondary" state={result === 'error' ? 'error' : 'idle'} onClick={() => flash('error')} disabled={disabled}>
            {result === 'error' ? 'Failed' : 'Trigger error'}
          </Button>
          <Button isLoading>Loading</Button>
          <Button disabled>Disabled</Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Dropdown button</CardTitle></CardHeader>
        <CardBody className="lab-component-row">
          <DropdownMenu
            trigger={<Button variant="secondary" icon={<ChevronDown size={16} />} iconPosition="right" disabled={disabled}>Actions</Button>}
            items={[
              { id: 'copy', label: 'Duplicate', icon: <Copy size={14} />, shortcut: 'Ctrl+D' },
              { id: 'export', label: 'Export', icon: <Download size={14} />, shortcut: 'Ctrl+E' },
              'separator',
              { id: 'delete', label: 'Delete', icon: <Trash2 size={14} />, danger: true }
            ]}
          />
          <DropdownMenu
            align="end"
            trigger={<Button iconOnly aria-label="More" variant="outline" icon={<Settings size={16} />} disabled={disabled} />}
            items={[
              { id: 'a', label: 'Preferences' },
              { id: 'b', label: 'Keyboard shortcuts', shortcut: '?' },
              { id: 'c', label: 'Signed out', disabled: true }
            ]}
          />
        </CardBody>
      </Card>
    </div>
  );
};

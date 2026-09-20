import React, { useMemo, useState } from 'react';
import { Table2, ToggleLeft } from 'lucide-react';
import { LabControls, useLabStatus } from '../LabsPage';
import { WorkspaceSection, WorkspaceSegmented, WorkspaceSwitch } from '../../../components/workspace/Workspace';
import { DataTable } from '../../../components/ui/DataTable';
import type { Column } from '../../../components/ui/DataTable';
import { Badge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/DataDisplay';
import { Sparkline } from '../../../components/charts/RadialCharts';
import { useToast } from '../../../components/ui/Feedback';
import { mulberry } from '../../../components/charts/chartUtils';
import { Pencil, Copy, Trash2, Mail } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Pending';
  spent: number;
  trend: number[];
  joined: string;
}

const FIRST = ['Sophia', 'Marcus', 'Amara', 'Lucas', 'Chloe', 'Ravi', 'Ingrid', 'Tomas', 'Yuki', 'Farah', 'Diego', 'Nadia', 'Owen', 'Priya', 'Elias', 'Mei', 'Jonas', 'Leila', 'Arjun', 'Zoe'];
const LAST = ['Martinez', 'Vance', 'Okafor', 'Meyer', 'Dubois', 'Patel', 'Larsen', 'Novak', 'Tanaka', 'Haddad', 'Silva', 'Kowalski', 'Byrne', 'Nair', 'Berg', 'Chen', 'Weber', 'Rahimi', 'Rao', 'Marsh'];
const ROLES = ['Lead Designer', 'Frontend Engineer', 'Product Manager', 'Design Systems Arch', 'UI Developer', 'Researcher'];
const STATUS: Person['status'][] = ['Active', 'Active', 'Active', 'Inactive', 'Pending'];

function makePeople(count: number): Person[] {
  const rnd = mulberry(99);
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST[Math.floor(rnd() * FIRST.length)];
    const last = LAST[Math.floor(rnd() * LAST.length)];
    return {
      id: `usr-${100 + i}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      role: ROLES[Math.floor(rnd() * ROLES.length)],
      status: STATUS[Math.floor(rnd() * STATUS.length)],
      spent: Math.round(rnd() * 4000),
      trend: Array.from({ length: 8 }, () => Math.round(rnd() * 100)),
      joined: `2026-0${1 + Math.floor(rnd() * 9)}-${String(1 + Math.floor(rnd() * 28)).padStart(2, '0')}`
    };
  });
}

const STATUS_TONE: Record<Person['status'], 'success' | 'default' | 'warning'> = { Active: 'success', Inactive: 'default', Pending: 'warning' };

export const TableLab: React.FC = () => {
  const { toast } = useToast();
  const [state, setState] = useState<'ready' | 'loading' | 'empty' | 'error'>('ready');
  const [pageSize, setPageSize] = useState<'5' | '10' | '20'>('5');
  const [selectable, setSelectable] = useState(true);
  const [actions, setActions] = useState(true);
  const [rowCount, setRowCount] = useState<'8' | '40' | '120'>('40');
  const rows = useMemo(() => makePeople(Number(rowCount)), [rowCount]);
  useLabStatus(`${rows.length} rows · ${state}`);

  const columns: Column<Person>[] = [
    { id: 'name', header: 'Name', sortValue: (r) => r.name, cell: (r) => <span className="labs-person"><Avatar name={r.name} size="sm" /><span><span className="labs-person__name">{r.name}</span><span className="labs-person__email">{r.email}</span></span></span> },
    { id: 'role', header: 'Role', sortValue: (r) => r.role, cell: (r) => r.role },
    { id: 'status', header: 'Status', sortValue: (r) => r.status, cell: (r) => <Badge size="sm" variant={STATUS_TONE[r.status]}>{r.status}</Badge> },
    { id: 'spent', header: 'Spent', align: 'right', sortValue: (r) => r.spent, cell: (r) => `$${r.spent.toLocaleString()}` },
    { id: 'trend', header: 'Trend', width: '120px', cell: (r) => <div style={{ width: 100 }}><Sparkline values={r.trend} height={24} fill={false} /></div> },
    { id: 'joined', header: 'Joined', sortValue: (r) => r.joined, cell: (r) => r.joined, defaultHidden: true }
  ];

  return (
    <>
      <LabControls>
        <WorkspaceSection title="Table" icon={<Table2 size={14} />}>
          <label className="ws-field"><span className="ws-field__label">Rows</span>
            <WorkspaceSegmented label="Row count" value={rowCount} onChange={setRowCount} options={[{ value: '8', label: '8' }, { value: '40', label: '40' }, { value: '120', label: '120' }]} />
          </label>
          <label className="ws-field"><span className="ws-field__label">Per page</span>
            <WorkspaceSegmented label="Page size" value={pageSize} onChange={setPageSize} options={[{ value: '5', label: '5' }, { value: '10', label: '10' }, { value: '20', label: '20' }]} />
          </label>
        </WorkspaceSection>
        <WorkspaceSection title="State" icon={<ToggleLeft size={14} />}>
          <WorkspaceSegmented label="Table state" value={state} onChange={setState} columns={2} options={[{ value: 'ready', label: 'Ready' }, { value: 'loading', label: 'Loading' }, { value: 'empty', label: 'Empty' }, { value: 'error', label: 'Error' }]} />
          <WorkspaceSwitch checked={selectable} onChange={setSelectable} label="Row selection" />
          <WorkspaceSwitch checked={actions} onChange={setActions} label="Action menu" />
        </WorkspaceSection>
      </LabControls>

      <DataTable<Person>
        columns={columns}
        rows={state === 'empty' ? [] : rows}
        rowKey={(r) => r.id}
        searchable={(r) => `${r.name} ${r.email} ${r.role}`}
        filter={{ label: 'Status', value: (r) => r.status, options: ['Active', 'Inactive', 'Pending'] }}
        pageSize={Number(pageSize)}
        selectable={selectable}
        state={state}
        onRetry={() => setState('loading')}
        caption="People with access to this workspace."
        rowActions={actions ? (r) => [
          { id: 'edit', label: 'Edit', icon: <Pencil size={14} />, onSelect: () => toast({ title: `Editing ${r.name}` }) },
          { id: 'mail', label: 'Send email', icon: <Mail size={14} />, onSelect: () => toast({ tone: 'success', title: 'Email sent', description: r.email }) },
          { id: 'dup', label: 'Duplicate', icon: <Copy size={14} /> },
          'separator',
          { id: 'del', label: 'Remove', icon: <Trash2 size={14} />, danger: true, onSelect: () => toast({ tone: 'error', title: `${r.name} removed` }) }
        ] : undefined}
      />
    </>
  );
};

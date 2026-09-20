import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, MoreHorizontal, Columns3, RefreshCw } from 'lucide-react';
import { Checkbox } from './Selection';
import { Input } from './Input';
import { Button } from './Button';
import { Pagination } from './Navigation';
import { Skeleton, EmptyState, Alert } from './Feedback';
import { DropdownMenu, Popover } from './Overlay';
import type { MenuEntry } from './Overlay';
import './DataTable.css';

export interface Column<Row> {
  id: string;
  header: string;
  cell: (row: Row) => ReactNode;
  sortValue?: (row: Row) => string | number;
  align?: 'left' | 'right' | 'center';
  width?: string;
  /** Hidden by default in the column picker. */
  defaultHidden?: boolean;
}

export interface DataTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Text search across these fields. */
  searchable?: (row: Row) => string;
  /** Status filter: field + options. */
  filter?: { label: string; value: (row: Row) => string; options: string[] };
  pageSize?: number;
  selectable?: boolean;
  rowActions?: (row: Row) => MenuEntry[];
  state?: 'ready' | 'loading' | 'empty' | 'error';
  onRetry?: () => void;
  caption?: string;
  className?: string;
}

type SortDir = 'asc' | 'desc';

export function DataTable<Row>({
  columns, rows, rowKey, searchable, filter, pageSize = 5, selectable = true, rowActions, state = 'ready', onRetry, caption, className = ''
}: DataTableProps<Row>) {
  const [query, setQuery] = useState('');
  const [filterValue, setFilterValue] = useState('All');
  const [sort, setSort] = useState<{ id: string; dir: SortDir } | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)));

  const visibleColumns = columns.filter((c) => !hidden.has(c.id));

  const processed = useMemo(() => {
    let list = rows;
    if (query && searchable) {
      const q = query.toLowerCase();
      list = list.filter((r) => searchable(r).toLowerCase().includes(q));
    }
    if (filter && filterValue !== 'All') list = list.filter((r) => filter.value(r) === filterValue);
    if (sort) {
      const col = columns.find((c) => c.id === sort.id);
      if (col?.sortValue) {
        const sv = col.sortValue;
        list = [...list].sort((a, b) => {
          const va = sv(a), vb = sv(b);
          const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
          return sort.dir === 'asc' ? cmp : -cmp;
        });
      }
    }
    return list;
  }, [rows, query, searchable, filter, filterValue, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = processed.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pageKeys = pageRows.map(rowKey);
  const allOnPage = pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));
  const someOnPage = pageKeys.some((k) => selected.has(k));

  const toggleSort = (id: string) => {
    setSort((prev) => (prev?.id === id ? (prev.dir === 'asc' ? { id, dir: 'desc' } : null) : { id, dir: 'asc' }));
  };

  const toggleAll = (on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      pageKeys.forEach((k) => (on ? next.add(k) : next.delete(k)));
      return next;
    });
  };

  const toggleRow = (k: string) => setSelected((prev) => { const next = new Set(prev); if (next.has(k)) next.delete(k); else next.add(k); return next; });

  const effectiveState = state === 'ready' && processed.length === 0 ? 'empty' : state;

  return (
    <div className={`ui-table-wrap ${className}`}>
      <div className="ui-table-toolbar">
        <div className="ui-table-toolbar__left">
          {searchable && (
            <Input placeholder="Search…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} icon={<Search size={16} />} aria-label="Search rows" className="ui-table-search" />
          )}
          {filter && (
            <div className="ui-table-filters" role="group" aria-label={filter.label}>
              {['All', ...filter.options].map((o) => (
                <button key={o} type="button" className={`ui-table-filter ${filterValue === o ? 'ui-table-filter--active' : ''}`} aria-pressed={filterValue === o} onClick={() => { setFilterValue(o); setPage(1); }}>{o}</button>
              ))}
            </div>
          )}
        </div>
        <div className="ui-table-toolbar__right">
          {selected.size > 0 && <span className="ui-table-selected">{selected.size} selected</span>}
          <Popover align="end" title="Columns" trigger={<Button size="sm" variant="ghost" icon={<Columns3 size={14} />}>Columns</Button>}>
            <div className="ui-table-columns">
              {columns.map((c) => (
                <Checkbox key={c.id} label={c.header} checked={!hidden.has(c.id)} onChange={(e) => setHidden((prev) => { const next = new Set(prev); if (e.target.checked) next.delete(c.id); else next.add(c.id); return next; })} />
              ))}
            </div>
          </Popover>
        </div>
      </div>

      <div className="ui-table-scroll">
        <table className="ui-table">
          {caption && <caption className="ui-table__caption">{caption}</caption>}
          <thead>
            <tr>
              {selectable && (
                <th className="ui-table__check">
                  <Checkbox aria-label="Select all rows on this page" checked={allOnPage} indeterminate={someOnPage && !allOnPage} onChange={(e) => toggleAll(e.target.checked)} />
                </th>
              )}
              {visibleColumns.map((c) => (
                <th key={c.id} style={{ width: c.width, textAlign: c.align }} aria-sort={sort?.id === c.id ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortValue ? (
                    <button type="button" className="ui-table__sort" onClick={() => toggleSort(c.id)}>
                      {c.header}
                      {sort?.id === c.id ? (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ArrowUpDown size={12} className="ui-table__sort-idle" />}
                    </button>
                  ) : c.header}
                </th>
              ))}
              {rowActions && <th className="ui-table__actions-head"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {effectiveState === 'loading' && Array.from({ length: pageSize }).map((_, i) => (
              <tr key={`sk-${i}`} className="ui-table__row">
                {selectable && <td><Skeleton width={16} height={16} /></td>}
                {visibleColumns.map((c) => <td key={c.id}><Skeleton width={`${50 + ((i * 17) % 40)}%`} /></td>)}
                {rowActions && <td />}
              </tr>
            ))}
            {effectiveState === 'ready' && pageRows.map((row) => {
              const k = rowKey(row);
              return (
                <tr key={k} className={`ui-table__row ${selected.has(k) ? 'ui-table__row--selected' : ''}`} aria-selected={selectable ? selected.has(k) : undefined}>
                  {selectable && <td className="ui-table__check"><Checkbox aria-label={`Select row ${k}`} checked={selected.has(k)} onChange={() => toggleRow(k)} /></td>}
                  {visibleColumns.map((c) => <td key={c.id} style={{ textAlign: c.align }}>{c.cell(row)}</td>)}
                  {rowActions && (
                    <td className="ui-table__actions">
                      <DropdownMenu align="end" trigger={<Button iconOnly size="sm" variant="ghost" aria-label="Row actions" icon={<MoreHorizontal size={16} />} />} items={rowActions(row)} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {effectiveState === 'empty' && (
          <EmptyState title={query || filterValue !== 'All' ? 'No rows match' : 'Nothing here yet'} description={query || filterValue !== 'All' ? 'Try a different search or clear the filter.' : 'Rows will appear here once data is loaded.'} action={(query || filterValue !== 'All') ? <Button size="sm" variant="secondary" onClick={() => { setQuery(''); setFilterValue('All'); }}>Clear filters</Button> : undefined} className="ui-table__state" />
        )}
        {effectiveState === 'error' && (
          <Alert tone="error" title="Couldn't load rows" action={onRetry && <Button size="sm" variant="outline" icon={<RefreshCw size={14} />} onClick={onRetry}>Retry</Button>} className="ui-table__state">The request failed. Check your connection and try again.</Alert>
        )}
      </div>

      <div className="ui-table-footer">
        <span className="ui-table-count">
          {effectiveState === 'ready' ? `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, processed.length)} of ${processed.length}` : ''}
        </span>
        <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
      </div>
    </div>
  );
}

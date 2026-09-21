import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { getStyleDataAttributes } from '../../engine/styleAttributes';
import type { StyleDefinition } from '../../engine/types';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Toggle, Checkbox, Slider } from '../../components/ui/Selection';
import { Tabs } from '../../components/ui/Navigation';
import { Progress, Alert } from '../../components/ui/Feedback';
import { Stat, ActivityFeed } from '../../components/ui/DataDisplay';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import { makeSeries } from '../../components/charts/chartUtils';
import { Columns, Columns3, Square, X, Link2, Link2Off, GitCompareArrows } from 'lucide-react';
import './CompareView.css';

type Mode = 1 | 2 | 3;

/** Shared interaction state so every panel shows the same component state. */
interface SharedState {
  tab: string;
  toggle: boolean;
  checked: boolean;
  slider: number;
  text: string;
}

const CompareSample: React.FC<{ style: StyleDefinition; shared: SharedState; setShared: (patch: Partial<SharedState>) => void }> = ({ style, shared, setShared }) => {
  const series = useMemo(() => [makeSeries('Revenue', 7, 7), makeSeries('Costs', 7, 19, 40, 25)], []);
  const bars = useMemo(() => [makeSeries('Visits', 5, 3)], []);
  return (
    <div className="compare-sample">
      <div className="compare-sample__hero">
        <Badge variant="accent" size="sm">{style.metadata.category}</Badge>
        <h2 className="compare-sample__title">{style.metadata.name}</h2>
        <p className="compare-sample__desc">{style.metadata.description}</p>
      </div>
      <div className="compare-sample__stats">
        <Card><CardBody><Stat label="Revenue" value="$128,450" delta="+14.2%" /></CardBody></Card>
        <Card><CardBody><Stat label="Users" value="24,890" delta="-0.8%" positive={false} /></CardBody></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Revenue</CardTitle><Button size="sm" variant="outline">Monthly</Button></CardHeader>
        <CardBody><LineChart series={series} height={150} /></CardBody>
      </Card>
      <Card>
        <CardHeader><CardTitle>Engagement</CardTitle></CardHeader>
        <CardBody><BarChart series={bars} height={130} /></CardBody>
      </Card>
      <Card>
        <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
        <CardBody className="compare-sample__stack">
          <Tabs label="Sections" tabs={[{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Tokens' }, { id: 'c', label: 'Motion' }]} value={shared.tab} onChange={(tab) => setShared({ tab })} />
          <div className="lab-component-row">
            <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Badge variant="success">Live</Badge>
          </div>
          <Input label="Synchronized input" placeholder="Type in any panel…" value={shared.text} onChange={(e) => setShared({ text: e.target.value })} />
          <Toggle checked={shared.toggle} onChange={(toggle) => setShared({ toggle })} label="Notifications" />
          <Checkbox label="Remember me" checked={shared.checked} onChange={(e) => setShared({ checked: e.target.checked })} />
          <Slider label="Volume" value={shared.slider} onChange={(slider) => setShared({ slider })} />
          <Progress label="Storage" value={shared.slider} />
          <Alert tone="info" title="Same data, same layout">Only the visual system changes between panels.</Alert>
        </CardBody>
      </Card>
      <Card>
        <CardHeader><CardTitle>Activity</CardTitle></CardHeader>
        <CardBody>
          <ActivityFeed items={[
            { user: 'Sophia Martinez', action: 'remixed', target: 'Glassmorphism', time: '2m' },
            { user: 'Marcus Vance', action: 'favorited', target: 'Neo Brutalism', time: '18m' },
            { user: 'Amara Okafor', action: 'exported', target: 'tokens.json', time: '1h' }
          ]} />
        </CardBody>
      </Card>
    </div>
  );
};

export const CompareView: React.FC<{ onOpenDiff?: () => void }> = ({ onOpenDiff }) => {
  const { currentStyle, availableStyles, setIsCompareActive, compareStyleIds, setCompareStyleIds } = useStyle();
  const distinct = availableStyles.filter((s) => s.metadata.id !== currentStyle.metadata.id).map((s) => s.metadata.id);
  const [ids, setIdsState] = useState<string[]>(() => {
    const saved = compareStyleIds.filter((id) => availableStyles.some((s) => s.metadata.id === id));
    return saved.length >= 2 ? saved.slice(0, 3) : [currentStyle.metadata.id, distinct[0] ?? currentStyle.metadata.id, distinct[1] ?? currentStyle.metadata.id];
  });
  const [mode, setMode] = useState<Mode>(() => (compareStyleIds.length === 3 ? 3 : 2));
  const [sync, setSync] = useState(true);
  const [shared, setSharedState] = useState<SharedState>({ tab: 'a', toggle: true, checked: false, slider: 64, text: '' });
  const setShared = (patch: Partial<SharedState>) => setSharedState((s) => ({ ...s, ...patch }));
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const syncing = useRef(false);

  const setIds = (next: string[]) => { setIdsState(next); setCompareStyleIds(next.slice(0, mode)); };
  useEffect(() => { setCompareStyleIds(ids.slice(0, mode)); }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const panels = ids.slice(0, mode).map((id) => availableStyles.find((s) => s.metadata.id === id) ?? currentStyle);

  const onScroll = (index: number) => (e: React.UIEvent<HTMLDivElement>) => {
    if (!sync || syncing.current) return;
    syncing.current = true;
    const top = e.currentTarget.scrollTop;
    panelRefs.current.forEach((el, i) => { if (el && i !== index) el.scrollTop = top; });
    requestAnimationFrame(() => { syncing.current = false; });
  };

  return (
    <div className="compare-view-root">
      <div className="compare-bar">
        <div className="compare-title-row">
          <Columns size={18} />
          <strong>Compare</strong>
          <div className="compare-modes" role="radiogroup" aria-label="Panels">
            {([[1, 'Single', <Square size={14} key="1" />], [2, 'Compare', <Columns size={14} key="2" />], [3, 'Triple', <Columns3 size={14} key="3" />]] as [Mode, string, React.ReactNode][]).map(([m, label, icon]) => (
              <button key={m} type="button" role="radio" aria-checked={mode === m} className={`compare-mode ${mode === m ? 'compare-mode--active' : ''}`} onClick={() => setMode(m)}>{icon} {label}</button>
            ))}
          </div>
          <button type="button" className={`compare-mode ${sync ? 'compare-mode--active' : ''}`} onClick={() => setSync((v) => !v)} aria-pressed={sync} title="Synchronize scroll and interaction across panels">
            {sync ? <Link2 size={14} /> : <Link2Off size={14} />} Sync
          </button>
          {onOpenDiff && mode >= 2 && (
            <button type="button" className="compare-mode" onClick={onOpenDiff}><GitCompareArrows size={14} /> Diff A/B</button>
          )}
        </div>
        <Button variant="ghost" size="sm" icon={<X size={16} />} onClick={() => setIsCompareActive(false)}>Exit Compare</Button>
      </div>

      <div className={`compare-split compare-split--${mode}`}>
        {panels.map((style, index) => (
          <div key={`${index}-${style.metadata.id}`} className="compare-panel" style={resolveStyleToCssVars(style) as React.CSSProperties} {...getStyleDataAttributes(style)}>
            <div className="compare-panel-header">
              <span className="compare-panel-slot">{String.fromCharCode(65 + index)}</span>
              <select value={style.metadata.id} onChange={(e) => setIds(ids.map((id, i) => (i === index ? e.target.value : id)))} className="shell-select" aria-label={`Style for panel ${String.fromCharCode(65 + index)}`}>
                {availableStyles.map((s) => (
                  <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name} ({s.metadata.category})</option>
                ))}
              </select>
            </div>
            <div className="compare-panel-content" ref={(el) => { panelRefs.current[index] = el; }} onScroll={onScroll(index)}>
              <CompareSample style={style} shared={shared} setShared={sync ? setShared : (patch) => setShared(patch)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

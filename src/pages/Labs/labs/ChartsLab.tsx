import React, { useMemo, useState } from 'react';
import { ChartColumn, Sliders, Database } from 'lucide-react';
import { LabControls, useLabStatus } from '../LabsPage';
import { WorkspaceSection, WorkspaceSegmented, WorkspaceSwitch } from '../../../components/workspace/Workspace';
import { Slider } from '../../../components/ui/Selection';
import { LineChart } from '../../../components/charts/LineChart';
import { BarChart } from '../../../components/charts/BarChart';
import { DonutChart, RadialChart, Sparkline, ScatterChart, Waveform } from '../../../components/charts/RadialCharts';
import { ProgressRing, Progress } from '../../../components/ui/Feedback';
import { makeSeries, mulberry } from '../../../components/charts/chartUtils';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';

type ChartType = 'line' | 'area' | 'bar' | 'hbar' | 'donut' | 'pie' | 'radial' | 'progress' | 'sparkline' | 'scatter' | 'waveform';
type Dataset = 'revenue' | 'traffic' | 'signups';

const DATASET_SEED: Record<Dataset, number> = { revenue: 11, traffic: 23, signups: 37 };

export const ChartsLab: React.FC = () => {
  const [type, setType] = useState<ChartType>('line');
  const [dataset, setDataset] = useState<Dataset>('revenue');
  const [points, setPoints] = useState(12);
  const [seriesCount, setSeriesCount] = useState<'1' | '2' | '3'>('2');
  const [scaleMax, setScaleMax] = useState(0);
  const [labels, setLabels] = useState(true);
  const [grid, setGrid] = useState(true);
  const [tooltip, setTooltip] = useState(true);
  const [animate, setAnimate] = useState(true);
  const [gradient, setGradient] = useState(true);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fill, setFill] = useState(true);
  const [showAll, setShowAll] = useState(true);
  useLabStatus(`${type} · ${points} points · ${seriesCount} series`);

  const series = useMemo(() => {
    const names = ['Revenue', 'Costs', 'Profit'];
    return Array.from({ length: Number(seriesCount) }, (_, i) => makeSeries(names[i], points, DATASET_SEED[dataset] + i * 101, 50 + i * 20, 30 + i * 10));
  }, [dataset, points, seriesCount]);

  const single = series[0].data;
  const parts = useMemo(() => single.slice(0, 5).map((d, i) => ({ label: ['Organic', 'Paid', 'Referral', 'Social', 'Email'][i], value: d.value })), [single]);
  const scatter = useMemo(() => { const rnd = mulberry(DATASET_SEED[dataset]); return Array.from({ length: points * 2 }, (_, i) => ({ x: Math.round(rnd() * 100), y: Math.round(rnd() * 100), label: `Sample ${i + 1}`, size: 4 + rnd() * 8 })); }, [dataset, points]);
  const samples = useMemo(() => { const rnd = mulberry(DATASET_SEED[dataset] + 5); return Array.from({ length: 64 }, (_, i) => Math.sin(i / 4) * 0.5 + (rnd() - 0.5) * 0.6); }, [dataset]);

  const render = (t: ChartType) => {
    switch (t) {
      case 'line': return <LineChart series={series} yMax={scaleMax || undefined} showGrid={grid} showLabels={labels} showTooltip={tooltip} animate={animate} gradient={gradient} strokeWidth={strokeWidth} />;
      case 'area': return <LineChart series={series} area yMax={scaleMax || undefined} showGrid={grid} showLabels={labels} showTooltip={tooltip} animate={animate} gradient strokeWidth={strokeWidth} />;
      case 'bar': return <BarChart series={series} yMax={scaleMax || undefined} showGrid={grid} showLabels={labels} showTooltip={tooltip} animate={animate} />;
      case 'hbar': return <BarChart series={[series[0]]} horizontal showGrid={grid} showLabels={labels} showTooltip={tooltip} animate={animate} height={Math.max(160, points * 22)} />;
      case 'donut': return <DonutChart data={parts} animate={animate} centerLabel="Traffic" />;
      case 'pie': return <DonutChart data={parts} pie animate={animate} />;
      case 'radial': return <RadialChart data={parts.slice(0, 4)} animate={animate} />;
      case 'progress': return <div className="labs-progress"><ProgressRing value={68} /><ProgressRing value={42} tone="warning" /><ProgressRing value={91} tone="success" /><div style={{ flex: 1, minWidth: 220 }}><Progress label="Quarter goal" value={68} /><Progress label="Tickets closed" value={42} tone="warning" size="sm" /></div></div>;
      case 'sparkline': return <div className="labs-sparklines">{series.map((s, i) => <div key={i} className="labs-sparkline"><span>{s.name}</span><Sparkline values={s.data.map((d) => d.value)} height={44} fill={fill} strokeWidth={strokeWidth} /></div>)}</div>;
      case 'scatter': return <ScatterChart points={scatter} showGrid={grid} animate={animate} />;
      case 'waveform': return <Waveform samples={samples} progress={0.45} animate={animate} />;
      default: return null;
    }
  };

  const ALL: ChartType[] = ['line', 'area', 'bar', 'hbar', 'donut', 'pie', 'radial', 'progress', 'sparkline', 'scatter', 'waveform'];
  const NAMES: Record<ChartType, string> = { line: 'Line', area: 'Area', bar: 'Bar', hbar: 'Horizontal bar', donut: 'Donut', pie: 'Pie', radial: 'Radial', progress: 'Progress', sparkline: 'Sparkline', scatter: 'Scatter', waveform: 'Waveform' };

  return (
    <>
      <LabControls>
        <WorkspaceSection title="Chart" icon={<ChartColumn size={14} />}>
          <label className="ws-field"><span className="ws-field__label">Type</span>
            <select className="ws-select" value={type} onChange={(e) => setType(e.target.value as ChartType)}>
              {ALL.map((t) => <option key={t} value={t}>{NAMES[t]}</option>)}
            </select>
          </label>
          <WorkspaceSwitch checked={showAll} onChange={setShowAll} label="Show every chart type" />
        </WorkspaceSection>
        <WorkspaceSection title="Dataset" icon={<Database size={14} />}>
          <WorkspaceSegmented label="Dataset" value={dataset} onChange={setDataset} options={[{ value: 'revenue', label: 'Revenue' }, { value: 'traffic', label: 'Traffic' }, { value: 'signups', label: 'Signups' }]} />
          <WorkspaceSegmented label="Series" value={seriesCount} onChange={setSeriesCount} options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]} />
          <div className="labs-slider"><Slider label="Points" value={points} min={4} max={30} onChange={setPoints} /></div>
          <div className="labs-slider"><Slider label="Scale max" value={scaleMax} min={0} max={300} step={10} format={(v) => (v === 0 ? 'auto' : String(v))} onChange={setScaleMax} /></div>
        </WorkspaceSection>
        <WorkspaceSection title="Options" icon={<Sliders size={14} />}>
          <WorkspaceSwitch checked={labels} onChange={setLabels} label="Labels" />
          <WorkspaceSwitch checked={grid} onChange={setGrid} label="Grid" />
          <WorkspaceSwitch checked={tooltip} onChange={setTooltip} label="Tooltip" />
          <WorkspaceSwitch checked={animate} onChange={setAnimate} label="Animation" />
          <WorkspaceSwitch checked={gradient} onChange={setGradient} label="Gradient fill" />
          <WorkspaceSwitch checked={fill} onChange={setFill} label="Sparkline fill" />
          <div className="labs-slider"><Slider label="Stroke" value={strokeWidth} min={1} max={6} onChange={setStrokeWidth} /></div>
        </WorkspaceSection>
      </LabControls>

      <div className="labs-charts">
        <Card className="labs-chart-main">
          <CardHeader><CardTitle>{NAMES[type]}</CardTitle></CardHeader>
          <CardBody>{render(type)}</CardBody>
        </Card>
        {showAll && (
          <div className="labs-chart-grid">
            {ALL.filter((t) => t !== type).map((t) => (
              <Card key={t} hoverable onClick={() => setType(t)}>
                <CardHeader><CardTitle>{NAMES[t]}</CardTitle></CardHeader>
                <CardBody>{render(t)}</CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

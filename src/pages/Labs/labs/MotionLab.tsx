import React, { useState } from 'react';
import { Zap, Settings2 } from 'lucide-react';
import { LabControls, useLabStatus } from '../LabsPage';
import { WorkspaceSection, WorkspaceSegmented, WorkspaceSwitch } from '../../../components/workspace/Workspace';
import { Slider } from '../../../components/ui/Selection';
import { useStyle } from '../../../hooks/useStyle';
import { Card, CardHeader, CardTitle, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/ui/Navigation';
import { Modal, DropdownMenu } from '../../../components/ui/Overlay';
import { useToast } from '../../../components/ui/Feedback';
import { LineChart } from '../../../components/charts/LineChart';
import { Backdrop } from '../../../components/svg/Backdrop';
import { makeSeries } from '../../../components/charts/chartUtils';
import './MotionLab.css';

const EASINGS = [
  { id: 'style', label: 'Style default', value: 'var(--motion-easing)' },
  { id: 'linear', label: 'Linear', value: 'linear' },
  { id: 'ease-out', label: 'Ease out', value: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'spring', label: 'Spring', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  { id: 'steps', label: 'Stepped', value: 'steps(4, end)' }
];

export const MotionLab: React.FC = () => {
  const { resolvedCssVars: v, settings, updateSettings } = useStyle();
  const { toast } = useToast();
  const [duration, setDuration] = useState(0);
  const [delay, setDelay] = useState(0);
  const [easing, setEasing] = useState('style');
  const [scale, setScale] = useState(1.05);
  const [translate, setTranslate] = useState(12);
  const [blur, setBlur] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [replay, setReplay] = useState(0);
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState('a');
  const [chartKey, setChartKey] = useState(0);
  useLabStatus(`${duration === 0 ? v['--duration-normal'] : `${duration}ms`} · ${EASINGS.find((e) => e.id === easing)?.label}`);

  const vars = {
    '--lab-duration': duration === 0 ? 'var(--duration-normal)' : `${duration}ms`,
    '--lab-delay': `${delay}ms`,
    '--lab-easing': EASINGS.find((e) => e.id === easing)?.value ?? 'var(--motion-easing)',
    '--lab-scale': String(scale),
    '--lab-translate': `${translate}px`,
    '--lab-blur': `${blur}px`,
    '--lab-opacity': String(1 - opacity),
    '--lab-rotation': `${rotation}deg`
  } as React.CSSProperties;

  return (
    <>
      <LabControls>
        <WorkspaceSection title="Timing" icon={<Zap size={14} />}>
          <div className="labs-slider"><Slider label="Duration" value={duration} min={0} max={1200} step={20} format={(x) => (x === 0 ? `style (${v['--duration-normal']})` : `${x}ms`)} onChange={setDuration} /></div>
          <div className="labs-slider"><Slider label="Delay" value={delay} min={0} max={600} step={20} format={(x) => `${x}ms`} onChange={setDelay} /></div>
          <label className="ws-field"><span className="ws-field__label">Easing</span>
            <select className="ws-select" value={easing} onChange={(e) => setEasing(e.target.value)}>
              {EASINGS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
            </select>
          </label>
        </WorkspaceSection>
        <WorkspaceSection title="Transform" icon={<Settings2 size={14} />}>
          <div className="labs-slider"><Slider label="Scale" value={scale} min={0.8} max={1.3} step={0.01} format={(x) => x.toFixed(2)} onChange={setScale} /></div>
          <div className="labs-slider"><Slider label="Translate" value={translate} min={0} max={80} format={(x) => `${x}px`} onChange={setTranslate} /></div>
          <div className="labs-slider"><Slider label="Blur" value={blur} min={0} max={16} format={(x) => `${x}px`} onChange={setBlur} /></div>
          <div className="labs-slider"><Slider label="Fade" value={opacity} min={0} max={1} step={0.05} format={(x) => `${Math.round(x * 100)}%`} onChange={setOpacity} /></div>
          <div className="labs-slider"><Slider label="Rotation" value={rotation} min={-45} max={45} format={(x) => `${x}°`} onChange={setRotation} /></div>
        </WorkspaceSection>
        <WorkspaceSection title="Accessibility" icon={<Zap size={14} />}>
          <WorkspaceSwitch checked={settings.reduceMotion} onChange={(on) => updateSettings({ reduceMotion: on })} label="Reduce motion" />
          <label className="ws-field"><span className="ws-field__label">Intensity</span>
            <WorkspaceSegmented label="Motion intensity" value={String(settings.motionIntensity) as '0.5' | '1' | '1.5'} onChange={(x) => updateSettings({ motionIntensity: Number(x) as 0.5 | 1 | 1.5 })} options={[{ value: '0.5', label: 'Calm' }, { value: '1', label: 'Normal' }, { value: '1.5', label: 'Expressive' }]} />
          </label>
          <p className="ws-hint">These two are app-wide settings and persist.</p>
        </WorkspaceSection>
      </LabControls>

      <div className="motion-lab" style={vars}>
        <Card>
          <CardHeader><CardTitle>Style motion tokens</CardTitle></CardHeader>
          <CardBody>
            <dl className="lab-kv">
              <dt>Fast / normal / slow</dt><dd>{v['--duration-fast']} / {v['--duration-normal']} / {v['--duration-slow']}</dd>
              <dt>Easing</dt><dd>{v['--motion-easing']}</dd>
              <dt>Hover / press scale</dt><dd>{v['--hover-scale']} / {v['--active-scale']}</dd>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Playground</CardTitle><Button size="sm" variant="secondary" onClick={() => setReplay((r) => r + 1)}>Replay</Button></CardHeader>
          <CardBody>
            <div className="motion-stage">
              <div key={replay} className="motion-sample">
                <div className="motion-sample__box">Enter</div>
              </div>
              <div className="motion-sample motion-sample--hover">
                <div className="motion-sample__box">Hover</div>
              </div>
            </div>
            <p className="motion-note">Enter uses translate, blur, fade and rotation; hover uses scale. Duration, delay and easing apply to both.</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Button press</CardTitle></CardHeader>
          <CardBody className="lab-component-row">
            <Button>Press and hold</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Modal &amp; dropdown entrance</CardTitle></CardHeader>
          <CardBody className="lab-component-row">
            <Button onClick={() => setModal(true)}>Open modal</Button>
            <DropdownMenu trigger={<Button variant="secondary">Open dropdown</Button>} items={[{ id: 'a', label: 'First item' }, { id: 'b', label: 'Second item' }, 'separator', { id: 'c', label: 'Third item' }]} />
            <Modal open={modal} onClose={() => setModal(false)} title="Modal entrance" description="Watch the scale and fade as it opens." footer={<Button onClick={() => setModal(false)}>Close</Button>} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Toast entrance</CardTitle></CardHeader>
          <CardBody className="lab-component-row">
            <Button variant="secondary" onClick={() => toast({ tone: 'success', title: 'Toast entrance', description: 'Slides up and fades in with the style easing.' })}>Show toast</Button>
          </CardBody>
        </Card>

        <Card hoverable>
          <CardHeader><CardTitle>Card hover</CardTitle></CardHeader>
          <CardBody>Hover this card to see the style's lift, shift or glow behaviour.</CardBody>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tab transition</CardTitle></CardHeader>
          <CardBody>
            <Tabs label="Motion tabs" tabs={[{ id: 'a', label: 'Overview' }, { id: 'b', label: 'Tokens' }, { id: 'c', label: 'Motion' }]} value={tab} onChange={setTab} />
            <div className="motion-tabpanel" key={tab}>Panel {tab.toUpperCase()} enters with the current timing.</div>
          </CardBody>
        </Card>

        <Card className="motion-wide">
          <CardHeader><CardTitle>Chart animation</CardTitle><Button size="sm" variant="ghost" onClick={() => setChartKey((k) => k + 1)}>Replay</Button></CardHeader>
          <CardBody><LineChart key={chartKey} series={[makeSeries('Revenue', 10, 7)]} animate /></CardBody>
        </Card>

        <Card className="motion-wide">
          <CardHeader><CardTitle>SVG animation</CardTitle></CardHeader>
          <CardBody><Backdrop preset="aurora" seed={3} intensity={0.7} animate={!settings.reduceMotion} height={160} /></CardBody>
        </Card>
      </div>
    </>
  );
};

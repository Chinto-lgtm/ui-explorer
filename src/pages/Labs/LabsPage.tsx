import React, { Suspense, createContext, lazy, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { Table2, ChartColumn, BellRing, Zap, Layers, Shapes, PenTool } from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { ToastProvider } from '../../components/ui/Feedback';
import { TableLab } from './labs/TableLab';
import { ChartsLab } from './labs/ChartsLab';
import { NotificationsLab } from './labs/NotificationsLab';
import { MotionLab } from './labs/MotionLab';
import { MaterialLab } from './labs/MaterialLab';
// The icon lab pulls in the whole icon set; keep it out of the Labs chunk until it is opened.
const IconLab = lazy(() => import('./labs/IconLab').then((m) => ({ default: m.IconLab })));
import { SvgLab } from './labs/SvgLab';
import '../../components/layout/Workspace.css';
import './LabsPage.css';

interface LabDef {
  id: string;
  label: string;
  icon: ReactNode;
  blurb: string;
  Component: React.FC;
}

const LABS: LabDef[] = [
  { id: 'table', label: 'Table', icon: <Table2 size={16} />, blurb: 'Search, sort, filter, paginate, select, hide columns, row actions and every state.', Component: TableLab },
  { id: 'charts', label: 'Data visualization', icon: <ChartColumn size={16} />, blurb: 'Ten chart types that follow the active style: curves, glow, corner language and colours.', Component: ChartsLab },
  { id: 'notifications', label: 'Notifications', icon: <BellRing size={16} />, blurb: 'A notification center with read state, counters, actions and a bell popover.', Component: NotificationsLab },
  { id: 'motion', label: 'Motion', icon: <Zap size={16} />, blurb: 'Inspect and tune duration, easing, scale and translation across real interactions.', Component: MotionLab },
  { id: 'material', label: 'Material', icon: <Layers size={16} />, blurb: 'Fourteen surface materials with highlight, shadow, reflection, texture, blur and transparency.', Component: MaterialLab },
  { id: 'icons', label: 'Icons', icon: <Shapes size={16} />, blurb: 'Icon styles from outline to pixel, previewed inside buttons, navigation, cards and inputs.', Component: IconLab },
  { id: 'svg', label: 'SVG', icon: <PenTool size={16} />, blurb: 'Procedural decorative presets: mesh, aurora, grid, blobs, waves, rings, glow, noise, liquid, chrome.', Component: SvgLab }
];

interface LabChrome {
  controlsHost: HTMLElement | null;
  setStatus: (text: string) => void;
}

const LabChromeContext = createContext<LabChrome>({ controlsHost: null, setStatus: () => undefined });

/** Labs render their settings into the shared sidebar and their preview into the stage. */
export const LabControls: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { controlsHost } = useContext(LabChromeContext);
  return controlsHost ? createPortal(children, controlsHost) : null;
};

export const useLabStatus = (text: string) => {
  const { setStatus } = useContext(LabChromeContext);
  useEffect(() => { setStatus(text); }, [text, setStatus]);
};

export const LabsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const initial = LABS.find((l) => l.id === params.get('lab'))?.id ?? 'table';
  const [active, setActive] = useState(initial);
  const [controlsHost, setControlsHost] = useState<HTMLElement | null>(null);
  const [status, setStatus] = useState('');
  const { currentStyle } = useStyle();
  const lab = LABS.find((l) => l.id === active) ?? LABS[0];

  const select = (id: string) => {
    setActive(id);
    setStatus('');
    setParams({ lab: id }, { replace: true });
  };

  return (
    <LabChromeContext.Provider value={{ controlsHost, setStatus }}>
      <div className="ws-workspace labs-workspace">
        <aside className="ws-settings" aria-label="Labs">
          <div className="ws-settings__header">
            <h1 className="ws-title">Labs</h1>
            <p className="ws-subtitle">Data, motion, material, icons and SVG under the active style.</p>
          </div>
          <div className="ws-settings__scroll">
            <div className="ws-section" style={{ borderBottom: '1px solid var(--chrome-border)' }}>
              <div className="ws-section__body" style={{ paddingTop: '0.5rem' }}>
                <div className="ws-category-list" role="group" aria-label="Lab">
                  {LABS.map((l) => (
                    <button key={l.id} type="button" className={`ws-category ${active === l.id ? 'ws-category--active' : ''}`} aria-pressed={active === l.id} onClick={() => select(l.id)}>
                      <span className="ws-category__icon">{l.icon}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div ref={setControlsHost} className="labs-controls-host" />
          </div>
        </aside>

        <section className="ws-stage" aria-label={`${lab.label} lab`}>
          <header className="ws-stage__bar">
            <div className="ws-stage__status" aria-live="polite">
              <span className="ws-stage__dot" aria-hidden="true" />
              {lab.label} · {currentStyle.metadata.name}{status ? ` · ${status}` : ''}
            </div>
            <span className="labs-blurb">{lab.blurb}</span>
          </header>
          <div className="ws-stage__body labs-stage">
            <ToastProvider>
              <div className="labs-canvas" key={lab.id}>
                <Suspense fallback={<div className="page-loading" role="status">Loading…</div>}><lab.Component /></Suspense>
              </div>
            </ToastProvider>
          </div>
        </section>
      </div>
    </LabChromeContext.Provider>
  );
};

export default LabsPage;

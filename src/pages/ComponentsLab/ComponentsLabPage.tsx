import React, { Suspense, useState, useRef, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useStyle } from '../../hooks/useStyle';
import { useSearchParam, useSearchFlag } from '../../hooks/useUrlState';
import { useCompare, COMPARE_SLOTS } from '../../hooks/useCompare';
import { getStyleDataAttributes } from '../../engine/styleAttributes';
import { ToastProvider } from '../../components/ui/Feedback';
import { LAB_SECTIONS, SECTION_GROUPS, DEFAULT_SECTION, sectionById } from './sections';
import { LabStateProvider, LabFrame } from './labState';
import { Workspace, WorkspacePanel, WorkspaceStage, WorkspaceSection, WorkspaceSearch, WorkspaceSwitch, WorkspaceSegmented } from '../../components/workspace/Workspace';
import { DeviceFrame } from '../../components/workspace/DeviceFrame';
import { deviceOuterSize, fitScale } from '../../components/workspace/device';
import { useElementSize } from '../../hooks/useElementSize';
import type { DeviceKind } from '../../components/workspace/device';
import { LayoutPanelTop, SlidersHorizontal, Monitor, Tablet, Smartphone, Columns3, ToggleLeft, Ruler } from 'lucide-react';
import { motion } from 'motion/react';
import { pageIn } from '../../motion/presets';
import '../../components/preview/showcase.css';
import './ComponentsLabPage.css';

type ViewportId = 'desktop' | 'tablet' | 'mobile' | 'custom';
const VIEWPORT_IDS: readonly ViewportId[] = ['desktop', 'tablet', 'mobile', 'custom'];

const VIEWPORTS: { id: ViewportId; label: string; width: string; icon: ReactNode }[] = [
  { id: 'desktop', label: 'Desktop', width: 'Fluid', icon: <Monitor size={16} /> },
  { id: 'tablet', label: 'Tablet', width: '768px', icon: <Tablet size={16} /> },
  { id: 'mobile', label: 'Mobile', width: '390px', icon: <Smartphone size={16} /> },
  { id: 'custom', label: 'Custom', width: 'px', icon: <Ruler size={16} /> }
];

const WIDTH_PRESETS = [1440, 1280, 1024, 768, 390];
const BREAKPOINTS: { max: number; name: string; layout: string; sidebar: string; nav: string }[] = [
  { max: 640, name: 'Phone', layout: '1 column', sidebar: 'Collapsed', nav: 'Mobile drawer' },
  { max: 1024, name: 'Tablet', layout: '2 columns', sidebar: 'Collapsed', nav: 'Drawer' },
  { max: 1280, name: 'Laptop', layout: '3 columns', sidebar: 'Expanded', nav: 'Sidebar' },
  { max: Infinity, name: 'Desktop', layout: 'Fluid grid', sidebar: 'Expanded', nav: 'Sidebar' }
];

/** Device and screen size for each viewport. Desktop is a fluid browser; the others render at true size and zoom to fit. */
const FRAMES: Record<Exclude<ViewportId, 'desktop' | 'custom'>, { kind: DeviceKind; width: number; height: number }> = {
  tablet: { kind: 'tablet', width: 768, height: 1024 },
  mobile: { kind: 'phone', width: 390, height: 800 }
};
const CUSTOM_HEIGHT = 900;

export const ComponentsLabPage: React.FC = () => {
  const { currentStyle, renderedStyle, resolvedCssVars } = useStyle();
  const params = useParams<{ section?: string }>();
  const { search } = useLocation();
  const section = sectionById(params.section);

  const [filter, setFilter] = useState('');
  const [buttonStateDisabled, setButtonStateDisabled] = useState<boolean>(false);
  const [buttonStateLoading, setButtonStateLoading] = useState<boolean>(false);
  const [viewport, setViewport] = useSearchParam<ViewportId>('device', 'desktop', VIEWPORT_IDS);
  const [widthParam, setWidthParam] = useSearchParam<string>('width', '1024');
  const customWidth = Math.max(280, Math.min(2560, Number(widthParam) || 1024));
  const setCustomWidth = (w: number) => setWidthParam(String(w));
  const [rulers, setRulers] = useSearchFlag('rulers');
  const compare = useCompare();
  const isCompareEnabled = compare.on;
  const [inspector, setInspector] = useState<{ width: number; columns: number } | null>(null);
  const [controlsHost, setControlsHost] = useState<HTMLElement | null>(null);
  const [labStatus, setLabStatus] = useState('');
  const screenRef = useRef<HTMLDivElement>(null);

  // Measure the stage so fixed-size device frames can be zoomed to fit (single or three-up).
  const [canvasEl, setCanvasEl] = useState<HTMLDivElement | null>(null);
  const stageSize = useElementSize(canvasEl);

  // Responsive inspector: measure the live preview so the readout reflects the real layout.
  useLayoutEffect(() => {
    const el = screenRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const grid = el.querySelector<HTMLElement>('.lab-grid');
      const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length : 1;
      setInspector({ width: Math.round(el.clientWidth), columns: cols });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewport, customWidth, section, isCompareEnabled]);

  if (!section) return <Navigate to={`/components/${DEFAULT_SECTION}${search}`} replace />;

  const frame = viewport === 'desktop' ? null
    : viewport === 'custom' ? { kind: 'browser' as DeviceKind, width: customWidth, height: CUSTOM_HEIGHT }
    : FRAMES[viewport];

  const frameScale = !frame || stageSize.width === 0
    ? 1
    : fitScale(stageSize, deviceOuterSize(frame.kind, frame), { count: isCompareEnabled ? 3 : 1, labelled: isCompareEnabled });

  const activeViewportMeta = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[0];
  const breakpoint = inspector ? BREAKPOINTS.find((b) => inspector.width <= b.max) ?? BREAKPOINTS[BREAKPOINTS.length - 1] : null;

  const ActiveSection = section.Component;
  const renderShowcase = (primary: boolean) => (
    <LabFrame primary={primary}>
      <ToastProvider position="bottom-right">
        <Suspense fallback={<div className="page-loading" role="status">Loading…</div>}>
          {/* Each section arrives with a short rise inside the frame. */}
          <motion.div key={section.id} variants={pageIn} initial="hidden" animate="show">
            <ActiveSection disabled={buttonStateDisabled} loading={buttonStateLoading} />
          </motion.div>
        </Suspense>
      </ToastProvider>
    </LabFrame>
  );

  const query = filter.trim().toLowerCase();
  const visible = query
    ? LAB_SECTIONS.filter((c) => c.label.toLowerCase().includes(query) || c.keywords.some((k) => k.includes(query)))
    : LAB_SECTIONS;
  const matchedKeywords = (c: typeof LAB_SECTIONS[number]) => (query ? c.keywords.filter((k) => k.includes(query)).slice(0, 3) : []);

  const stageStatus = `${section.label} · ${activeViewportMeta.label} ${viewport === 'custom' ? `${customWidth}px` : activeViewportMeta.width}` +
    (isCompareEnabled ? ' · Comparing 3 styles' : ` · ${currentStyle.metadata.name}`) + (labStatus ? ` · ${labStatus}` : '');

  const frames = isCompareEnabled
    ? compare.frames.map((f, index) => ({ ...f, key: `${COMPARE_SLOTS[index]}-${f.style.metadata.id}`, label: COMPARE_SLOTS[index], primary: index === 0 }))
    : [{ style: renderedStyle, vars: resolvedCssVars, key: 'single', label: null, primary: true }];

  return (
    <LabStateProvider key={section.id} controlsHost={controlsHost} setStatus={setLabStatus}>
    <Workspace className="cl-workspace">
      {/* ===== Settings panel ===== */}
      <WorkspacePanel title="Components" subtitle="Every building block in every state, on any device, in any style." label="Components settings">
        <WorkspaceSection title="Section" icon={<LayoutPanelTop size={14} />}>
          <WorkspaceSearch value={filter} onChange={setFilter} placeholder="Search components…" label="Search components" />
          <nav className="ws-category-list" aria-label="Component sections">
            {visible.length === 0 && <p className="ws-hint">No section matches "{filter}".</p>}
            {SECTION_GROUPS.map((group) => {
              const items = visible.filter((c) => c.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group} className="ws-category-group">
                  <span className="ws-category-group__title">{group}</span>
                  {items.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/components/${cat.id}${search}`}
                      className={`ws-category ${section.id === cat.id ? 'ws-category--active' : ''}`}
                      aria-current={section.id === cat.id ? 'page' : undefined}
                    >
                      <span className="ws-category__icon"><cat.icon size={16} /></span>
                      <span className="ws-category__text">
                        <span>{cat.label}</span>
                        {matchedKeywords(cat).length > 0 && <span className="ws-category__hits">{matchedKeywords(cat).join(', ')}</span>}
                      </span>
                    </Link>
                  ))}
                </div>
              );
            })}
          </nav>
        </WorkspaceSection>

        {section.hasSettings ? (
          <WorkspaceSection title={`${section.label} settings`} icon={<SlidersHorizontal size={14} />}>
            <div ref={setControlsHost} className="labs-controls-host" />
          </WorkspaceSection>
        ) : (
          <WorkspaceSection title="State" icon={<ToggleLeft size={14} />}>
            <WorkspaceSwitch checked={buttonStateDisabled} onChange={setButtonStateDisabled} label="Disabled state" />
            <WorkspaceSwitch checked={buttonStateLoading} onChange={setButtonStateLoading} label="Loading state" />
            <p className="ws-hint">Applies to interactive components in the preview.</p>
          </WorkspaceSection>
        )}

        <WorkspaceSection title="Viewport" icon={<Monitor size={14} />}>
          <WorkspaceSegmented<ViewportId>
            label="Preview viewport"
            value={viewport}
            onChange={setViewport}
            columns={4}
            options={VIEWPORTS.map((vp) => ({ value: vp.id, title: `${vp.label} (${vp.width})`, label: <>{vp.icon}<span>{vp.label}</span></> }))}
          />
          {viewport === 'custom' && (
            <div className="lab-custom-width">
              <input
                type="number"
                className="ws-input"
                min={280}
                max={2560}
                step={10}
                value={customWidth}
                onChange={(e) => setCustomWidth(Math.max(280, Math.min(2560, Number(e.target.value) || 280)))}
                aria-label="Custom viewport width in pixels"
              />
              <div className="lab-width-presets">
                {WIDTH_PRESETS.map((w) => (
                  <button key={w} type="button" className={`lab-width-preset ${customWidth === w ? 'lab-width-preset--active' : ''}`} onClick={() => setCustomWidth(w)}>{w}</button>
                ))}
              </div>
            </div>
          )}
          <WorkspaceSwitch checked={rulers} onChange={setRulers} label={<>Rulers &amp; grid</>} />
          {inspector && breakpoint && (
            <dl className="lab-inspector" aria-label="Responsive inspector">
              <dt>Width</dt><dd>{inspector.width}px</dd>
              <dt>Breakpoint</dt><dd>{breakpoint.name}</dd>
              <dt>Card grid</dt><dd>{inspector.columns} column{inspector.columns === 1 ? '' : 's'}</dd>
              <dt>App layout</dt><dd>{breakpoint.layout}</dd>
              <dt>Sidebar</dt><dd>{breakpoint.sidebar}</dd>
              <dt>Navigation</dt><dd>{breakpoint.nav}</dd>
            </dl>
          )}
        </WorkspaceSection>

        <WorkspaceSection title="Compare" icon={<Columns3 size={14} />}>
          <WorkspaceSwitch checked={isCompareEnabled} onChange={compare.setOn} label="Compare three styles" />
          <CompareSlots disabled={!isCompareEnabled} />
        </WorkspaceSection>
      </WorkspacePanel>

      {/* ===== Live preview stage ===== */}
      <WorkspaceStage
        label="Live preview"
        status={stageStatus}
        actions={(
          <>
            <span className="cl-blurb">{section.blurb}</span>
            {isCompareEnabled && <span className="ws-chip ws-chip--accent"><Columns3 size={14} aria-hidden="true" />A · B · C</span>}
          </>
        )}
      >
        <div
          ref={setCanvasEl}
          className={`ws-stage__canvas ${frame ? 'ws-stage__canvas--fixed' : ''} ${isCompareEnabled ? 'ws-stage__canvas--compare' : ''}`}
        >
          {frames.map((f) => (
            <DeviceFrame
              key={f.key}
              kind={frame?.kind ?? 'browser'}
              width={frame?.width}
              height={frame?.height}
              scale={frameScale}
              address={`ui-explorer/${section.id}`}
              label={f.label ? <><span className="ws-slot">{f.label}</span><span className="ws-slot__name">{f.style.metadata.name}</span></> : undefined}
              rulers={rulers}
              screenRef={f.primary ? screenRef : undefined}
              screenClassName="cl-screen"
              screenStyle={f.vars as React.CSSProperties}
              screenAttrs={getStyleDataAttributes(f.style)}
            >
              {renderShowcase(f.primary)}
            </DeviceFrame>
          ))}
        </div>
      </WorkspaceStage>
    </Workspace>
    </LabStateProvider>
  );
};

/** The three compare slots, each a style picker writing to ?compare=. */
const CompareSlots: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const { availableStyles } = useStyle();
  const compare = useCompare();
  return (
    <div className={`ws-compare-slots ${disabled ? 'ws-compare-slots--muted' : ''}`}>
      {COMPARE_SLOTS.map((slot, index) => (
        <label key={slot} className="ws-field">
          <span className="ws-field__label">Style {slot}</span>
          <select className="ws-select" value={compare.ids[index]} disabled={disabled} onChange={(e) => compare.setSlot(index, e.target.value)}>
            {availableStyles.map((s) => <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name}</option>)}
          </select>
        </label>
      ))}
    </div>
  );
};

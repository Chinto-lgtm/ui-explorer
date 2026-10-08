import React, { Suspense, useState, useRef, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useStyle } from '../../hooks/useStyle';
import { useSearchParam, useSearchFlag } from '../../hooks/useUrlState';
import { useCompare, COMPARE_SLOTS } from '../../hooks/useCompare';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { getStyleDataAttributes } from '../../engine/styleAttributes';
import type { StyleDefinition } from '../../engine/types';
import { ToastProvider } from '../../components/ui/Feedback';
import { LAB_SECTIONS, SECTION_GROUPS, DEFAULT_SECTION, sectionById } from './sections';
import { LabStateProvider, LabFrame } from './labState';
import {
  Search, LayoutPanelTop, SlidersHorizontal,
  Monitor, Tablet, Smartphone, Columns3, ToggleLeft, ChevronDown, X, Ruler
} from 'lucide-react';
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

/** Device frame dimensions in CSS px. Frames render at true size and are zoomed down to fit the stage. */
const FRAME_SIZE: Record<Exclude<ViewportId, 'desktop' | 'custom'>, { width: number; height: number }> = {
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 780 }
};

/** Collapsible settings group. Native <details> keeps keyboard + screen-reader behavior for free. */
const LabSection: React.FC<{ title: string; icon: ReactNode; defaultOpen?: boolean; children: ReactNode }> = ({
  title, icon, defaultOpen = true, children
}) => (
  <details className="lab-section" open={defaultOpen}>
    <summary className="lab-section__summary">
      <span className="lab-section__icon">{icon}</span>
      <span className="lab-section__title">{title}</span>
      <ChevronDown size={14} className="lab-section__chevron" aria-hidden="true" />
    </summary>
    <div className="lab-section__body">{children}</div>
  </details>
);

/** Device-framed preview surface. Receives the resolved CSS variables of the style it renders. */
const DeviceFrame: React.FC<{
  viewport: ViewportId;
  scale: number;
  vars?: Record<string, string>;
  frameStyle?: StyleDefinition;
  label?: string;
  styleName: string;
  customWidth?: number;
  rulers?: boolean;
  screenRef?: React.Ref<HTMLDivElement>;
  children: ReactNode;
}> = ({ viewport, scale, vars, frameStyle, label, styleName, customWidth, rulers, screenRef, children }) => (
  <figure className={`lab-device lab-device--${viewport}`}>
    {label && (
      <figcaption className="lab-device__label">
        <span className="lab-device__slot">{label}</span>
        <span className="lab-device__style-name">{styleName}</span>
      </figcaption>
    )}
    <div className="lab-device__shell" style={{ zoom: scale, ...(viewport === 'custom' && customWidth ? { width: customWidth } : {}) }}>
      {rulers && (
        <div className="lab-rulers" aria-hidden="true">
          {Array.from({ length: Math.ceil((viewport === 'custom' && customWidth ? customWidth : viewport === 'tablet' ? 768 : viewport === 'mobile' ? 390 : 1280) / 100) }, (_, i) => (
            <span key={i} className="lab-rulers__tick" style={{ left: i * 100 }}>{i * 100}</span>
          ))}
        </div>
      )}
      {(viewport === 'desktop' || viewport === 'custom') && (
        <div className="lab-device__browser-bar" aria-hidden="true">
          <span /><span /><span />
          <div className="lab-device__url">{styleName}</div>
        </div>
      )}
      {viewport === 'mobile' && <div className="lab-device__notch" aria-hidden="true" />}
      <div ref={screenRef} className={`lab-device__screen ${rulers ? 'lab-device__screen--grid' : ''}`} style={vars as React.CSSProperties} {...(frameStyle ? getStyleDataAttributes(frameStyle) : {})}>
        {children}
      </div>
    </div>
  </figure>
);

export const ComponentsLabPage: React.FC = () => {
  const { currentStyle } = useStyle();
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
  const canvasRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const cs = getComputedStyle(el);
      setStageSize({
        width: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
        height: el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [section]);

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

  const frameScale = (() => {
    if (viewport === 'desktop' || stageSize.width === 0) return 1;
    const { width, height } = viewport === 'custom' ? { width: customWidth, height: 900 } : FRAME_SIZE[viewport];
    const count = isCompareEnabled ? 3 : 1;
    const gap = 24;
    const labelHeight = isCompareEnabled ? 28 : 0;
    const byWidth = (stageSize.width - gap * (count - 1)) / (width * count);
    const byHeight = stageSize.height / (height + labelHeight);
    return Math.min(1, byWidth, byHeight);
  })();

  const activeViewportMeta = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[0];
  const breakpoint = inspector ? BREAKPOINTS.find((b) => inspector.width <= b.max) ?? BREAKPOINTS[BREAKPOINTS.length - 1] : null;

  const ActiveSection = section.Component;
  const renderShowcase = (primary: boolean) => (
    <LabFrame primary={primary}>
      <ToastProvider position="bottom-right">
        <Suspense fallback={<div className="page-loading" role="status">Loading…</div>}>
          <ActiveSection disabled={buttonStateDisabled} loading={buttonStateLoading} />
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

  return (
    <LabStateProvider key={section.id} controlsHost={controlsHost} setStatus={setLabStatus}>
    <div className="lab-workspace">
      {/* ===== Settings sidebar ===== */}
      <aside className="lab-settings" aria-label="Components settings">
        <div className="lab-settings__header">
          <h1 className="lab-title">Components</h1>
          <p className="lab-subtitle">Every building block in every state, on any device, in any style.</p>
        </div>

        <div className="lab-settings__scroll">
          <LabSection title="Section" icon={<LayoutPanelTop size={14} />}>
            <div className="lab-search">
              <Search size={14} className="lab-search__icon" aria-hidden="true" />
              <input
                type="search"
                className="lab-search__input"
                placeholder="Search components…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Search components"
              />
              {filter && (
                <button type="button" className="lab-search__clear" onClick={() => setFilter('')} aria-label="Clear search"><X size={12} /></button>
              )}
            </div>
            <nav className="lab-category-list" aria-label="Component sections">
              {visible.length === 0 && <p className="lab-hint">No section matches "{filter}".</p>}
              {SECTION_GROUPS.map((group) => {
                const items = visible.filter((c) => c.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className="lab-category-group">
                    <span className="lab-category-group__title">{group}</span>
                    {items.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/components/${cat.id}${search}`}
                        className={`lab-category ${section.id === cat.id ? 'lab-category--active' : ''}`}
                        aria-current={section.id === cat.id ? 'page' : undefined}
                      >
                        <span className="lab-category__icon"><cat.icon size={16} /></span>
                        <span className="lab-category__text">
                          <span>{cat.label}</span>
                          {matchedKeywords(cat).length > 0 && <span className="lab-category__hits">{matchedKeywords(cat).join(', ')}</span>}
                        </span>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </nav>
          </LabSection>

          {section.hasSettings ? (
            <LabSection title={`${section.label} settings`} icon={<SlidersHorizontal size={14} />}>
              <div ref={setControlsHost} className="labs-controls-host" />
            </LabSection>
          ) : (
            <LabSection title="State" icon={<ToggleLeft size={14} />}>
              <label className="lab-switch">
                <input type="checkbox" checked={buttonStateDisabled} onChange={(e) => setButtonStateDisabled(e.target.checked)} />
                <span className="lab-switch__track" aria-hidden="true"><span className="lab-switch__thumb" /></span>
                <span className="lab-switch__text">Disabled state</span>
              </label>
              <label className="lab-switch">
                <input type="checkbox" checked={buttonStateLoading} onChange={(e) => setButtonStateLoading(e.target.checked)} />
                <span className="lab-switch__track" aria-hidden="true"><span className="lab-switch__thumb" /></span>
                <span className="lab-switch__text">Loading state</span>
              </label>
              <p className="lab-hint">Applies to interactive components in the preview.</p>
            </LabSection>
          )}

          <LabSection title="Viewport" icon={<Monitor size={14} />}>
            <div className="lab-segmented" role="group" aria-label="Preview viewport">
              {VIEWPORTS.map((vp) => (
                <button
                  key={vp.id}
                  type="button"
                  className={`lab-segmented__btn ${viewport === vp.id ? 'lab-segmented__btn--active' : ''}`}
                  aria-pressed={viewport === vp.id}
                  title={`${vp.label} (${vp.width})`}
                  onClick={() => setViewport(vp.id)}
                >
                  {vp.icon}
                  <span>{vp.label}</span>
                </button>
              ))}
            </div>
            {viewport === 'custom' && (
              <div className="lab-custom-width">
                <input
                  type="number"
                  className="lab-search__input"
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
            <label className="lab-switch">
              <input type="checkbox" checked={rulers} onChange={(e) => setRulers(e.target.checked)} />
              <span className="lab-switch__track" aria-hidden="true"><span className="lab-switch__thumb" /></span>
              <span className="lab-switch__text">Rulers &amp; grid</span>
            </label>
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
          </LabSection>

          <LabSection title="Compare" icon={<Columns3 size={14} />}>
            <label className="lab-switch">
              <input type="checkbox" checked={isCompareEnabled} onChange={(e) => compare.setOn(e.target.checked)} />
              <span className="lab-switch__track" aria-hidden="true"><span className="lab-switch__thumb" /></span>
              <span className="lab-switch__text">Compare three styles</span>
            </label>
            <CompareSlots disabled={!isCompareEnabled} />
          </LabSection>
        </div>
      </aside>

      {/* ===== Live preview stage ===== */}
      <section className="lab-stage" aria-label="Live preview">
        <header className="lab-stage__bar">
          <div className="lab-stage__status" aria-live="polite">
            <span className="lab-stage__dot" aria-hidden="true" />
            {stageStatus}
          </div>
          <div className="lab-stage__chips">
            <span className="lab-stage__blurb">{section.blurb}</span>
            {isCompareEnabled && <span className="lab-chip lab-chip--accent" aria-hidden="true"><Columns3 size={14} />A | B | C</span>}
          </div>
        </header>

        <div
          ref={canvasRef}
          className={`lab-stage__canvas lab-stage__canvas--${viewport} ${isCompareEnabled ? 'lab-stage__canvas--compare' : ''}`}
        >
          {isCompareEnabled ? (
            compare.styles.map((style: StyleDefinition, index) => (
              <DeviceFrame
                key={`${COMPARE_SLOTS[index]}-${style.metadata.id}`}
                viewport={viewport}
                scale={frameScale}
                vars={resolveStyleToCssVars(style)}
                frameStyle={style}
                label={`Style ${COMPARE_SLOTS[index]}`}
                styleName={style.metadata.name}
                customWidth={customWidth}
                rulers={rulers}
                screenRef={index === 0 ? screenRef : undefined}
              >
                {renderShowcase(index === 0)}
              </DeviceFrame>
            ))
          ) : (
            <DeviceFrame viewport={viewport} scale={frameScale} styleName={currentStyle.metadata.name} frameStyle={currentStyle} customWidth={customWidth} rulers={rulers} screenRef={screenRef}>
              {renderShowcase(true)}
            </DeviceFrame>
          )}
        </div>
      </section>
    </div>
    </LabStateProvider>
  );
};

/** The three compare slots, each a style picker writing to ?compare=. */
const CompareSlots: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const { availableStyles } = useStyle();
  const compare = useCompare();
  return (
    <div className={`lab-compare-slots ${disabled ? 'lab-compare-slots--muted' : ''}`}>
      {COMPARE_SLOTS.map((slot, index) => (
        <label key={slot} className="lab-field">
          <span className="lab-field__label">Style {slot}</span>
          <select className="lab-select" value={compare.ids[index]} disabled={disabled} onChange={(e) => compare.setSlot(index, e.target.value)}>
            {availableStyles.map((s) => <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name}</option>)}
          </select>
        </label>
      ))}
    </div>
  );
};

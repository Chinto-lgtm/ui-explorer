import React, { useState, useRef, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { getStyleDataAttributes } from '../../engine/styleAttributes';
import type { StyleDefinition } from '../../engine/types';
import { ToastProvider } from '../../components/ui/Feedback';
import { LAB_SECTIONS } from './sections';
import {
  Search, Palette, MousePointerClick, TextCursorInput, CheckSquare, Compass, BellRing, Layers,
  LayoutPanelTop, Tag, ListTree, ChartColumn,
  Monitor, Tablet, Smartphone, Columns3, ToggleLeft, ChevronDown, X
} from 'lucide-react';
import './ComponentsLabPage.css';

type CategoryId = string;
type ViewportId = 'desktop' | 'tablet' | 'mobile';

const SECTION_ICONS: Record<string, ReactNode> = {
  foundations: <Palette size={16} />,
  buttons: <MousePointerClick size={16} />,
  inputs: <TextCursorInput size={16} />,
  selection: <CheckSquare size={16} />,
  navigation: <Compass size={16} />,
  feedback: <BellRing size={16} />,
  overlays: <Layers size={16} />,
  cards: <LayoutPanelTop size={16} />,
  badges: <Tag size={16} />,
  lists: <ListTree size={16} />,
  charts: <ChartColumn size={16} />
};

const CATEGORIES = LAB_SECTIONS.map((sec) => ({ id: sec.id, label: sec.label, icon: SECTION_ICONS[sec.id], keywords: sec.keywords }));

const VIEWPORTS: { id: ViewportId; label: string; width: string; icon: ReactNode }[] = [
  { id: 'desktop', label: 'Desktop', width: 'Fluid', icon: <Monitor size={16} /> },
  { id: 'tablet', label: 'Tablet', width: '768px', icon: <Tablet size={16} /> },
  { id: 'mobile', label: 'Mobile', width: '390px', icon: <Smartphone size={16} /> }
];

const COMPARE_SLOTS = ['A', 'B', 'C'] as const;

/** Device frame dimensions in CSS px. Frames render at true size and are zoomed down to fit the stage. */
const FRAME_SIZE: Record<Exclude<ViewportId, 'desktop'>, { width: number; height: number }> = {
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
  children: ReactNode;
}> = ({ viewport, scale, vars, frameStyle, label, styleName, children }) => (
  <figure className={`lab-device lab-device--${viewport}`}>
    {label && (
      <figcaption className="lab-device__label">
        <span className="lab-device__slot">{label}</span>
        <span className="lab-device__style-name">{styleName}</span>
      </figcaption>
    )}
    <div className="lab-device__shell" style={{ zoom: scale }}>
      {viewport === 'desktop' && (
        <div className="lab-device__browser-bar" aria-hidden="true">
          <span /><span /><span />
          <div className="lab-device__url">{styleName}</div>
        </div>
      )}
      {viewport === 'mobile' && <div className="lab-device__notch" aria-hidden="true" />}
      <div className="lab-device__screen" style={vars as React.CSSProperties} {...(frameStyle ? getStyleDataAttributes(frameStyle) : {})}>
        {children}
      </div>
    </div>
  </figure>
);

export const ComponentsLabPage: React.FC = () => {
  const { currentStyle, availableStyles } = useStyle();

  const [activeCategory, setActiveCategory] = useState<CategoryId>('buttons');
  const [search, setSearch] = useState('');
  const [buttonStateDisabled, setButtonStateDisabled] = useState<boolean>(false);
  const [buttonStateLoading, setButtonStateLoading] = useState<boolean>(false);
  const [viewport, setViewport] = useState<ViewportId>('desktop');
  const [isCompareEnabled, setIsCompareEnabled] = useState<boolean>(false);
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    // Seed the three slots with the active style followed by the next two distinct styles.
    const others = availableStyles.filter((s) => s.metadata.id !== currentStyle.metadata.id).map((s) => s.metadata.id);
    return [currentStyle.metadata.id, others[0] ?? currentStyle.metadata.id, others[1] ?? currentStyle.metadata.id];
  });

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
  }, []);

  const frameScale = (() => {
    if (viewport === 'desktop' || stageSize.width === 0) return 1;
    const { width, height } = FRAME_SIZE[viewport];
    const count = isCompareEnabled ? 3 : 1;
    const gap = 24;
    const labelHeight = isCompareEnabled ? 28 : 0;
    const byWidth = (stageSize.width - gap * (count - 1)) / (width * count);
    const byHeight = stageSize.height / (height + labelHeight);
    return Math.min(1, byWidth, byHeight);
  })();

  const activeCategoryMeta = CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0];
  const activeViewportMeta = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[0];

  const compareStyles: StyleDefinition[] = compareIds.map(
    (id) => availableStyles.find((s) => s.metadata.id === id) ?? currentStyle
  );

  const setCompareSlot = (index: number, id: string) => {
    setCompareIds((prev) => prev.map((existing, i) => (i === index ? id : existing)));
  };

  const ActiveSection = (LAB_SECTIONS.find((sec) => sec.id === activeCategory) ?? LAB_SECTIONS[0]).Component;
  const renderShowcase = () => (
    <ToastProvider position="bottom-right">
      <ActiveSection disabled={buttonStateDisabled} loading={buttonStateLoading} />
    </ToastProvider>
  );

  const query = search.trim().toLowerCase();
  const visibleCategories = query
    ? CATEGORIES.filter((c) => c.label.toLowerCase().includes(query) || c.keywords.some((k) => k.includes(query)))
    : CATEGORIES;
  const matchedKeywords = (c: typeof CATEGORIES[number]) => (query ? c.keywords.filter((k) => k.includes(query)).slice(0, 3) : []);

  const stageStatus = `${activeCategoryMeta.label} · ${activeViewportMeta.label} ${activeViewportMeta.width}` +
    (isCompareEnabled ? ' · Comparing 3 styles' : ` · ${currentStyle.metadata.name}`);

  return (
    <div className="lab-workspace">
      {/* ===== Settings sidebar ===== */}
      <aside className="lab-settings" aria-label="Components Lab settings">
        <div className="lab-settings__header">
          <h1 className="lab-title">Components Lab</h1>
          <p className="lab-subtitle">Test states, viewports and styles against the live component set.</p>
        </div>

        <div className="lab-settings__scroll">
          <LabSection title="Component" icon={<LayoutPanelTop size={14} />}>
            <div className="lab-search">
              <Search size={14} className="lab-search__icon" aria-hidden="true" />
              <input
                type="search"
                className="lab-search__input"
                placeholder="Search components…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search components"
              />
              {search && (
                <button type="button" className="lab-search__clear" onClick={() => setSearch('')} aria-label="Clear search"><X size={12} /></button>
              )}
            </div>
            <div className="lab-category-list" role="group" aria-label="Component category">
              {visibleCategories.length === 0 && <p className="lab-hint">No component matches "{search}".</p>}
              {visibleCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`lab-category ${activeCategory === cat.id ? 'lab-category--active' : ''}`}
                  aria-pressed={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="lab-category__icon">{cat.icon}</span>
                  <span className="lab-category__text">
                    <span>{cat.label}</span>
                    {matchedKeywords(cat).length > 0 && <span className="lab-category__hits">{matchedKeywords(cat).join(', ')}</span>}
                  </span>
                </button>
              ))}
            </div>
          </LabSection>

          <LabSection title="State" icon={<ToggleLeft size={14} />}>
            <label className="lab-switch">
              <input
                type="checkbox"
                checked={buttonStateDisabled}
                onChange={(e) => setButtonStateDisabled(e.target.checked)}
              />
              <span className="lab-switch__track" aria-hidden="true"><span className="lab-switch__thumb" /></span>
              <span className="lab-switch__text">Disabled state</span>
            </label>

            <label className="lab-switch">
              <input
                type="checkbox"
                checked={buttonStateLoading}
                onChange={(e) => setButtonStateLoading(e.target.checked)}
              />
              <span className="lab-switch__track" aria-hidden="true"><span className="lab-switch__thumb" /></span>
              <span className="lab-switch__text">Loading state</span>
            </label>
            <p className="lab-hint">Applies to interactive components in the preview.</p>
          </LabSection>

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
            <p className="lab-hint">
              Canvas width: <strong>{activeViewportMeta.width}</strong>
            </p>
          </LabSection>

          <LabSection title="Compare" icon={<Columns3 size={14} />}>
            <label className="lab-switch">
              <input
                type="checkbox"
                checked={isCompareEnabled}
                onChange={(e) => setIsCompareEnabled(e.target.checked)}
              />
              <span className="lab-switch__track" aria-hidden="true"><span className="lab-switch__thumb" /></span>
              <span className="lab-switch__text">Compare three styles</span>
            </label>

            <div className={`lab-compare-slots ${isCompareEnabled ? '' : 'lab-compare-slots--muted'}`}>
              {COMPARE_SLOTS.map((slot, index) => (
                <label key={slot} className="lab-field">
                  <span className="lab-field__label">Style {slot}</span>
                  <select
                    className="lab-select"
                    value={compareIds[index]}
                    disabled={!isCompareEnabled}
                    onChange={(e) => setCompareSlot(index, e.target.value)}
                  >
                    {availableStyles.map((s) => (
                      <option key={s.metadata.id} value={s.metadata.id}>
                        {s.metadata.name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
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
          <div className="lab-stage__chips" aria-hidden="true">
            <span className="lab-chip">{activeViewportMeta.icon}{activeViewportMeta.label}</span>
            {isCompareEnabled && <span className="lab-chip lab-chip--accent"><Columns3 size={14} />A | B | C</span>}
          </div>
        </header>

        <div
          ref={canvasRef}
          className={`lab-stage__canvas lab-stage__canvas--${viewport} ${isCompareEnabled ? 'lab-stage__canvas--compare' : ''}`}
        >
          {isCompareEnabled ? (
            compareStyles.map((style, index) => (
              <DeviceFrame
                key={`${COMPARE_SLOTS[index]}-${style.metadata.id}`}
                viewport={viewport}
                scale={frameScale}
                vars={resolveStyleToCssVars(style)}
                frameStyle={style}
                label={`Style ${COMPARE_SLOTS[index]}`}
                styleName={style.metadata.name}
              >
                {renderShowcase()}
              </DeviceFrame>
            ))
          ) : (
            <DeviceFrame viewport={viewport} scale={frameScale} styleName={currentStyle.metadata.name} frameStyle={currentStyle}>
              {renderShowcase()}
            </DeviceFrame>
          )}
        </div>
      </section>
    </div>
  );
};

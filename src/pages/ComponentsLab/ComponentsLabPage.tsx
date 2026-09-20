import React, { useState, useRef, useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { resolveStyleToCssVars } from '../../engine/resolver';
import type { StyleDefinition } from '../../engine/types';
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LineChart } from '../../components/charts/LineChart';
import { BarChart } from '../../components/charts/BarChart';
import {
  Search, Sparkles, Heart, Bell,
  MousePointerClick, TextCursorInput, LayoutPanelTop, Tag, ChartColumn,
  Monitor, Tablet, Smartphone, Columns3, ToggleLeft, ChevronDown
} from 'lucide-react';
import './ComponentsLabPage.css';

type CategoryId = 'buttons' | 'inputs' | 'cards' | 'badges' | 'charts';
type ViewportId = 'desktop' | 'tablet' | 'mobile';

const CATEGORIES: { id: CategoryId; label: string; icon: ReactNode }[] = [
  { id: 'buttons', label: 'Buttons & Controls', icon: <MousePointerClick size={16} /> },
  { id: 'inputs', label: 'Inputs & Form Elements', icon: <TextCursorInput size={16} /> },
  { id: 'cards', label: 'Cards & Containers', icon: <LayoutPanelTop size={16} /> },
  { id: 'badges', label: 'Badges & Indicators', icon: <Tag size={16} /> },
  { id: 'charts', label: 'Data Visualization', icon: <ChartColumn size={16} /> }
];

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
  label?: string;
  styleName: string;
  children: ReactNode;
}> = ({ viewport, scale, vars, label, styleName, children }) => (
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
      <div className="lab-device__screen" style={vars as React.CSSProperties}>
        {children}
      </div>
    </div>
  </figure>
);

export const ComponentsLabPage: React.FC = () => {
  const { currentStyle, availableStyles } = useStyle();

  const [activeCategory, setActiveCategory] = useState<CategoryId>('buttons');
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

  const renderShowcase = () => {
    switch (activeCategory) {
      case 'buttons':
        return (
          <div className="lab-grid">
            <Card>
              <CardHeader><CardTitle>Button Variants</CardTitle></CardHeader>
              <CardBody className="lab-component-row">
                <Button variant="primary" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Primary Button
                </Button>
                <Button variant="secondary" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Secondary Button
                </Button>
                <Button variant="outline" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Outline Button
                </Button>
                <Button variant="ghost" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Ghost Button
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Status & Special Buttons</CardTitle></CardHeader>
              <CardBody className="lab-component-row">
                <Button variant="destructive" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Destructive Action
                </Button>
                <Button variant="success" disabled={buttonStateDisabled} isLoading={buttonStateLoading}>
                  Success Action
                </Button>
                <Button variant="floating" icon={<Sparkles size={16} />} disabled={buttonStateDisabled}>
                  Floating Pill
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Button Sizes & Icons</CardTitle></CardHeader>
              <CardBody className="lab-component-row">
                <Button size="sm" icon={<Heart size={14} />} disabled={buttonStateDisabled} isLoading={buttonStateLoading}>Small</Button>
                <Button size="md" icon={<Sparkles size={16} />} disabled={buttonStateDisabled} isLoading={buttonStateLoading}>Medium</Button>
                <Button size="lg" icon={<Bell size={18} />} disabled={buttonStateDisabled} isLoading={buttonStateLoading}>Large</Button>
              </CardBody>
            </Card>
          </div>
        );

      case 'inputs':
        return (
          <div className="lab-grid">
            <Card>
              <CardHeader><CardTitle>Standard Input Fields</CardTitle></CardHeader>
              <CardBody className="lab-input-col">
                <Input label="Email Address" placeholder="alex@example.com" helperText="We will never share your email." />
                <Input label="Search Library" placeholder="Type to search..." icon={<Search size={16} />} />
                <Input label="Error State Input" placeholder="Invalid entry" error="Please enter a valid format." />
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Textarea & Complex Inputs</CardTitle></CardHeader>
              <CardBody className="lab-input-col">
                <Textarea label="Project Description" placeholder="Describe your design tokens or style requirements..." />
              </CardBody>
            </Card>
          </div>
        );

      case 'cards':
        return (
          <div className="lab-grid">
            <Card variant="default" hoverable>
              <CardHeader><CardTitle>Default Hoverable Card</CardTitle></CardHeader>
              <CardBody>Standard surface container responding to active token variables.</CardBody>
            </Card>

            <Card variant="outlined">
              <CardHeader><CardTitle>Outlined Card Variant</CardTitle></CardHeader>
              <CardBody>Card with explicit accent border styling.</CardBody>
            </Card>

            <Card variant="elevated">
              <CardHeader><CardTitle>Elevated Shadow Card</CardTitle></CardHeader>
              <CardBody>Card with prominent box-shadow elevation.</CardBody>
            </Card>
          </div>
        );

      case 'badges':
        return (
          <div className="lab-grid">
            <Card>
              <CardHeader><CardTitle>Badges & Status Tags</CardTitle></CardHeader>
              <CardBody className="lab-component-row">
                <Badge variant="default">Default</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="outline">Outline</Badge>
              </CardBody>
            </Card>
          </div>
        );

      case 'charts':
        return (
          <div className="lab-grid">
            <Card>
              <CardHeader><CardTitle>Interactive Line Chart</CardTitle></CardHeader>
              <CardBody>
                <LineChart
                  data={[
                    { label: 'Mon', value: 30 },
                    { label: 'Tue', value: 75 },
                    { label: 'Wed', value: 45 },
                    { label: 'Thu', value: 90 },
                    { label: 'Fri', value: 120 }
                  ]}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader><CardTitle>Interactive Bar Chart</CardTitle></CardHeader>
              <CardBody>
                <BarChart
                  data={[
                    { label: 'Q1', value: 450 },
                    { label: 'Q2', value: 620 },
                    { label: 'Q3', value: 810 },
                    { label: 'Q4', value: 950 }
                  ]}
                />
              </CardBody>
            </Card>
          </div>
        );
    }
  };

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
            <div className="lab-category-list" role="group" aria-label="Component category">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`lab-category ${activeCategory === cat.id ? 'lab-category--active' : ''}`}
                  aria-pressed={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span className="lab-category__icon">{cat.icon}</span>
                  <span>{cat.label}</span>
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
            <p className="lab-hint">Applies to button components.</p>
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
                label={`Style ${COMPARE_SLOTS[index]}`}
                styleName={style.metadata.name}
              >
                {renderShowcase()}
              </DeviceFrame>
            ))
          ) : (
            <DeviceFrame viewport={viewport} scale={frameScale} styleName={currentStyle.metadata.name}>
              {renderShowcase()}
            </DeviceFrame>
          )}
        </div>
      </section>
    </div>
  );
};

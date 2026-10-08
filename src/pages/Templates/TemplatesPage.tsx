import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Monitor, Smartphone, AppWindow, LayoutTemplate, Columns3, Workflow, ListChecks, Link2, Check, Maximize2,
  ChevronLeft, ChevronRight, ImagePlus, Trash2, ZoomIn
} from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { encodeStyleParam } from '../../engine/share';
import { absoluteUrl } from '../../config/app';
import type { StyleDefinition } from '../../engine/types';
import { FAMILIES, getFamily, groupScreens, isFamilyId } from '../../templates/registry';
import type { FamilyDef, FamilyId } from '../../templates/nav';
import { TemplateScreen } from '../../templates/TemplateScreen';
import { userImageStore, useUserImage } from '../../templates/userImage';
import { TemplateFrame, PHONE_BEZEL, BROWSER_BAR } from './TemplateFrame';
import { ComponentsPanel } from './ComponentsPanel';
import './TemplatesPage.css';

type ViewMode = 'screen' | 'flow' | 'compare';
type Zoom = 'fit' | '0.5' | '0.75' | '1';

const FAMILY_ICONS: Record<FamilyId, ReactNode> = {
  'landing-desktop': <Monitor size={16} />,
  'landing-mobile': <Smartphone size={16} />,
  app: <AppWindow size={16} />
};

const VIEWS: { id: ViewMode; label: string; icon: ReactNode }[] = [
  { id: 'screen', label: 'Screen', icon: <LayoutTemplate size={14} /> },
  { id: 'flow', label: 'Flow', icon: <Workflow size={14} /> },
  { id: 'compare', label: 'A / B / C', icon: <Columns3 size={14} /> }
];

const SLOTS = ['A', 'B', 'C'] as const;
const STAGE_GAP = 24;
const LABEL_HEIGHT = 34;

/** Fit a device into the stage. Browser frames fill the height; phones keep their size. */
function fitDevice(family: FamilyDef, stage: { width: number; height: number }, count: number, zoom: Zoom, labelled: boolean) {
  const isPhone = family.device === 'phone';
  const outerW = family.width + (isPhone ? PHONE_BEZEL * 2 : 0);
  const availH = Math.max(200, stage.height - (labelled ? LABEL_HEIGHT : 0));
  let scale: number;
  if (zoom !== 'fit') scale = Number(zoom);
  else if (stage.width === 0) scale = isPhone ? 0.8 : 0.6;
  else {
    const byWidth = (stage.width - STAGE_GAP * (count - 1)) / (outerW * count);
    scale = isPhone ? Math.min(1, byWidth, availH / (family.height + PHONE_BEZEL * 2)) : Math.min(1, byWidth);
  }
  scale = Math.max(0.08, scale);
  const screenHeight = isPhone ? family.height : (zoom === 'fit' ? Math.max(480, availH / scale - BROWSER_BAR - 2) : family.height);
  return { scale, screenHeight };
}

export const TemplatesPage: React.FC = () => {
  const params = useParams<{ family?: string; screen?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { renderedStyle, resolvedCssVars, availableStyles, currentStyle } = useStyle();
  const userImage = useUserImage();

  const family = getFamily(params.family);
  const screen = family.screens.find((s) => s.id === params.screen) ?? family.screens[0];
  const view = (['screen', 'flow', 'compare'].includes(searchParams.get('view') ?? '') ? searchParams.get('view') : 'screen') as ViewMode;
  const zoom = (['fit', '0.5', '0.75', '1'].includes(searchParams.get('zoom') ?? '') ? searchParams.get('zoom') : 'fit') as Zoom;
  const [panelOpen, setPanelOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const compareIds = useMemo(() => {
    const fromUrl = (searchParams.get('compare') ?? '').split(',').filter((id) => availableStyles.some((s) => s.metadata.id === id));
    const others = availableStyles.map((s) => s.metadata.id).filter((id) => id !== currentStyle.metadata.id);
    const defaults = [currentStyle.metadata.id, others[0], others[1]];
    return SLOTS.map((_, i) => fromUrl[i] ?? defaults[i] ?? currentStyle.metadata.id);
  }, [searchParams, availableStyles, currentStyle]);

  const setParam = useCallback((key: string, value: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === null) next.delete(key); else next.set(key, value);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const urlFor = (familyId: string, screenId: string, nextView?: ViewMode) => {
    const next = new URLSearchParams(searchParams);
    if (nextView) { if (nextView === 'screen') next.delete('view'); else next.set('view', nextView); }
    const qs = next.toString();
    return `/templates/${familyId}/${screenId}${qs ? `?${qs}` : ''}`;
  };
  const goTo = (familyId: string, screenId: string, nextView?: ViewMode) => navigate(urlFor(familyId, screenId, nextView));

  // Links inside a template keep the current view and comparison.
  const goScreen = (screenId: string) => {
    if (family.screens.some((s) => s.id === screenId)) goTo(family.id, screenId);
  };

  // Measure the stage so frames can be zoomed to fit.
  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);
  const [stage, setStage] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = stageEl;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const cs = getComputedStyle(el);
      setStage({
        width: el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
        height: el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [stageEl]);

  // The element the components panel scans: the screen, slot A, or the whole flow board.
  const [scanTarget, setScanTarget] = useState<HTMLDivElement | null>(null);

  const index = family.screens.findIndex((s) => s.id === screen.id);
  const prev = family.screens[index - 1];
  const next = family.screens[index + 1];

  const shareUrl = () => {
    const isBuiltIn = !renderedStyle.metadata.isCustom;
    const qs = new URLSearchParams();
    qs.set('style', encodeStyleParam(renderedStyle, isBuiltIn));
    if (view !== 'screen') qs.set('view', view);
    if (view === 'compare') qs.set('compare', compareIds.join(','));
    return `${absoluteUrl(`/templates/${family.id}/${screen.id}`)}?${qs.toString()}`;
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl()); } catch { /* clipboard unavailable */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageError(userImageStore.set(file) ? null : 'That file is not an image.');
  };

  if (!isFamilyId(params.family) || !params.screen || params.screen !== screen.id) {
    const qs = searchParams.toString();
    return <Navigate to={`/templates/${family.id}/${screen.id}${qs ? `?${qs}` : ''}`} replace />;
  }

  const renderSingle = () => {
    const { scale, screenHeight } = fitDevice(family, stage, 1, zoom, false);
    return (
      <TemplateFrame family={family} screenId={screen.id} scale={scale} screenHeight={screenHeight}>
        <TemplateScreen family={family} screenId={screen.id} style={renderedStyle} vars={resolvedCssVars} go={goScreen} screenRef={setScanTarget} />
      </TemplateFrame>
    );
  };

  const renderCompare = () => {
    const { scale, screenHeight } = fitDevice(family, stage, 3, zoom, true);
    return compareIds.map((id, i) => {
      const style: StyleDefinition = availableStyles.find((s) => s.metadata.id === id) ?? renderedStyle;
      return (
        <TemplateFrame
          key={SLOTS[i]}
          family={family}
          screenId={screen.id}
          scale={scale}
          screenHeight={screenHeight}
          label={(
            <>
              <span className="tp-slot">{SLOTS[i]}</span>
              <select
                className="tp-select tp-select--slot"
                aria-label={`Style ${SLOTS[i]}`}
                value={style.metadata.id}
                onChange={(e) => setParam('compare', compareIds.map((x, j) => (j === i ? e.target.value : x)).join(','))}
              >
                {availableStyles.map((s) => <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name}</option>)}
              </select>
            </>
          )}
        >
          <TemplateScreen family={family} screenId={screen.id} style={style} vars={resolveStyleToCssVars(style)} go={goScreen} screenRef={i === 0 ? setScanTarget : undefined} />
        </TemplateFrame>
      );
    });
  };

  const renderFlow = () => {
    const thumbScale = family.device === 'phone' ? 0.42 : 0.17;
    return (
      <div className="tp-flow" ref={setScanTarget}>
        {groupScreens(family).map(({ group, screens }) => (
          <section key={group} className="tp-flow__group">
            <h2 className="tp-flow__title">{group}<span>{screens.length}</span></h2>
            <ol className="tp-flow__row">
              {screens.map((s, i) => (
                <li key={s.id} className="tp-flow__item">
                  <div className={`tp-thumb ${s.id === screen.id ? 'tp-thumb--current' : ''}`}>
                    <div className="tp-thumb__frame" inert>
                      <TemplateFrame family={family} screenId={s.id} scale={thumbScale} screenHeight={family.device === 'phone' ? undefined : 1100}>
                        <TemplateScreen family={family} screenId={s.id} style={renderedStyle} vars={resolvedCssVars} go={goScreen} interactive={false} />
                      </TemplateFrame>
                    </div>
                    <button type="button" className="tp-thumb__open" onClick={() => goTo(family.id, s.id, 'screen')} aria-label={`Open ${s.name}`} />
                    <span className="tp-thumb__name">{s.name}</span>
                    <span className="tp-thumb__desc">{s.description}</span>
                  </div>
                  {i < screens.length - 1 && <ChevronRight size={18} className="tp-flow__arrow" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    );
  };

  return (
    <div className="tp-workspace">
      {/* ===== Template and screen picker ===== */}
      <aside className="tp-side" aria-label="Templates">
        <div className="tp-side__header">
          <h1 className="tp-title">Templates</h1>
          <p className="tp-subtitle">Orbit, one product in three templates. Every screen is built from the component library and follows the active style.</p>
        </div>
        <div className="tp-side__scroll">
          <div className="tp-families" role="group" aria-label="Template">
            {FAMILIES.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`tp-family ${f.id === family.id ? 'tp-family--active' : ''}`}
                aria-pressed={f.id === family.id}
                onClick={() => goTo(f.id, f.screens.some((s) => s.id === screen.id) ? screen.id : f.screens[0].id)}
              >
                <span className="tp-family__icon">{FAMILY_ICONS[f.id]}</span>
                <span className="tp-family__text">
                  <span className="tp-family__name">{f.name}</span>
                  <span className="tp-family__meta">{f.screens.length} {f.device === 'phone' && f.id === 'app' ? 'screens' : 'pages'} · {f.width}px</span>
                </span>
              </button>
            ))}
          </div>

          <nav className="tp-screens" aria-label={`${family.name} screens`}>
            {groupScreens(family).map(({ group, screens }) => (
              <div key={group} className="tp-screens__group">
                <span className="tp-screens__heading">{group}</span>
                {screens.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`tp-screen-link ${s.id === screen.id ? 'tp-screen-link--active' : ''}`}
                    aria-current={s.id === screen.id ? 'page' : undefined}
                    onClick={() => goTo(family.id, s.id, view === 'flow' ? 'screen' : undefined)}
                    title={s.description}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="tp-image">
            <span className="tp-screens__heading">Your image</span>
            {userImage ? (
              <div className="tp-image__current">
                <img src={userImage.url} alt="" className="tp-image__thumb" />
                <span className="tp-image__name" title={userImage.name}>{userImage.name}</span>
                <button type="button" className="tp-icon-btn" onClick={() => userImageStore.clear()} aria-label="Remove image"><Trash2 size={14} /></button>
              </div>
            ) : (
              <button type="button" className="tp-btn tp-btn--block" onClick={() => fileRef.current?.click()}><ImagePlus size={14} /> Add an image</button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />
            {imageError && <p className="tp-hint tp-hint--error">{imageError}</p>}
            <p className="tp-hint">Shown in every picture slot. It stays in this tab only: nothing is uploaded, and it is gone when you reload.</p>
          </div>
        </div>
      </aside>

      {/* ===== Stage ===== */}
      <section className="tp-stage" aria-label="Template preview">
        <header className="tp-toolbar">
          <div className="tp-toolbar__group">
            <div className="tp-seg" role="radiogroup" aria-label="View">
              {VIEWS.map((v) => (
                <button key={v.id} type="button" role="radio" aria-checked={view === v.id} className={`tp-seg__btn ${view === v.id ? 'tp-seg__btn--active' : ''}`} onClick={() => setParam('view', v.id === 'screen' ? null : v.id)}>
                  {v.icon}<span>{v.label}</span>
                </button>
              ))}
            </div>
            {view !== 'flow' && (
              <div className="tp-pager">
                <button type="button" className="tp-icon-btn" disabled={!prev} onClick={() => prev && goScreen(prev.id)} aria-label="Previous screen"><ChevronLeft size={16} /></button>
                <span className="tp-pager__label" aria-live="polite"><strong>{screen.name}</strong> <span>{index + 1}/{family.screens.length}</span></span>
                <button type="button" className="tp-icon-btn" disabled={!next} onClick={() => next && goScreen(next.id)} aria-label="Next screen"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
          <div className="tp-toolbar__group">
            {view !== 'flow' && (
              <label className="tp-zoom">
                <ZoomIn size={14} aria-hidden="true" />
                <select className="tp-select" aria-label="Zoom" value={zoom} onChange={(e) => setParam('zoom', e.target.value === 'fit' ? null : e.target.value)}>
                  <option value="fit">Fit</option>
                  <option value="0.5">50%</option>
                  <option value="0.75">75%</option>
                  <option value="1">100%</option>
                </select>
              </label>
            )}
            <button type="button" className={`tp-btn ${panelOpen ? 'tp-btn--active' : ''}`} aria-pressed={panelOpen} onClick={() => setPanelOpen((v) => !v)}><ListChecks size={14} /><span>Components</span></button>
            <button type="button" className="tp-btn" onClick={copyLink}>{copied ? <Check size={14} /> : <Link2 size={14} />}<span>{copied ? 'Copied' : 'Copy link'}</span></button>
            <Link className="tp-btn tp-btn--primary" to={`/preview/${family.id}/${screen.id}`}><Maximize2 size={14} /><span>Full screen</span></Link>
          </div>
        </header>

        <div className="tp-stage__body">
          <div ref={setStageEl} className={`tp-canvas tp-canvas--${view} tp-canvas--${family.device} ${zoom !== 'fit' ? 'tp-canvas--zoomed' : ''}`}>
            {view === 'screen' && renderSingle()}
            {view === 'compare' && renderCompare()}
            {view === 'flow' && renderFlow()}
          </div>
          {panelOpen && <ComponentsPanel target={scanTarget} scope={view === 'flow' ? 'template' : 'screen'} onClose={() => setPanelOpen(false)} />}
        </div>
      </section>
    </div>
  );
};

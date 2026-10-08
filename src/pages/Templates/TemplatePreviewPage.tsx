import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, EyeOff, PanelTop } from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { decodeStyleParam } from '../../engine/share';
import { getFamily } from '../../templates/registry';
import { TemplateScreen } from '../../templates/TemplateScreen';
import './TemplatePreviewPage.css';

/**
 * A template on its own, filling the browser: the landing site at full width
 * (or phone width for the mobile family) and the app as a phone-sized column.
 * Links inside keep working; a small bar switches screen and style.
 */
export const TemplatePreviewPage: React.FC = () => {
  const params = useParams<{ family: string; screen: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { renderedStyle, resolvedCssVars, currentStyle, availableStyles, setStyle, addCustomStyle } = useStyle();
  const [barOpen, setBarOpen] = useState(true);

  const family = getFamily(params.family);
  const screen = family.screens.find((s) => s.id === params.screen);

  // Shared links carry the style; apply it once and drop it from the address.
  useEffect(() => {
    const shared = searchParams.get('style');
    if (!shared) return;
    const decoded = decodeStyleParam(shared);
    if (decoded.kind === 'id') setStyle(decoded.id);
    else if (decoded.kind === 'style') addCustomStyle(decoded.style);
    const next = new URLSearchParams(searchParams);
    next.delete('style');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const go = useCallback((id: string) => {
    if (family.screens.some((s) => s.id === id)) navigate(`/preview/${family.id}/${id}`);
  }, [family, navigate]);

  useEffect(() => {
    if (screen) document.title = `${screen.name} · ${family.name} · UI Explorer`;
    return () => { document.title = 'UI Explorer'; };
  }, [screen, family]);

  if (!screen || family.id !== params.family) return <Navigate to={`/preview/${family.id}/${family.screens[0].id}`} replace />;

  return (
    <div className={`tpv tpv--${family.device === 'phone' ? 'phone' : 'browser'}`}>
      <div className="tpv__stage">
        <TemplateScreen family={family} screenId={screen.id} style={renderedStyle} vars={resolvedCssVars} go={go} />
      </div>
      {barOpen ? (
        <div className="tpv__bar" role="toolbar" aria-label="Preview controls">
          <Link className="tpv__btn" to={`/templates/${family.id}/${screen.id}`}><ArrowLeft size={14} /><span>Templates</span></Link>
          <select className="tpv__select" aria-label="Screen" value={screen.id} onChange={(e) => go(e.target.value)}>
            {family.screens.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="tpv__select" aria-label="Style" value={currentStyle.metadata.id} onChange={(e) => setStyle(e.target.value)}>
            {availableStyles.map((s) => <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name}</option>)}
          </select>
          <button type="button" className="tpv__btn tpv__btn--icon" onClick={() => setBarOpen(false)} aria-label="Hide controls"><EyeOff size={14} /></button>
        </div>
      ) : (
        <button type="button" className="tpv__show" onClick={() => setBarOpen(true)} aria-label="Show controls"><PanelTop size={16} /></button>
      )}
    </div>
  );
};

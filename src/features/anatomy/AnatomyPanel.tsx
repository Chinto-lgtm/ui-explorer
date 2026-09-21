import React, { useEffect, useMemo, useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { X, Copy, Check, Sliders, Crosshair, ChevronDown, Braces } from 'lucide-react';
import { buildAnatomy } from './anatomy';
import type { AnatomyProperty } from './anatomy';
import './AnatomyPanel.css';

const HIGHLIGHT_STYLE_ID = 'anatomy-highlight-style';

/** Outline every element the property shapes, inside themed containers only. */
function highlight(selector: string | null) {
  let el = document.getElementById(HIGHLIGHT_STYLE_ID) as HTMLStyleElement | null;
  if (!selector) { el?.remove(); return; }
  if (!el) { el = document.createElement('style'); el.id = HIGHLIGHT_STYLE_ID; document.head.appendChild(el); }
  const scoped = selector.split(',').map((s) => `[data-style] ${s.trim()}`).join(', ');
  el.textContent = `${scoped} { outline: 2px dashed var(--chrome-warning) !important; outline-offset: 3px !important; box-shadow: 0 0 0 6px color-mix(in srgb, var(--chrome-warning) 25%, transparent) !important; transition: none !important; }`;
}

export const AnatomyPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { renderedStyle, resolvedCssVars } = useStyle();
  const [copied, setCopied] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({ typography: true, color: true, surface: true, depth: true });

  const sections = useMemo(() => buildAnatomy(renderedStyle, resolvedCssVars), [renderedStyle, resolvedCssVars]);

  useEffect(() => () => highlight(null), []);
  useEffect(() => { if (active === null) highlight(null); }, [active]);

  const copy = async (key: string, text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const onProperty = (sectionId: string, p: AnatomyProperty) => {
    const key = `${sectionId}:${p.label}`;
    if (active === key) { setActive(null); highlight(null); return; }
    setActive(key);
    highlight(p.appliesTo ?? null);
  };

  return (
    <aside className="anatomy-panel" aria-label="Style anatomy">
      <div className="anatomy-header">
        <div className="anatomy-title-row">
          <Sliders size={18} />
          <h3>Style Anatomy</h3>
        </div>
        <button className="anatomy-close-btn" onClick={onClose} aria-label="Close anatomy"><X size={18} /></button>
      </div>

      <div className="anatomy-style-info">
        <h4>{renderedStyle.metadata.name}</h4>
        <span className="anatomy-badge">{renderedStyle.metadata.category}</span>
        <p>{renderedStyle.metadata.description}</p>
        <p className="anatomy-hint"><Crosshair size={12} /> Click a property to see where it appears in the interface.</p>
      </div>

      <div className="anatomy-sections">
        {sections.map((section) => (
          <div key={section.id} className="anatomy-section">
            <button type="button" className="anatomy-section-toggle" onClick={() => setOpen((o) => ({ ...o, [section.id]: !o[section.id] }))} aria-expanded={open[section.id] ?? false}>
              <span className="anatomy-section-title">{section.title}</span>
              <ChevronDown size={14} className={`anatomy-chevron ${open[section.id] ? 'anatomy-chevron--open' : ''}`} />
            </button>
            {(open[section.id] ?? false) && (
              <div className="anatomy-token-list">
                {section.properties.map((p) => {
                  const key = `${section.id}:${p.label}`;
                  return (
                    <div key={key} className={`anatomy-token-row ${active === key ? 'anatomy-token-row--active' : ''} ${p.tone ? `anatomy-token-row--${p.tone}` : ''}`}>
                      <button type="button" className="anatomy-token-main" onClick={() => onProperty(section.id, p)} aria-pressed={active === key} disabled={!p.appliesTo} title={p.appliesTo ? `Highlights ${p.appliesTo}` : undefined}>
                        <span className="token-key">{p.label}</span>
                        <span className="token-val">{p.value}</span>
                        {p.note && <span className="token-note">{p.note}</span>}
                      </button>
                      {p.swatch && <span className="color-swatch-preview" style={{ backgroundColor: p.swatch }} />}
                      <button type="button" className="token-copy-btn" onClick={() => copy(key, p.token ? `${p.token}: ${resolvedCssVars[p.token] ?? p.value};` : p.value)} aria-label={`Copy ${p.label}`} title={p.token ? `Copy ${p.token}` : 'Copy value'}>
                        {copied === key ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div className="anatomy-section">
          <button type="button" className="anatomy-section-toggle" onClick={() => setShowRaw((v) => !v)} aria-expanded={showRaw}>
            <span className="anatomy-section-title"><Braces size={12} /> All CSS custom properties ({Object.keys(resolvedCssVars).length})</span>
            <ChevronDown size={14} className={`anatomy-chevron ${showRaw ? 'anatomy-chevron--open' : ''}`} />
          </button>
          {showRaw && (
            <div className="anatomy-token-list">
              {Object.entries(resolvedCssVars).map(([k, v]) => (
                <div key={k} className="anatomy-token-row">
                  <div className="anatomy-token-main anatomy-token-main--static">
                    <span className="token-key token-key--mono">{k}</span>
                    <span className="token-val">{v}</span>
                  </div>
                  {k.startsWith('--color') && v.startsWith('#') && <span className="color-swatch-preview" style={{ backgroundColor: v }} />}
                  <button type="button" className="token-copy-btn" onClick={() => copy(k, `${k}: ${v};`)} aria-label={`Copy ${k}`}>{copied === k ? <Check size={14} /> : <Copy size={14} />}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

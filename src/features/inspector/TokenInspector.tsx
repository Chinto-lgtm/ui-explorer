import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Copy, Check, Crosshair, Sliders } from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import './TokenInspector.css';

interface Target {
  el: HTMLElement;
  rect: DOMRect;
  name: string;
}

interface InspectedProperty {
  css: string;
  value: string;
  token?: string;
}

const CSS_PROPS: { css: string; label: string }[] = [
  { css: 'background-color', label: 'background' },
  { css: 'color', label: 'color' },
  { css: 'border-radius', label: 'radius' },
  { css: 'box-shadow', label: 'shadow' },
  { css: 'border', label: 'border' },
  { css: 'font-family', label: 'font-family' },
  { css: 'font-weight', label: 'font-weight' },
  { css: 'font-size', label: 'font-size' },
  { css: 'letter-spacing', label: 'letter-spacing' },
  { css: 'transition-duration', label: 'transition' },
  { css: 'backdrop-filter', label: 'blur' },
  { css: 'padding', label: 'padding' }
];

const friendlyName = (el: HTMLElement): string => {
  const cls = Array.from(el.classList).find((c) => c.startsWith('ui-') && !c.includes('--') && !c.includes('__')) ?? Array.from(el.classList).find((c) => !c.includes('--')) ?? el.tagName.toLowerCase();
  const variant = Array.from(el.classList).find((c) => c.startsWith(`${cls}--`))?.replace(`${cls}--`, '');
  const base = cls.replace(/^ui-/, '').replace(/__/g, ' ').replace(/-/g, ' ');
  return variant ? `${base} · ${variant}` : base;
};

/** Normalise a colour string so a computed rgb() value can match a hex token. */
const norm = (v: string): string => {
  const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(v.trim());
  if (!m) return v.trim().toLowerCase();
  const hex = `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`;
  return m[4] && Number(m[4]) < 1 ? v.replace(/\s+/g, '') : hex;
};

/**
 * Inspect mode: hover outlines any component inside a themed container,
 * click reveals its computed values and the design tokens behind them.
 */
export const TokenInspector: React.FC<{ active: boolean; onClose: () => void; onOpenAnatomy: () => void }> = ({ active, onClose, onOpenAnatomy }) => {
  const { resolvedCssVars } = useStyle();
  const [hover, setHover] = useState<Target | null>(null);
  const [picked, setPicked] = useState<Target | null>(null);
  const [props, setProps] = useState<InspectedProperty[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const raf = useRef<number | null>(null);

  const findTarget = useCallback((x: number, y: number): Target | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) return null;
    if (el.closest('.inspector-panel, .inspector-toolbar')) return null;
    const themed = el.closest<HTMLElement>('[data-style]');
    if (!themed) return null;
    const comp = el.closest<HTMLElement>('[class*="ui-"], .style-preview__surface, .kpi-card__value') ?? el;
    return { el: comp, rect: comp.getBoundingClientRect(), name: friendlyName(comp) };
  }, []);

  // Leaving inspect mode drops any outline or open panel (cleanup runs when `active` flips).
  useEffect(() => () => { setHover(null); setPicked(null); }, [active]);

  useEffect(() => {
    if (!active) return;
    const onMove = (e: MouseEvent) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => setHover(findTarget(e.clientX, e.clientY)));
    };
    const onClick = (e: MouseEvent) => {
      const t = findTarget(e.clientX, e.clientY);
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      const cs = getComputedStyle(t.el);
      const tokenByValue = new Map<string, string>();
      for (const [k, v] of Object.entries(resolvedCssVars)) tokenByValue.set(norm(v), k);
      setProps(CSS_PROPS.map((p) => {
        const value = cs.getPropertyValue(p.css).trim();
        const token = tokenByValue.get(norm(value)) ?? (p.css === 'font-family' ? Object.entries(resolvedCssVars).find(([k, v]) => k.startsWith('--font-family') && v.split(',')[0].trim().toLowerCase() === value.split(',')[0].trim().replace(/"/g, '').toLowerCase())?.[0] : undefined);
        return { css: p.label, value: value || '—', token };
      }).filter((p) => p.value !== '—' && p.value !== 'none' && p.value !== 'normal' && p.value !== '0s'));
      setPicked(t);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (picked) setPicked(null); else onClose(); } };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [active, findTarget, resolvedCssVars, onClose, picked]);

  if (!active) return null;

  const copy = async (key: string, text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  const box = picked ?? hover;
  const panelLeft = picked ? Math.min(window.innerWidth - 340, Math.max(8, picked.rect.left)) : 0;
  const panelTop = picked ? (picked.rect.bottom + 8 + 320 > window.innerHeight ? Math.max(8, picked.rect.top - 328) : picked.rect.bottom + 8) : 0;

  return (
    <>
      <div className="inspector-toolbar" role="status">
        <Crosshair size={14} /> Inspect mode — click any component. <kbd>Esc</kbd> to exit
        <button type="button" onClick={onClose} aria-label="Exit inspect mode"><X size={14} /></button>
      </div>
      {box && (
        <div className="inspector-box" style={{ left: box.rect.left, top: box.rect.top, width: box.rect.width, height: box.rect.height }} aria-hidden="true">
          <span className="inspector-box__label">{box.name} · {Math.round(box.rect.width)}×{Math.round(box.rect.height)}</span>
        </div>
      )}
      {picked && (
        <div className="inspector-panel" style={{ left: panelLeft, top: panelTop }} role="dialog" aria-label={`Tokens for ${picked.name}`}>
          <div className="inspector-panel__head">
            <span className="inspector-panel__name">{picked.name}</span>
            <button type="button" className="inspector-panel__close" onClick={() => setPicked(null)} aria-label="Close"><X size={14} /></button>
          </div>
          <div className="inspector-panel__list">
            {props.map((p) => (
              <div key={p.css} className="inspector-prop">
                <span className="inspector-prop__css">{p.css}</span>
                <span className="inspector-prop__token">{p.token ? `var(${p.token})` : <em>no token</em>}</span>
                <span className="inspector-prop__value">{p.value}</span>
                <span className="inspector-prop__actions">
                  {p.token && <button type="button" onClick={() => copy(`${p.css}-t`, p.token!)} title="Copy token">{copied === `${p.css}-t` ? <Check size={12} /> : 'token'}</button>}
                  <button type="button" onClick={() => copy(`${p.css}-c`, `${p.css}: ${p.token ? `var(${p.token})` : p.value};`)} title="Copy CSS">{copied === `${p.css}-c` ? <Check size={12} /> : 'css'}</button>
                  <button type="button" onClick={() => copy(`${p.css}-v`, p.value)} title="Copy value">{copied === `${p.css}-v` ? <Check size={12} /> : <Copy size={12} />}</button>
                </span>
              </div>
            ))}
          </div>
          <button type="button" className="inspector-panel__anatomy" onClick={() => { onOpenAnatomy(); setPicked(null); }}><Sliders size={12} /> Open in Style Anatomy</button>
        </div>
      )}
    </>
  );
};

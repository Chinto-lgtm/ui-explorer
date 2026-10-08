import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, MousePointerClick, Crosshair } from 'lucide-react';
import { COMPONENT_CATALOG, scanComponents, scanOpeners } from '../../templates/catalog';
import type { CatalogGroup, ScreenComponentUse } from '../../templates/catalog';

const GROUP_ORDER: CatalogGroup[] = ['Actions', 'Forms', 'Navigation', 'Feedback', 'Overlays', 'Data display', 'Charts & graphics', 'Content', 'Mobile'];

export interface ComponentsPanelProps {
  /** Element whose subtree is scanned (a screen, or the whole flow board). */
  target: HTMLElement | null;
  scope: 'screen' | 'template';
  onClose: () => void;
}

const HIGHLIGHT = 'data-tpl-highlight';

/**
 * Lists the library components actually rendered in the target and keeps the
 * list live as the visitor interacts. Hover highlights them in the frame;
 * click scrolls the first one into view.
 */
export const ComponentsPanel: React.FC<ComponentsPanelProps> = ({ target, scope, onClose }) => {
  // Results are tagged with the element they came from, so a stale scan is never shown for a new target.
  const [scan, setScan] = useState<{ target: HTMLElement | null; uses: ScreenComponentUse[]; openers: string[] }>({ target: null, uses: [], openers: [] });
  const uses = scan.target === target && target ? scan.uses : [];
  const openers = scan.target === target && target ? scan.openers : [];
  const highlighted = useRef<HTMLElement[]>([]);

  const clearHighlight = useCallback(() => {
    highlighted.current.forEach((el) => el.removeAttribute(HIGHLIGHT));
    highlighted.current = [];
  }, []);

  useEffect(() => {
    if (!target) return;
    let frame = 0;
    const rescan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScan({ target, uses: scanComponents(target), openers: scanOpeners(target) }));
    };
    rescan();
    // Overlays portal into the screen container, so opening a modal or sheet is picked up here too.
    const observer = new MutationObserver(rescan);
    observer.observe(target, { childList: true, subtree: true });
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [target]);

  useEffect(() => clearHighlight, [target, clearHighlight]);

  const highlight = (use: ScreenComponentUse) => {
    clearHighlight();
    use.elements.forEach((el) => el.setAttribute(HIGHLIGHT, ''));
    highlighted.current = use.elements;
  };

  const reveal = (use: ScreenComponentUse) => {
    const el = use.elements.find((e) => e.isConnected);
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el.setAttribute('data-tpl-flash', '');
    window.setTimeout(() => el.removeAttribute('data-tpl-flash'), 1200);
  };

  const rendered = new Set(uses.map((u) => u.entry.name));
  const pending = openers.filter((n) => !rendered.has(n));
  const unused = COMPONENT_CATALOG.filter((c) => !rendered.has(c.name) && !pending.includes(c.name));
  const groups = GROUP_ORDER.map((g) => ({ group: g, items: uses.filter((u) => u.entry.group === g) })).filter((g) => g.items.length > 0);
  const total = COMPONENT_CATALOG.length;
  const coverage = rendered.size + pending.length;

  return (
    <aside className="tp-panel" aria-label="Components used">
      <header className="tp-panel__head">
        <div>
          <h2 className="tp-panel__title">{scope === 'screen' ? 'On this screen' : 'In this template'}</h2>
          <p className="tp-panel__sub">{coverage} of {total} library components</p>
        </div>
        <button type="button" className="tp-icon-btn" onClick={onClose} aria-label="Close components panel"><X size={16} /></button>
      </header>
      <div className="tp-panel__meter" aria-hidden="true"><span style={{ width: `${(coverage / total) * 100}%` }} /></div>
      <div className="tp-panel__scroll" onMouseLeave={clearHighlight}>
        {uses.length === 0 && <p className="tp-hint">Nothing rendered yet.</p>}
        {groups.map(({ group, items }) => (
          <section key={group} className="tp-panel__group">
            <h3 className="tp-panel__group-title">{group}</h3>
            <ul className="tp-panel__list">
              {items.map((u) => (
                <li key={u.entry.name}>
                  <button
                    type="button"
                    className="tp-panel__item"
                    onMouseEnter={() => highlight(u)}
                    onFocus={() => highlight(u)}
                    onBlur={clearHighlight}
                    onClick={() => reveal(u)}
                    title={`Show ${u.entry.name} in the frame`}
                  >
                    <Crosshair size={12} className="tp-panel__item-icon" aria-hidden="true" />
                    <span className="tp-panel__name">{u.entry.name}</span>
                    <span className="tp-panel__count">{u.elements.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {pending.length > 0 && (
          <section className="tp-panel__group">
            <h3 className="tp-panel__group-title"><MousePointerClick size={12} /> Opens on interaction</h3>
            <ul className="tp-panel__list">
              {pending.map((n) => <li key={n}><span className="tp-panel__item tp-panel__item--static"><span className="tp-panel__name">{n}</span></span></li>)}
            </ul>
          </section>
        )}
        {unused.length > 0 && (
          <details className="tp-panel__unused">
            <summary>Not used {scope === 'screen' ? 'on this screen' : 'yet'} ({unused.length})</summary>
            <p>{unused.map((u) => u.name).join(', ')}</p>
          </details>
        )}
        <p className="tp-hint">Hover a name to outline it in the frame. Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to inspect the tokens behind any element.</p>
      </div>
    </aside>
  );
};

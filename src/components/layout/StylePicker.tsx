import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronsUpDown, Check, Search, Star, ArrowRight } from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import type { StyleDefinition } from '../../engine/types';
import './StylePicker.css';

/** Three dots that sum a style up: background, surface, accent. */
export const StyleDots: React.FC<{ style: StyleDefinition }> = ({ style }) => (
  <span className="sp-dots" aria-hidden="true">
    <span style={{ background: style.tokens.colors.bg }} />
    <span style={{ background: style.tokens.colors.surface }} />
    <span style={{ background: style.tokens.colors.accent }} />
  </span>
);

interface Group { title: string; styles: StyleDefinition[] }

/**
 * The header's style switcher: a searchable list grouped into favourites,
 * recent and categories. Arrow keys move, Enter applies, Escape closes.
 */
export const StylePicker: React.FC = () => {
  const { currentStyle, setStyle, availableStyles, favoriteIds, recentStyleIds, toggleFavorite, isTweaked } = useStyle();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const isFav = favoriteIds.includes(currentStyle.metadata.id);

  const groups: Group[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (s: StyleDefinition) => !q || s.metadata.name.toLowerCase().includes(q) || s.metadata.category.toLowerCase().includes(q) || s.metadata.tags.some((t) => t.toLowerCase().includes(q));
    const pool = availableStyles.filter(match);
    if (q) return [{ title: `${pool.length} match${pool.length === 1 ? '' : 'es'}`, styles: pool }];
    const byId = new Map(availableStyles.map((s) => [s.metadata.id, s]));
    const favs = favoriteIds.map((id) => byId.get(id)).filter((s): s is StyleDefinition => Boolean(s));
    const recent = recentStyleIds.filter((id) => !favoriteIds.includes(id)).slice(0, 4).map((id) => byId.get(id)).filter((s): s is StyleDefinition => Boolean(s));
    const out: Group[] = [];
    if (favs.length) out.push({ title: 'Favorites', styles: favs });
    if (recent.length) out.push({ title: 'Recent', styles: recent });
    const categories = [...new Set(availableStyles.map((s) => s.metadata.category))];
    categories.forEach((c) => out.push({ title: c, styles: availableStyles.filter((s) => s.metadata.category === c) }));
    return out;
  }, [query, availableStyles, favoriteIds, recentStyleIds]);

  const flat = useMemo(() => groups.flatMap((g) => g.styles.map((s) => ({ style: s, key: `${g.title}:${s.metadata.id}` }))), [groups]);

  const openPicker = () => {
    setQuery('');
    const index = groups.flatMap((g) => g.styles).findIndex((s) => s.metadata.id === currentStyle.metadata.id);
    setActive(Math.max(0, index));
    setOpen(true);
  };

  const choose = (s: StyleDefinition) => {
    setStyle(s.metadata.id);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDown = (e: MouseEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }, [active, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(flat.length - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); const item = flat[active]; if (item) choose(item.style); }
    else if (e.key === 'Tab') setOpen(false);
  };

  let index = -1;
  return (
    <div className="sp" ref={rootRef}>
      <button
        type="button"
        className={`sp-trigger ${open ? 'sp-trigger--open' : ''}`}
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Active style: ${currentStyle.metadata.name}. Change style`}
      >
        <StyleDots style={currentStyle} />
        <span className="sp-trigger__text">
          <span className="sp-trigger__name">{currentStyle.metadata.name}</span>
          <span className="sp-trigger__meta">{currentStyle.metadata.category}{isTweaked ? ' · tweaked' : ''}</span>
        </span>
        <ChevronsUpDown size={14} className="sp-trigger__chevron" aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`sp-fav ${isFav ? 'sp-fav--on' : ''}`}
        onClick={() => toggleFavorite(currentStyle.metadata.id)}
        aria-pressed={isFav}
        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
      </button>

      {open && (
        <div className="sp-pop" onKeyDown={onKeyDown}>
          <div className="sp-pop__search">
            <Search size={14} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={flat[active] ? `${listId}-${active}` : undefined}
              aria-label="Find a style"
              placeholder={`Find among ${availableStyles.length} styles…`}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            />
          </div>
          <ul className="sp-pop__list" id={listId} role="listbox" aria-label="Styles" ref={listRef}>
            {flat.length === 0 && <li className="sp-pop__empty" role="presentation">No style matches “{query}”.</li>}
            {groups.map((g) => (
              <li key={g.title} role="presentation" className="sp-group">
                <span className="sp-group__title" aria-hidden="true">{g.title}</span>
                <ul role="group" aria-label={g.title} className="sp-group__list">
                  {g.styles.map((s) => {
                    index += 1;
                    const i = index;
                    const selected = s.metadata.id === currentStyle.metadata.id;
                    return (
                      <li
                        key={s.metadata.id}
                        id={`${listId}-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={selected}
                        className={`sp-option ${i === active ? 'sp-option--active' : ''} ${selected ? 'sp-option--selected' : ''}`}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => choose(s)}
                      >
                        <StyleDots style={s} />
                        <span className="sp-option__name">{s.metadata.name}</span>
                        {favoriteIds.includes(s.metadata.id) && <Star size={12} className="sp-option__fav" fill="currentColor" aria-hidden="true" />}
                        {selected && <Check size={14} className="sp-option__check" aria-hidden="true" />}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
          <Link to="/styles" className="sp-pop__foot" onClick={() => setOpen(false)}>
            Browse the gallery <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
};

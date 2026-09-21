import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStyle } from '../../hooks/useStyle';
import {
  Search, Sparkles, LayoutDashboard, Component, Database, Sliders, Wand2, X,
  Columns, Download, Shuffle, Star, Keyboard, Eye, Braces, Zap, Info, GitCompareArrows, Crosshair
} from 'lucide-react';
import './CommandPalette.css';

export interface PaletteActions {
  openAnatomy: () => void;
  openExport: () => void;
  openMixer: () => void;
  openShortcuts: () => void;
  openDiff: () => void;
  toggleInspect: () => void;
  toggleCompare: () => void;
}

interface PaletteItem {
  id: string;
  group: 'Commands' | 'Styles' | 'Pages' | 'Tokens';
  label: string;
  hint?: string;
  icon: ReactNode;
  keywords: string;
  run: () => void;
}

const PAGES = [
  { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={16} /> },
  { name: 'Styles', path: '/styles', icon: <LayoutDashboard size={16} /> },
  { name: 'Style Generator', path: '/generator', icon: <Wand2 size={16} /> },
  { name: 'Components Lab', path: '/components', icon: <Component size={16} /> },
  { name: 'Labs', path: '/data', icon: <Database size={16} /> },
  { name: 'Style Customizer', path: '/customizer', icon: <Sliders size={16} /> },
  { name: 'About UI Explorer', path: '/welcome', icon: <Info size={16} /> }
];

export const CommandPalette: React.FC<{ onClose: () => void; actions: PaletteActions }> = ({ onClose, actions }) => {
  const { availableStyles, currentStyle, setStyle, resolvedCssVars, toggleFavorite, isFavorite, settings, updateSettings } = useStyle();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const close = onClose;
  const go = (path: string) => { navigate(path); close(); };

  const items = useMemo<PaletteItem[]>(() => {
    const commands: PaletteItem[] = [
      { id: 'cmd-components', group: 'Commands', label: 'Open Components Lab', icon: <Component size={16} />, keywords: 'components lab buttons inputs', run: () => go('/components') },
      { id: 'cmd-customizer', group: 'Commands', label: 'Open Customizer', hint: 'Ctrl+E', icon: <Sliders size={16} />, keywords: 'customizer edit tokens', run: () => go('/customizer') },
      { id: 'cmd-anatomy', group: 'Commands', label: 'Open Style Anatomy', hint: 'Ctrl+Shift+A', icon: <Eye size={16} />, keywords: 'anatomy inspect tokens why', run: () => { actions.openAnatomy(); close(); } },
      { id: 'cmd-compare', group: 'Commands', label: 'Compare styles', hint: 'Ctrl+Shift+C', icon: <Columns size={16} />, keywords: 'compare side by side triple', run: () => { actions.toggleCompare(); close(); } },
      { id: 'cmd-create', group: 'Commands', label: 'Create a style', icon: <Wand2 size={16} />, keywords: 'create generate new style seed', run: () => go('/generator') },
      { id: 'cmd-mixer', group: 'Commands', label: 'Open Style Mixer', icon: <Shuffle size={16} />, keywords: 'mixer remix hybrid combine', run: () => { actions.openMixer(); close(); } },
      { id: 'cmd-export', group: 'Commands', label: 'Export style', hint: 'Ctrl+Shift+E', icon: <Download size={16} />, keywords: 'export json css download import', run: () => { actions.openExport(); close(); } },
      { id: 'cmd-random', group: 'Commands', label: 'Randomize style', hint: 'Surprise me', icon: <Sparkles size={16} />, keywords: 'random surprise shuffle', run: () => go(`/generator?seed=${Math.floor(Math.random() * 900000) + 100000}&surprise=1`) },
      { id: 'cmd-gallery', group: 'Commands', label: 'Browse all styles', hint: 'Gallery', icon: <LayoutDashboard size={16} />, keywords: 'styles gallery browse community official map relationships docs', run: () => go('/styles') },
      { id: 'cmd-favorite', group: 'Commands', label: isFavorite(currentStyle.metadata.id) ? `Remove ${currentStyle.metadata.name} from favorites` : `Favorite ${currentStyle.metadata.name}`, icon: <Star size={16} />, keywords: 'favorite star bookmark', run: () => { toggleFavorite(currentStyle.metadata.id); close(); } },
      { id: 'cmd-motion', group: 'Commands', label: settings.reduceMotion ? 'Turn motion back on' : 'Reduce motion', icon: <Zap size={16} />, keywords: 'motion animation reduce accessibility', run: () => { updateSettings({ reduceMotion: !settings.reduceMotion }); close(); } },
      { id: 'cmd-experimental', group: 'Commands', label: settings.experimental ? 'Turn off experimental mode' : 'Turn on experimental mode', icon: <Zap size={16} />, keywords: 'experimental effects blur glow', run: () => { updateSettings({ experimental: !settings.experimental }); close(); } },
      { id: 'cmd-viewport', group: 'Commands', label: 'Toggle viewport', hint: 'Components Lab', icon: <Component size={16} />, keywords: 'viewport mobile tablet desktop responsive', run: () => go('/components') },
      { id: 'cmd-diff', group: 'Commands', label: 'Style diff', hint: 'Ctrl+Shift+D', icon: <GitCompareArrows size={16} />, keywords: 'diff compare tokens differences', run: () => { actions.openDiff(); close(); } },
      { id: 'cmd-inspect', group: 'Commands', label: 'Inspect tokens', hint: 'Ctrl+Shift+X', icon: <Crosshair size={16} />, keywords: 'inspect token inspector click element', run: () => { actions.toggleInspect(); close(); } },
      { id: 'cmd-shortcuts', group: 'Commands', label: 'Keyboard shortcuts', hint: '?', icon: <Keyboard size={16} />, keywords: 'keyboard shortcuts help keys', run: () => { actions.openShortcuts(); close(); } }
    ];

    const styles: PaletteItem[] = availableStyles.map((s) => ({
      id: `style-${s.metadata.id}`,
      group: 'Styles',
      label: s.metadata.name,
      hint: s.metadata.category,
      icon: <Sparkles size={16} />,
      keywords: `${s.metadata.description} ${s.metadata.tags.join(' ')} ${s.metadata.category} ${s.metadata.personality}`,
      run: () => { setStyle(s.metadata.id); close(); }
    }));

    const pages: PaletteItem[] = PAGES.map((p) => ({
      id: `page-${p.path}`,
      group: 'Pages',
      label: p.name,
      icon: p.icon,
      keywords: 'page navigate open',
      run: () => go(p.path)
    }));

    const tokens: PaletteItem[] = Object.entries(resolvedCssVars).map(([name, value]) => ({
      id: `token-${name}`,
      group: 'Tokens',
      label: name,
      hint: value,
      icon: <Braces size={16} />,
      keywords: `token property ${name.replace(/-/g, ' ')} ${value}`,
      run: () => { actions.openAnatomy(); close(); }
    }));

    return [...commands, ...styles, ...pages, ...tokens];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableStyles, currentStyle, resolvedCssVars, settings, isFavorite]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.filter((i) => i.group !== 'Tokens');
    const terms = q.split(/\s+/);
    return items.filter((i) => {
      const hay = `${i.label} ${i.hint ?? ''} ${i.keywords}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
  }, [items, query]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); filtered[activeIndex]?.run(); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  };

  const groups = (['Commands', 'Styles', 'Pages', 'Tokens'] as const)
    .map((g) => ({ name: g, items: filtered.filter((i) => i.group === g) }))
    .filter((g) => g.items.length > 0);

  let runningIndex = -1;

  return (
    <div className="cmd-backdrop" onClick={close}>
      <div className="cmd-palette" role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="cmd-input-row">
          <Search size={18} className="cmd-search-icon" />
          <input
            autoFocus
            type="text"
            placeholder="Search styles, pages, commands or tokens…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="cmd-input"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmd-listbox"
            aria-activedescendant={filtered[activeIndex] ? `cmd-${filtered[activeIndex].id}` : undefined}
            aria-autocomplete="list"
          />
          <button className="cmd-close-btn" onClick={close} aria-label="Close"><X size={16} /></button>
        </div>

        <div className="cmd-results" id="cmd-listbox" role="listbox" ref={listRef}>
          {groups.length === 0 && (
            <div className="cmd-empty">Nothing matches "{query}". Try a style name, a page, or a token like "radius".</div>
          )}
          {groups.map((group) => (
            <div key={group.name} className="cmd-group" role="group" aria-label={group.name}>
              <span className="cmd-group-heading">{group.name}</span>
              {group.items.map((item) => {
                runningIndex += 1;
                const index = runningIndex;
                return (
                  <div
                    key={item.id}
                    id={`cmd-${item.id}`}
                    data-index={index}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={`cmd-item ${index === activeIndex ? 'cmd-item--active' : ''}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={item.run}
                  >
                    {item.icon}
                    <span className="cmd-item-label">{item.label}</span>
                    {item.hint && <span className="cmd-item-hint">{item.hint}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="cmd-footer" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>Enter</kbd> select</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { dialog, fade } from '../../motion/presets';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStyle } from '../../hooks/useStyle';
import { Search, Sparkles, X, Columns, Star, Zap, Braces, Home, Monitor, Smartphone, AppWindow, PencilLine, Save, RotateCcw } from 'lucide-react';
import { PAGES, TOOLS } from '../../config/routes';
import { useTools } from '../../components/layout/tools';
import { LAB_SECTIONS } from '../../pages/ComponentsLab/sections';
import './CommandPalette.css';

interface PaletteItem {
  id: string;
  group: 'Commands' | 'Pages' | 'Tools' | 'Styles' | 'Tokens';
  label: string;
  hint?: string;
  icon: ReactNode;
  keywords: string;
  run: () => void;
}

/** Template entry points; the full screen lists live on the Templates page. */
const TEMPLATE_LINKS = [
  { label: 'Templates: Desktop landing', path: '/templates/landing-desktop/home', icon: <Monitor size={16} />, keywords: 'website marketing site pages' },
  { label: 'Templates: Mobile landing', path: '/templates/landing-mobile/home', icon: <Smartphone size={16} />, keywords: 'responsive website phone' },
  { label: 'Templates: Mobile app', path: '/templates/app/home', icon: <AppWindow size={16} />, keywords: 'app screens ios android onboarding' }
];

export const CommandPalette: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { availableStyles, currentStyle, setStyle, resolvedCssVars, toggleFavorite, isFavorite, settings, updateSettings, isTweaked, resetTweaks, saveTweaksAsStyle } = useStyle();
  const { openTool, toggleCompare } = useTools();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const close = onClose;
  const go = (path: string) => { navigate(path); close(); };

  const items = useMemo<PaletteItem[]>(() => {
    const commands: PaletteItem[] = [
      { id: 'cmd-compare', group: 'Commands', label: 'Compare styles', hint: 'Ctrl+Shift+C', icon: <Columns size={16} />, keywords: 'compare side by side triple a b c', run: () => { toggleCompare(); close(); } },
      { id: 'cmd-random', group: 'Commands', label: 'Randomize style', hint: 'Surprise me', icon: <Sparkles size={16} />, keywords: 'random surprise shuffle generate', run: () => go(`/generator?seed=${Math.floor(Math.random() * 900000) + 100000}&surprise=1`) },
      { id: 'cmd-favorite', group: 'Commands', label: isFavorite(currentStyle.metadata.id) ? `Remove ${currentStyle.metadata.name} from favorites` : `Favorite ${currentStyle.metadata.name}`, icon: <Star size={16} />, keywords: 'favorite star bookmark', run: () => { toggleFavorite(currentStyle.metadata.id); close(); } },
      { id: 'cmd-motion', group: 'Commands', label: settings.reduceMotion ? 'Turn motion back on' : 'Reduce motion', icon: <Zap size={16} />, keywords: 'motion animation reduce accessibility', run: () => { updateSettings({ reduceMotion: !settings.reduceMotion }); close(); } },
      { id: 'cmd-experimental', group: 'Commands', label: settings.experimental ? 'Turn off experimental mode' : 'Turn on experimental mode', icon: <Zap size={16} />, keywords: 'experimental effects blur glow', run: () => { updateSettings({ experimental: !settings.experimental }); close(); } },
      { id: 'cmd-edit-template', group: 'Commands', label: 'Edit a template', hint: 'Rewrite text, reorder sections', icon: <PencilLine size={16} />, keywords: 'edit template text copy sections reorder hide landing page', run: () => go('/templates/landing-desktop/home?edit') },
      ...(isTweaked ? [
        { id: 'cmd-tweaks-save', group: 'Commands' as const, label: 'Save tweaks as a new style', icon: <Save size={16} />, keywords: 'tweaks save bake custom style', run: () => { saveTweaksAsStyle(); close(); } },
        { id: 'cmd-tweaks-reset', group: 'Commands' as const, label: 'Reset tweaks', icon: <RotateCcw size={16} />, keywords: 'tweaks reset clear radius spacing accent', run: () => { resetTweaks(); close(); } }
      ] : [])
    ];

    const pages: PaletteItem[] = [
      ...PAGES.map((p) => ({ id: `page-${p.id}`, group: 'Pages' as const, label: p.label, hint: p.group, icon: <p.icon size={16} />, keywords: `page open ${p.description} ${p.keywords}`, run: () => go(p.path) })),
      ...TEMPLATE_LINKS.map((t) => ({ id: `page-${t.path}`, group: 'Pages' as const, label: t.label, icon: t.icon, keywords: `templates ${t.keywords}`, run: () => go(t.path) })),
      ...LAB_SECTIONS.map((sec) => ({ id: `page-components-${sec.id}`, group: 'Pages' as const, label: `Components: ${sec.label}`, hint: sec.group, icon: <Sparkles size={16} />, keywords: `components lab ${sec.keywords.join(' ')}`, run: () => go(`/components/${sec.id}`) })),
      { id: 'page-landing', group: 'Pages', label: 'About UI Explorer', icon: <Home size={16} />, keywords: 'landing home welcome about', run: () => go('/') }
    ];

    const tools: PaletteItem[] = TOOLS.filter((t) => t.id !== 'search').map((t) => ({
      id: `tool-${t.id}`,
      group: 'Tools',
      label: t.label,
      hint: t.shortcut,
      icon: <t.icon size={16} />,
      keywords: `tool open ${t.description} ${t.keywords}`,
      run: () => { openTool(t.id); close(); }
    }));

    const styles: PaletteItem[] = availableStyles.map((s) => ({
      id: `style-${s.metadata.id}`,
      group: 'Styles',
      label: s.metadata.name,
      hint: s.metadata.category,
      icon: <Sparkles size={16} />,
      keywords: `${s.metadata.description} ${s.metadata.tags.join(' ')} ${s.metadata.category} ${s.metadata.personality}`,
      run: () => { setStyle(s.metadata.id); close(); }
    }));

    const tokens: PaletteItem[] = Object.entries(resolvedCssVars).map(([name, value]) => ({
      id: `token-${name}`,
      group: 'Tokens',
      label: name,
      hint: value,
      icon: <Braces size={16} />,
      keywords: `token property ${name.replace(/-/g, ' ')} ${value}`,
      run: () => { openTool('anatomy'); close(); }
    }));

    return [...pages, ...tools, ...commands, ...styles, ...tokens];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableStyles, currentStyle, resolvedCssVars, settings, isFavorite, isTweaked]);

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

  const groups = (['Pages', 'Tools', 'Commands', 'Styles', 'Tokens'] as const)
    .map((g) => ({ name: g, items: filtered.filter((i) => i.group === g) }))
    .filter((g) => g.items.length > 0);

  let runningIndex = -1;

  return (
    <motion.div className="cmd-backdrop" onClick={close} variants={fade} initial="hidden" animate="show" exit="exit">
      <motion.div className="cmd-palette" role="dialog" aria-modal="true" aria-label="Command palette" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown} variants={dialog}>
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
      </motion.div>
    </motion.div>
  );
};

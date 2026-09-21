import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Star, LayoutGrid, Share2, Check, Copy, Wand2, GitCompareArrows, Code2, ExternalLink, X, Filter,
  BookOpen, ShieldCheck, Layers, Network, Play, Users, BadgeCheck, FlaskConical, Sparkles
} from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import type { StyleDefinition } from '../../engine/types';
import { checkStyleCompleteness } from '../../engine/validator';
import { findSimilarStyles } from '../../engine/generator/dna';
import { buildShareUrl } from '../../engine/share';
import { communityPackages } from '../../styles';
import { GITHUB_REPO_URL } from '../../config/app';
import { StylePreviewCard } from '../../components/preview/StylePreviewCard';
import { WorkspaceSection, WorkspaceSegmented } from '../../components/workspace/Workspace';
import { computeFacets, FACET_OPTIONS, type StyleFacets } from './facets';
import { RelationshipMap, collectRelations } from './RelationshipMap';
import './StylesPage.css';

type SourceFilter = 'all' | 'official' | 'community' | 'custom' | 'favorites';
type SortKey = 'name' | 'category' | 'recent';
type View = 'grid' | 'map';
type DrawerTab = 'docs' | 'validator' | 'similar' | 'relations' | 'source';

const CATEGORIES = ['Morphism', 'Modern', 'Expressive', 'Futuristic', 'Retro', 'Minimalist', 'Custom'];

const SOURCE_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
  official: { label: 'Official', icon: <BadgeCheck size={12} /> },
  community: { label: 'Community', icon: <Users size={12} /> },
  custom: { label: 'Custom', icon: <FlaskConical size={12} /> },
  generated: { label: 'Generated', icon: <Sparkles size={12} /> }
};

/**
 * Styles gallery: every registered style as a live thumbnail, discovery
 * filters derived from tokens, a relationship map and a detail drawer with
 * docs, a completeness check, similar styles and the package source.
 */
export const StylesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { availableStyles, currentStyle, setStyle, favoriteIds, toggleFavorite, isFavorite, recentStyleIds, duplicateStyle } = useStyle();

  const [query, setQuery] = useState('');
  const [source, setSource] = useState<SourceFilter>('all');
  const [category, setCategory] = useState<string>('All');
  const [facetFilter, setFacetFilter] = useState<Partial<Record<keyof StyleFacets, string>>>({});
  const [sort, setSort] = useState<SortKey>('name');
  const [view, setView] = useState<View>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get('style'));
  const [tab, setTab] = useState<DrawerTab>('docs');
  const [copied, setCopied] = useState<string | null>(null);

  const facetsById = useMemo(() => new Map(availableStyles.map((s) => [s.metadata.id, computeFacets(s)])), [availableStyles]);
  const packageById = useMemo(() => new Map(communityPackages.map((p) => [p.style.metadata.id, p])), []);
  const extendsOf = useMemo(() => Object.fromEntries(communityPackages.map((p) => [p.style.metadata.id, p.extends])), []);
  const relations = useMemo(() => collectRelations(availableStyles, extendsOf), [availableStyles, extendsOf]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = availableStyles.filter((s) => {
      const f = facetsById.get(s.metadata.id)!;
      if (source === 'favorites' && !favoriteIds.includes(s.metadata.id)) return false;
      if (source === 'official' && f.source !== 'official') return false;
      if (source === 'community' && f.source !== 'community') return false;
      if (source === 'custom' && f.source !== 'custom' && f.source !== 'generated') return false;
      if (category !== 'All' && s.metadata.category !== category) return false;
      for (const [k, v] of Object.entries(facetFilter)) if (v && f[k as keyof StyleFacets] !== v) return false;
      if (q) {
        const hay = [s.metadata.name, s.metadata.description, s.metadata.personality, s.metadata.author, ...s.metadata.tags, ...(s.metadata.bestUsedFor ?? [])].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const recentRank = (id: string) => { const i = recentStyleIds.indexOf(id); return i === -1 ? 999 : i; };
    return list.sort((a, b) =>
      sort === 'name' ? a.metadata.name.localeCompare(b.metadata.name)
      : sort === 'category' ? a.metadata.category.localeCompare(b.metadata.category) || a.metadata.name.localeCompare(b.metadata.name)
      : recentRank(a.metadata.id) - recentRank(b.metadata.id) || a.metadata.name.localeCompare(b.metadata.name)
    );
  }, [availableStyles, facetsById, query, source, category, facetFilter, sort, favoriteIds, recentStyleIds]);

  const selected = useMemo(() => availableStyles.find((s) => s.metadata.id === selectedId) ?? null, [availableStyles, selectedId]);
  const selectedFacets = selected ? facetsById.get(selected.metadata.id) : undefined;
  const selectedPackage = selected ? packageById.get(selected.metadata.id) : undefined;
  const report = useMemo(() => (selected ? checkStyleCompleteness(selected) : null), [selected]);
  const similar = useMemo(() => (selected ? findSimilarStyles(selected, availableStyles, 5) : []), [selected, availableStyles]);
  const selectedRelations = useMemo(() => relations.filter((r) => r.from === selectedId || r.to === selectedId), [relations, selectedId]);

  // Deep links and share links: the shell resolves ?style= to a registered id; follow it into the drawer.
  const urlStyle = searchParams.get('style');
  useEffect(() => {
    if (urlStyle && urlStyle !== selectedId && availableStyles.some((s) => s.metadata.id === urlStyle)) setSelectedId(urlStyle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlStyle, availableStyles]);

  // Keep the drawer deep-linkable: /styles?style=<id>
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (selectedId) next.set('style', selectedId); else next.delete('style');
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (!selected) return;
    // Modals stacked above the drawer (diff, mixer, export) take the Escape first.
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('[aria-modal="true"]')) setSelectedId(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const copy = async (key: string, text: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    setCopied(key);
    setTimeout(() => setCopied(null), 1400);
  };

  const counts = useMemo(() => {
    const c = { official: 0, community: 0, custom: 0 };
    for (const f of facetsById.values()) { if (f.source === 'official') c.official++; else if (f.source === 'community') c.community++; else c.custom++; }
    return c;
  }, [facetsById]);

  const activeFilterCount = (source !== 'all' ? 1 : 0) + (category !== 'All' ? 1 : 0) + Object.values(facetFilter).filter(Boolean).length;
  const clearFilters = () => { setSource('all'); setCategory('All'); setFacetFilter({}); setQuery(''); };

  const applyStyle = (s: StyleDefinition) => setStyle(s.metadata.id);
  const remix = (s: StyleDefinition) => navigate(`/generator?remix=${encodeURIComponent(s.metadata.id)}`);
  const openDiff = (s: StyleDefinition) => window.dispatchEvent(new CustomEvent('ui-explorer:open-diff', { detail: { a: s.metadata.id, b: currentStyle.metadata.id === s.metadata.id ? undefined : currentStyle.metadata.id } }));
  const share = (s: StyleDefinition) => copy('share', buildShareUrl(s, !s.metadata.isCustom, '/styles'));
  const duplicate = (s: StyleDefinition) => { const copyStyle = duplicateStyle(s.metadata.id); if (copyStyle) { setSelectedId(copyStyle.metadata.id); } };
  const sourceJson = (s: StyleDefinition) => selectedPackage?.source ?? JSON.stringify(s, null, 2);
  const sourceUrl = (s: StyleDefinition) => {
    const pkg = packageById.get(s.metadata.id);
    if (pkg) return `${GITHUB_REPO_URL}/blob/main/${pkg.path}`;
    if (s.metadata.isCustom) return undefined;
    const file = ({ Morphism: 'morphism', Modern: 'modern', Expressive: 'expressive', Futuristic: 'futuristic', Retro: 'retro', Minimalist: 'artistic' } as Record<string, string>)[s.metadata.category] ?? 'index';
    return `${GITHUB_REPO_URL}/blob/main/src/styles/${file}.ts`;
  };

  return (
    <div className={`ws-workspace styles-page ${selected ? 'styles-page--drawer' : ''}`}>
      <aside className="ws-settings" aria-label="Style filters">
        <div className="ws-settings__header">
          <div className="ws-title">Styles</div>
          <div className="ws-subtitle">{counts.official} official · {counts.community} community · {counts.custom} yours</div>
        </div>
        <div className="ws-settings__scroll">
          <div className="styles-search">
            <Search size={14} aria-hidden="true" />
            <input className="ws-input" placeholder="Search name, tag, use case…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search styles" />
            {query && <button type="button" className="styles-search__clear" onClick={() => setQuery('')} aria-label="Clear search"><X size={12} /></button>}
          </div>

          <WorkspaceSection title="Source" icon={<Filter size={14} />}>
            <WorkspaceSegmented<SourceFilter>
              label="Source"
              value={source}
              onChange={setSource}
              columns={3}
              options={[
                { value: 'all', label: 'All' }, { value: 'official', label: 'Official' }, { value: 'community', label: 'Community' },
                { value: 'custom', label: 'Yours' }, { value: 'favorites', label: <><Star size={11} /> Fav</> }
              ]}
            />
          </WorkspaceSection>

          <WorkspaceSection title="Category" icon={<LayoutGrid size={14} />}>
            <ul className="ws-category-list">
              {['All', ...CATEGORIES].map((c) => {
                const n = c === 'All' ? availableStyles.length : availableStyles.filter((s) => s.metadata.category === c).length;
                if (n === 0 && c !== 'All') return null;
                return (
                  <li key={c}>
                    <button type="button" className={`ws-category ${category === c ? 'ws-category--active' : ''}`} onClick={() => setCategory(c)} aria-pressed={category === c}>
                      <span>{c}</span><span className="ws-category__count">{n}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </WorkspaceSection>

          <WorkspaceSection title="Discover" icon={<Layers size={14} />}>
            {FACET_OPTIONS.map((f) => (
              <div key={f.key} className="styles-facet">
                <div className="styles-facet__label">{f.label}</div>
                <div className="styles-facet__chips">
                  {f.values.map((v) => {
                    const active = facetFilter[f.key] === v;
                    const n = availableStyles.filter((s) => facetsById.get(s.metadata.id)![f.key] === v).length;
                    return (
                      <button
                        key={v}
                        type="button"
                        className={`ws-chip ${active ? 'ws-chip--accent' : ''}`}
                        aria-pressed={active}
                        onClick={() => setFacetFilter((prev) => ({ ...prev, [f.key]: active ? undefined : v }))}
                      >
                        {v} <span className="styles-facet__n">{n}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {activeFilterCount > 0 && <button type="button" className="ws-btn ws-btn--sm styles-clear" onClick={clearFilters}>Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}</button>}
          </WorkspaceSection>

          <WorkspaceSection title="Contribute" icon={<ExternalLink size={14} />} defaultOpen={false}>
            <p className="ws-hint">Community styles are plain JSON packages under <code>styles/community/&lt;slug&gt;/style.json</code>. Add one, list it in <code>index.json</code>, and open a pull request.</p>
            <a className="ws-btn ws-btn--sm" href={`${GITHUB_REPO_URL}/tree/main/styles/community`} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Browse the registry</a>
          </WorkspaceSection>
        </div>
      </aside>

      <section className="ws-stage">
        <div className="ws-stage__bar">
          <div className="ws-stage__status"><span className="ws-stage__dot" />{filtered.length} of {availableStyles.length} styles{query ? ` matching “${query}”` : ''}</div>
          <div className="styles-bar__controls">
            <label className="ws-field styles-sort">
              <span>Sort</span>
              <select className="ws-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort styles">
                <option value="name">Name</option><option value="category">Category</option><option value="recent">Recently used</option>
              </select>
            </label>
            <WorkspaceSegmented<View> label="View" value={view} onChange={setView} options={[{ value: 'grid', label: <><LayoutGrid size={13} /> Gallery</> }, { value: 'map', label: <><Network size={13} /> Map</> }]} />
          </div>
        </div>

        <div className="styles-stage__body">
          {view === 'map' ? (
            <RelationshipMap styles={filtered} relations={relations} selectedId={selectedId ?? undefined} onSelect={(id) => { setSelectedId(id); setTab('relations'); }} />
          ) : filtered.length === 0 ? (
            <div className="ws-empty">No styles match. <button type="button" className="ws-btn ws-btn--sm" onClick={clearFilters}>Clear filters</button></div>
          ) : (
            <div className="styles-grid">
              {filtered.map((s) => {
                const f = facetsById.get(s.metadata.id)!;
                const isCurrent = s.metadata.id === currentStyle.metadata.id;
                const badge = SOURCE_LABEL[f.source];
                return (
                  <article key={s.metadata.id} className={`styles-card ${isCurrent ? 'styles-card--current' : ''} ${selectedId === s.metadata.id ? 'styles-card--selected' : ''}`}>
                    <StylePreviewCard style={s} size="thumb" onClick={() => { setSelectedId(s.metadata.id); setTab('docs'); }} />
                    <div className="styles-card__meta">
                      <div className="styles-card__row">
                        <h3 className="styles-card__name">{s.metadata.name}</h3>
                        <button type="button" className={`styles-card__fav ${isFavorite(s.metadata.id) ? 'styles-card__fav--on' : ''}`} onClick={() => toggleFavorite(s.metadata.id)} aria-label={isFavorite(s.metadata.id) ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={isFavorite(s.metadata.id)}>
                          <Star size={14} />
                        </button>
                      </div>
                      <div className="styles-card__tags">
                        <span className={`styles-badge styles-badge--${f.source}`}>{badge.icon} {badge.label}</span>
                        <span className="styles-badge">{s.metadata.category}</span>
                        <span className="styles-badge styles-badge--muted">{f.material} · {f.mood} · {f.depth}</span>
                      </div>
                      <div className="styles-card__actions">
                        <button type="button" className={`ws-btn ws-btn--sm ${isCurrent ? '' : 'ws-btn--primary'}`} onClick={() => applyStyle(s)} disabled={isCurrent}>{isCurrent ? <><Check size={12} /> In use</> : <><Play size={12} /> Use</>}</button>
                        <button type="button" className="ws-btn ws-btn--sm" onClick={() => { setSelectedId(s.metadata.id); setTab('docs'); }}><BookOpen size={12} /> Details</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {selected && selectedFacets && report && (
        <aside className="styles-drawer" role="dialog" aria-label={`${selected.metadata.name} details`}>
          <div className="styles-drawer__hero">
            <StylePreviewCard style={selected} size="thumb" />
          </div>
          <div className="styles-drawer__head">
            <div>
              <h2 className="styles-drawer__title">{selected.metadata.name}</h2>
              <div className="styles-card__tags">
                <span className={`styles-badge styles-badge--${selectedFacets.source}`}>{SOURCE_LABEL[selectedFacets.source].icon} {SOURCE_LABEL[selectedFacets.source].label}</span>
                <span className="styles-badge">{selected.metadata.category}</span>
                {selected.metadata.version && <span className="styles-badge styles-badge--muted">v{selected.metadata.version}</span>}
                {selected.metadata.license && <span className="styles-badge styles-badge--muted">{selected.metadata.license}</span>}
              </div>
            </div>
            <button type="button" className="styles-drawer__close" onClick={() => setSelectedId(null)} aria-label="Close details"><X size={16} /></button>
          </div>

          <div className="styles-drawer__actions">
            <button type="button" className="ws-btn ws-btn--primary ws-btn--sm" onClick={() => applyStyle(selected)} disabled={selected.metadata.id === currentStyle.metadata.id}><Play size={12} /> {selected.metadata.id === currentStyle.metadata.id ? 'In use' : 'Use'}</button>
            <button type="button" className="ws-btn ws-btn--sm" onClick={() => remix(selected)}><Wand2 size={12} /> Remix</button>
            <button type="button" className="ws-btn ws-btn--sm" onClick={() => duplicate(selected)}><Copy size={12} /> Duplicate</button>
            <button type="button" className="ws-btn ws-btn--sm" onClick={() => openDiff(selected)}><GitCompareArrows size={12} /> Diff</button>
            <button type="button" className="ws-btn ws-btn--sm" onClick={() => share(selected)}>{copied === 'share' ? <Check size={12} /> : <Share2 size={12} />} {copied === 'share' ? 'Copied' : 'Share'}</button>
            <button type="button" className={`ws-btn ws-btn--sm ${isFavorite(selected.metadata.id) ? 'styles-card__fav--on' : ''}`} onClick={() => toggleFavorite(selected.metadata.id)} aria-pressed={isFavorite(selected.metadata.id)}><Star size={12} /> {isFavorite(selected.metadata.id) ? 'Favorited' : 'Favorite'}</button>
          </div>

          <div className="ws-tabs styles-drawer__tabs" role="tablist">
            {([['docs', 'Docs', <BookOpen size={13} key="i" />], ['validator', 'Validator', <ShieldCheck size={13} key="i" />], ['similar', 'Similar', <Layers size={13} key="i" />], ['relations', 'Relations', <Network size={13} key="i" />], ['source', 'Source', <Code2 size={13} key="i" />]] as [DrawerTab, string, React.ReactNode][]).map(([id, label, icon]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} className={`ws-tab ${tab === id ? 'ws-tab--active' : ''}`} onClick={() => setTab(id)}>{icon} {label}</button>
            ))}
          </div>

          <div className="styles-drawer__body">
            {tab === 'docs' && (
              <div className="styles-docs">
                <p className="styles-docs__lead">{selected.metadata.description}</p>
                {selected.metadata.visualCharacter && <section><h4>Visual character</h4><p>{selected.metadata.visualCharacter}</p></section>}
                {selected.metadata.personality && <section><h4>Personality</h4><p>{selected.metadata.personality}</p></section>}
                {selected.metadata.history && <section><h4>History</h4><p>{selected.metadata.history}</p></section>}
                {selected.metadata.principles && selected.metadata.principles.length > 0 && <section><h4>Design principles</h4><ul>{selected.metadata.principles.map((p) => <li key={p}>{p}</li>)}</ul></section>}
                {selected.metadata.bestUsedFor.length > 0 && <section><h4>Best used for</h4><ul>{selected.metadata.bestUsedFor.map((p) => <li key={p}>{p}</li>)}</ul></section>}
                {selected.metadata.avoidWhen && selected.metadata.avoidWhen.length > 0 && <section><h4>Avoid when</h4><ul>{selected.metadata.avoidWhen.map((p) => <li key={p}>{p}</li>)}</ul></section>}
                <section>
                  <h4>Traits</h4>
                  <div className="styles-card__tags">
                    {(['material', 'mood', 'depth', 'motion', 'complexity'] as const).map((k) => <span key={k} className="styles-badge styles-badge--muted">{k}: {selectedFacets[k]}</span>)}
                  </div>
                </section>
                {selected.metadata.tags.length > 0 && <section><h4>Tags</h4><div className="styles-card__tags">{selected.metadata.tags.map((t) => <span key={t} className="styles-badge">{t}</span>)}</div></section>}
                <section className="styles-docs__meta">
                  {selected.metadata.author && <div><span>Author</span><strong>{selected.metadata.author}</strong></div>}
                  <div><span>Source</span><strong>{SOURCE_LABEL[selectedFacets.source].label}</strong></div>
                  {selected.metadata.license && <div><span>Licence</span><strong>{selected.metadata.license}</strong></div>}
                  {selected.generation && <div><span>Seed</span><strong>{selected.generation.seed}</strong></div>}
                  {selected.generation && <div><span>DNA</span><strong>{selected.generation.dnaHash}</strong></div>}
                </section>
              </div>
            )}

            {tab === 'validator' && (
              <div className="styles-validator">
                <div className="styles-validator__summary">
                  <div><span className="styles-validator__big">{report.score}</span><span>systems defined</span></div>
                  <div><span className="styles-validator__big">{report.componentDepth}%</span><span>component depth</span></div>
                </div>
                <p className="ws-hint">A development indicator for style authors — which systems the package defines and how deep the optional coverage goes. Not a quality ranking.</p>
                <ul className="styles-validator__list">
                  {report.checks.map((c) => (
                    <li key={c.id} className={c.ok ? 'ok' : 'missing'}>
                      <span className="styles-validator__mark">{c.ok ? <Check size={12} /> : <X size={12} />}</span>
                      <span className="styles-validator__label">{c.label}</span>
                      <span className="styles-validator__detail">{c.detail}</span>
                    </li>
                  ))}
                </ul>
                <div className="styles-validator__bar"><span style={{ width: `${report.componentDepth}%` }} /></div>
              </div>
            )}

            {tab === 'similar' && (
              <div className="styles-similar">
                <p className="ws-hint">Closest styles in DNA space — shared characteristics, not a ranking.</p>
                {similar.map((s) => (
                  <div key={s.style.metadata.id} className="styles-similar__item" role="button" tabIndex={0} onClick={() => { setSelectedId(s.style.metadata.id); }} onKeyDown={(e) => { if (e.key === 'Enter') setSelectedId(s.style.metadata.id); }}>
                    <StylePreviewCard style={s.style} size="thumb" className="styles-similar__thumb" />
                    <div>
                      <div className="styles-similar__name">{s.style.metadata.name}</div>
                      <div className="styles-similar__shared">{s.shared.length ? s.shared.slice(0, 4).join(' · ') : 'different character'} · distance {s.distance.toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'relations' && (
              <div className="styles-relations">
                {selectedRelations.length === 0 && <p className="ws-hint">No declared relations yet.</p>}
                {selectedRelations.map((r) => {
                  const otherId = r.from === selectedId ? r.to : r.from;
                  const other = availableStyles.find((s) => s.metadata.id === otherId);
                  const label = r.kind === 'related' ? 'related' : r.from === selectedId ? (r.kind === 'extends' ? 'extends' : r.kind === 'remix' ? 'remixed from' : 'duplicated from') : (r.kind === 'extends' ? 'extended by' : r.kind === 'remix' ? 'remixed into' : 'duplicated as');
                  return (
                    <div key={`${r.from}-${r.to}-${r.kind}`} className="styles-relations__row">
                      <span className={`styles-badge styles-badge--${r.kind}`}>{label}</span>
                      <button type="button" className="styles-link" onClick={() => setSelectedId(otherId)}>{other?.metadata.name ?? otherId}</button>
                    </div>
                  );
                })}
                <button type="button" className="ws-btn ws-btn--sm" onClick={() => setView('map')}><Network size={12} /> Show on the map</button>
              </div>
            )}

            {tab === 'source' && (
              <div className="styles-source">
                <div className="styles-source__row">
                  {selectedPackage && <span className="ws-hint"><code>{selectedPackage.path}</code></span>}
                  <button type="button" className="ws-btn ws-btn--sm" onClick={() => copy('json', sourceJson(selected))}>{copied === 'json' ? <Check size={12} /> : <Copy size={12} />} Copy JSON</button>
                  {sourceUrl(selected) && <a className="ws-btn ws-btn--sm" href={sourceUrl(selected)} target="_blank" rel="noreferrer"><ExternalLink size={12} /> View on GitHub</a>}
                </div>
                {selectedPackage?.readme && <pre className="styles-source__readme">{selectedPackage.readme}</pre>}
                <pre className="styles-source__code"><code>{sourceJson(selected)}</code></pre>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

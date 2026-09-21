import React, { useMemo, useState } from 'react';
import type { StyleDefinition } from '../../engine/types';

export type RelationKind = 'related' | 'extends' | 'remix' | 'duplicate';

export interface Relation {
  from: string;
  to: string;
  kind: RelationKind;
}

interface Node {
  id: string;
  name: string;
  category: string;
  accent: string;
  bg: string;
  x: number;
  y: number;
}

const CATEGORY_ORDER = ['Morphism', 'Modern', 'Expressive', 'Futuristic', 'Retro', 'Minimalist', 'Custom'];

/** Every relationship the registry knows about: declared, inherited and generated lineage. */
export function collectRelations(styles: StyleDefinition[], extendsOf: Record<string, string | undefined>): Relation[] {
  const ids = new Set(styles.map((s) => s.metadata.id));
  const out: Relation[] = [];
  const seen = new Set<string>();
  const push = (r: Relation) => {
    if (!ids.has(r.from) || !ids.has(r.to) || r.from === r.to) return;
    const key = r.kind === 'related' ? [r.from, r.to].sort().join('|') + r.kind : `${r.from}|${r.to}|${r.kind}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(r);
  };
  for (const s of styles) {
    const id = s.metadata.id;
    const parent = extendsOf[id];
    for (const rel of s.metadata.relatedStyles ?? []) push({ from: id, to: rel, kind: rel === parent ? 'extends' : 'related' });
    if (parent) push({ from: id, to: parent, kind: 'extends' });
    if (s.generation?.parentId) push({ from: id, to: s.generation.parentId, kind: 'remix' });
    if (s.metadata.isCustom && !s.generation) {
      // Duplicates keep a "<name> (Copy)" convention; match them to their origin by name.
      const origin = styles.find((o) => o.metadata.id !== id && !o.metadata.isCustom && s.metadata.name.startsWith(o.metadata.name));
      if (origin) push({ from: id, to: origin.metadata.id, kind: 'duplicate' });
    }
  }
  return out;
}

/**
 * Radial map: styles cluster by category around a ring, edges show declared
 * relations, inheritance and generated lineage. Pure SVG, no layout library.
 */
export const RelationshipMap: React.FC<{
  styles: StyleDefinition[];
  relations: Relation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}> = ({ styles, relations, selectedId, onSelect }) => {
  const [hover, setHover] = useState<string | null>(null);
  const W = 700, H = 620, cx = W / 2, cy = H / 2;

  const nodes = useMemo<Node[]>(() => {
    const groups = new Map<string, StyleDefinition[]>();
    for (const s of styles) {
      const cat = CATEGORY_ORDER.includes(s.metadata.category) ? s.metadata.category : 'Custom';
      groups.set(cat, [...(groups.get(cat) ?? []), s]);
    }
    const order = CATEGORY_ORDER.filter((c) => groups.has(c));
    const total = styles.length;
    const out: Node[] = [];
    let index = 0;
    order.forEach((cat, gi) => {
      const list = groups.get(cat)!;
      list.forEach((s, i) => {
        // Slot on the ring, with a small gap between category groups and an inner/outer stagger.
        const angle = ((index + gi * 0.9) / (total + order.length * 0.9)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? 268 : 222;
        out.push({
          id: s.metadata.id, name: s.metadata.name, category: cat,
          accent: s.tokens.colors.accent, bg: s.tokens.colors.bg,
          x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r * 0.92
        });
        index++;
      });
    });
    return out;
  }, [styles, cx, cy]);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const focus = hover ?? selectedId ?? null;
  const connected = useMemo(() => {
    if (!focus) return null;
    const set = new Set<string>([focus]);
    for (const r of relations) { if (r.from === focus) set.add(r.to); if (r.to === focus) set.add(r.from); }
    return set;
  }, [focus, relations]);

  const stroke: Record<RelationKind, string> = { related: '#3a3e44', extends: '#a78bfa', remix: '#22d3ee', duplicate: '#f59e0b' };

  return (
    <div className="relmap" role="figure" aria-label="Style relationship map">
      <svg viewBox={`0 0 ${W} ${H}`} className="relmap__svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="relmap-glow"><stop offset="0" stopColor="#06b6d4" stopOpacity="0.25" /><stop offset="1" stopColor="#06b6d4" stopOpacity="0" /></radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={290} fill="url(#relmap-glow)" />
        <g className="relmap__edges">
          {relations.map((r) => {
            const a = byId.get(r.from), b = byId.get(r.to);
            if (!a || !b) return null;
            const active = connected ? connected.has(r.from) && connected.has(r.to) && (r.from === focus || r.to === focus) : true;
            const mx = (a.x + b.x) / 2 + (cy - (a.y + b.y) / 2) * 0.25, my = (a.y + b.y) / 2 + ((a.x + b.x) / 2 - cx) * 0.25;
            return (
              <path
                key={`${r.from}-${r.to}-${r.kind}`}
                d={`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`}
                fill="none"
                stroke={stroke[r.kind]}
                strokeWidth={active ? (r.kind === 'related' ? 1.5 : 2.2) : 1}
                strokeDasharray={r.kind === 'extends' ? '6 4' : r.kind === 'remix' ? '2 4' : undefined}
                opacity={active ? 0.95 : connected ? 0.08 : 0.45}
              />
            );
          })}
        </g>
        <g className="relmap__nodes">
          {nodes.map((n) => {
            const dim = connected ? !connected.has(n.id) : false;
            const isFocus = n.id === focus;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                className={`relmap__node ${dim ? 'relmap__node--dim' : ''} ${isFocus ? 'relmap__node--focus' : ''}`}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect(n.id)}
                role="button"
                tabIndex={0}
                aria-label={`${n.name} (${n.category})`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(n.id); } }}
              >
                <circle r={isFocus ? 16 : 12} fill={n.bg} stroke={n.accent} strokeWidth={isFocus ? 4 : 2.5} />
                <circle r={4} fill={n.accent} />
                <text y={isFocus ? 30 : 25} textAnchor="middle" className="relmap__label">{n.name.length > 18 ? `${n.name.slice(0, 17)}…` : n.name}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="relmap__legend" aria-hidden="true">
        <span><i style={{ background: '#3a3e44' }} /> related</span>
        <span><i style={{ background: '#a78bfa' }} /> extends</span>
        <span><i style={{ background: '#22d3ee' }} /> remixed from</span>
        <span><i style={{ background: '#f59e0b' }} /> duplicated from</span>
      </div>
    </div>
  );
};

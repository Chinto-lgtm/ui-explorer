import React, { useMemo, useState } from 'react';
import { X, GitCompareArrows, ArrowRight } from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { buildAnatomy } from '../anatomy/anatomy';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { computeStyleDNA, DNA_AXES } from '../../engine/generator/dna';
import { StylePreviewCard } from '../../components/preview/StylePreviewCard';
import './StyleDiffModal.css';

export const StyleDiffModal: React.FC<{ onClose: () => void; initialA?: string; initialB?: string }> = ({ onClose, initialA, initialB }) => {
  const { availableStyles, currentStyle } = useStyle();
  const [aId, setAId] = useState(initialA ?? currentStyle.metadata.id);
  const [bId, setBId] = useState(initialB ?? availableStyles.find((s) => s.metadata.id !== currentStyle.metadata.id)?.metadata.id ?? currentStyle.metadata.id);
  const [onlyDiff, setOnlyDiff] = useState(true);

  const a = availableStyles.find((s) => s.metadata.id === aId) ?? currentStyle;
  const b = availableStyles.find((s) => s.metadata.id === bId) ?? currentStyle;

  const rows = useMemo(() => {
    const sa = buildAnatomy(a, resolveStyleToCssVars(a));
    const sb = buildAnatomy(b, resolveStyleToCssVars(b));
    return sa.map((section, i) => ({
      title: section.title,
      items: section.properties.map((p, j) => {
        const q = sb[i]?.properties[j];
        return { label: p.label, a: p.value, b: q?.value ?? '', swatchA: p.swatch, swatchB: q?.swatch, changed: p.value !== (q?.value ?? '') };
      })
    }));
  }, [a, b]);

  const dnaA = computeStyleDNA(a);
  const dnaB = computeStyleDNA(b);
  const changedCount = rows.reduce((n, s) => n + s.items.filter((i) => i.changed).length, 0);

  return (
    <div className="diff-backdrop" onClick={onClose}>
      <div className="diff-modal" role="dialog" aria-modal="true" aria-label="Style diff" onClick={(e) => e.stopPropagation()}>
        <div className="diff-header">
          <div className="diff-title"><GitCompareArrows size={18} /> Style Diff</div>
          <button type="button" className="diff-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="diff-pickers">
          <label className="diff-picker">
            <span>A</span>
            <select className="shell-select" value={aId} onChange={(e) => setAId(e.target.value)}>
              {availableStyles.map((s) => <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name}</option>)}
            </select>
          </label>
          <ArrowRight size={16} className="diff-arrow" />
          <label className="diff-picker">
            <span>B</span>
            <select className="shell-select" value={bId} onChange={(e) => setBId(e.target.value)}>
              {availableStyles.map((s) => <option key={s.metadata.id} value={s.metadata.id}>{s.metadata.name}</option>)}
            </select>
          </label>
          <label className="diff-only">
            <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} /> Only differences ({changedCount})
          </label>
        </div>

        <div className="diff-previews">
          <StylePreviewCard style={a} size="thumb" />
          <StylePreviewCard style={b} size="thumb" />
        </div>

        <div className="diff-dna">
          {DNA_AXES.map((axis) => (
            <div key={axis} className="diff-dna__row">
              <span className="diff-dna__label">{axis}</span>
              <div className="diff-dna__bars">
                <span className="diff-dna__bar diff-dna__bar--a" style={{ width: `${dnaA[axis] * 10}%` }} />
                <span className="diff-dna__bar diff-dna__bar--b" style={{ width: `${dnaB[axis] * 10}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="diff-body">
          {rows.map((section) => {
            const items = onlyDiff ? section.items.filter((i) => i.changed) : section.items;
            if (items.length === 0) return null;
            return (
              <div key={section.title} className="diff-section">
                <div className="diff-section__title">{section.title}</div>
                {items.map((i) => (
                  <div key={i.label} className={`diff-row ${i.changed ? 'diff-row--changed' : ''}`}>
                    <span className="diff-row__label">{i.label}</span>
                    <span className="diff-row__value">{i.swatchA && <span className="diff-swatch" style={{ background: i.swatchA }} />}{i.a}</span>
                    <ArrowRight size={12} className="diff-row__arrow" />
                    <span className="diff-row__value">{i.swatchB && <span className="diff-swatch" style={{ background: i.swatchB }} />}{i.b}</span>
                  </div>
                ))}
              </div>
            );
          })}
          {changedCount === 0 && <p className="diff-empty">These two styles resolve to the same anatomy.</p>}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { Reorder, AnimatePresence, motion } from 'motion/react';
import { PencilLine, Eye, EyeOff, GripVertical, ChevronUp, ChevronDown, RotateCcw, Download, Upload } from 'lucide-react';
import { WorkspaceSwitch } from '../../components/workspace/Workspace';
import type { FamilyDef, ScreenDef } from '../../templates/nav';
import { countEdits, editStore, screenKey, useEdits } from '../../templates/edit/editStore';
import { normaliseOrder, sectionLabel, sectionsOf } from '../../templates/edit/applyEdits';

interface Props {
  family: FamilyDef;
  screen: ScreenDef;
  /** The rendered screen, to read its sections. Null outside the single-screen view. */
  root: HTMLElement | null;
  editing: boolean;
  setEditing: (on: boolean) => void;
  /** Editing works on one screen at a time. */
  canEdit: boolean;
}

const download = (name: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Edit the template you are looking at: rewrite any text in place, hide or
 * reorder landing sections, and keep the result in this browser or take it
 * with you as JSON.
 */
export const EditPanel: React.FC<Props> = ({ family, screen, root, editing, setEditing, canEdit }) => {
  const edits = useEdits();
  const key = screenKey(family.id, screen.id);
  const screenEdits = edits.screens[key];
  const counts = countEdits(screenEdits);
  const totalScreens = Object.keys(edits.screens).length;
  const [names, setNames] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const isLanding = family.id !== 'app';

  // Read section names from the rendered page once it has painted (they follow any heading you rewrote).
  useEffect(() => {
    if (!root || !isLanding) return;
    const id = requestAnimationFrame(() => setNames(sectionsOf(root).map((el, i) => sectionLabel(el, i))));
    return () => cancelAnimationFrame(id);
  }, [root, isLanding, screen.id, screenEdits]);

  const sections = normaliseOrder(names.length, screenEdits?.sections);
  const save = (next: { order?: number[]; hidden?: number[] }) => editStore.setSections(key, { ...sections, ...next });
  const move = (from: number, to: number) => {
    if (to < 0 || to >= sections.order.length) return;
    const order = [...sections.order];
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    save({ order });
  };
  const toggleHidden = (i: number) => save({ hidden: sections.hidden.includes(i) ? sections.hidden.filter((n) => n !== i) : [...sections.hidden, i] });

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const ok = editStore.import(JSON.parse(await file.text()));
      setMessage(ok ? `Imported edits from ${file.name}.` : 'That file has no template edits in it.');
    } catch {
      setMessage('That file is not valid JSON.');
    }
  };

  const summary = [
    counts.text ? `${counts.text} text${counts.text === 1 ? '' : 's'} rewritten` : null,
    counts.hidden ? `${counts.hidden} section${counts.hidden === 1 ? '' : 's'} hidden` : null,
    counts.moved ? 'sections reordered' : null
  ].filter(Boolean).join(' · ');

  return (
    <div className="tp-edit">
      <WorkspaceSwitch
        checked={editing}
        onChange={setEditing}
        disabled={!canEdit}
        label={<><PencilLine size={13} aria-hidden="true" /> Edit text on the page</>}
      />
      <p className="tp-hint">
        {canEdit
          ? editing ? 'Click any text in the frame to rewrite it. Enter saves, Esc undoes. Links wait until you are done.' : 'Rewrite headlines, buttons and copy right in the frame.'
          : 'Switch to the Screen view to edit.'}
      </p>
      <p className="tp-edit__summary" aria-live="polite">{summary || 'No edits on this page yet.'}</p>

      {isLanding && canEdit && names.length > 1 && (
        <div className="tp-edit__sections">
          <span className="tp-screens__heading">Sections · drag to reorder</span>
          <Reorder.Group axis="y" values={sections.order} onReorder={(order) => save({ order })} className="tp-sections" as="ol">
            <AnimatePresence initial={false}>
              {sections.order.map((idx, pos) => {
                const hidden = sections.hidden.includes(idx);
                return (
                  <Reorder.Item key={idx} value={idx} as="li" className={`tp-section ${hidden ? 'tp-section--hidden' : ''}`} whileDrag={{ scale: 1.03, boxShadow: '0 12px 30px -10px var(--chrome-overlay)' }}>
                    <GripVertical size={14} className="tp-section__grip" aria-hidden="true" />
                    <span className="tp-section__name" title={names[idx]}>{names[idx]}</span>
                    <button type="button" className="tp-icon-btn" onClick={() => move(pos, pos - 1)} disabled={pos === 0} aria-label={`Move ${names[idx]} up`}><ChevronUp size={14} /></button>
                    <button type="button" className="tp-icon-btn" onClick={() => move(pos, pos + 1)} disabled={pos === sections.order.length - 1} aria-label={`Move ${names[idx]} down`}><ChevronDown size={14} /></button>
                    <button type="button" className="tp-icon-btn" onClick={() => toggleHidden(idx)} aria-pressed={hidden} aria-label={hidden ? `Show ${names[idx]}` : `Hide ${names[idx]}`}>
                      {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </Reorder.Item>
                );
              })}
            </AnimatePresence>
          </Reorder.Group>
        </div>
      )}

      <div className="tp-edit__actions">
        <button type="button" className="tp-btn" onClick={() => editStore.resetScreen(key)} disabled={!screenEdits}><RotateCcw size={13} /> Reset page</button>
        <button type="button" className="tp-btn" onClick={() => download('orbit-template-edits.json', editStore.export())} disabled={!totalScreens}><Download size={13} /> Export</button>
        <button type="button" className="tp-btn" onClick={() => fileRef.current?.click()}><Upload size={13} /> Import</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
      </div>
      {totalScreens > 0 && (
        <button type="button" className="tp-link-btn" onClick={() => { editStore.resetAll(); setMessage('All template edits removed.'); }}>
          Reset edits on all {totalScreens} page{totalScreens === 1 ? '' : 's'}
        </button>
      )}
      <AnimatePresence>
        {message && (
          <motion.p className="tp-hint" role="status" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onAnimationComplete={() => window.setTimeout(() => setMessage(null), 2600)}>
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

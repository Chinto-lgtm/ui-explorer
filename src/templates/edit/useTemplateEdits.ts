import { useLayoutEffect, useRef } from 'react';
import { editStore, screenKey, useEdits } from './editStore';
import { applySections, applyText, enableEditing, markEditable } from './applyEdits';
import type { Leaf } from './applyEdits';

/**
 * Keeps a rendered screen in step with its saved edits (also after React
 * re-renders parts of it), and turns on in-place editing when asked.
 */
export function useTemplateEdits(root: HTMLElement | null, family: string, screen: string, editing: boolean) {
  const edits = useEdits();
  const key = screenKey(family, screen);
  const screenEdits = edits.screens[key];
  const leavesRef = useRef<Leaf[]>([]);

  useLayoutEffect(() => {
    if (!root) return;
    let frame = 0;
    const apply = () => {
      observer.disconnect();
      leavesRef.current = applyText(root, screenEdits);
      applySections(root, screenEdits?.sections);
      markEditable(leavesRef.current, editing);
      observer.observe(root, { childList: true, subtree: true, characterData: true });
    };
    // React re-renders parts of a screen (tabs, sliders, toasts); re-apply once per frame after it does.
    const observer = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; apply(); });
    });
    apply();
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, [root, screenEdits, editing]);

  useLayoutEffect(() => {
    if (!root || !editing) return;
    return enableEditing(root, () => leavesRef.current, (tKey, text) => editStore.setText(key, tKey, text));
  }, [root, editing, key]);
}

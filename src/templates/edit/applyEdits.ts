/**
 * Lays a visitor's edits over a rendered template screen.
 *
 * Templates are ordinary React components, so edits are applied to the DOM
 * they render, carefully: only "leaf" text elements (elements whose children
 * are all text nodes) are rewritten, and only by changing text node values,
 * which React tolerates. Sections are hidden and reordered with CSS (`order`,
 * `data-tpl-hidden`), never by moving nodes React owns.
 */

import type { ScreenEdits, SectionEdits } from './editStore';
import { textKey } from './editStore';

const SKIP = 'svg, script, style, textarea, select, option, input, [data-no-edit], [aria-hidden="true"]';

/** Text of an element as React rendered it, before any override we applied. */
const originals = new WeakMap<HTMLElement, string>();
/** The text we last wrote into an element. If the DOM no longer matches it, React has changed the element. */
const applied = new WeakMap<HTMLElement, string>();

const normalise = (s: string) => s.replace(/\s+/g, ' ').trim();

const isTextish = (n: Node) => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.COMMENT_NODE;

function isLeaf(el: HTMLElement): boolean {
  if (!el.childNodes.length) return false;
  for (const n of el.childNodes) if (!isTextish(n)) return false;
  const text = normalise(el.textContent ?? '');
  return text.length > 0 && text.length < 400 && /[\p{L}\p{N}]/u.test(text);
}

/** Every editable text element in a screen, in document order. */
export function leafTextElements(root: HTMLElement): HTMLElement[] {
  const out: HTMLElement[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => ((node as Element).matches(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n as HTMLElement;
    if (isLeaf(el)) out.push(el);
  }
  return out;
}

/** Rewrites an element's text through its existing text nodes, so React keeps the nodes it knows. */
function setText(el: HTMLElement, text: string) {
  const nodes = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE);
  if (!nodes.length) { el.appendChild(document.createTextNode(text)); return; }
  nodes[0].nodeValue = text;
  for (const n of nodes.slice(1)) n.nodeValue = '';
}

export interface Leaf {
  el: HTMLElement;
  original: string;
  key: string;
}

/**
 * Pairs every leaf with its original text and a stable key: the original
 * text plus how many earlier leaves carry the same text. Keys survive
 * re-renders and remounts because they do not depend on DOM positions.
 */
export function indexLeaves(root: HTMLElement): Leaf[] {
  const counts = new Map<string, number>();
  const focused = document.activeElement;
  return leafTextElements(root).map((el) => {
    const current = el.textContent ?? '';
    const last = applied.get(el);
    // React rewrote an element we had touched (dynamic text): its new text is the new original.
    if (last !== undefined && current !== last && el !== focused) { applied.delete(el); originals.delete(el); }
    if (!applied.has(el) && el !== focused) originals.set(el, current);
    const original = normalise(originals.get(el) ?? current);
    const n = counts.get(original) ?? 0;
    counts.set(original, n + 1);
    return { el, original, key: textKey(original, n) };
  });
}

/** Writes overrides into the screen and restores text whose override was removed. */
export function applyText(root: HTMLElement, edits: ScreenEdits | undefined): Leaf[] {
  const focused = document.activeElement;
  const leaves = indexLeaves(root);
  for (const { el, key } of leaves) {
    if (el === focused) continue;
    const override = edits?.text[key];
    const current = el.textContent ?? '';
    if (override !== undefined) {
      if (current !== override) setText(el, override);
      applied.set(el, override);
    } else if (applied.has(el)) {
      setText(el, originals.get(el) ?? current);
      applied.delete(el);
    }
  }
  return leaves;
}

/* ------------------------------------------------------------------ */
/* Sections (landing pages)                                            */
/* ------------------------------------------------------------------ */

/** The reorderable blocks of a landing page: the children of its main element. */
export function sectionsOf(root: HTMLElement): HTMLElement[] {
  const main = root.querySelector<HTMLElement>('.ls-main');
  return main ? ([...main.children] as HTMLElement[]) : [];
}

const SECTION_NAMES: Record<string, string> = {
  'ls-hero': 'Hero', 'ls-press': 'Press strip', 'ls-cta': 'Call to action', 'ls-page-hero': 'Page header', 'ls-stats': 'Stats'
};

/** A readable name for a section: its heading, its label, or what it is. */
export function sectionLabel(el: HTMLElement, index: number): string {
  const heading = el.querySelector('h1, h2, h3');
  const text = heading ? normalise(heading.textContent ?? '') : '';
  if (text) return text.length > 48 ? `${text.slice(0, 46)}…` : text;
  const aria = el.getAttribute('aria-label');
  if (aria) return aria;
  const named = [...el.classList].map((c) => SECTION_NAMES[c]).find(Boolean);
  return named ?? `Section ${index + 1}`;
}

export function applySections(root: HTMLElement, s: SectionEdits | undefined) {
  const els = sectionsOf(root);
  if (!els.length) return;
  const main = els[0].parentElement!;
  const reordered = Boolean(s && s.order.some((n, i) => n !== i));
  if (reordered) main.setAttribute('data-tpl-ordered', ''); else main.removeAttribute('data-tpl-ordered');
  els.forEach((el, i) => {
    const pos = s ? s.order.indexOf(i) : -1;
    el.style.order = reordered && pos >= 0 ? String(pos) : '';
    if (s?.hidden.includes(i)) el.setAttribute('data-tpl-hidden', ''); else el.removeAttribute('data-tpl-hidden');
  });
}

/** The current section order, filling in sections an older edit did not know about. */
export function normaliseOrder(count: number, s: SectionEdits | undefined): SectionEdits {
  const order = (s?.order ?? []).filter((n) => n < count);
  for (let i = 0; i < count; i += 1) if (!order.includes(i)) order.push(i);
  return { order, hidden: (s?.hidden ?? []).filter((n) => n < count) };
}

/* ------------------------------------------------------------------ */
/* Editing                                                              */
/* ------------------------------------------------------------------ */

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [role="radio"], [role="menuitem"], label, summary, input, select, textarea';

let plaintextSupported: boolean | null = null;
const editableValue = () => {
  if (plaintextSupported === null) {
    const probe = document.createElement('span');
    probe.contentEditable = 'plaintext-only';
    plaintextSupported = probe.contentEditable === 'plaintext-only';
  }
  return plaintextSupported ? 'plaintext-only' : 'true';
};

/** Marks (or unmarks) every leaf as editable. */
export function markEditable(leaves: Leaf[], on: boolean) {
  for (const { el } of leaves) {
    if (on) {
      if (el.getAttribute('data-tpl-editable') === null) {
        el.setAttribute('data-tpl-editable', '');
        el.contentEditable = editableValue();
        el.spellcheck = false;
      }
    } else if (el.getAttribute('data-tpl-editable') !== null) {
      el.removeAttribute('data-tpl-editable');
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
    }
  }
}

/**
 * While editing: clicks no longer follow links or press buttons, text is
 * edited in place, Enter saves, Escape restores. `onCommit` receives the key
 * and the new text (null when the text is back to the original).
 */
export function enableEditing(root: HTMLElement, getLeaves: () => Leaf[], onCommit: (key: string, text: string | null) => void): () => void {
  let editing: { el: HTMLElement; before: string; leaf: Leaf } | null = null;

  const leafFor = (target: EventTarget | null) => {
    const el = (target as HTMLElement | null)?.closest?.('[data-tpl-editable]') as HTMLElement | null;
    return el && root.contains(el) ? el : null;
  };

  const onClick = (e: MouseEvent) => {
    const leaf = leafFor(e.target);
    const interactive = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE);
    if (leaf || (interactive && root.contains(interactive))) {
      e.preventDefault();
      e.stopPropagation();
      leaf?.focus();
    }
  };

  const onFocusIn = (e: FocusEvent) => {
    const el = leafFor(e.target);
    if (!el) return;
    const leaf = getLeaves().find((l) => l.el === el);
    if (leaf) editing = { el, before: el.textContent ?? '', leaf };
  };

  const finish = (save: boolean) => {
    if (!editing) return;
    const { el, before, leaf } = editing;
    editing = null;
    if (!save) { setText(el, before); return; }
    const text = normalise(el.textContent ?? '');
    if (!text) { setText(el, before); return; }
    setText(el, text);
    // Remember what this element really says, so later passes keep the same key.
    if (text === leaf.original) applied.delete(el); else applied.set(el, text);
    onCommit(leaf.key, text === leaf.original ? null : text);
  };

  const onFocusOut = (e: FocusEvent) => { if (editing && e.target === editing.el) finish(true); };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!editing || e.target !== editing.el) return;
    if (e.key === 'Enter') { e.preventDefault(); editing.el.blur(); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); const el = editing.el; finish(false); el.blur(); }
    else if (e.key === ' ') e.stopPropagation();
  };

  // Paste as plain text on browsers without plaintext-only editing.
  const onPaste = (e: ClipboardEvent) => {
    if (!editing || e.target !== editing.el) return;
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain').replace(/\s+/g, ' ') ?? '';
    document.execCommand?.('insertText', false, text);
  };

  const onSubmit = (e: Event) => { e.preventDefault(); e.stopPropagation(); };

  root.setAttribute('data-tpl-editing', '');
  root.addEventListener('click', onClick, true);
  root.addEventListener('focusin', onFocusIn);
  root.addEventListener('focusout', onFocusOut);
  root.addEventListener('keydown', onKeyDown);
  root.addEventListener('paste', onPaste);
  root.addEventListener('submit', onSubmit, true);
  return () => {
    finish(true);
    root.removeAttribute('data-tpl-editing');
    root.removeEventListener('click', onClick, true);
    root.removeEventListener('focusin', onFocusIn);
    root.removeEventListener('focusout', onFocusOut);
    root.removeEventListener('keydown', onKeyDown);
    root.removeEventListener('paste', onPaste);
    root.removeEventListener('submit', onSubmit, true);
  };
}

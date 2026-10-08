import { beforeEach, describe, expect, it } from 'vitest';
import { applySections, applyText, enableEditing, indexLeaves, normaliseOrder, sectionLabel, sectionsOf } from './applyEdits';
import { coerceEdits, countEdits, editStore, screenKey } from './editStore';

const build = () => {
  const root = document.createElement('div');
  root.innerHTML = `
    <main class="ls-main">
      <section class="ls-hero"><h1>Money that moves with you<!-- -->.</h1><button type="button"><span>Get started</span></button></section>
      <section aria-label="Numbers"><p>Saved</p><p>Saved</p></section>
      <section class="ls-cta"><h2>Join today</h2><svg><text>skip me</text></svg></section>
    </main>`;
  document.body.appendChild(root);
  return root;
};

describe('template edits', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    editStore.resetAll();
  });

  it('keys text by its original wording and occurrence, skipping SVG', () => {
    const root = build();
    expect(indexLeaves(root).map((l) => l.key)).toEqual(['Money that moves with you.#0', 'Get started#0', 'Saved#0', 'Saved#1', 'Join today#0']);
  });

  it('applies overrides, follows React updates of untouched text, and restores on reset', () => {
    const root = build();
    applyText(root, { text: { 'Saved#1': 'Kept', 'Money that moves with you.#0': 'Calm money' } });
    const ps = root.querySelectorAll('p');
    expect(ps[0].textContent).toBe('Saved');
    expect(ps[1].textContent).toBe('Kept');
    expect(root.querySelector('h1')!.textContent).toBe('Calm money');
    // A later pass keeps the same keys even though the DOM text changed.
    expect(indexLeaves(root).map((l) => l.key)).toContain('Saved#1');
    applyText(root, { text: {} });
    expect(ps[1].textContent).toBe('Saved');
    expect(root.querySelector('h1')!.textContent).toBe('Money that moves with you.');
  });

  it('hides and reorders sections with CSS only', () => {
    const root = build();
    const els = sectionsOf(root);
    expect(els.map((el, i) => sectionLabel(el, i))).toEqual(['Money that moves with you.', 'Numbers', 'Join today']);
    applySections(root, { order: [2, 0, 1], hidden: [1] });
    expect(root.querySelector('.ls-main')!.hasAttribute('data-tpl-ordered')).toBe(true);
    expect(els.map((el) => el.style.order)).toEqual(['1', '2', '0']);
    expect(els[1].hasAttribute('data-tpl-hidden')).toBe(true);
    // The DOM order React owns is untouched.
    expect(sectionsOf(root)).toEqual(els);
    expect(normaliseOrder(4, { order: [2, 0], hidden: [5] })).toEqual({ order: [2, 0, 1, 3], hidden: [] });
  });

  it('edits in place: clicks are held, Enter-style commits save, unchanged text clears the edit', () => {
    const root = build();
    applyText(root, undefined);
    const commits: [string, string | null][] = [];
    const stop = enableEditing(root, () => indexLeaves(root), (k, t) => commits.push([k, t]));
    let clicked = false;
    root.querySelector('button')!.addEventListener('click', () => { clicked = true; });

    const label = root.querySelector('button span') as HTMLElement;
    label.setAttribute('data-tpl-editable', '');
    label.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(clicked).toBe(false);

    label.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    label.firstChild!.nodeValue = '  Try   Orbit ';
    label.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(commits).toEqual([['Get started#0', 'Try Orbit']]);
    expect(label.textContent).toBe('Try Orbit');

    label.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    label.firstChild!.nodeValue = 'Get started';
    label.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(commits[1]).toEqual(['Get started#0', null]);
    stop();
    expect(root.hasAttribute('data-tpl-editing')).toBe(false);
  });

  it('stores edits per screen, shares the landing site between devices, and round-trips JSON', () => {
    expect(screenKey('landing-desktop', 'home')).toBe(screenKey('landing-mobile', 'home'));
    editStore.setText('landing/home', 'Hi#0', 'Hello');
    editStore.setSections('landing/home', { order: [1, 0], hidden: [] });
    expect(countEdits(editStore.screen('landing/home'))).toEqual({ text: 1, hidden: 0, moved: true });
    const json = editStore.export();
    editStore.resetAll();
    expect(editStore.get().screens).toEqual({});
    expect(editStore.import(JSON.parse(json))).toBe(true);
    expect(editStore.screen('landing/home')?.text).toEqual({ 'Hi#0': 'Hello' });
    // Back to the original order and no text: the screen drops out.
    editStore.setText('landing/home', 'Hi#0', null);
    editStore.setSections('landing/home', { order: [0, 1], hidden: [] });
    expect(editStore.screen('landing/home')).toBeUndefined();
  });

  it('rejects junk on import', () => {
    expect(coerceEdits('nope')).toBeNull();
    expect(coerceEdits({ screens: { 'bad key!': { text: { a: 'b' } }, 'app/home': { text: { a: 5 }, sections: { order: ['x'], hidden: [] } } } })?.screens).toEqual({});
    expect(editStore.import({ hello: 'world' })).toBe(false);
  });
});

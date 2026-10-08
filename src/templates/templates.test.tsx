/**
 * Templates: every screen renders in very different styles, links point at real
 * screens, each template uses the whole component library, and template code
 * only ever reads style tokens.
 */
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { allStyles } from '../styles';
import { resolveStyleToCssVars } from '../engine/resolver';
import { FAMILIES, getFamily, groupScreens } from './registry';
import { TemplateScreen } from './TemplateScreen';
import { COMPONENT_CATALOG, scanComponents, scanOpeners } from './catalog';
import { userImageStore } from './userImage';

const root = process.cwd();
const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
};
const sources = (dir: string) => walk(join(root, dir)).filter((f) => /\.(tsx?|css)$/.test(f) && !/\.test\.tsx?$/.test(f));
const read = (files: string[]) => files.map((f) => readFileSync(f, 'utf8')).join('\n');

const styleById = (id: string) => allStyles.find((s) => s.metadata.id === id)!;
/** Styles whose construction differs the most: soft shadows, neon, hard offsets, stepped pixels, glass. */
const CONTRAST_STYLES = ['neumorphism', 'cyberpunk', 'neo-brutalism', 'pixel-art', 'glassmorphism'];

const renderScreen = (familyId: string, screenId: string, styleId = 'neumorphism', go = vi.fn()) => {
  const style = styleById(styleId);
  return render(<TemplateScreen family={getFamily(familyId)} screenId={screenId} style={style} vars={resolveStyleToCssVars(style)} go={go} />);
};

beforeEach(() => { localStorage.clear(); });
afterEach(() => { vi.useRealTimers(); });

describe('template registry', () => {
  it('has the three families with unique screen ids', () => {
    expect(FAMILIES.map((f) => f.id)).toEqual(['landing-desktop', 'landing-mobile', 'app']);
    for (const f of FAMILIES) {
      const ids = f.screens.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(groupScreens(f).flatMap((g) => g.screens)).toHaveLength(ids.length);
    }
    expect(getFamily('app').screens.length).toBeGreaterThanOrEqual(17);
    expect(getFamily('landing-desktop').screens.length).toBe(7);
  });

  it('falls back to the first family for unknown ids', () => {
    expect(getFamily('nope').id).toBe('landing-desktop');
  });
});

describe('every screen renders', () => {
  for (const family of FAMILIES.filter((f) => f.id !== 'landing-mobile')) {
    for (const s of family.screens) {
      it(`${family.id} / ${s.id} in ${CONTRAST_STYLES.length} contrasting styles`, () => {
        for (const styleId of CONTRAST_STYLES) {
          const { container, unmount } = renderScreen(family.id, s.id, styleId);
          const el = container.querySelector<HTMLElement>('.tpl-screen')!;
          expect(el.dataset.style).toBe(styleId);
          expect(el.style.getPropertyValue('--color-accent')).not.toBe('');
          expect(scanComponents(el).length).toBeGreaterThan(2);
          unmount();
        }
      });
    }
  }

  it('the home screens render in every registered style', () => {
    for (const style of allStyles) {
      for (const familyId of ['landing-desktop', 'app']) {
        const { unmount } = renderScreen(familyId, 'home', style.metadata.id);
        unmount();
      }
    }
  });
});

describe('navigation inside templates', () => {
  it('site links ask for real pages', () => {
    const go = vi.fn();
    renderScreen('landing-desktop', 'home', 'neumorphism', go);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Primary' })).getByRole('button', { name: 'Pricing' }));
    expect(go).toHaveBeenLastCalledWith('pricing');
    fireEvent.click(screen.getByRole('button', { name: /get started free/i }));
    expect(go).toHaveBeenLastCalledWith('signin');
  });

  it('every literal go() target names a screen of its template', () => {
    const check = (dir: string, familyId: string) => {
      const ids = new Set(getFamily(familyId).screens.map((s) => s.id));
      const text = read(sources(dir));
      const targets = [...text.matchAll(/\b(?:go|navigate)\('([a-z-]+)'\)/g)].map((m) => m[1]);
      expect(targets.length).toBeGreaterThan(10);
      expect(targets.filter((t) => !ids.has(t))).toEqual([]);
    };
    check('src/templates/landing', 'landing-desktop');
    check('src/templates/app', 'app');
  });

  it('the app tab bar moves between tabs and opens the new goal flow', () => {
    const go = vi.fn();
    renderScreen('app', 'home', 'neumorphism', go);
    const tabs = screen.getByRole('navigation', { name: 'Tabs' });
    fireEvent.click(within(tabs).getByText('Wallet').closest('button')!);
    expect(go).toHaveBeenLastCalledWith('wallet');
    fireEvent.click(within(tabs).getByRole('button', { name: 'New goal' }));
    expect(go).toHaveBeenLastCalledWith('create');
  });

  it('onboarding screens hide the tab bar', () => {
    renderScreen('app', 'signin');
    expect(screen.queryByRole('navigation', { name: 'Tabs' })).toBeNull();
  });
});

describe('interactions stay inside the template', () => {
  it('a dialog opens inside the themed screen and a toast confirms the action', () => {
    const { container } = renderScreen('landing-desktop', 'pricing');
    fireEvent.click(screen.getByRole('button', { name: /try plus free/i }));
    const dialog = screen.getByRole('dialog');
    expect(container.querySelector('.tpl-screen')!.contains(dialog)).toBe(true);
    fireEvent.click(within(dialog).getByRole('checkbox'));
    fireEvent.click(within(dialog).getByRole('button', { name: /start free trial/i }));
    expect(screen.getByText('Plus trial started')).toBeInTheDocument();
  });

  it('the sign-in flow goes from password to code to success', () => {
    vi.useFakeTimers();
    renderScreen('landing-desktop', 'signin');
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret12' } });
    fireEvent.submit(screen.getByLabelText('Password').closest('form')!);
    act(() => { vi.advanceTimersByTime(1000); });
    const boxes = screen.getAllByRole('textbox', { name: /digit/i });
    fireEvent.paste(boxes[0], { clipboardData: { getData: () => '123456' } });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it('the blog shows a loading state, then an empty state for no matches', () => {
    vi.useFakeTimers();
    const { container } = renderScreen('landing-mobile', 'blog');
    fireEvent.change(screen.getByLabelText('Search articles'), { target: { value: 'zzzz' } });
    expect(container.querySelector('.ui-skeleton')).not.toBeNull();
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.getByText('No articles match')).toBeInTheDocument();
  });

  it('the new goal form walks its three steps', () => {
    const go = vi.fn();
    renderScreen('app', 'create', 'neumorphism', go);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Save automatically')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create goal' }));
    expect(go).toHaveBeenLastCalledWith('created');
  });
});

describe('component coverage', () => {
  const SHARED = read(sources('src/templates/shared'));
  // The app is a phone product; a desktop top navigation bar has no place in it.
  const EXEMPT: Record<string, string[]> = { landing: [], app: ['Navbar'] };

  const uses = (text: string, name: string, usage?: RegExp) => (usage ?? new RegExp(`<${name}[\\s/>]`)).test(text);

  it.each([['landing', 'src/templates/landing'], ['app', 'src/templates/app']])('the %s template uses every library component', (key, dir) => {
    const text = read(sources(dir)) + SHARED;
    const missing = COMPONENT_CATALOG.filter((c) => !EXEMPT[key].includes(c.name) && !uses(text, c.name, c.usage)).map((c) => c.name);
    expect(missing).toEqual([]);
  });

  it('every catalog entry is a real exported component', () => {
    const lib = read([...sources('src/components/ui'), ...sources('src/components/charts'), ...sources('src/components/svg')]);
    const missing = COMPONENT_CATALOG.filter((c) => c.name !== 'Toast' && !new RegExp(`export (?:const|function) ${c.name}\\b`).test(lib)).map((c) => c.name);
    expect(missing).toEqual([]);
  });

  it('scans rendered components and declared openers', () => {
    const { container } = renderScreen('landing-desktop', 'pricing');
    const names = scanComponents(container).map((u) => u.entry.name);
    expect(names).toEqual(expect.arrayContaining(['Button', 'PricingCard', 'Segmented', 'DataTable', 'Accordion', 'Navbar']));
    expect(scanOpeners(container)).toContain('Modal');
  });
});

describe('templates read only style tokens', () => {
  const COLOUR = /#[0-9a-f]{3,8}\b|rgba?\(\s*\d/i;
  const DECLARATION = /(?:^|[\s{;"'`(])(?:background|color|border|outline|fill|stroke|box-shadow|stop-color|stopColor)[a-z-]*\s*[:=]/i;
  // Demo content (card colours a visitor can change) is data, not styling.
  const files = sources('src/templates').filter((f) => !f.endsWith('content.ts'));

  it.each(files.map((f) => relative(root, f)))('%s has no literal colours', (file) => {
    const offending = readFileSync(join(root, file), 'utf8').split('\n')
      .map((line, i) => ({ line: line.trim(), n: i + 1 }))
      .filter(({ line }) => !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*'))
      .filter(({ line }) => DECLARATION.test(line) && COLOUR.test(line.replace(/var\([^)]*\)/g, '')));
    expect(offending.map((o) => `${o.n}: ${o.line}`)).toEqual([]);
  });
});

describe('visitor image', () => {
  it('only accepts images, lives in memory, and can be removed', () => {
    const create = vi.fn(() => 'blob:local/1');
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    expect(userImageStore.set(new File(['x'], 'notes.txt', { type: 'text/plain' }))).toBe(false);
    expect(userImageStore.get()).toBeNull();
    expect(userImageStore.set(new File(['x'], 'me.png', { type: 'image/png' }))).toBe(true);
    expect(userImageStore.get()).toEqual({ url: 'blob:local/1', name: 'me.png' });

    renderScreen('landing-desktop', 'about');
    expect(screen.getByRole('img', { name: /your image/i }).querySelector('img')).toHaveAttribute('src', 'blob:local/1');

    act(() => { userImageStore.clear(); });
    expect(revoke).toHaveBeenCalledWith('blob:local/1');
    expect(screen.queryByRole('img', { name: /your image/i })).toBeNull();
  });
});

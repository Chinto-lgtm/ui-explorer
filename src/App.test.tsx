import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { registry } from './engine/registry';
import { resolveStyleToCssVars } from './engine/resolver';
import { allStyles } from './styles';
import { createSeededRandom } from './engine/random/prng';
import { generateProceduralStyle } from './engine/generator/generator';

describe('UI Explorer — Integration & Engine Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('shows the landing page on first launch', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /one interface\.\s*thirty design languages\./i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /start exploring/i }).length).toBeGreaterThan(0);
  });

  it('starting from the landing page finishes onboarding and opens the lab', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: /start exploring/i })[0]);
    expect(localStorage.getItem('ui_explorer_onboarded')).toBe('1');
    expect(window.location.pathname).toBe('/');
    expect(screen.getByText('Neumorphism')).toBeInTheDocument();
  });

  it('skips the landing page once onboarding is complete', () => {
    localStorage.setItem('ui_explorer_onboarded', '1');
    render(<App />);
    expect(screen.queryByRole('heading', { level: 1, name: /one interface/i })).not.toBeInTheDocument();
    expect(screen.getByText('Neumorphism')).toBeInTheDocument();
  });

  it('the header logo and wordmark open the landing page', () => {
    localStorage.setItem('ui_explorer_onboarded', '1');
    render(<App />);
    const home = screen.getByRole('link', { name: 'UI Explorer home' });
    expect(home).toHaveAttribute('href', '/welcome');
    expect(home.querySelector('svg.brand-mark')).not.toBeNull();
    fireEvent.click(home);
    expect(window.location.pathname).toBe('/welcome');
    expect(screen.getByRole('heading', { level: 1, name: /one interface/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to the lab/i })).toBeInTheDocument();
  });

  it('renders the brand title in header', () => {
    localStorage.setItem('ui_explorer_onboarded', '1');
    render(<App />);
    expect(screen.getByText('Explorer', { exact: false, selector: '.brand-lockup__word' })).toBeInTheDocument();
  });

  it('renders active style hero on dashboard', () => {
    localStorage.setItem('ui_explorer_onboarded', '1');
    render(<App />);
    expect(screen.getByText('Neumorphism')).toBeInTheDocument();
  });

  it('registers all 30 built-in design styles plus community styles', () => {
    expect(allStyles.length).toBeGreaterThanOrEqual(30);
    expect(registry.getAll().length).toBeGreaterThanOrEqual(30);
    expect(registry.get('neumorphism')).toBeDefined();
    expect(registry.get('glassmorphism')).toBeDefined();
    expect(registry.get('cyberpunk')).toBeDefined();
    expect(registry.get('bento-grid')).toBeDefined();
  });

  it('resolves style tokens into CSS custom properties', () => {
    const style = registry.get('neumorphism')!;
    const vars = resolveStyleToCssVars(style);
    expect(vars['--color-bg']).toBe('#e0e5ec');
    expect(vars['--radius-md']).toBe('16px');
  });

  describe('Templates', () => {
    beforeEach(() => { localStorage.setItem('ui_explorer_onboarded', '1'); });

    it('opens the first landing page and lists the screens and components', async () => {
      window.history.replaceState({}, '', '/templates');
      render(<App />);
      expect(await screen.findByRole('heading', { name: 'Templates' }, { timeout: 5000 })).toBeInTheDocument();
      expect(window.location.pathname).toBe('/templates/landing-desktop/home');
      expect(screen.getByRole('button', { name: /desktop landing/i })).toHaveAttribute('aria-pressed', 'true');
      expect(await screen.findByRole('heading', { name: /money that moves with you/i })).toBeInTheDocument();
      expect(screen.getByRole('complementary', { name: 'Components used' })).toBeInTheDocument();
      // Frames carry their own treatment attributes; the shell canvas must not, or its rules would leak into them.
      expect(document.querySelector('.style-preview-canvas')).not.toHaveAttribute('data-family');
      expect(document.querySelector('.tpl-screen')).toHaveAttribute('data-family', 'neumorphic');
    });

    it('switches template and follows links inside a screen', async () => {
      window.history.replaceState({}, '', '/templates/landing-desktop/home');
      render(<App />);
      fireEvent.click(await screen.findByRole('button', { name: /mobile app/i }));
      expect(window.location.pathname).toBe('/templates/app/home');
      const tabs = await screen.findByRole('navigation', { name: 'Tabs' });
      fireEvent.click(within(tabs).getByText('Wallet').closest('button')!);
      expect(window.location.pathname).toBe('/templates/app/wallet');
    });

    it('shows every screen on the flow board', async () => {
      window.history.replaceState({}, '', '/templates/app/home?view=flow');
      render(<App />);
      // Seventeen full screens make a large DOM, so query it directly rather than by role.
      await waitFor(() => expect(document.querySelectorAll('.tp-thumb__open')).toHaveLength(17), { timeout: 8000 });
      fireEvent.click(document.querySelector('.tp-thumb__open[aria-label="Open Wallet"]')!);
      expect(window.location.pathname).toBe('/templates/app/wallet');
      expect(window.location.search).toBe('');
    }, 20000);

    it('renders a full-screen preview outside the shell', async () => {
      window.history.replaceState({}, '', '/preview/landing-desktop/pricing?style=cyberpunk');
      render(<App />);
      expect(await screen.findByRole('heading', { name: /simple, fair pricing/i })).toBeInTheDocument();
      expect(screen.queryByText('UI Explorer')).toBeNull();
      expect(document.querySelector('.tpl-screen')).toHaveAttribute('data-style', 'cyberpunk');
      expect(screen.getByRole('link', { name: /templates/i })).toHaveAttribute('href', '/templates/landing-desktop/pricing');
    });
  });

  describe('Procedural Engine & PRNG Determinism', () => {
    it('guarantees identical PRNG output for identical seeds', () => {
      const rng1 = createSeededRandom(847291);
      const rng2 = createSeededRandom(847291);

      expect(rng1.next()).toBe(rng2.next());
      expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
      expect(rng1.choice(['a', 'b', 'c'])).toBe(rng2.choice(['a', 'b', 'c']));
    });

    it('generates reproducible styles from the same seed', () => {
      const res1 = generateProceduralStyle({ seed: 847291, mode: 'Coherent' });
      const res2 = generateProceduralStyle({ seed: 847291, mode: 'Coherent' });

      expect(res1.seedNumber).toBe(res2.seedNumber);
      expect(res1.style.metadata.name).toBe(res2.style.metadata.name);
      expect(res1.style.tokens.colors.bg).toBe(res2.style.tokens.colors.bg);
      expect(res1.style.tokens.typography.fontFamilySans).toBe(res2.style.tokens.typography.fontFamilySans);
    });

    it('generates different styles for different seeds', () => {
      const resA = generateProceduralStyle({ seed: 111111 });
      const resB = generateProceduralStyle({ seed: 999999 });

      expect(resA.seedNumber).not.toBe(resB.seedNumber);
      expect(resA.style.metadata.name).not.toBe(resB.style.metadata.name);
    });
  });
});

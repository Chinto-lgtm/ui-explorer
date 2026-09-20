import { render, screen } from '@testing-library/react';
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

  it('shows the welcome view on first launch', () => {
    render(<App />);
    expect(screen.getByText('The same interface, in thirty design languages.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore styles/i })).toBeInTheDocument();
  });

  it('skips the welcome view once onboarding is complete', () => {
    localStorage.setItem('ui_explorer_onboarded', '1');
    render(<App />);
    expect(screen.queryByText('The same interface, in thirty design languages.')).not.toBeInTheDocument();
    expect(screen.getByText('Neumorphism')).toBeInTheDocument();
  });

  it('renders the brand title in header', () => {
    localStorage.setItem('ui_explorer_onboarded', '1');
    render(<App />);
    expect(screen.getByText('UI Explorer')).toBeInTheDocument();
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

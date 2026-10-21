import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { registry } from './engine/registry';
import { resolveStyleToCssVars } from './engine/resolver';
import { allStyles } from './styles';
import { editStore } from './templates/edit/editStore';

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

  it('starting from the landing page finishes onboarding and opens Templates', async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: /start exploring/i })[0]);
    expect(localStorage.getItem('ui_explorer_onboarded')).toBe('1');
    await waitFor(() => expect(window.location.pathname).toBe('/templates/landing-desktop/home'), { timeout: 5000 });
    expect(await screen.findByRole('complementary', { name: 'Templates' }, { timeout: 5000 })).toBeInTheDocument();
  });

  it('the landing page sends returning visitors back to their last page', () => {
    localStorage.setItem('ui_explorer_onboarded', '1');
    localStorage.setItem('ui_explorer_last_route', '/customizer');
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /back to the lab/i }));
    expect(window.location.pathname).toBe('/customizer');
  });

  it('the header logo and wordmark open the landing page', async () => {
    window.history.replaceState({}, '', '/components/buttons');
    render(<App />);
    const home = await screen.findByRole('link', { name: 'UI Explorer home' });
    expect(home).toHaveAttribute('href', '/');
    expect(home.querySelector('svg.brand-mark')).not.toBeNull();
    expect(screen.getByText('Explorer', { exact: false, selector: '.brand-lockup__word' })).toBeInTheDocument();
    fireEvent.click(home);
    expect(window.location.pathname).toBe('/');
    expect(screen.getByRole('heading', { level: 1, name: /one interface/i })).toBeInTheDocument();
  });

  describe('addresses', () => {
    it('old addresses redirect to their new homes', async () => {
      window.history.replaceState({}, '', '/welcome');
      const { unmount } = render(<App />);
      expect(window.location.pathname).toBe('/');
      unmount();
      window.history.replaceState({}, '', '/labs?lab=charts');
      const second = render(<App />);
      await waitFor(() => expect(window.location.pathname).toBe('/components/charts'));
      second.unmount();
      window.history.replaceState({}, '', '/data');
      const third = render(<App />);
      await waitFor(() => expect(window.location.pathname).toBe('/components/table'));
      third.unmount();
      // The removed Styles gallery: its links open Templates in that style.
      window.history.replaceState({}, '', '/styles/glassmorphism/relations');
      const fourth = render(<App />);
      await waitFor(() => expect(window.location.pathname).toBe('/templates/landing-desktop/home'), { timeout: 5000 });
      expect(localStorage.getItem('ui_explorer_style_id')).toBe('glassmorphism');
      fourth.unmount();
      // The removed Generator sends people to the Customizer.
      window.history.replaceState({}, '', '/generator');
      render(<App />);
      await waitFor(() => expect(window.location.pathname).toBe('/customizer'));
    });

    it('unknown pages say so and list every real page', async () => {
      window.history.replaceState({}, '', '/nowhere');
      render(<App />);
      expect(await screen.findByRole('heading', { name: /nothing lives at/i })).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: /templates/i }).length).toBeGreaterThan(0);
    });

    it('components sections, device and compare live in the URL', async () => {
      window.history.replaceState({}, '', '/components/table?device=mobile');
      render(<App />);
      expect(await screen.findByRole('heading', { name: 'Components' }, { timeout: 5000 })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^mobile/i })).toHaveAttribute('aria-pressed', 'true');
      // The deep-dive section brings its own settings into the sidebar.
      expect(await screen.findByText('Table settings')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('link', { name: /charts/i }));
      expect(window.location.pathname).toBe('/components/charts');
      expect(window.location.search).toContain('device=mobile');
      fireEvent.click(screen.getByRole('button', { name: /compare/i }));
      expect(new URLSearchParams(window.location.search).has('compare')).toBe(true);
      expect((await screen.findAllByText('Style C')).length).toBeGreaterThan(0);
    });

    it('tools open from the URL and close back to the page', async () => {
      window.history.replaceState({}, '', '/components/buttons?tool=shortcuts');
      render(<App />);
      expect(await screen.findByRole('dialog', { name: /keyboard shortcuts/i }, { timeout: 5000 })).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      await waitFor(() => expect(new URLSearchParams(window.location.search).has('tool')).toBe(false));
    });
  });

  describe('layout and tweaks', () => {
    beforeEach(() => localStorage.setItem('ui_explorer_onboarded', '1'));

    it('tweaks restyle the page live and can be saved as a new style', async () => {
      localStorage.setItem('ui_explorer_style_id', 'neo-brutalism');
      window.history.replaceState({}, '', '/components/buttons?tool=tweaks');
      render(<App />);
      const panel = await screen.findByRole('dialog', { name: 'Tweaks' }, { timeout: 5000 });
      expect(within(panel).getByRole('button', { name: /save as new style/i })).toBeDisabled();

      fireEvent.change(within(panel).getByLabelText('Corner radius'), { target: { value: '2' } });
      const canvas = document.querySelector<HTMLElement>('.style-preview-canvas')!;
      const brutal = resolveStyleToCssVars(registry.get('neo-brutalism')!)['--radius-md'];
      expect(canvas.style.getPropertyValue('--radius-md')).not.toBe(brutal);
      expect(screen.getByRole('button', { name: /active style: neo brutalism/i })).toHaveTextContent(/tweaked/i);

      fireEvent.click(within(panel).getByRole('radio', { name: 'Pink' }));
      expect(canvas.style.getPropertyValue('--color-accent')).toBe('#ec4899');

      fireEvent.click(within(panel).getByRole('button', { name: /save as new style/i }));
      expect(await within(panel).findByRole('status')).toHaveTextContent(/saved as neo brutalism \(tweaked\)/i);
      expect(localStorage.getItem('ui_explorer_style_id')).toBe('neo-brutalism-tweaked');
      // The saved style carries the change; the dials are back at 100%.
      expect(canvas.style.getPropertyValue('--color-accent')).toBe('#ec4899');
      expect(within(panel).getByLabelText('Corner radius')).toHaveValue('1');
    });

    it('the left panel hides and comes back, and remembers the choice', async () => {
      window.history.replaceState({}, '', '/customizer');
      const { unmount } = render(<App />);
      const panel = await screen.findByRole('complementary', { name: 'Style customizer controls' }, { timeout: 5000 });
      fireEvent.click(within(panel).getByRole('button', { name: 'Hide panel' }));
      expect(screen.queryByRole('complementary', { name: 'Style customizer controls' })).toBeNull();
      expect(localStorage.getItem('ui_explorer_panel_collapsed')).toBe('1');
      unmount();

      window.history.replaceState({}, '', '/components/buttons');
      render(<App />);
      fireEvent.click(await screen.findByRole('button', { name: 'Show panel' }, { timeout: 5000 }));
      expect(screen.getByRole('complementary', { name: 'Components settings' })).toBeInTheDocument();
    });

    it('templates can be edited in place and the edits persist across devices', async () => {
      editStore.resetAll();
      window.history.replaceState({}, '', '/templates/landing-desktop/home?edit');
      const { unmount } = render(<App />);
      const h1 = await waitFor(() => {
        const el = document.querySelector<HTMLElement>('.tpl-screen h1');
        expect(el).toHaveAttribute('data-tpl-editable');
        return el!;
      }, { timeout: 8000 });
      fireEvent.focusIn(h1);
      // What typing does: the browser rewrites the element's text nodes.
      h1.childNodes.forEach((n, i) => { n.nodeValue = i === 0 ? 'Money, finally calm' : ''; });
      fireEvent.focusOut(h1);
      expect(JSON.parse(localStorage.getItem('ui_explorer_template_edits')!).screens['landing/home'].text).toEqual({ 'Money that moves with you.#0': 'Money, finally calm' });
      expect(screen.getByText(/1 text rewritten/i)).toBeInTheDocument();

      // Links wait while editing.
      fireEvent.click(within(document.querySelector('.tpl-screen')!).getAllByRole('button', { name: /see how it works/i })[0]);
      expect(window.location.pathname).toBe('/templates/landing-desktop/home');

      fireEvent.click(screen.getAllByRole('button', { name: 'Done' })[0]);
      await waitFor(() => expect(new URLSearchParams(window.location.search).has('edit')).toBe(false));
      unmount();

      window.history.replaceState({}, '', '/templates/landing-mobile/home');
      render(<App />);
      await waitFor(() => expect(document.querySelector('.tpl-screen h1')).toHaveTextContent('Money, finally calm'), { timeout: 8000 });
      expect(document.querySelector('.tpl-screen h1')).not.toHaveAttribute('data-tpl-editable');
      fireEvent.click(screen.getByRole('button', { name: /reset page/i }));
      await waitFor(() => expect(document.querySelector('.tpl-screen h1')).toHaveTextContent('Money that moves with you.'));
    }, 20000);

    it('the style picker filters and applies a style from the keyboard', async () => {
      window.history.replaceState({}, '', '/components/buttons');
      render(<App />);
      fireEvent.click(await screen.findByRole('button', { name: /active style:/i }, { timeout: 5000 }));
      const input = screen.getByRole('combobox', { name: /find a style/i });
      fireEvent.change(input, { target: { value: 'vaporwave' } });
      expect(within(screen.getByRole('listbox')).getByRole('option', { name: 'Retrofuturism / Vaporwave' })).toBeInTheDocument();
      fireEvent.keyDown(input, { key: 'Enter' });
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
      expect(localStorage.getItem('ui_explorer_style_id')).toBe('vaporwave');
    });
  });

  it('registers the 30 built-in themes and the 3 community themes', () => {
    expect(allStyles.length).toBe(33);
    expect(registry.get('community-aurora-glass')?.metadata.author).toBe('alex_designer');
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
});

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Code2, Palette, LayoutTemplate, Wand2, Component, Sliders, ScanSearch, Shuffle, Download,
  Copy, Check, MousePointerClick, Microscope, PackageOpen, Star
} from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { StylePreviewCard } from '../../components/preview/StylePreviewCard';
import { BrandLockup, BrandMark } from '../../components/layout/BrandMark';
import { COMPONENT_CATALOG } from '../../templates/catalog';
import { ONBOARDING_STORAGE_KEY, GITHUB_REPO_URL, DOCS_URL, APP_VERSION } from '../../config/app';
import './WelcomePage.css';

/** Styles that read as clearly different universes when dealt into the hero deck. */
const HERO_STYLE_IDS = [
  'neumorphism', 'cyberpunk', 'neo-brutalism', 'glassmorphism', 'editorial',
  'pixel-art', 'claymorphism', 'swiss-style', 'vaporwave', 'bauhaus'
];

/** Styles shown in the wall; each tile is the live component system under that style. */
const WALL_STYLE_IDS = [
  'neumorphism', 'glassmorphism', 'claymorphism', 'neo-brutalism', 'cyberpunk', 'swiss-style',
  'editorial', 'pixel-art', 'vaporwave', 'bauhaus', 'material-design-3', 'sci-fi-hud'
];

/** Pages plus app screens in the Templates section (7 landing pages + 17 app screens). */
export const TEMPLATE_SCREEN_COUNT = 24;

const HERO_INTERVAL_MS = 3200;

const STEPS = [
  { icon: <MousePointerClick size={20} />, title: 'Pick a style', text: 'Browse thirty design languages and switch the whole interface in one click.' },
  { icon: <Microscope size={20} />, title: 'See why it works', text: 'Inspect any element, read the anatomy of a style and diff two styles token by token.' },
  { icon: <PackageOpen size={20} />, title: 'Make it yours', text: 'Generate from a seed, tune every token, mix styles, then export CSS variables or JSON.' }
];

const FEATURES: { id: string; icon: React.ReactNode; name: string; text: string; to: string; span?: 'wide' | 'tall' }[] = [
  { id: 'styles', icon: <Palette size={20} />, name: 'Thirty styles', text: 'Neumorphism to Neo Brutalism, each a full token system with its own construction, not a palette swap.', to: '/styles', span: 'wide' },
  { id: 'templates', icon: <LayoutTemplate size={20} />, name: 'Product templates', text: 'A landing site and a 17-screen mobile app, fully clickable, restyled by whatever style you pick.', to: '/templates', span: 'tall' },
  { id: 'generator', icon: <Wand2 size={20} />, name: 'Style generator', text: 'Seed in, coherent style out. Lock axes, remix, and share the exact result by link.', to: '/generator', span: 'tall' },
  { id: 'components', icon: <Component size={20} />, name: 'Components Lab', text: 'Every component, every state, on desktop, tablet and phone frames.', to: '/components' },
  { id: 'customizer', icon: <Sliders size={20} />, name: 'Customizer', text: 'A real colour picker with contrast checks, undo, and live preview everywhere.', to: '/customizer' },
  { id: 'inspect', icon: <ScanSearch size={20} />, name: 'Anatomy & inspector', text: 'Click any element to see the tokens behind it.', to: '/' },
  { id: 'mixer', icon: <Shuffle size={20} />, name: 'Style mixer', text: 'Typography from one style, surfaces from another.', to: '/' },
  { id: 'export', icon: <Download size={20} />, name: 'Export', text: 'CSS variables, JSON tokens or a contribution package.', to: '/customizer', span: 'wide' }
];

/** The tokens shown in the live code sample, in reading order. */
const SAMPLE_TOKENS = ['--color-bg', '--color-surface', '--color-accent', '--color-text-primary', '--radius-md', '--border-width', '--duration-normal', '--font-family-sans'];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isColour = (v: string) => /^(#|rgb|hsl)/i.test(v.trim());

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { availableStyles, setStyle } = useStyle();

  const heroStyles = useMemo(() => HERO_STYLE_IDS.map((id) => availableStyles.find((s) => s.metadata.id === id)).filter((s) => s !== undefined), [availableStyles]);
  const wallStyles = useMemo(() => WALL_STYLE_IDS.map((id) => availableStyles.find((s) => s.metadata.id === id)).filter((s) => s !== undefined), [availableStyles]);

  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const count = Math.max(heroStyles.length, 1);
  const front = heroStyles[heroIndex % count];
  const left = heroStyles[(heroIndex + count - 1) % count];
  const right = heroStyles[(heroIndex + 1) % count];

  // The one deliberate motion on this page: the deck deals the next design language to the front.
  useEffect(() => {
    if (isPaused || heroStyles.length < 2 || prefersReducedMotion()) return;
    const id = window.setInterval(() => setHeroIndex((i) => (i + 1) % heroStyles.length), HERO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isPaused, heroStyles.length]);

  const tokens = useMemo(() => {
    if (!front) return [];
    const vars = resolveStyleToCssVars(front);
    return SAMPLE_TOKENS.map((name) => ({ name, value: vars[name] ?? '' }));
  }, [front]);

  const hasOnboarded = typeof localStorage !== 'undefined' && localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';

  const finish = (to: string, styleId?: string) => {
    try { localStorage.setItem(ONBOARDING_STORAGE_KEY, '1'); } catch { /* storage unavailable */ }
    if (styleId) setStyle(styleId);
    navigate(to);
  };

  const copyTokens = async () => {
    const css = `:root {\n${tokens.map((t) => `  ${t.name}: ${t.value};`).join('\n')}\n}`;
    try { await navigator.clipboard.writeText(css); } catch { /* clipboard unavailable */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const styleCount = availableStyles.filter((s) => !s.metadata.isCustom).length;

  return (
    <div className="lp">
      <header className="lp-nav">
        <button type="button" className="lp-nav__brand" onClick={() => window.scrollTo?.({ top: 0, behavior: 'smooth' })} aria-label="UI Explorer, back to top">
          <BrandLockup size={30} />
        </button>
        <nav className="lp-nav__links" aria-label="Sections">
          <button type="button" onClick={() => finish('/styles')}>Styles</button>
          <button type="button" onClick={() => finish('/templates')}>Templates</button>
          <button type="button" onClick={() => finish('/generator')}>Generator</button>
          <a href={DOCS_URL} target="_blank" rel="noreferrer">Docs</a>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <button type="button" className="lp-btn lp-btn--primary lp-btn--sm" onClick={() => finish('/')}>
          {hasOnboarded ? 'Back to the lab' : 'Open the lab'} <ArrowRight size={15} />
        </button>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="lp-hero">
          <div className="lp-glow lp-glow--a" aria-hidden="true" />
          <div className="lp-glow lp-glow--b" aria-hidden="true" />
          <div className="lp-container lp-hero__grid">
            <div className="lp-hero__copy">
              <span className="lp-pill"><span className="lp-pill__dot" /> Open source · runs in your browser · v{APP_VERSION}</span>
              <h1 className="lp-h1">
                One interface.
                <span className="lp-gradient-text">Thirty design languages.</span>
              </h1>
              <p className="lp-lede">
                UI Explorer is a laboratory for interface design systems. Switch a style and every button, card, chart
                and template rebuilds — then see why it looks that way, remix it, and take the tokens home.
              </p>
              <div className="lp-actions">
                <button type="button" className="lp-btn lp-btn--primary lp-btn--lg" onClick={() => finish('/')}>Start exploring <ArrowRight size={18} /></button>
                <button type="button" className="lp-btn lp-btn--ghost lp-btn--lg" onClick={() => finish('/templates')}><LayoutTemplate size={18} /> See the templates</button>
              </div>
              <ul className="lp-proof">
                <li>No account</li>
                <li>No server</li>
                <li>MIT licensed</li>
              </ul>
            </div>

            <div className="lp-deck" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
              {left && right && front && (
                <>
                  <div className="lp-deck__card lp-deck__card--left" aria-hidden="true"><StylePreviewCard key={`l-${left.metadata.id}`} style={left} size="hero" /></div>
                  <div className="lp-deck__card lp-deck__card--right" aria-hidden="true"><StylePreviewCard key={`r-${right.metadata.id}`} style={right} size="hero" /></div>
                  <div className="lp-deck__card lp-deck__card--front"><StylePreviewCard key={`f-${front.metadata.id}`} style={front} size="hero" /></div>
                  <div className="lp-deck__caption" aria-live="polite">
                    <span className="lp-deck__name">{front.metadata.name}</span>
                    <span className="lp-deck__personality">{front.metadata.personality}</span>
                  </div>
                  <ol className="lp-deck__dots" aria-label="Featured styles">
                    {heroStyles.map((s, i) => (
                      <li key={s.metadata.id}>
                        <button
                          type="button"
                          className={`lp-dot ${i === heroIndex % count ? 'lp-dot--active' : ''}`}
                          aria-label={s.metadata.name}
                          aria-current={i === heroIndex % count ? 'true' : undefined}
                          onClick={() => { setHeroIndex(i); setIsPaused(true); }}
                        />
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </div>

          <div className="lp-container">
            <dl className="lp-stats">
              <div><dt>Design styles</dt><dd>{styleCount}</dd></div>
              <div><dt>Library components</dt><dd>{COMPONENT_CATALOG.length}</dd></div>
              <div><dt>Template screens</dt><dd>{TEMPLATE_SCREEN_COUNT}</dd></div>
              <div><dt>Generated styles</dt><dd>∞</dd></div>
            </dl>
          </div>
        </section>

        {/* ---------- Style marquee ---------- */}
        <div className="lp-marquee" aria-hidden="true">
          <div className="lp-marquee__track">
            {[0, 1].map((copy) => (
              <span key={copy} className="lp-marquee__group">
                {availableStyles.filter((s) => !s.metadata.isCustom).map((s) => <span key={s.metadata.id} className="lp-marquee__item">{s.metadata.name}</span>)}
              </span>
            ))}
          </div>
        </div>

        {/* ---------- How it works ---------- */}
        <section className="lp-section" aria-labelledby="lp-steps-title">
          <div className="lp-container">
            <div className="lp-head">
              <span className="lp-eyebrow">How it works</span>
              <h2 id="lp-steps-title" className="lp-h2">From curious to shipped in three steps</h2>
            </div>
            <ol className="lp-steps">
              {STEPS.map((s, i) => (
                <li key={s.title} className="lp-step">
                  <span className="lp-step__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lp-step__icon">{s.icon}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Features (bento) ---------- */}
        <section className="lp-section" aria-labelledby="lp-features-title">
          <div className="lp-container">
            <div className="lp-head">
              <span className="lp-eyebrow">Everything in the lab</span>
              <h2 id="lp-features-title" className="lp-h2">Tools for looking closer</h2>
            </div>
            <ul className="lp-bento">
              {FEATURES.map((f) => (
                <li key={f.id} className={`lp-tile ${f.span ? `lp-tile--${f.span}` : ''} lp-tile--${f.id}`}>
                  <button type="button" className="lp-tile__btn" onClick={() => finish(f.to)}>
                    <span className="lp-tile__icon">{f.icon}</span>
                    <span className="lp-tile__name">{f.name}</span>
                    <span className="lp-tile__text">{f.text}</span>
                    {f.id === 'templates' && (
                      <span className="lp-tile__art" aria-hidden="true">
                        <span className="lp-mini lp-mini--browser"><span /><span /><span /></span>
                        <span className="lp-mini lp-mini--phone"><span /><span /></span>
                      </span>
                    )}
                    {f.id === 'generator' && (
                      <span className="lp-tile__seed" aria-hidden="true">
                        <span className="lp-tile__seed-code">seed 847291</span>
                        <ArrowRight size={14} />
                        <span className="lp-tile__swatches"><span /><span /><span /><span /></span>
                      </span>
                    )}
                    {f.id === 'styles' && (
                      <span className="lp-tile__chips" aria-hidden="true">
                        {heroStyles.slice(0, 6).map((s) => <span key={s.metadata.id}>{s.metadata.name}</span>)}
                      </span>
                    )}
                    <ArrowRight size={16} className="lp-tile__arrow" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Style wall ---------- */}
        <section className="lp-section" aria-labelledby="lp-wall-title">
          <div className="lp-container">
            <div className="lp-head lp-head--split">
              <div>
                <span className="lp-eyebrow">Live, not screenshots</span>
                <h2 id="lp-wall-title" className="lp-h2">Same structure, same data, different experience</h2>
              </div>
              <p className="lp-muted">Every tile is the real component system under that style. Open one to start there.</p>
            </div>
            <div className="lp-wall">
              {wallStyles.map((s) => (
                <div key={s.metadata.id} className="lp-wall__tile">
                  <StylePreviewCard style={s} size="thumb" onClick={() => finish('/', s.metadata.id)} />
                  <div className="lp-wall__meta">
                    <span className="lp-wall__name">{s.metadata.name}</span>
                    <span className="lp-wall__cat">{s.metadata.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Tokens ---------- */}
        <section className="lp-section" aria-labelledby="lp-tokens-title">
          <div className="lp-container lp-split">
            <div className="lp-split__copy">
              <span className="lp-eyebrow">Take it with you</span>
              <h2 id="lp-tokens-title" className="lp-h2">Every style is just tokens</h2>
              <p className="lp-muted">
                Colours, radii, borders, depth, motion and type — named values your own project can use. The sample on
                the right follows the style at the front of the deck.
              </p>
              <ul className="lp-checks">
                <li><Check size={16} /> CSS variables, JSON tokens or a full package</li>
                <li><Check size={16} /> Share any style, even a generated one, as a link</li>
                <li><Check size={16} /> Contribute styles to the community registry</li>
              </ul>
              <div className="lp-actions">
                <a className="lp-btn lp-btn--ghost" href={GITHUB_REPO_URL} target="_blank" rel="noreferrer"><Star size={16} /> Star on GitHub</a>
                <a className="lp-btn lp-btn--ghost" href={DOCS_URL} target="_blank" rel="noreferrer"><BookOpen size={16} /> Read the docs</a>
              </div>
            </div>
            <figure className="lp-code">
              <figcaption className="lp-code__bar">
                <span className="lp-code__dots" aria-hidden="true"><span /><span /><span /></span>
                <span className="lp-code__file">{front ? `${front.metadata.id}.css` : 'style.css'}</span>
                <button type="button" className="lp-code__copy" onClick={copyTokens} aria-label="Copy these tokens">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button>
              </figcaption>
              <pre className="lp-code__body"><code>
                <span className="lp-code__sel">:root</span> {'{'}{'\n'}
                {tokens.map((t) => (
                  <span key={t.name} className="lp-code__line">
                    {'  '}<span className="lp-code__prop">{t.name}</span>: {isColour(t.value) && <span className="lp-code__swatch" style={{ background: t.value }} />}<span className="lp-code__val">{t.value}</span>;{'\n'}
                  </span>
                ))}
                {'}'}
              </code></pre>
            </figure>
          </div>
        </section>

        {/* ---------- Call to action ---------- */}
        <section className="lp-section">
          <div className="lp-container">
            <div className="lp-cta">
              <BrandMark size={64} className="lp-cta__mark" />
              <h2 className="lp-h2">Pick a style. Break it. Make it yours.</h2>
              <p className="lp-muted">Free, open source, and nothing to install.</p>
              <div className="lp-actions lp-actions--center">
                <button type="button" className="lp-btn lp-btn--primary lp-btn--lg" onClick={() => finish('/')}>Start exploring <ArrowRight size={18} /></button>
                <button type="button" className="lp-btn lp-btn--ghost lp-btn--lg" onClick={() => finish('/generator')}><Wand2 size={18} /> Generate a style</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container lp-footer__inner">
          <BrandLockup size={24} />
          <nav className="lp-footer__links" aria-label="Footer">
            <button type="button" onClick={() => finish('/styles')}>Styles</button>
            <button type="button" onClick={() => finish('/templates')}>Templates</button>
            <button type="button" onClick={() => finish('/components')}>Components</button>
            <a href={DOCS_URL} target="_blank" rel="noreferrer">Docs</a>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer"><Code2 size={14} /> Source</a>
          </nav>
          <span className="lp-footer__legal">MIT licensed · v{APP_VERSION}</span>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Code2, ArrowRight, X } from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { StylePreviewCard } from '../../components/preview/StylePreviewCard';
import { ONBOARDING_STORAGE_KEY, GITHUB_REPO_URL } from '../../config/app';
import './WelcomePage.css';

/** Styles that read as clearly different universes when cycled in the hero. */
const HERO_STYLE_IDS = [
  'neumorphism', 'cyberpunk', 'neo-brutalism', 'glassmorphism', 'editorial',
  'pixel-art', 'claymorphism', 'swiss-style', 'vaporwave', 'bauhaus'
];

/** Styles shown in the wall below the hero. */
const WALL_STYLE_IDS = [
  'neumorphism', 'glassmorphism', 'claymorphism', 'neo-brutalism', 'cyberpunk', 'swiss-style',
  'editorial', 'pixel-art', 'vaporwave', 'bauhaus', 'material-design-3', 'sci-fi-hud'
];

const HERO_INTERVAL_MS = 3200;

const FEATURES: { name: string; text: string; to: string }[] = [
  { name: '30 design styles', text: 'From Neumorphism to Neo Brutalism, each defined as its own token system, not a palette swap.', to: '/styles' },
  { name: 'Interactive components', text: 'Real buttons, inputs, cards, tables and charts that change with the active style.', to: '/components' },
  { name: 'SVG experiments', text: 'Charts and decorative graphics generated live from the style engine.', to: '/data' },
  { name: 'Style Anatomy', text: 'Open any style and read the exact values that make it look the way it does.', to: '/' },
  { name: 'Style Mixer', text: 'Combine the typography of one style with the surfaces and depth of another.', to: '/' },
  { name: 'Custom themes', text: 'Generate a coherent system from a seed, then tune every token by hand.', to: '/generator' },
  { name: 'Export tools', text: 'Take the result out as JSON tokens or CSS variables, ready for your own project.', to: '/customizer' },
  { name: 'Community registry', text: 'Styles contributed as plain JSON packages on GitHub, validated and loaded at build time.', to: '/styles' }
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { availableStyles, setStyle } = useStyle();

  const heroStyles = useMemo(
    () => HERO_STYLE_IDS.map((id) => availableStyles.find((s) => s.metadata.id === id)).filter((s) => s !== undefined),
    [availableStyles]
  );
  const wallStyles = useMemo(
    () => WALL_STYLE_IDS.map((id) => availableStyles.find((s) => s.metadata.id === id)).filter((s) => s !== undefined),
    [availableStyles]
  );

  const [heroIndex, setHeroIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroStyle = heroStyles[heroIndex % Math.max(heroStyles.length, 1)];

  // The one deliberate motion on this page: the same card cycling through design languages.
  useEffect(() => {
    if (isPaused || heroStyles.length < 2 || prefersReducedMotion()) return;
    const id = window.setInterval(() => setHeroIndex((i) => (i + 1) % heroStyles.length), HERO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isPaused, heroStyles.length]);

  const hasOnboarded = typeof localStorage !== 'undefined' && localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';

  const finish = (to: string, styleId?: string) => {
    try { localStorage.setItem(ONBOARDING_STORAGE_KEY, '1'); } catch { /* storage unavailable */ }
    if (styleId) setStyle(styleId);
    navigate(to);
  };

  return (
    <div className="welcome">
      <header className="welcome__top">
        <div className="welcome__brand">
          <Sparkles size={18} className="welcome__brand-icon" />
          <span>UI Explorer</span>
        </div>
        <div className="welcome__top-actions">
          <a className="welcome__link" href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
            <Code2 size={16} /> GitHub
          </a>
          {hasOnboarded ? (
            <button type="button" className="welcome__link" onClick={() => navigate('/')}>
              <X size={16} /> Close
            </button>
          ) : (
            <button type="button" className="welcome__link" onClick={() => finish('/')}>
              Skip for now
            </button>
          )}
        </div>
      </header>

      <main className="welcome__main">
        <section className="welcome__hero">
          <div className="welcome__hero-copy">
            <h1 className="welcome__headline">
              The same interface, in thirty design languages.
            </h1>
            <p className="welcome__lede">
              UI Explorer is an open-source laboratory for exploring, understanding and experimenting with
              interface design systems. Pick a style, inspect why it looks the way it does, remix it, and take
              the tokens into your own project.
            </p>
            <div className="welcome__cta-row">
              <button type="button" className="welcome__cta welcome__cta--primary" onClick={() => finish('/')}>
                Explore styles <ArrowRight size={16} />
              </button>
              <button type="button" className="welcome__cta" onClick={() => finish('/generator')}>
                Create a style
              </button>
            </div>
            <p className="welcome__note">No account needed. Everything runs in your browser.</p>
          </div>

          <div
            className="welcome__hero-stage"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {heroStyle && (
              <>
                <StylePreviewCard style={heroStyle} size="hero" className="welcome__hero-card" />
                <div className="welcome__hero-caption" aria-live="polite">
                  <span className="welcome__hero-name">{heroStyle.metadata.name}</span>
                  <span className="welcome__hero-personality">{heroStyle.metadata.personality}</span>
                </div>
                <ol className="welcome__hero-dots" aria-label="Featured styles">
                  {heroStyles.map((s, i) => (
                    <li key={s.metadata.id}>
                      <button
                        type="button"
                        className={`welcome__dot ${i === heroIndex ? 'welcome__dot--active' : ''}`}
                        aria-label={s.metadata.name}
                        aria-current={i === heroIndex ? 'true' : undefined}
                        onClick={() => { setHeroIndex(i); setIsPaused(true); }}
                      />
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </section>

        <section className="welcome__wall" aria-labelledby="welcome-wall-title">
          <div className="welcome__section-head">
            <h2 id="welcome-wall-title">Same structure, same data, different experience.</h2>
            <p>Every tile is the live component system rendered under that style. Open one to start there.</p>
          </div>
          <div className="welcome__wall-grid">
            {wallStyles.map((s) => (
              <div key={s.metadata.id} className="welcome__tile">
                <StylePreviewCard style={s} size="thumb" onClick={() => finish('/', s.metadata.id)} />
                <div className="welcome__tile-meta">
                  <span className="welcome__tile-name">{s.metadata.name}</span>
                  <span className="welcome__tile-cat">{s.metadata.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="welcome__features" aria-labelledby="welcome-features-title">
          <div className="welcome__section-head">
            <h2 id="welcome-features-title">What you can do here</h2>
          </div>
          <ul className="welcome__feature-list">
            {FEATURES.map((f) => (
              <li key={f.name} className="welcome__feature">
                <button type="button" className="welcome__feature-btn" onClick={() => finish(f.to)}>
                  <span className="welcome__feature-name">{f.name}</span>
                  <span className="welcome__feature-text">{f.text}</span>
                  <ArrowRight size={16} className="welcome__feature-arrow" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="welcome__footer">
        <span>Open source under the MIT license.</span>
        <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">Contribute a style on GitHub</a>
      </footer>
    </div>
  );
};

export default WelcomePage;

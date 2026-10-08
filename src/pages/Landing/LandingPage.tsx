import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { TargetAndTransition } from 'motion/react';
import { SPRING_SOFT, rise, stagger } from '../../motion/presets';
import { CountUp, Magnetic, Reveal, RevealItem, RevealList, ScrollProgress, SplitHeadline, Spotlight, Tilt } from './landingMotion';
import { trackPointer, useScrolledPast } from './landingHooks';
import {
  ArrowRight, BookOpen, Code2, LayoutTemplate, Wand2,
  Copy, Check, MousePointerClick, Microscope, PackageOpen, Star
} from 'lucide-react';
import { useStyle } from '../../hooks/useStyle';
import { resolveStyleToCssVars } from '../../engine/resolver';
import { StylePreviewCard } from '../../components/preview/StylePreviewCard';
import { BrandLockup, BrandMark } from '../../components/layout/BrandMark';
import { COMPONENT_CATALOG } from '../../templates/catalog';
import { ONBOARDING_STORAGE_KEY, GITHUB_REPO_URL, DOCS_URL, APP_VERSION } from '../../config/app';
import { PAGES, TOOLS, APP_HOME, LAST_ROUTE_KEY } from '../../config/routes';
import './LandingPage.css';

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

/** The feature grid is drawn from the page and tool registry, so its names and descriptions never drift. */
const FEATURE_TILES: { kind: 'page' | 'tool'; id: string; span?: 'wide' | 'tall' }[] = [
  { kind: 'page', id: 'styles', span: 'wide' },
  { kind: 'page', id: 'templates', span: 'tall' },
  { kind: 'page', id: 'generator', span: 'tall' },
  { kind: 'page', id: 'components' },
  { kind: 'page', id: 'customizer' },
  { kind: 'tool', id: 'anatomy' },
  { kind: 'tool', id: 'mixer' },
  { kind: 'tool', id: 'export', span: 'wide' }
];

const FEATURES = FEATURE_TILES.map((t) => {
  const def = t.kind === 'page' ? PAGES.find((p) => p.id === t.id)! : TOOLS.find((x) => x.id === t.id)!;
  const to = t.kind === 'page' ? (def as (typeof PAGES)[number]).path : `${APP_HOME}?tool=${t.id}`;
  return { id: t.id, span: t.span, Icon: def.icon, name: def.label, text: def.description, to };
});

/** Where "Open the lab" goes: the last page the visitor used, or the styles gallery the first time. */
const appEntry = () => {
  try { return localStorage.getItem(LAST_ROUTE_KEY) || APP_HOME; } catch { return APP_HOME; }
};

/** The tokens shown in the live code sample, in reading order. */
const SAMPLE_TOKENS = ['--color-bg', '--color-surface', '--color-accent', '--color-text-primary', '--radius-md', '--border-width', '--duration-normal', '--font-family-sans'];

/** Where each card of the hero deck sits. Cards keep their identity as they move, so the deck deals. */
type DeckSlot = 'left' | 'front' | 'right';
const deckPose = (slot: DeckSlot, spread: boolean): TargetAndTransition => {
  const side = spread ? { x: 21, r: 13 } : { x: 15, r: 9 };
  if (slot === 'front') return { x: '0%', rotate: 0, scale: 1, opacity: 1, z: 40 };
  const dir = slot === 'left' ? -1 : 1;
  return { x: `${dir * side.x}%`, rotate: dir * side.r, scale: 0.9, opacity: 0.72, z: 0 };
};
const DECK_ENTER: TargetAndTransition = { x: '34%', rotate: 18, scale: 0.84, opacity: 0, z: 0 };
const DECK_EXIT: TargetAndTransition = { x: '-34%', rotate: -18, scale: 0.84, opacity: 0, z: 0 };

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isColour = (v: string) => /^(#|rgb|hsl)/i.test(v.trim());

export const LandingPage: React.FC = () => {
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

  // The deck deals the next design language to the front on a timer; hovering it pauses.
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
  const scrolled = useScrolledPast();

  const deck = left && right && front ? ([['left', left], ['front', front], ['right', right]] as const) : [];

  return (
    <div className="lp">
      <ScrollProgress />
      <header className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <button type="button" className="lp-nav__brand" onClick={() => window.scrollTo?.({ top: 0, behavior: 'smooth' })} aria-label="UI Explorer, back to top">
          <BrandLockup size={30} />
        </button>
        <nav className="lp-nav__links" aria-label="Sections">
          {PAGES.map((p) => <button key={p.id} type="button" onClick={() => finish(p.path)}>{p.label}</button>)}
          <a href={DOCS_URL} target="_blank" rel="noreferrer">Docs</a>
          <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <button type="button" className="lp-btn lp-btn--primary lp-btn--sm" onClick={() => finish(appEntry())}>
          {hasOnboarded ? 'Back to the lab' : 'Open the lab'} <ArrowRight size={15} />
        </button>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <Spotlight className="lp-hero">
          <div className="lp-glow lp-glow--a" aria-hidden="true" />
          <div className="lp-glow lp-glow--b" aria-hidden="true" />
          <div className="lp-glow lp-glow--c" aria-hidden="true" />
          <div className="lp-container lp-hero__grid">
            <div className="lp-hero__copy">
              <motion.span className="lp-pill" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="lp-pill__dot" /> Free &amp; open source · runs in your browser · v{APP_VERSION}
              </motion.span>
              <SplitHeadline
                className="lp-h1"
                lines={[{ text: 'One interface.' }, { text: 'Thirty design languages.', className: 'lp-gradient-text', whole: true }]}
              />
              <motion.div className="lp-hero__rest" variants={stagger(0.09, 0.45)} initial="hidden" animate="show">
                <motion.p className="lp-lede" variants={rise}>
                  UI Explorer is a laboratory for interface design systems. Switch a style and every button, card, chart
                  and template rebuilds — then see why it looks that way, remix it, and take the tokens home.
                </motion.p>
                <motion.div className="lp-actions" variants={rise}>
                  <Magnetic>
                    <button type="button" className="lp-btn lp-btn--primary lp-btn--lg lp-btn--shine" onClick={() => finish(appEntry())}>Start exploring <ArrowRight size={18} /></button>
                  </Magnetic>
                  <Magnetic strength={0.18}>
                    <button type="button" className="lp-btn lp-btn--ghost lp-btn--lg" onClick={() => finish('/templates')}><LayoutTemplate size={18} /> See the templates</button>
                  </Magnetic>
                </motion.div>
                <motion.ul className="lp-proof" variants={rise}>
                  <li>No account</li>
                  <li>No server</li>
                  <li>MIT licensed</li>
                </motion.ul>
              </motion.div>
            </div>

            <motion.div className="lp-deck-wrap" initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...SPRING_SOFT, delay: 0.25 }}>
              <Tilt className="lp-deck" onHover={setIsPaused}>
                <div className="lp-deck__stack">
                  <AnimatePresence initial={false}>
                    {deck.map(([slot, s]) => (
                      <motion.div
                        key={s.metadata.id}
                        className={`lp-deck__card lp-deck__card--${slot}`}
                        aria-hidden={slot === 'front' ? undefined : true}
                        initial={DECK_ENTER}
                        animate={deckPose(slot, isPaused)}
                        exit={DECK_EXIT}
                        transition={SPRING_SOFT}
                      >
                        <StylePreviewCard style={s} size="hero" />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {front && (
                  <div className="lp-deck__caption" aria-live="polite">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span key={front.metadata.id} className="lp-deck__caption-inner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                        <span className="lp-deck__name">{front.metadata.name}</span>
                        <span className="lp-deck__personality">{front.metadata.personality}</span>
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
                <ol className="lp-deck__dots" aria-label="Featured styles">
                  {heroStyles.map((s, i) => (
                    <li key={s.metadata.id}>
                      <button
                        type="button"
                        className={`lp-dot ${i === heroIndex % count ? 'lp-dot--active' : ''}`}
                        aria-label={s.metadata.name}
                        aria-current={i === heroIndex % count ? 'true' : undefined}
                        onClick={() => { setHeroIndex(i); setIsPaused(true); }}
                      >
                        {i === heroIndex % count && !isPaused && <span key={heroIndex} className="lp-dot__timer" style={{ animationDuration: `${HERO_INTERVAL_MS}ms` }} />}
                      </button>
                    </li>
                  ))}
                </ol>
              </Tilt>
            </motion.div>
          </div>

          <div className="lp-container">
            <RevealList as="dl" className="lp-stats" step={0.1}>
              <RevealItem as="div"><dt>Design styles</dt><dd><CountUp value={styleCount} /></dd></RevealItem>
              <RevealItem as="div"><dt>Library components</dt><dd><CountUp value={COMPONENT_CATALOG.length} /></dd></RevealItem>
              <RevealItem as="div"><dt>Template screens</dt><dd><CountUp value={TEMPLATE_SCREEN_COUNT} /></dd></RevealItem>
              <RevealItem as="div"><dt>Generated styles</dt><dd>∞</dd></RevealItem>
            </RevealList>
          </div>
        </Spotlight>

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
            <Reveal className="lp-head">
              <span className="lp-eyebrow">How it works</span>
              <h2 id="lp-steps-title" className="lp-h2">From curious to shipped in three steps</h2>
            </Reveal>
            <RevealList as="ol" className="lp-steps" step={0.12}>
              {STEPS.map((s, i) => (
                <RevealItem key={s.title} className="lp-step">
                  <span className="lp-step__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lp-step__icon">{s.icon}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </RevealItem>
              ))}
            </RevealList>
          </div>
        </section>

        {/* ---------- Features (bento) ---------- */}
        <section className="lp-section" aria-labelledby="lp-features-title">
          <div className="lp-container">
            <Reveal className="lp-head">
              <span className="lp-eyebrow">Everything in the lab</span>
              <h2 id="lp-features-title" className="lp-h2">Tools for looking closer</h2>
            </Reveal>
            <RevealList className="lp-bento" step={0.06}>
              {FEATURES.map((f) => (
                <RevealItem key={f.id} className={`lp-tile ${f.span ? `lp-tile--${f.span}` : ''} lp-tile--${f.id}`}>
                  <button type="button" className="lp-tile__btn" onClick={() => finish(f.to)} onPointerMove={trackPointer}>
                    <span className="lp-tile__icon"><f.Icon size={20} /></span>
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
                </RevealItem>
              ))}
            </RevealList>
          </div>
        </section>

        {/* ---------- Style wall ---------- */}
        <section className="lp-section" aria-labelledby="lp-wall-title">
          <div className="lp-container">
            <Reveal className="lp-head lp-head--split">
              <div>
                <span className="lp-eyebrow">Live, not screenshots</span>
                <h2 id="lp-wall-title" className="lp-h2">Same structure, same data, different experience</h2>
              </div>
              <p className="lp-muted">Every tile is the real component system under that style. Open one to start there.</p>
            </Reveal>
            <RevealList as="div" className="lp-wall" step={0.05}>
              {wallStyles.map((s) => (
                <RevealItem as="div" key={s.metadata.id} className="lp-wall__tile">
                  <StylePreviewCard style={s} size="thumb" onClick={() => finish(`/styles/${encodeURIComponent(s.metadata.id)}`, s.metadata.id)} />
                  <div className="lp-wall__meta">
                    <span className="lp-wall__name">{s.metadata.name}</span>
                    <span className="lp-wall__cat">{s.metadata.category}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealList>
          </div>
        </section>

        {/* ---------- Tokens ---------- */}
        <section className="lp-section" aria-labelledby="lp-tokens-title">
          <div className="lp-container lp-split">
            <Reveal className="lp-split__copy">
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
            </Reveal>
            <Reveal as="figure" className="lp-code" delay={0.12}>
              <figcaption className="lp-code__bar">
                <span className="lp-code__dots" aria-hidden="true"><span /><span /><span /></span>
                <span className="lp-code__file">{front ? `${front.metadata.id}.css` : 'style.css'}</span>
                <button type="button" className="lp-code__copy" onClick={copyTokens} aria-label="Copy these tokens">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy'}</button>
              </figcaption>
              <pre className="lp-code__body"><code>
                <span className="lp-code__sel">:root</span> {'{'}{'\n'}
                {tokens.map((t, i) => (
                  <span key={t.name} className="lp-code__line">
                    {'  '}<span className="lp-code__prop">{t.name}</span>: {isColour(t.value) && <motion.span key={`sw-${t.value}`} className="lp-code__swatch" style={{ background: t.value }} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ ...SPRING_SOFT, delay: i * 0.03 }} />}
                    <motion.span key={t.value} className="lp-code__val" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}>{t.value}</motion.span>;{'\n'}
                  </span>
                ))}
                {'}'}
              </code></pre>
            </Reveal>
          </div>
        </section>

        {/* ---------- Call to action ---------- */}
        <section className="lp-section">
          <div className="lp-container">
            <Reveal className="lp-cta">
              <BrandMark size={64} className="lp-cta__mark" />
              <h2 className="lp-h2">Pick a style. Break it. Make it yours.</h2>
              <p className="lp-muted">Free, open source, and nothing to install.</p>
              <div className="lp-actions lp-actions--center">
                <Magnetic>
                  <button type="button" className="lp-btn lp-btn--primary lp-btn--lg lp-btn--shine" onClick={() => finish(appEntry())}>Start exploring <ArrowRight size={18} /></button>
                </Magnetic>
                <Magnetic strength={0.18}>
                  <button type="button" className="lp-btn lp-btn--ghost lp-btn--lg" onClick={() => finish('/generator')}><Wand2 size={18} /> Generate a style</button>
                </Magnetic>
              </div>
            </Reveal>
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

export default LandingPage;

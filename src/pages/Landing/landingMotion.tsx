import React, { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  animate, motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform
} from 'motion/react';
import { REVEAL_VIEWPORT, rise, stagger, word } from '../../motion/presets';

/** Scroll reveals need IntersectionObserver; without it (old browsers, test DOMs) content simply shows. */
const canObserve = typeof IntersectionObserver !== 'undefined';
const revealProps = canObserve ? { whileInView: 'show', viewport: REVEAL_VIEWPORT } : { animate: 'show' };

/** A thin brand-gradient bar that fills as the page scrolls. */
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return <motion.div className="lp-progress" style={{ scaleX }} aria-hidden="true" />;
};

/**
 * A headline whose words rise out of a soft blur one after another. A line
 * with `whole` animates as one piece (used for gradient text, which must not
 * be split into separately painted words).
 */
export const SplitHeadline: React.FC<{ lines: { text: string; className?: string; whole?: boolean }[]; className?: string; delay?: number }> = ({ lines, className, delay = 0.1 }) => (
  <motion.h1 className={className} variants={stagger(0.07, delay)} initial="hidden" animate="show">
    {lines.map((line, li) => (
      <React.Fragment key={li}>
        {line.whole ? (
          <motion.span className={`lp-line ${line.className ?? ''}`} variants={word}>{line.text}</motion.span>
        ) : (
          <span className={`lp-line ${line.className ?? ''}`}>
            {line.text.split(' ').map((w, wi, all) => (
              <React.Fragment key={wi}>
                <motion.span className="lp-word" variants={word}>{w}</motion.span>
                {wi < all.length - 1 ? ' ' : ''}
              </React.Fragment>
            ))}
          </span>
        )}
        {li < lines.length - 1 ? ' ' : ''}
      </React.Fragment>
    ))}
  </motion.h1>
);

/** Fades and rises into place the first time it scrolls into view. */
export const Reveal: React.FC<{ children: ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'figure' }> = ({ children, className, delay = 0, as = 'div' }) => {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      {...revealProps}
      variants={{ hidden: rise.hidden, show: { ...(rise.show as object), transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay } } }}
    >
      {children}
    </Tag>
  );
};

/** A list whose items reveal one after another when the list scrolls into view. Children should be `RevealItem`s. */
export const RevealList: React.FC<{ children: ReactNode; className?: string; step?: number; as?: 'ul' | 'ol' | 'div' | 'dl' }> = ({ children, className, step = 0.08, as = 'ul' }) => {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={stagger(step)} initial="hidden" {...revealProps}>
      {children}
    </Tag>
  );
};

export const RevealItem: React.FC<{ children: ReactNode; className?: string; as?: 'li' | 'div' }> = ({ children, className, as = 'li' }) => {
  const Tag = motion[as];
  return <Tag className={className} variants={rise}>{children}</Tag>;
};

/** Counts up to `value` the first time it is seen. Non-numbers are shown as they are. */
export const CountUp: React.FC<{ value: number | string; duration?: number }> = ({ value, duration = 1.4 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const numeric = typeof value === 'number' && canObserve;
  const [shown, setShown] = useState<number | string>(numeric && !reduce ? 0 : value);

  useEffect(() => {
    const el = ref.current;
    if (!numeric || reduce || !el) return;
    let controls: ReturnType<typeof animate> | undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      controls = animate(0, value as number, { duration, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setShown(Math.round(v)) });
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); controls?.stop(); };
  }, [numeric, reduce, value, duration]);

  return (
    <span ref={ref}>
      <span aria-hidden="true">{shown}</span>
      <span className="lp-sr">{value}</span>
    </span>
  );
};

/** Pulls its child gently toward the pointer while hovered, then springs back. */
export const Magnetic: React.FC<{ children: ReactNode; strength?: number; className?: string }> = ({ children, strength = 0.28, className }) => {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 });
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 });
  const onMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.span className={`lp-magnetic ${className ?? ''}`} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  );
};

/** Tilts its content in 3D toward the pointer. Children can lift off with `translateZ`. */
export const Tilt: React.FC<{ children: ReactNode; className?: string; max?: number; onHover?: (hovering: boolean) => void }> = ({ children, className, max = 10, onHover }) => {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 150, damping: 18 });
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 150, damping: 18 });
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => { px.set(0.5); py.set(0.5); onHover?.(false); };
  return (
    <motion.div
      className={className}
      style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1100 }}
      onPointerMove={onMove}
      onPointerEnter={() => onHover?.(true)}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
};

/** A soft light that follows the pointer across a section. Sets --spot-x/--spot-y for CSS to use. */
export const Spotlight: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const background = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, var(--lp-spot), transparent 70%)`;
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  return (
    <div className={`lp-spotlight ${className ?? ''}`} onPointerMove={onMove} onPointerLeave={() => { mx.set(-1000); my.set(-1000); }}>
      <motion.div className="lp-spotlight__light" style={{ background }} aria-hidden="true" />
      {children}
    </div>
  );
};

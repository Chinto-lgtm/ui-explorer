/**
 * UI Explorer — motion presets (single source of truth for the chrome's motion).
 *
 * Every animated part of the tool (page entrances, panels, popovers, the nav
 * indicator, the landing page) uses these values, so the app moves with one
 * voice. Styles' own motion tokens drive the previews, not these.
 */
import type { Transition, Variants } from 'motion/react';

/** Fast out, gentle settle. */
export const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const SPRING: Transition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.8 };
export const SPRING_SOFT: Transition = { type: 'spring', stiffness: 220, damping: 26 };
/** For indicators that slide between items (nav pill, segmented controls). */
export const SPRING_SNAPPY: Transition = { type: 'spring', stiffness: 560, damping: 40 };

export const DURATION = { fast: 0.16, base: 0.28, slow: 0.6 } as const;

/** A page or stage arriving. */
export const pageIn: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE_OUT } }
};

/** Panels sliding from the right edge (Tweaks, Anatomy). */
export const panelRight: Variants = {
  hidden: { x: 32, opacity: 0 },
  show: { x: 0, opacity: 1, transition: SPRING },
  exit: { x: 32, opacity: 0, transition: { duration: DURATION.fast, ease: EASE_IN_OUT } }
};

/** Popovers and menus dropping from their trigger. */
export const popover: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: DURATION.fast, ease: EASE_OUT } },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.12, ease: EASE_IN_OUT } }
};

/** Dialogs scaling in over a backdrop. */
export const dialog: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: SPRING },
  exit: { opacity: 0, scale: 0.98, y: 4, transition: { duration: DURATION.fast } }
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DURATION.base } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } }
};

/** Parent that reveals its children one after another. */
export const stagger = (step = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } }
});

/** Child of `stagger`: rises and fades in. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } }
};

/** Child of `stagger` for words in a headline: rises out of a soft blur. */
export const word: Variants = {
  hidden: { opacity: 0, y: '0.4em', filter: 'blur(8px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE_OUT } }
};

/** Viewport options for scroll reveals: once, a little before the element is fully in. */
export const REVEAL_VIEWPORT = { once: true, amount: 0.2 } as const;

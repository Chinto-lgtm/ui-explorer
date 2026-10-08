import { createContext, useContext } from 'react';

/** Below this width the site switches to its phone layout (matches the container queries in landing.css). */
export const NARROW_WIDTH = 760;

export const LandingViewport = createContext({ narrow: false });

/** True when the site is rendered at phone width. */
export const useNarrow = () => useContext(LandingViewport).narrow;

import { createContext } from 'react';

/** Turns a section title into its URL segment: "Typography" → "typography". */
export const sectionSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Optional: lets a page put its open section in the URL (/customizer/typography).
 * Sections read the active slug to decide whether they start open, and report
 * when the visitor opens one.
 */
export const SectionRouteContext = createContext<{ active: string | null; onOpen: (slug: string) => void } | null>(null);

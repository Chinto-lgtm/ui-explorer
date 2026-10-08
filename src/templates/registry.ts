import type { FamilyDef, FamilyId, ScreenDef } from './nav';
import { LandingLayout } from './landing/LandingLayout';
import { HomePage } from './landing/pages/HomePage';
import { FeaturesPage } from './landing/pages/FeaturesPage';
import { PricingPage } from './landing/pages/PricingPage';
import { AboutPage } from './landing/pages/AboutPage';
import { BlogPage } from './landing/pages/BlogPage';
import { ContactPage } from './landing/pages/ContactPage';
import { SignInPage } from './landing/pages/SignInPage';
import { BRAND } from './content';

/** The landing site: one responsive set of pages, shown as two families (desktop and phone). */
const LANDING_SCREENS: ScreenDef[] = [
  { id: 'home', name: 'Home', group: 'Marketing', description: 'Hero with the app, features, stats, steps, calculator, testimonials, support chat.', Component: HomePage },
  { id: 'features', name: 'Features', group: 'Marketing', description: 'Feature tabs with charts, an interactive product demo, a month timeline, banks.', Component: FeaturesPage },
  { id: 'pricing', name: 'Pricing', group: 'Marketing', description: 'Billing switch, plan cards, trial dialog, comparison table, FAQ.', Component: PricingPage },
  { id: 'about', name: 'About', group: 'Company', description: 'Mission, numbers, history timeline, team, values and open roles.', Component: AboutPage },
  { id: 'blog', name: 'Blog', group: 'Company', description: 'Search and filters, featured post, cards, loading and empty states, pagination.', Component: BlogPage },
  { id: 'contact', name: 'Contact', group: 'Conversion', description: 'Validated form, contact cards, office map, demo booking dialog.', Component: ContactPage },
  { id: 'signin', name: 'Sign in', group: 'Conversion', description: 'Sign in or sign up, social buttons, errors, two-step code, success.', Component: SignInPage }
];

export const FAMILIES: FamilyDef[] = [
  {
    id: 'landing-desktop',
    name: 'Desktop landing',
    short: 'Desktop',
    description: 'The Orbit marketing site in a 1440px browser.',
    device: 'browser',
    width: 1440,
    height: 900,
    host: BRAND.host,
    Layout: LandingLayout,
    screens: LANDING_SCREENS
  },
  {
    id: 'landing-mobile',
    name: 'Mobile landing',
    short: 'Mobile web',
    description: 'The same site, responsive, on a 390px phone.',
    device: 'phone',
    width: 390,
    height: 844,
    host: BRAND.host,
    Layout: LandingLayout,
    screens: LANDING_SCREENS
  }
];

export const getFamily = (id: string | undefined): FamilyDef => FAMILIES.find((f) => f.id === id) ?? FAMILIES[0];

export const isFamilyId = (id: string | undefined): id is FamilyId => FAMILIES.some((f) => f.id === id);

/** Screens of a family grouped by flow, in order. */
export function groupScreens(family: FamilyDef): { group: string; screens: ScreenDef[] }[] {
  const groups: { group: string; screens: ScreenDef[] }[] = [];
  for (const s of family.screens) {
    const g = groups.find((x) => x.group === s.group);
    if (g) g.screens.push(s); else groups.push({ group: s.group, screens: [s] });
  }
  return groups;
}

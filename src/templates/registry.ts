import type { FamilyDef, FamilyId, ScreenDef } from './nav';
import { LandingLayout } from './landing/LandingLayout';
import { HomePage } from './landing/pages/HomePage';
import { FeaturesPage } from './landing/pages/FeaturesPage';
import { PricingPage } from './landing/pages/PricingPage';
import { AboutPage } from './landing/pages/AboutPage';
import { BlogPage } from './landing/pages/BlogPage';
import { ContactPage } from './landing/pages/ContactPage';
import { SignInPage } from './landing/pages/SignInPage';
import { AppLayout } from './app/AppLayout';
import { SplashScreen, WelcomeScreen, SignInScreen, VerifyScreen, PermissionsScreen } from './app/screens/Onboarding';
import { HomeScreen, ExploreScreen, NotificationsScreen } from './app/screens/Main';
import { GoalScreen, CreateGoalScreen, GoalCreatedScreen } from './app/screens/Goals';
import { WalletScreen } from './app/screens/Wallet';
import { MessagesScreen, ChatScreen } from './app/screens/Social';
import { ProfileScreen, SettingsScreen, StatesScreen } from './app/screens/Account';
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

/** The Orbit app itself, grouped into the flows a person walks through. */
const APP_SCREENS: ScreenDef[] = [
  { id: 'splash', name: 'Splash', group: 'Onboarding', description: 'Brand moment while the app secures the connection.', Component: SplashScreen },
  { id: 'welcome', name: 'Welcome', group: 'Onboarding', description: 'Three intro slides in a carousel, then sign up or sign in.', Component: WelcomeScreen },
  { id: 'signin', name: 'Sign in', group: 'Onboarding', description: 'Email or phone with country search, Face ID, errors.', Component: SignInScreen },
  { id: 'verify', name: 'Verify', group: 'Onboarding', description: 'Six-digit code with paste, resend and an expired-code error.', Component: VerifyScreen },
  { id: 'permissions', name: 'Permissions', group: 'Onboarding', description: 'Notification, Face ID and location switches, terms.', Component: PermissionsScreen },
  { id: 'home', name: 'Home', group: 'Everyday', description: 'Balance, quick actions, goal carousel, budgets, activity, menu.', Component: HomeScreen },
  { id: 'explore', name: 'Discover', group: 'Everyday', description: 'Search, filter chips, loading skeleton, empty state, offers.', Component: ExploreScreen },
  { id: 'notifications', name: 'Notifications', group: 'Everyday', description: 'Notification centre with read, unread and dismiss.', Component: NotificationsScreen },
  { id: 'goal', name: 'Goal', group: 'Goals', description: 'Progress ring, tabs, chart, history, members, add-money sheet.', Component: GoalScreen },
  { id: 'create', name: 'New goal', group: 'Goals', description: 'Three-step form: name, plan, review.', Component: CreateGoalScreen },
  { id: 'created', name: 'Goal created', group: 'Goals', description: 'Success state with what happens next.', Component: GoalCreatedScreen },
  { id: 'wallet', name: 'Wallet', group: 'Money', description: 'Card carousel, freeze, card designer, charts, transactions, statements.', Component: WalletScreen },
  { id: 'messages', name: 'Chats', group: 'Social', description: 'Conversation list with unread counts and search.', Component: MessagesScreen },
  { id: 'chat', name: 'Chat', group: 'Social', description: 'Bubbles, a playable voice note, quick replies, message menu.', Component: ChatScreen },
  { id: 'profile', name: 'Profile', group: 'Account', description: 'Stats, goals chart, household, upgrade card, rating.', Component: ProfileScreen },
  { id: 'settings', name: 'Settings', group: 'Account', description: 'Switches, currency, appearance, text size, language sheet, sign out.', Component: SettingsScreen },
  { id: 'states', name: 'App states', group: 'Account', description: 'Loading, empty, error and offline versions of a screen.', Component: StatesScreen }
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
  },
  {
    id: 'app',
    name: 'Mobile app',
    short: 'App',
    description: 'The Orbit app on a 390px phone.',
    device: 'phone',
    width: 390,
    height: 844,
    Layout: AppLayout,
    screens: APP_SCREENS
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

/**
 * One product story shared by every template: Orbit, a personal money app.
 * The landing site sells it; the mobile app is the product itself.
 * Everything here is fictional demo content.
 */

export const BRAND = {
  name: 'Orbit',
  tagline: 'Money that moves with you',
  pitch: 'Budgets that adapt, savings that run on autopilot, and a clear picture of where every dollar goes — in one calm app.',
  host: 'orbit.money'
};

export const USER = { name: 'Sam Rivera', first: 'Sam', email: 'sam@orbit.money', handle: '@samr' };

export const SITE_NAV = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'about', label: 'About' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' }
];

export const PRESS = ['The Ledger', 'Fintech Weekly', 'Product Hunt', 'Money Today', 'Wired Wallet', 'Daily Saver'];

export const FEATURES = [
  { id: 'budgets', title: 'Adaptive budgets', text: 'Limits that learn from your month and nudge you before you overspend, not after.' },
  { id: 'goals', title: 'Savings goals', text: 'Name it, date it, fund it. Round-ups and rules move money there while you sleep.' },
  { id: 'insights', title: 'Clear insights', text: 'See trends, recurring charges and the categories that quietly grow.' },
  { id: 'shared', title: 'Shared wallets', text: 'Split rent, trips and groceries with the people you live with.' },
  { id: 'security', title: 'Bank-grade security', text: 'Biometric sign-in, instant card freeze and read-only bank links.' },
  { id: 'transfers', title: 'Instant transfers', text: 'Send money to anyone in seconds, free, in 32 currencies.' }
];

export const STATS = [
  { label: 'People saving', value: '2.4M', delta: '+38% this year' },
  { label: 'Saved toward goals', value: '$4.1B', delta: '+$310M last month' },
  { label: 'Average monthly saving', value: '$412', delta: '+12%' },
  { label: 'App Store rating', value: '4.9', delta: '86k reviews' }
];

export const TESTIMONIALS = [
  { name: 'Maya Chen', role: 'Designer, Lisbon', rating: 5, quote: 'I stopped dreading the end of the month. Orbit tells me where I stand before I ask.' },
  { name: 'Jordan Okafor', role: 'Nurse, Leeds', rating: 5, quote: 'The round-ups paid for our honeymoon flights. I genuinely did nothing.' },
  { name: 'Lucía Moreno', role: 'Freelancer, Madrid', rating: 4.5, quote: 'Shared wallets ended the spreadsheet arguments with my flatmates.' },
  { name: 'Theo Becker', role: 'Student, Berlin', rating: 5, quote: 'Budgets that adapt instead of scolding me. First finance app I kept.' }
];

export const STEPS = [
  { label: 'Connect', description: 'Link your bank in two minutes' },
  { label: 'Plan', description: 'Orbit drafts budgets from your history' },
  { label: 'Automate', description: 'Rules and round-ups fund your goals' },
  { label: 'Grow', description: 'Watch the trend line climb' }
];

export const PLANS = [
  {
    id: 'free', name: 'Free', monthly: 0, yearly: 0, description: 'Everything you need to start.',
    features: [{ label: 'Budgets and insights' }, { label: '2 savings goals' }, { label: 'Instant transfers' }, { label: 'Shared wallets', included: false }, { label: 'Priority support', included: false }]
  },
  {
    id: 'plus', name: 'Plus', monthly: 6, yearly: 60, description: 'For people serious about saving.', featured: true,
    features: [{ label: 'Everything in Free' }, { label: 'Unlimited goals' }, { label: 'Smart rules and round-ups' }, { label: 'Shared wallets' }, { label: 'Priority support', included: false }]
  },
  {
    id: 'family', name: 'Family', monthly: 12, yearly: 120, description: 'Up to six people, one plan.',
    features: [{ label: 'Everything in Plus' }, { label: 'Six members' }, { label: 'Kids cards with limits' }, { label: 'Shared goals' }, { label: 'Priority support' }]
  }
];

export interface CompareRow { id: string; feature: string; free: string; plus: string; family: string }

export const COMPARE: CompareRow[] = [
  { id: 'goals', feature: 'Savings goals', free: '2', plus: 'Unlimited', family: 'Unlimited' },
  { id: 'rules', feature: 'Automation rules', free: '—', plus: '25', family: '50' },
  { id: 'members', feature: 'Members', free: '1', plus: '1', family: '6' },
  { id: 'cards', feature: 'Virtual cards', free: '1', plus: '5', family: '12' },
  { id: 'fx', feature: 'Currency exchange', free: '1% fee', plus: 'Free', family: 'Free' },
  { id: 'export', feature: 'CSV and PDF export', free: '—', plus: 'Yes', family: 'Yes' },
  { id: 'support', feature: 'Support', free: 'Email', plus: 'Chat', family: 'Priority chat' }
];

export const FAQ = [
  { id: 'safe', title: 'Is my money safe with Orbit?', content: 'Deposits are held with partner banks and protected up to $250,000. Bank links are read-only and you can freeze any card instantly.' },
  { id: 'cost', title: 'What does it cost?', content: 'Orbit is free forever for budgets, two goals and transfers. Plus and Family add automation, shared wallets and more goals.' },
  { id: 'cancel', title: 'Can I cancel any time?', content: 'Yes. Cancel from Settings in two taps; your plan runs until the end of the period you paid for.' },
  { id: 'banks', title: 'Which banks can I connect?', content: 'More than 12,000 banks and card issuers across 31 countries, including every major bank in the US, UK and EU.' },
  { id: 'switch', title: 'Can I switch plans later?', content: 'Upgrade or downgrade whenever you like. Changes apply immediately and are prorated.' }
];

export const TEAM = [
  { name: 'Ana Duarte', role: 'Co-founder & CEO' },
  { name: 'Kenji Watanabe', role: 'Co-founder & CTO' },
  { name: 'Fatima Zahra', role: 'Head of Design' },
  { name: 'Oliver Grant', role: 'Head of Risk' },
  { name: 'Priya Nair', role: 'Engineering Lead' },
  { name: 'Diego Alvarez', role: 'Customer Lead' },
  { name: 'Hannah Stone', role: 'Data Science' },
  { name: 'Samuel Osei', role: 'Mobile Lead' }
];

export const HISTORY = [
  { time: '2021', title: 'Founded in a Lisbon flat', description: 'Two friends, one shared spreadsheet that kept breaking.', tone: 'accent' as const },
  { time: '2022', title: 'First 10,000 savers', description: 'Round-ups launch and become the most-used feature.', tone: 'default' as const },
  { time: '2023', title: 'Series A and banking licence', description: 'Orbit opens accounts in 12 European countries.', tone: 'success' as const },
  { time: '2024', title: 'Shared wallets', description: 'Households and flatmates manage money together.', tone: 'default' as const },
  { time: '2025', title: '2 million people', description: 'Expansion to the US and Canada.', tone: 'success' as const }
];

export const VALUES = [
  { title: 'Calm over clever', description: 'No guilt, no gamified streaks. Just a clear picture.' },
  { title: 'Your data is yours', description: 'We never sell data. Export or delete it any time.' },
  { title: 'Fair pricing', description: 'No hidden FX markups, no surprise fees.' }
];

export interface Post { id: string; title: string; excerpt: string; category: string; tags: string[]; author: string; date: string; minutes: number }

export const POSTS: Post[] = [
  { id: 'p1', title: 'The 50/30/20 rule, rebuilt for 2025', excerpt: 'Why fixed percentages break when rent is half your income — and what to do instead.', category: 'Guides', tags: ['Budgeting'], author: 'Fatima Zahra', date: 'Mar 12', minutes: 6 },
  { id: 'p2', title: 'How round-ups saved our users $310M', excerpt: 'A look at the small, boring automation that quietly outperforms every challenge.', category: 'Company', tags: ['Saving', 'Product'], author: 'Ana Duarte', date: 'Mar 04', minutes: 4 },
  { id: 'p3', title: 'Splitting rent without splitting hairs', excerpt: 'Shared wallets, fair splits and the art of the flatmate group chat.', category: 'Guides', tags: ['Shared'], author: 'Diego Alvarez', date: 'Feb 26', minutes: 5 },
  { id: 'p4', title: 'Designing calm money software', excerpt: 'Notes from our design team on colour, motion and saying less.', category: 'Design', tags: ['Product'], author: 'Fatima Zahra', date: 'Feb 18', minutes: 8 },
  { id: 'p5', title: 'Emergency funds: how much is enough?', excerpt: 'Three months, six months, or something more personal? A practical answer.', category: 'Guides', tags: ['Saving'], author: 'Hannah Stone', date: 'Feb 09', minutes: 7 },
  { id: 'p6', title: 'Inside our fraud model', excerpt: 'How we stop card fraud in under 40 milliseconds without blocking your coffee.', category: 'Engineering', tags: ['Security'], author: 'Kenji Watanabe', date: 'Jan 30', minutes: 9 },
  { id: 'p7', title: 'Travel money without the markups', excerpt: 'Spend abroad at the real exchange rate and what that saves on a typical trip.', category: 'Guides', tags: ['Travel'], author: 'Lucía Moreno', date: 'Jan 21', minutes: 5 },
  { id: 'p8', title: 'Building Orbit for iOS and Android at once', excerpt: 'One component library, two platforms, and the design tokens that hold it together.', category: 'Engineering', tags: ['Product'], author: 'Samuel Osei', date: 'Jan 12', minutes: 10 },
  { id: 'p9', title: 'Kids, cards and pocket money', excerpt: 'Teaching money with real limits — what we learned from 40,000 families.', category: 'Company', tags: ['Family'], author: 'Oliver Grant', date: 'Jan 03', minutes: 6 }
];

export const BLOG_CATEGORIES = ['All', 'Guides', 'Company', 'Design', 'Engineering'];
export const BLOG_TAGS = ['Budgeting', 'Saving', 'Shared', 'Product', 'Security', 'Travel', 'Family'];

export const COUNTRIES = [
  'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Denmark', 'Finland', 'France', 'Germany', 'India', 'Ireland', 'Italy',
  'Japan', 'Mexico', 'Netherlands', 'New Zealand', 'Norway', 'Poland', 'Portugal', 'Singapore', 'Spain', 'Sweden', 'Switzerland',
  'United Kingdom', 'United States'
].map((c) => ({ value: c.toLowerCase().replace(/\s+/g, '-'), label: c }));

export const CURRENCIES = [
  { value: 'usd', label: 'US Dollar (USD)' },
  { value: 'eur', label: 'Euro (EUR)' },
  { value: 'gbp', label: 'British Pound (GBP)' },
  { value: 'jpy', label: 'Japanese Yen (JPY)' },
  { value: 'cad', label: 'Canadian Dollar (CAD)' },
  { value: 'aud', label: 'Australian Dollar (AUD)' }
];

/* ---------- Money data (shared by the site demo and the app) ---------- */

export const NET_WORTH = [
  { label: 'Jan', value: 8200 }, { label: 'Feb', value: 8650 }, { label: 'Mar', value: 9120 }, { label: 'Apr', value: 9040 },
  { label: 'May', value: 9780 }, { label: 'Jun', value: 10450 }, { label: 'Jul', value: 10990 }, { label: 'Aug', value: 11820 }
];

export const SPENDING_BY_MONTH = [
  { label: 'Mar', value: 2140 }, { label: 'Apr', value: 1980 }, { label: 'May', value: 2310 }, { label: 'Jun', value: 1870 },
  { label: 'Jul', value: 2050 }, { label: 'Aug', value: 1760 }
];

export const SPENDING_BY_DAY = [
  { label: 'M', value: 42 }, { label: 'T', value: 18 }, { label: 'W', value: 64 }, { label: 'T', value: 27 },
  { label: 'F', value: 96 }, { label: 'S', value: 120 }, { label: 'S', value: 38 }
];

export const CATEGORIES = [
  { label: 'Housing', value: 1150 },
  { label: 'Groceries', value: 340 },
  { label: 'Transport', value: 160 },
  { label: 'Eating out', value: 210 },
  { label: 'Fun', value: 120 }
];

export const SPARK = [12, 14, 13, 17, 16, 19, 18, 22, 21, 25, 24, 28];

export const SCATTER = [
  { x: 1, y: 12, label: 'Coffee · $4' }, { x: 2, y: 64, label: 'Groceries · $64' }, { x: 3, y: 8, label: 'Bus · $3' },
  { x: 5, y: 120, label: 'Dinner · $86' }, { x: 6, y: 34, label: 'Books · $34' }, { x: 8, y: 22, label: 'Lunch · $22' },
  { x: 9, y: 75, label: 'Shoes · $75' }, { x: 11, y: 14, label: 'Coffee · $5' }, { x: 13, y: 52, label: 'Groceries · $52' },
  { x: 15, y: 140, label: 'Concert · $140' }, { x: 17, y: 18, label: 'Taxi · $18' }, { x: 20, y: 46, label: 'Pharmacy · $46' },
  { x: 22, y: 9, label: 'Coffee · $4' }, { x: 24, y: 88, label: 'Utilities · $88' }, { x: 27, y: 30, label: 'Lunch · $30' }
].map((p) => ({ ...p, size: 4 + p.y / 25 }));

export interface Transaction { id: string; merchant: string; category: string; amount: number; date: string; status: 'Completed' | 'Pending' | 'Refunded' }

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', merchant: 'Green Grocer', category: 'Groceries', amount: -64.2, date: 'Today', status: 'Completed' },
  { id: 't2', merchant: 'Salary · Northwind', category: 'Income', amount: 3200, date: 'Today', status: 'Completed' },
  { id: 't3', merchant: 'Metro Card', category: 'Transport', amount: -30, date: 'Yesterday', status: 'Completed' },
  { id: 't4', merchant: 'Café Lumen', category: 'Eating out', amount: -4.6, date: 'Yesterday', status: 'Pending' },
  { id: 't5', merchant: 'Streamly', category: 'Fun', amount: -11.99, date: 'Aug 14', status: 'Completed' },
  { id: 't6', merchant: 'Rent · Lake St', category: 'Housing', amount: -1150, date: 'Aug 01', status: 'Completed' },
  { id: 't7', merchant: 'Sneaker Lab', category: 'Shopping', amount: 75, date: 'Jul 29', status: 'Refunded' },
  { id: 't8', merchant: 'Power & Light', category: 'Utilities', amount: -88.4, date: 'Jul 28', status: 'Completed' },
  { id: 't9', merchant: 'Book Nook', category: 'Fun', amount: -34, date: 'Jul 25', status: 'Completed' },
  { id: 't10', merchant: 'Ride Co', category: 'Transport', amount: -18.5, date: 'Jul 24', status: 'Completed' },
  { id: 't11', merchant: 'Green Grocer', category: 'Groceries', amount: -52.1, date: 'Jul 22', status: 'Completed' },
  { id: 't12', merchant: 'Gym Club', category: 'Health', amount: -39, date: 'Jul 20', status: 'Completed' }
];

export const money = (n: number, sign = false) => {
  const s = Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Math.abs(n) % 1 ? 2 : 0 });
  if (!sign) return n < 0 ? `-${s}` : s;
  return `${n < 0 ? '−' : '+'}${s}`;
};

export interface Goal { id: string; name: string; target: number; saved: number; due: string; category: string; members: string[] }

export const GOALS: Goal[] = [
  { id: 'japan', name: 'Japan trip', target: 4000, saved: 2760, due: 'Apr 2026', category: 'Travel', members: ['Sam Rivera', 'Alex Kim'] },
  { id: 'emergency', name: 'Emergency fund', target: 6000, saved: 4650, due: 'Dec 2025', category: 'Safety', members: ['Sam Rivera'] },
  { id: 'bike', name: 'New bike', target: 1200, saved: 380, due: 'Jun 2026', category: 'Things', members: ['Sam Rivera'] }
];

export const GOAL_HISTORY = [
  { label: 'Mar', value: 900 }, { label: 'Apr', value: 1250 }, { label: 'May', value: 1600 }, { label: 'Jun', value: 1980 },
  { label: 'Jul', value: 2380 }, { label: 'Aug', value: 2760 }
];

export const BUDGETS = [
  { label: 'Groceries', spent: 340, limit: 450 },
  { label: 'Eating out', spent: 210, limit: 220 },
  { label: 'Transport', spent: 160, limit: 250 },
  { label: 'Fun', spent: 120, limit: 100 }
];

/** Card designs the visitor can recolour; the colours are user data, not style tokens. */
export const CARDS = [
  { id: 'main', name: 'Everyday', last4: '4821', color: '#6d5efc' },
  { id: 'travel', name: 'Travel', last4: '0937', color: '#0f9b8e' },
  { id: 'virtual', name: 'Online only', last4: '5512', color: '#e2557a' }
];

export const OFFERS = [
  { id: 'o1', title: 'High-yield vault', text: '4.6% AER on easy-access savings', tag: 'Savings', badge: 'New' },
  { id: 'o2', title: 'Round-up boost', text: 'Multiply round-ups ×3 for a month', tag: 'Automation', badge: 'Popular' },
  { id: 'o3', title: 'Travel card', text: 'No FX fees in 150 countries', tag: 'Cards' },
  { id: 'o4', title: 'Bill split', text: 'Split any bill with friends in two taps', tag: 'Shared' },
  { id: 'o5', title: 'Green pot', text: 'Savings invested in climate projects', tag: 'Savings' },
  { id: 'o6', title: 'Salary early', text: 'Get paid up to two days sooner', tag: 'Banking', badge: 'Plus' },
  { id: 'o7', title: 'Kids card', text: 'Pocket money with parental limits', tag: 'Cards' }
];

export const OFFER_TAGS = ['Savings', 'Automation', 'Cards', 'Shared', 'Banking'];

export const ACTIVITY = [
  { user: 'Alex Kim', action: 'added $50 to', target: 'Japan trip', time: '2m' },
  { user: 'Sam Rivera', action: 'paid', target: 'Green Grocer', time: '1h' },
  { user: 'Orbit', action: 'rounded up $3.40 to', target: 'Emergency fund', time: '3h' },
  { user: 'Maya Chen', action: 'split dinner with you', target: '$43.00', time: 'Yesterday' }
];

export const CHATS = [
  { id: 'support', name: 'Orbit Support', last: 'Your new card is on the way 🎉', time: '09:41', unread: 2, online: true },
  { id: 'alex', name: 'Alex Kim', last: 'Sent you $24 for the tickets', time: '08:12', unread: 1, online: true },
  { id: 'maya', name: 'Maya Chen', last: 'Voice message · 0:14', time: 'Yesterday', unread: 0, online: false },
  { id: 'flat', name: 'Flat 4B wallet', last: 'Jordan: rent is in!', time: 'Mon', unread: 0, online: false },
  { id: 'jordan', name: 'Jordan Okafor', last: 'Thanks for covering lunch', time: 'Sun', unread: 0, online: false }
];

export const WAVE = Array.from({ length: 44 }, (_, i) => 0.18 + Math.abs(Math.sin(i * 0.62) * Math.cos(i * 0.21)) * 0.8);

export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'ja', label: '日本語' }
];

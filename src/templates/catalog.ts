/**
 * Every library component a template can use, with how to find it in a rendered
 * screen. The Templates page uses this to list (and highlight) what a screen is
 * built from; the coverage test uses `name` to check each family uses them all.
 */

export type CatalogGroup = 'Actions' | 'Forms' | 'Navigation' | 'Feedback' | 'Overlays' | 'Data display' | 'Charts & graphics' | 'Content' | 'Mobile';

export interface CatalogEntry {
  /** Exported component name. */
  name: string;
  group: CatalogGroup;
  /** Matches one element per rendered instance. */
  selector: string;
  /** Highlight this ancestor instead of the matched element. */
  root?: string;
  /** Source pattern that proves a template uses it (defaults to `<Name`). */
  usage?: RegExp;
}

export const COMPONENT_CATALOG: CatalogEntry[] = [
  { name: 'Button', group: 'Actions', selector: '.ui-button' },

  { name: 'Input', group: 'Forms', selector: '.ui-input-container', root: '.ui-input-wrapper' },
  { name: 'Textarea', group: 'Forms', selector: 'textarea.ui-textarea', root: '.ui-input-wrapper' },
  { name: 'Checkbox', group: 'Forms', selector: '.ui-check:not(.ui-check--radio)' },
  { name: 'Radio', group: 'Forms', selector: '.ui-check--radio' },
  { name: 'Toggle', group: 'Forms', selector: '.ui-toggle' },
  { name: 'Slider', group: 'Forms', selector: '.ui-slider' },
  { name: 'Segmented', group: 'Forms', selector: '.ui-segmented' },
  { name: 'Select', group: 'Forms', selector: '.ui-select__value', root: '.ui-select' },
  { name: 'MultiSelect', group: 'Forms', selector: '.ui-select__chips', root: '.ui-select' },
  { name: 'Combobox', group: 'Forms', selector: '.ui-combobox' },
  { name: 'ColorPicker', group: 'Forms', selector: '.ui-color' },
  { name: 'PinInput', group: 'Forms', selector: '.ui-pin' },

  { name: 'Navbar', group: 'Navigation', selector: '.ui-navbar' },
  { name: 'SideNav', group: 'Navigation', selector: '.ui-sidenav' },
  { name: 'Tabs', group: 'Navigation', selector: '.ui-tabs' },
  { name: 'Breadcrumbs', group: 'Navigation', selector: '.ui-breadcrumbs' },
  { name: 'Pagination', group: 'Navigation', selector: '.ui-pagination' },
  { name: 'Stepper', group: 'Navigation', selector: '.ui-stepper' },

  { name: 'Alert', group: 'Feedback', selector: '.ui-alert' },
  { name: 'Toast', group: 'Feedback', selector: '.ui-toast', usage: /\btoast\(\{/ },
  { name: 'Progress', group: 'Feedback', selector: '.ui-progress' },
  { name: 'ProgressRing', group: 'Feedback', selector: '.ui-ring' },
  { name: 'Skeleton', group: 'Feedback', selector: '.ui-skeleton' },
  { name: 'Spinner', group: 'Feedback', selector: '.ui-spinner' },
  { name: 'EmptyState', group: 'Feedback', selector: '.ui-empty' },
  { name: 'NotificationCenter', group: 'Feedback', selector: '.ui-notifications__bell, .ui-notifications', root: '.ui-popover-host' },

  { name: 'Modal', group: 'Overlays', selector: '.ui-modal' },
  { name: 'Drawer', group: 'Overlays', selector: '.ui-drawer' },
  { name: 'Tooltip', group: 'Overlays', selector: '.ui-tooltip-host' },
  { name: 'Popover', group: 'Overlays', selector: '.ui-popover-host' },
  { name: 'DropdownMenu', group: 'Overlays', selector: '.ui-menu-host' },
  { name: 'ContextMenu', group: 'Overlays', selector: '.ui-context-host' },

  { name: 'Card', group: 'Data display', selector: '.ui-card' },
  { name: 'Badge', group: 'Data display', selector: '.ui-badge' },
  { name: 'Avatar', group: 'Data display', selector: '.ui-avatar:not(.ui-avatar--more)' },
  { name: 'AvatarGroup', group: 'Data display', selector: '.ui-avatar-group' },
  { name: 'List', group: 'Data display', selector: '.ui-list' },
  { name: 'Timeline', group: 'Data display', selector: '.ui-timeline' },
  { name: 'ActivityFeed', group: 'Data display', selector: '.ui-activity' },
  { name: 'Stat', group: 'Data display', selector: '.ui-stat' },
  { name: 'DataTable', group: 'Data display', selector: '.ui-table-wrap' },

  { name: 'LineChart', group: 'Charts & graphics', selector: 'svg[aria-label^="Line chart"]', root: '.ui-chart-container' },
  { name: 'BarChart', group: 'Charts & graphics', selector: 'svg[aria-label^="Bar chart"]', root: '.ui-chart-container' },
  { name: 'DonutChart', group: 'Charts & graphics', selector: 'svg[aria-label="Donut chart"], svg[aria-label="Pie chart"]', root: '.ui-chart-container' },
  { name: 'RadialChart', group: 'Charts & graphics', selector: 'svg[aria-label="Radial chart"]', root: '.ui-chart-container' },
  { name: 'Sparkline', group: 'Charts & graphics', selector: '.ui-sparkline' },
  { name: 'ScatterChart', group: 'Charts & graphics', selector: 'svg[aria-label="Scatter chart"]', root: '.ui-chart-container' },
  { name: 'Waveform', group: 'Charts & graphics', selector: 'svg[aria-label="Waveform"]', root: '.ui-chart-container' },
  { name: 'Backdrop', group: 'Charts & graphics', selector: '.ui-backdrop' },

  { name: 'Accordion', group: 'Content', selector: '.ui-accordion' },
  { name: 'Chip', group: 'Content', selector: '.ui-chip' },
  { name: 'Carousel', group: 'Content', selector: '.ui-carousel' },
  { name: 'Rating', group: 'Content', selector: '.ui-rating' },
  { name: 'PricingCard', group: 'Content', selector: '.ui-pricing' },
  { name: 'Testimonial', group: 'Content', selector: '.ui-testimonial' },

  { name: 'StatusBar', group: 'Mobile', selector: '.ui-statusbar' },
  { name: 'AppBar', group: 'Mobile', selector: '.ui-appbar' },
  { name: 'TabBar', group: 'Mobile', selector: '.ui-tabbar' },
  { name: 'ChatBubble', group: 'Mobile', selector: '.ui-chat' }
];

export interface ScreenComponentUse {
  entry: CatalogEntry;
  elements: HTMLElement[];
}

/** Which catalog components are rendered inside `root`, with their elements. */
export function scanComponents(root: ParentNode): ScreenComponentUse[] {
  const found: ScreenComponentUse[] = [];
  for (const entry of COMPONENT_CATALOG) {
    const seen = new Set<HTMLElement>();
    root.querySelectorAll<HTMLElement>(entry.selector).forEach((el) => {
      const target = entry.root ? el.closest<HTMLElement>(entry.root) ?? el : el;
      seen.add(target);
    });
    if (seen.size > 0) found.push({ entry, elements: [...seen] });
  }
  return found;
}

/** Components a screen can open on interaction, declared with data-opens on the trigger. */
export function scanOpeners(root: ParentNode): string[] {
  const names = new Set<string>();
  root.querySelectorAll<HTMLElement>('[data-opens]').forEach((el) => {
    (el.dataset.opens ?? '').split(/[\s,]+/).filter(Boolean).forEach((n) => names.add(n));
  });
  return [...names];
}

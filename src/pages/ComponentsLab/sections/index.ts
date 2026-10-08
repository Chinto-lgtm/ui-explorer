import { lazy } from 'react';
import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Palette, MousePointerClick, TextCursorInput, CheckSquare, Compass, BellRing, Layers, LayoutPanelTop, Tag, ListTree,
  ChartColumn, Megaphone, Smartphone, Zap, Gem, Shapes, PenTool, Table2, Bell
} from 'lucide-react';
import type { SectionProps } from './types';
import { FoundationsSection } from './FoundationsSection';
import { ButtonsSection } from './ButtonsSection';
import { InputsSection } from './InputsSection';
import { SelectionSection } from './SelectionSection';
import { NavigationSection } from './NavigationSection';
import { FeedbackSection } from './FeedbackSection';
import { OverlaysSection } from './OverlaysSection';
import { CardsSection, BadgesSection, ListsSection } from './DataSection';
import { ContentSection } from './ContentSection';
import { MobileSection } from './MobileSection';
import { ChartsLab } from '../labs/ChartsLab';
import { TableLab } from '../labs/TableLab';
import { NotificationsLab } from '../labs/NotificationsLab';
import { MotionLab } from '../labs/MotionLab';
import { MaterialLab } from '../labs/MaterialLab';
import { SvgLab } from '../labs/SvgLab';

// The icon section pulls in the whole icon set; keep it out of the page chunk until it is opened.
const IconLab = lazy(() => import('../labs/IconLab').then((m) => ({ default: m.IconLab })));

export type SectionGroup = 'Foundations' | 'Components' | 'Data';

export interface LabSection {
  /** The URL segment: /components/<id>. */
  id: string;
  label: string;
  group: SectionGroup;
  icon: LucideIcon;
  /** One line shown above the preview. */
  blurb: string;
  /** Component names and synonyms so search finds the right section. */
  keywords: string[];
  /** Deep dives bring their own settings into the sidebar. */
  hasSettings?: boolean;
  Component: ComponentType<SectionProps>;
}

/** Every section of the Components page, in display order. The single list the page, its URLs and search read. */
export const LAB_SECTIONS: LabSection[] = [
  { id: 'foundations', label: 'Tokens', group: 'Foundations', icon: Palette, blurb: 'Colours, type scale, spacing, radius, elevation, borders and motion values of the style.', keywords: ['colors', 'typography', 'spacing', 'radius', 'shadows', 'borders', 'surfaces', 'tokens', 'foundations'], Component: FoundationsSection },
  { id: 'motion', label: 'Motion', group: 'Foundations', icon: Zap, blurb: 'Tune duration, easing, scale and translation across real interactions.', keywords: ['motion', 'animation', 'easing', 'duration', 'transition'], hasSettings: true, Component: MotionLab },
  { id: 'material', label: 'Material', group: 'Foundations', icon: Gem, blurb: 'Fourteen surface materials with highlight, shadow, reflection, texture, blur and transparency.', keywords: ['material', 'surface', 'glass', 'blur', 'texture'], hasSettings: true, Component: MaterialLab },
  { id: 'icons', label: 'Icons', group: 'Foundations', icon: Shapes, blurb: 'Icon styles from outline to pixel, inside buttons, navigation, cards and inputs.', keywords: ['icons', 'icon style', 'stroke', 'pixel', 'duotone'], hasSettings: true, Component: IconLab },
  { id: 'svg', label: 'SVG art', group: 'Foundations', icon: PenTool, blurb: 'Procedural decorative art: mesh, aurora, grid, blobs, waves, rings, glow, noise, liquid, chrome.', keywords: ['svg', 'backdrop', 'decoration', 'mesh', 'aurora', 'pattern'], hasSettings: true, Component: SvgLab },

  { id: 'buttons', label: 'Buttons', group: 'Components', icon: MousePointerClick, blurb: 'Every variant, size and state, including loading, success and error.', keywords: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'icon', 'floating', 'loading', 'dropdown button', 'states'], Component: ButtonsSection },
  { id: 'inputs', label: 'Inputs', group: 'Components', icon: TextCursorInput, blurb: 'Text fields with icons, validation and every state.', keywords: ['text', 'search', 'password', 'number', 'date', 'textarea', 'url', 'email', 'error', 'read-only', 'disabled'], Component: InputsSection },
  { id: 'selection', label: 'Selection', group: 'Components', icon: CheckSquare, blurb: 'Checkboxes, radios, switches, sliders, segmented controls and selects.', keywords: ['checkbox', 'radio', 'toggle', 'switch', 'slider', 'segmented control', 'select', 'multi-select', 'combobox'], Component: SelectionSection },
  { id: 'navigation', label: 'Navigation', group: 'Components', icon: Compass, blurb: 'Navbar, side navigation, tabs, breadcrumbs, pagination and steppers.', keywords: ['navbar', 'sidebar', 'tabs', 'breadcrumbs', 'pagination', 'stepper'], Component: NavigationSection },
  { id: 'feedback', label: 'Feedback', group: 'Components', icon: BellRing, blurb: 'Toasts, alerts, progress, skeletons, spinners and empty states.', keywords: ['toast', 'notification', 'alert', 'progress', 'circular progress', 'ring', 'skeleton', 'spinner', 'loading', 'empty state'], Component: FeedbackSection },
  { id: 'overlays', label: 'Overlays', group: 'Components', icon: Layers, blurb: 'Modals, drawers, tooltips, popovers and menus that carry the frame’s style.', keywords: ['modal', 'dialog', 'drawer', 'tooltip', 'popover', 'context menu', 'menu', 'bottom sheet'], Component: OverlaysSection },
  { id: 'cards', label: 'Cards', group: 'Components', icon: LayoutPanelTop, blurb: 'Card variants, stat tiles and cards with actions.', keywords: ['card', 'container', 'stat', 'elevated', 'outlined', 'flat'], Component: CardsSection },
  { id: 'badges', label: 'Badges & avatars', group: 'Components', icon: Tag, blurb: 'Status badges, avatars and avatar groups.', keywords: ['badge', 'status', 'tag', 'avatar', 'avatar group'], Component: BadgesSection },
  { id: 'lists', label: 'Lists & timeline', group: 'Components', icon: ListTree, blurb: 'Lists, timelines and activity feeds.', keywords: ['list', 'timeline', 'activity feed'], Component: ListsSection },
  { id: 'content', label: 'Content & marketing', group: 'Components', icon: Megaphone, blurb: 'Accordions, chips, carousels, ratings, pricing cards and testimonials.', keywords: ['accordion', 'faq', 'chip', 'filter chip', 'tag', 'carousel', 'rating', 'stars', 'pricing card', 'testimonial', 'quote'], Component: ContentSection },
  { id: 'mobile', label: 'Mobile patterns', group: 'Components', icon: Smartphone, blurb: 'Status bar, app bars, tab bars, chat bubbles, code input and bottom sheets.', keywords: ['status bar', 'app bar', 'top bar', 'tab bar', 'bottom navigation', 'chat', 'message bubble', 'pin', 'otp', 'verification code', 'bottom sheet'], Component: MobileSection },

  { id: 'charts', label: 'Charts', group: 'Data', icon: ChartColumn, blurb: 'Ten chart types that follow the style: curves, glow, corner language and colours.', keywords: ['line chart', 'bar chart', 'area', 'donut', 'radial', 'scatter', 'sparkline', 'waveform', 'data visualization'], hasSettings: true, Component: ChartsLab },
  { id: 'table', label: 'Table', group: 'Data', icon: Table2, blurb: 'Search, sort, filter, paginate, select, hide columns, row actions and every state.', keywords: ['table', 'data table', 'grid', 'rows', 'sort', 'filter', 'pagination'], hasSettings: true, Component: TableLab },
  { id: 'notifications', label: 'Notifications', group: 'Data', icon: Bell, blurb: 'A notification centre with read state, counters, actions and a bell popover.', keywords: ['notifications', 'inbox', 'bell', 'unread'], hasSettings: true, Component: NotificationsLab }
];

export const SECTION_GROUPS: SectionGroup[] = ['Foundations', 'Components', 'Data'];

export const DEFAULT_SECTION = 'buttons';

export const sectionById = (id: string | undefined) => LAB_SECTIONS.find((s) => s.id === id);

import type { ComponentType } from 'react';
import type { SectionProps } from './types';
import { FoundationsSection } from './FoundationsSection';
import { ButtonsSection } from './ButtonsSection';
import { InputsSection } from './InputsSection';
import { SelectionSection } from './SelectionSection';
import { NavigationSection } from './NavigationSection';
import { FeedbackSection } from './FeedbackSection';
import { OverlaysSection } from './OverlaysSection';
import { CardsSection, BadgesSection, ListsSection, ChartsSection } from './DataSection';

export interface LabSection {
  id: string;
  label: string;
  /** Component names and synonyms so search finds the right section. */
  keywords: string[];
  Component: ComponentType<SectionProps>;
}

export const LAB_SECTIONS: LabSection[] = [
  { id: 'foundations', label: 'Foundations', keywords: ['colors', 'typography', 'spacing', 'radius', 'shadows', 'borders', 'surfaces', 'icons', 'motion', 'tokens'], Component: FoundationsSection },
  { id: 'buttons', label: 'Buttons', keywords: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'icon', 'floating', 'loading', 'dropdown button', 'states'], Component: ButtonsSection },
  { id: 'inputs', label: 'Inputs', keywords: ['text', 'search', 'password', 'number', 'date', 'textarea', 'url', 'email', 'error', 'read-only', 'disabled'], Component: InputsSection },
  { id: 'selection', label: 'Selection', keywords: ['checkbox', 'radio', 'toggle', 'switch', 'slider', 'segmented control', 'select', 'multi-select', 'combobox'], Component: SelectionSection },
  { id: 'navigation', label: 'Navigation', keywords: ['navbar', 'sidebar', 'tabs', 'breadcrumbs', 'pagination', 'stepper'], Component: NavigationSection },
  { id: 'feedback', label: 'Feedback', keywords: ['toast', 'notification', 'alert', 'progress', 'circular progress', 'ring', 'skeleton', 'spinner', 'loading', 'empty state'], Component: FeedbackSection },
  { id: 'overlays', label: 'Overlays', keywords: ['modal', 'dialog', 'drawer', 'tooltip', 'popover', 'context menu', 'menu'], Component: OverlaysSection },
  { id: 'cards', label: 'Cards', keywords: ['card', 'container', 'stat', 'elevated', 'outlined', 'flat'], Component: CardsSection },
  { id: 'badges', label: 'Badges & avatars', keywords: ['badge', 'status', 'tag', 'avatar', 'avatar group'], Component: BadgesSection },
  { id: 'lists', label: 'Lists & timeline', keywords: ['list', 'timeline', 'activity feed'], Component: ListsSection },
  { id: 'charts', label: 'Charts', keywords: ['line chart', 'bar chart', 'data visualization', 'svg'], Component: ChartsSection }
];

/**
 * UI Explorer — Style completeness checker
 * A development indicator (not a public ranking): which systems a style
 * defines and how deep its component coverage goes.
 */

import type { StyleDefinition } from './types';

export interface CompletenessCheck {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

export interface CompletenessReport {
  checks: CompletenessCheck[];
  /** 0..100: share of optional depth fields present. */
  componentDepth: number;
  /** Number of required systems present out of total. */
  score: string;
}

export function checkStyleCompleteness(style: StyleDefinition): CompletenessReport {
  const t = style.tokens;
  const has = (v: unknown) => v !== undefined && v !== null && v !== '';
  const checks: CompletenessCheck[] = [
    { id: 'typography', label: 'Typography', ok: has(t.typography?.fontFamilySans) && has(t.typography?.fontSizeBase), detail: has(t.typography?.fontFamilyHeading) ? 'heading + body families' : 'single family' },
    { id: 'color', label: 'Color system', ok: has(t.colors?.bg) && has(t.colors?.accent) && has(t.colors?.textPrimary), detail: [t.colors?.success, t.colors?.warning, t.colors?.error, t.colors?.info].filter(has).length + '/4 semantic colours' },
    { id: 'surface', label: 'Surface system', ok: has(t.materials), detail: t.materials ? `blur ${t.materials.backdropBlur ?? '0px'}, texture ${t.materials.texture ?? 'none'}` : 'no materials block' },
    { id: 'depth', label: 'Depth system', ok: has(t.shadows?.md), detail: [t.shadows?.inset, t.shadows?.glow].filter(has).length + '/2 special shadows' },
    { id: 'borders', label: 'Borders', ok: has(t.borders?.width), detail: `${t.borders?.width ?? '?'} ${t.borders?.style ?? ''}` },
    { id: 'radius', label: 'Radius', ok: has(t.radii?.md), detail: has(t.radii?.xl) ? 'sm/md/lg/xl/full' : 'sm/md/lg/full' },
    { id: 'motion', label: 'Motion', ok: has(t.motion?.durationNormal) && has(t.motion?.easing), detail: has(t.motion?.hoverScale) ? 'with hover/press scale' : 'durations + easing' },
    { id: 'icons', label: 'Icons', ok: has(t.icons), detail: t.icons ? `${t.icons.styleVariant}, stroke ${t.icons.strokeWidth}` : 'defaults' },
    { id: 'behavior', label: 'Components', ok: has(style.behavior), detail: style.behavior ? `${style.behavior.buttonHoverAction} hover, ${style.behavior.cardElevationType} cards` : 'default behaviour' },
    { id: 'svg', label: 'SVG language', ok: has(style.svgLanguage), detail: style.svgLanguage ? `${style.svgLanguage.cornerStyle} corners${style.svgLanguage.patternOverlay ? `, ${style.svgLanguage.patternOverlay}` : ''}` : 'defaults' },
    { id: 'docs', label: 'Documentation', ok: has(style.metadata.description) && (style.metadata.bestUsedFor?.length ?? 0) > 0, detail: [style.metadata.history, style.metadata.visualCharacter, style.metadata.avoidWhen?.length, style.metadata.relatedStyles?.length].filter(Boolean).length + '/4 extended fields' }
  ];

  const depthFields = [
    t.typography?.fontFamilyHeading, t.typography?.fontFamilyMono, t.colors?.surfaceHover, t.colors?.surfaceActive, t.colors?.borderHover,
    t.colors?.accentText, t.colors?.success, t.colors?.warning, t.colors?.error, t.colors?.info, t.colors?.shadowColor, t.colors?.glowColor,
    t.radii?.xl, t.shadows?.inset, t.shadows?.glow, t.shadows?.colored, t.borders?.opacity, t.motion?.hoverScale, t.motion?.activeScale,
    t.materials?.backdropBlur, t.materials?.texture, t.materials?.gradient, t.icons, style.behavior, style.svgLanguage,
    style.metadata.history, style.metadata.visualCharacter, style.metadata.avoidWhen, style.metadata.relatedStyles
  ];
  const present = depthFields.filter(has).length;
  const componentDepth = Math.round((present / depthFields.length) * 100);
  const okCount = checks.filter((c) => c.ok).length;
  return { checks, componentDepth, score: `${okCount}/${checks.length}` };
}

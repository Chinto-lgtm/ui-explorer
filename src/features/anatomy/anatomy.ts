/**
 * UI Explorer — Style Anatomy model
 * Groups a style's resolved tokens into the eight anatomy sections with
 * human-readable values and a CSS selector describing where each property shows up.
 */

import type { StyleDefinition } from '../../engine/types';
import { deriveRecipeFromStyle } from '../../engine/generator/generator';
import { contrastRatio } from '../../engine/color';

export interface AnatomyProperty {
  label: string;
  value: string;
  /** CSS custom property backing this value, when there is one. */
  token?: string;
  /** Colour swatch to render. */
  swatch?: string;
  /** Selector (inside a themed container) of elements this property shapes. */
  appliesTo?: string;
  note?: string;
  tone?: 'ok' | 'warn' | 'fail';
}

export interface AnatomySection {
  id: string;
  title: string;
  properties: AnatomyProperty[];
}

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const font = (stack: string) => stack.split(',')[0].trim();

export function buildAnatomy(style: StyleDefinition, vars: Record<string, string>): AnatomySection[] {
  const t = style.tokens;
  const recipe = deriveRecipeFromStyle(style);
  const c = t.colors;
  const textRatio = contrastRatio(c.textPrimary, c.bg);
  const mutedRatio = contrastRatio(c.textSecondary, c.surface);
  const accentRatio = contrastRatio(c.accentText ?? '#ffffff', c.accent);
  const tone = (r: number | null, large = false) => (r === null ? undefined : r >= (large ? 3 : 4.5) ? 'ok' : r >= 3 ? 'warn' : 'fail');
  const wcag = (r: number | null) => (r === null ? '' : r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large' : 'fails AA');

  return [
    {
      id: 'typography', title: 'Typography',
      properties: [
        { label: 'Heading family', value: font(t.typography.fontFamilyHeading ?? t.typography.fontFamilySans), token: '--font-family-heading', appliesTo: '.ui-card__title, h1, h2, h3' },
        { label: 'Body family', value: font(t.typography.fontFamilySans), token: '--font-family-sans', appliesTo: '.ui-button, .ui-input, p' },
        { label: 'Heading weight', value: String(t.typography.fontWeightBold), token: '--font-weight-bold', appliesTo: '.ui-card__title' },
        { label: 'Body weight', value: String(t.typography.fontWeightNormal), token: '--font-weight-normal', appliesTo: 'p' },
        { label: 'Letter spacing', value: t.typography.letterSpacing, token: '--letter-spacing', appliesTo: '.ui-button' },
        { label: 'Line height', value: t.typography.lineHeight, token: '--line-height', appliesTo: 'p' },
        { label: 'Type scale', value: `${t.typography.fontSizeXs} → ${t.typography.fontSize3xl}`, token: '--font-size-base', note: `${recipe.typography.scale} scale` }
      ]
    },
    {
      id: 'color', title: 'Color',
      properties: [
        { label: 'Background', value: c.bg, token: '--color-bg', swatch: c.bg, appliesTo: '.style-preview-canvas, .lab-device__screen' },
        { label: 'Surface', value: c.surface, token: '--color-surface', swatch: c.surface, appliesTo: '.ui-card' },
        { label: 'Primary', value: c.accent, token: '--color-accent', swatch: c.accent, appliesTo: '.ui-button--primary, .ui-badge--accent' },
        { label: 'Secondary', value: c.accentHover, token: '--color-accent-hover', swatch: c.accentHover, appliesTo: '.ui-button--primary' },
        { label: 'Accent text', value: c.accentText ?? '#ffffff', token: '--color-accent-text', swatch: c.accentText ?? '#ffffff', appliesTo: '.ui-button--primary', note: accentRatio ? `${accentRatio}:1 on primary · ${wcag(accentRatio)}` : undefined, tone: tone(accentRatio) },
        { label: 'Text', value: c.textPrimary, token: '--color-text-primary', swatch: c.textPrimary, appliesTo: '.ui-card__title, p', note: textRatio ? `${textRatio}:1 on background · ${wcag(textRatio)}` : undefined, tone: tone(textRatio) },
        { label: 'Muted', value: c.textSecondary, token: '--color-text-secondary', swatch: c.textSecondary, appliesTo: '.ui-input-label, .ui-card__body', note: mutedRatio ? `${mutedRatio}:1 on surface · ${wcag(mutedRatio)}` : undefined, tone: tone(mutedRatio) },
        { label: 'Border', value: c.border, token: '--color-border', swatch: c.border, appliesTo: '.ui-card, .ui-input' },
        { label: 'Success', value: c.success ?? '#10b981', token: '--color-success', swatch: c.success ?? '#10b981', appliesTo: '.ui-badge--success, .ui-button--success' },
        { label: 'Warning', value: c.warning ?? '#f59e0b', token: '--color-warning', swatch: c.warning ?? '#f59e0b', appliesTo: '.ui-badge--warning' },
        { label: 'Error', value: c.error ?? '#ef4444', token: '--color-error', swatch: c.error ?? '#ef4444', appliesTo: '.ui-badge--error, .ui-button--destructive' },
        { label: 'Info', value: c.info ?? '#3b82f6', token: '--color-info', swatch: c.info ?? '#3b82f6', appliesTo: '.ui-alert--info' }
      ]
    },
    {
      id: 'surface', title: 'Surface',
      properties: [
        { label: 'Material', value: title(recipe.surface), appliesTo: '.ui-card' },
        { label: 'Opacity', value: `${Math.round((t.materials?.opacity ?? 1) * 100)}%`, token: '--material-opacity', appliesTo: '.ui-card' },
        { label: 'Blur', value: t.materials?.backdropBlur ?? '0px', token: '--backdrop-blur', appliesTo: '.ui-card' },
        { label: 'Elevation', value: title(recipe.depth), appliesTo: '.ui-card' },
        { label: 'Texture', value: t.materials?.texture ?? 'none', appliesTo: '.style-preview-canvas' },
        { label: 'Gradient', value: t.materials?.gradient ? 'yes' : 'none', token: '--material-gradient', appliesTo: '.ui-card' }
      ]
    },
    {
      id: 'depth', title: 'Depth',
      properties: [
        { label: 'Shadow', value: t.shadows.md, token: '--shadow-md', appliesTo: '.ui-card, .ui-button--primary' },
        { label: 'Inner shadow', value: t.shadows.inset ?? 'none', token: '--shadow-inset', appliesTo: '.ui-input' },
        { label: 'Glow', value: t.shadows.glow ?? 'none', token: '--shadow-glow', appliesTo: '.ui-button--primary' },
        { label: 'Offset / large', value: t.shadows.lg, token: '--shadow-lg', appliesTo: '.ui-card--elevated, .ui-button--floating' },
        { label: 'Elevation type', value: style.behavior?.cardElevationType ?? 'shadow', appliesTo: '.ui-card' }
      ]
    },
    {
      id: 'geometry', title: 'Geometry',
      properties: [
        { label: 'Radius', value: `${t.radii.sm} / ${t.radii.md} / ${t.radii.lg}`, token: '--radius-md', appliesTo: '.ui-button, .ui-input, .ui-card' },
        { label: 'Border width', value: `${t.borders.width} ${t.borders.style}`, token: '--border-width', appliesTo: '.ui-card, .ui-input, .ui-button' },
        { label: 'Component density', value: `${t.materials?.density ?? 1}×`, token: '--density-scale', appliesTo: '.ui-card, .ui-button' },
        { label: 'Spacing scale', value: `${t.typography.fontSizeBase} base · ${recipe.density}`, appliesTo: '.ui-card' }
      ]
    },
    {
      id: 'motion', title: 'Motion',
      properties: [
        { label: 'Duration', value: `${t.motion.durationFast} / ${t.motion.durationNormal} / ${t.motion.durationSlow}`, token: '--duration-normal', appliesTo: '.ui-button, .ui-card' },
        { label: 'Easing', value: t.motion.easing, token: '--motion-easing', appliesTo: '.ui-button' },
        { label: 'Hover movement', value: `${style.behavior?.buttonHoverAction ?? 'lift'} · scale ${t.motion.hoverScale ?? 1.02}`, token: '--hover-scale', appliesTo: '.ui-button' },
        { label: 'Press movement', value: `scale ${t.motion.activeScale ?? 0.98}`, token: '--active-scale', appliesTo: '.ui-button' },
        { label: 'Entrance animation', value: title(recipe.behavior), appliesTo: '.ui-modal, .ui-toast' }
      ]
    },
    {
      id: 'iconography', title: 'Iconography',
      properties: [
        { label: 'Stroke', value: `${t.icons?.strokeWidth ?? 2}px`, token: '--icon-stroke-width', appliesTo: '.ui-button__icon' },
        { label: 'Fill', value: t.icons?.filled ? 'filled' : 'outline' },
        { label: 'Corner treatment', value: t.icons?.styleVariant ?? 'outline' },
        { label: 'Icon scale', value: `${t.typography.fontSizeBase} relative` },
        { label: 'Icon personality', value: title(recipe.icons) }
      ]
    },
    {
      id: 'svg', title: 'SVG language',
      properties: [
        { label: 'Gradient', value: recipe.svg.gradientType },
        { label: 'Glow', value: `${Math.round(recipe.svg.glowLevel * 100)}%` },
        { label: 'Noise', value: `${Math.round(recipe.svg.noiseLevel * 100)}%` },
        { label: 'Mesh / grid', value: `${Math.round(recipe.svg.gridLevel * 100)}%` },
        { label: 'Shape language', value: `${recipe.svg.shapeLanguage} · corners ${style.svgLanguage?.cornerStyle ?? 'rounded'}`, token: '--svg-corner-style', appliesTo: '.ui-chart-line, .ui-chart-bar' },
        { label: 'Stroke style', value: recipe.svg.strokeLanguage }
      ]
    }
  ].map((section) => ({
    ...section,
    properties: section.properties.map((p) => (p.token && vars[p.token] !== undefined && !p.value ? { ...p, value: vars[p.token] } : p))
  }));
}

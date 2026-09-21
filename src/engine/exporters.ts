/**
 * UI Explorer — Export formats
 * Deterministic serialisations of a style: the same definition always
 * produces byte-identical output.
 *
 *   tokens   semantic design tokens (color.background, radius.md, motion.fast …)
 *   css      :root custom properties as the engine resolves them (--color-*, --radius-* …)
 *   theme    a complete stylesheet: the variables plus base rules for common elements
 *   svg      the token-rendered preview
 *   package  the StyleDefinition itself (what the app imports)
 */

import type { StyleDefinition } from './types';
import { resolveStyleToCssVars } from './resolver';
import { renderStylePreviewSvg } from './preview';

export type ExportFormat = 'tokens' | 'css' | 'theme' | 'svg' | 'package';

export const EXPORT_FORMATS: { id: ExportFormat; label: string; ext: string; mime: string; hint: string }[] = [
  { id: 'tokens', label: 'Design tokens', ext: 'tokens.json', mime: 'application/json', hint: 'Semantic token tree — color.background, radius.md, motion.fast' },
  { id: 'css', label: 'CSS variables', ext: 'css', mime: 'text/css', hint: ':root custom properties exactly as the engine resolves them' },
  { id: 'theme', label: 'Theme CSS', ext: 'theme.css', mime: 'text/css', hint: 'Variables plus base rules for body, headings, links, buttons, inputs, cards' },
  { id: 'svg', label: 'Preview SVG', ext: 'svg', mime: 'image/svg+xml', hint: 'A miniature interface rendered from the tokens' },
  { id: 'package', label: 'Style package', ext: 'json', mime: 'application/json', hint: 'The full StyleDefinition — importable here and valid for styles/community' }
];

/** Semantic token tree in a predictable, tool-friendly shape. */
export function exportSemanticTokens(style: StyleDefinition): Record<string, unknown> {
  const t = style.tokens;
  const c = t.colors;
  const ty = t.typography;
  const tokens = {
    $name: style.metadata.name,
    $description: style.metadata.description,
    color: {
      background: c.bg,
      surface: c.surface,
      'surface.hover': c.surfaceHover ?? c.surface,
      'surface.active': c.surfaceActive ?? c.surfaceHover ?? c.surface,
      text: c.textPrimary,
      textMuted: c.textSecondary,
      textSubtle: c.textTertiary,
      border: c.border,
      'border.hover': c.borderHover ?? c.accent,
      primary: c.accent,
      'primary.hover': c.accentHover,
      'primary.text': c.accentText ?? '#ffffff',
      accent: c.accent,
      success: c.success ?? '#10b981',
      warning: c.warning ?? '#f59e0b',
      error: c.error ?? '#ef4444',
      info: c.info ?? '#3b82f6',
      shadow: c.shadowColor ?? 'rgba(0, 0, 0, 0.15)',
      glow: c.glowColor ?? c.accent
    },
    font: {
      family: ty.fontFamilySans,
      'family.heading': ty.fontFamilyHeading ?? ty.fontFamilySans,
      'family.mono': ty.fontFamilyMono ?? 'ui-monospace, monospace',
      size: { xs: ty.fontSizeXs, sm: ty.fontSizeSm, base: ty.fontSizeBase, lg: ty.fontSizeLg, xl: ty.fontSizeXl, '2xl': ty.fontSize2xl, '3xl': ty.fontSize3xl },
      weight: { normal: ty.fontWeightNormal, medium: ty.fontWeightMedium, bold: ty.fontWeightBold },
      letterSpacing: ty.letterSpacing,
      lineHeight: ty.lineHeight
    },
    radius: { sm: t.radii.sm, md: t.radii.md, lg: t.radii.lg, xl: t.radii.xl ?? t.radii.lg, full: t.radii.full },
    shadow: { sm: t.shadows.sm, md: t.shadows.md, lg: t.shadows.lg, inset: t.shadows.inset ?? 'none', glow: t.shadows.glow ?? 'none' },
    border: { width: t.borders.width, style: t.borders.style, color: t.borders.color, opacity: t.borders.opacity ?? 1 },
    motion: {
      fast: t.motion.durationFast, normal: t.motion.durationNormal, slow: t.motion.durationSlow, easing: t.motion.easing,
      hoverScale: t.motion.hoverScale ?? 1, activeScale: t.motion.activeScale ?? 1
    },
    material: {
      blur: t.materials?.backdropBlur ?? '0px', opacity: t.materials?.opacity ?? 1, texture: t.materials?.texture ?? 'none',
      gradient: t.materials?.gradient ?? 'none', density: t.materials?.density ?? 'comfortable'
    },
    icon: { strokeWidth: t.icons?.strokeWidth ?? 2, filled: t.icons?.filled ?? false, variant: t.icons?.styleVariant ?? 'outline' },
    behavior: style.behavior ?? { buttonHoverAction: 'lift', cardElevationType: 'shadow', focusRingStyle: 'outline' },
    svg: style.svgLanguage ?? { cornerStyle: 'rounded', decorativeShapes: false }
  };
  return tokens;
}

export function exportCssVariables(style: StyleDefinition): string {
  const vars = resolveStyleToCssVars(style);
  const lines = Object.keys(vars).sort().map((k) => `  ${k}: ${vars[k]};`);
  return `/* ${style.metadata.name} — UI Explorer */\n:root {\n${lines.join('\n')}\n}\n`;
}

/** A usable stylesheet: the variables plus base rules for common elements. */
export function exportThemeCss(style: StyleDefinition): string {
  const b = style.behavior;
  const hover = b?.buttonHoverAction ?? 'lift';
  const hoverRule =
    hover === 'lift' ? 'transform: translateY(-1px); box-shadow: var(--shadow-md);'
    : hover === 'press' ? 'transform: translateY(1px); box-shadow: var(--shadow-sm);'
    : hover === 'glow' ? 'box-shadow: var(--shadow-glow, var(--shadow-md));'
    : hover === 'shift' ? 'transform: translate(-2px, -2px); box-shadow: 4px 4px 0 var(--color-text-primary);'
    : hover === 'invert' ? 'background: var(--color-text-primary); color: var(--color-bg);'
    : '';
  const focus = b?.focusRingStyle ?? 'outline';
  const focusRule =
    focus === 'glow' ? 'outline: none; box-shadow: 0 0 0 3px var(--color-accent), var(--shadow-glow, none);'
    : focus === 'solid-border' ? 'outline: 3px solid var(--color-accent); outline-offset: 0;'
    : focus === 'double-ring' ? 'outline: 2px solid var(--color-accent); outline-offset: 2px; box-shadow: 0 0 0 5px var(--color-bg);'
    : 'outline: 2px solid var(--color-accent); outline-offset: 2px;';
  const card = b?.cardElevationType ?? 'shadow';
  const cardRule =
    card === 'border' ? 'box-shadow: none; border: var(--border-width) var(--border-style) var(--color-border);'
    : card === 'inset' ? 'box-shadow: var(--shadow-inset, inset 0 2px 6px rgba(0,0,0,0.15));'
    : card === 'gradient-border' ? 'border: 1px solid transparent; background: linear-gradient(var(--color-surface), var(--color-surface)) padding-box, linear-gradient(135deg, var(--color-accent), var(--color-accent-hover)) border-box;'
    : card === 'flat' ? 'box-shadow: none; border: none;'
    : 'box-shadow: var(--shadow-md);';
  const blur = style.tokens.materials?.backdropBlur;
  return `${exportCssVariables(style)}
/* Base */
body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  letter-spacing: var(--letter-spacing);
}
h1, h2, h3, h4 { font-family: var(--font-family-heading, var(--font-family-sans)); font-weight: var(--font-weight-bold); }
a { color: var(--color-accent); }
a:hover { color: var(--color-accent-hover); }
code, pre { font-family: var(--font-family-mono, ui-monospace, monospace); }

/* Controls */
button, .button {
  font: inherit;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  border: var(--border-width) var(--border-style) var(--color-border);
  background: var(--color-accent);
  color: var(--color-accent-text, #fff);
  transition: transform var(--duration-fast) var(--motion-easing), box-shadow var(--duration-fast) var(--motion-easing), background var(--duration-fast) var(--motion-easing);
}
button:hover, .button:hover { ${hoverRule} }
button:active, .button:active { transform: scale(var(--active-scale, 0.98)); }
button:focus-visible, .button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { ${focusRule} }

input, select, textarea {
  font: inherit;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  border: var(--border-width) var(--border-style) var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
}
input::placeholder, textarea::placeholder { color: var(--color-text-tertiary); }

/* Surfaces */
.card {
  padding: 1rem;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  ${cardRule}${blur ? `\n  backdrop-filter: blur(${blur});` : ''}
}
.card:hover { background: var(--color-surface-hover, var(--color-surface)); }
.muted { color: var(--color-text-secondary); }

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0ms !important; animation: none !important; }
}
`;
}

export function exportPackage(style: StyleDefinition): string {
  const { generation: _generation, ...definition } = style;
  return JSON.stringify(definition, null, 2) + '\n';
}

export function exportStyle(style: StyleDefinition, format: ExportFormat): string {
  switch (format) {
    case 'tokens': return JSON.stringify(exportSemanticTokens(style), null, 2) + '\n';
    case 'css': return exportCssVariables(style);
    case 'theme': return exportThemeCss(style);
    case 'svg': return renderStylePreviewSvg(style) + '\n';
    case 'package': return exportPackage(style);
  }
}

export const exportFilename = (style: StyleDefinition, format: ExportFormat) =>
  `${style.metadata.id}.${EXPORT_FORMATS.find((f) => f.id === format)!.ext}`;

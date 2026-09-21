/**
 * UI Explorer — Style Token Resolver
 * Converts a StyleDefinition into CSS custom properties (variables) object.
 */

import type { StyleDefinition } from './types';

export function resolveStyleToCssVars(style: StyleDefinition): Record<string, string> {
  const { tokens, svgLanguage, customCssVars } = style;
  const { colors, typography, radii, shadows, borders, motion, materials, icons } = tokens;

  const vars: Record<string, string> = {
    // Colors
    '--color-bg': colors.bg,
    '--color-surface': colors.surface,
    '--color-surface-hover': colors.surfaceHover || colors.surface,
    '--color-surface-active': colors.surfaceActive || colors.surface,
    '--color-text-primary': colors.textPrimary,
    '--color-text-secondary': colors.textSecondary,
    '--color-text-tertiary': colors.textTertiary,
    '--color-border': colors.border,
    '--color-border-hover': colors.borderHover || colors.border,
    '--color-accent': colors.accent,
    '--color-accent-hover': colors.accentHover,
    '--color-accent-text': colors.accentText || '#ffffff',
    '--color-success': colors.success || '#10b981',
    '--color-warning': colors.warning || '#f59e0b',
    '--color-error': colors.error || '#ef4444',
    '--color-info': colors.info || '#3b82f6',

    // Category / Special Colors
    '--color-shadow': colors.shadowColor || 'rgba(0, 0, 0, 0.1)',
    '--color-highlight': colors.highlightColor || 'rgba(255, 255, 255, 0.5)',
    '--color-glow': colors.glowColor || colors.accent,

    // Typography
    '--font-family-sans': typography.fontFamilySans,
    '--font-family-heading': typography.fontFamilyHeading || typography.fontFamilySans,
    '--font-family-mono': typography.fontFamilyMono || typography.fontFamilySans,
    '--font-size-xs': typography.fontSizeXs,
    '--font-size-sm': typography.fontSizeSm,
    '--font-size-base': typography.fontSizeBase,
    '--font-size-lg': typography.fontSizeLg,
    '--font-size-xl': typography.fontSizeXl,
    '--font-size-2xl': typography.fontSize2xl,
    '--font-size-3xl': typography.fontSize3xl,
    '--font-weight-normal': String(typography.fontWeightNormal),
    '--font-weight-medium': String(typography.fontWeightMedium),
    '--font-weight-bold': String(typography.fontWeightBold),
    '--letter-spacing': typography.letterSpacing,
    '--line-height': typography.lineHeight,

    // Radii
    '--radius-sm': radii.sm,
    '--radius-md': radii.md,
    '--radius-lg': radii.lg,
    '--radius-xl': radii.xl || radii.lg,
    '--radius-full': radii.full,

    // Shadows
    '--shadow-sm': shadows.sm,
    '--shadow-md': shadows.md,
    '--shadow-lg': shadows.lg,
    '--shadow-inset': shadows.inset || 'none',
    '--shadow-colored': shadows.colored || shadows.md,
    '--shadow-glow': shadows.glow || 'none',

    // Borders
    '--border-width': borders.width,
    '--border-style': borders.style,
    '--border-color': borders.color,

    // Motion
    '--duration-fast': motion.durationFast,
    '--duration-normal': motion.durationNormal,
    '--duration-slow': motion.durationSlow,
    '--motion-easing': motion.easing,
    '--hover-scale': String(motion.hoverScale ?? 1.02),
    '--active-scale': String(motion.activeScale ?? 0.98),

    // Materials
    '--backdrop-blur': materials?.backdropBlur || '0px',
    '--material-opacity': String(materials?.opacity ?? 1),
    '--material-gradient': materials?.gradient || 'none',
    '--background-image': materials?.backgroundImage || 'none',
    '--density-scale': String(materials?.density ?? 1),

    // Icons
    '--icon-stroke-width': String(icons?.strokeWidth ?? 2),

    // Behaviors / SVG
    '--svg-corner-style': svgLanguage?.cornerStyle || 'rounded',
    ...customCssVars,
  };

  return vars;
}

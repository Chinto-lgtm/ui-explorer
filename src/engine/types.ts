/**
 * UI Explorer — Style Engine Core Types
 * Defines full data schemas for Design Styles, Tokens, Materials, SVG Language, and Behaviors.
 */

export type StyleCategory = 'Morphism' | 'Modern' | 'Expressive' | 'Minimalist' | 'Futuristic' | 'Retro' | 'Custom';

export interface ColorTokens {
  bg: string;
  surface: string;
  surfaceHover?: string;
  surfaceActive?: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderHover?: string;
  accent: string;
  accentHover: string;
  accentText?: string;
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
  // Category/style specific color tokens
  shadowColor?: string;
  highlightColor?: string;
  glowColor?: string;
}

export interface TypographyTokens {
  fontFamilySans: string;
  fontFamilyHeading?: string;
  fontFamilyMono?: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeBase: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSize2xl: string;
  fontSize3xl: string;
  fontWeightNormal: number | string;
  fontWeightMedium: number | string;
  fontWeightBold: number | string;
  letterSpacing: string;
  lineHeight: string;
}

export interface RadiusTokens {
  sm: string;
  md: string;
  lg: string;
  xl?: string;
  full: string;
}

export interface ShadowTokens {
  none?: string;
  sm: string;
  md: string;
  lg: string;
  inset?: string;
  colored?: string;
  glow?: string;
}

export interface BorderTokens {
  width: string;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  color: string;
  opacity?: number;
}

export interface MotionTokens {
  durationFast: string;
  durationNormal: string;
  durationSlow: string;
  easing: string;
  hoverScale?: number;
  activeScale?: number;
}

export interface MaterialTokens {
  backdropBlur?: string;
  opacity?: number;
  reflection?: boolean;
  texture?: 'none' | 'noise' | 'grid' | 'scanline' | 'dot-pattern' | 'grain';
  gradient?: string;
}

export interface IconTokens {
  strokeWidth: number | string;
  filled: boolean;
  styleVariant: 'outline' | 'filled' | 'duotone' | 'sharp' | 'rounded';
}

export interface SVGLanguage {
  cornerStyle: 'sharp' | 'rounded' | 'bevel' | 'brutalist';
  decorativeShapes: boolean;
  patternOverlay?: string;
  borderDecoration?: boolean;
}

export interface ComponentBehavior {
  buttonHoverAction: 'lift' | 'press' | 'glow' | 'shift' | 'invert' | 'none';
  cardElevationType: 'shadow' | 'border' | 'gradient-border' | 'inset' | 'flat';
  focusRingStyle: 'outline' | 'glow' | 'solid-border' | 'double-ring';
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  radii: RadiusTokens;
  shadows: ShadowTokens;
  borders: BorderTokens;
  motion: MotionTokens;
  materials?: MaterialTokens;
  icons?: IconTokens;
}

export interface StyleMetadata {
  id: string;
  name: string;
  category: StyleCategory;
  description: string;
  tags: string[];
  personality: string;
  history?: string;
  bestUsedFor: string[];
  relatedStyles?: string[];
  isCustom?: boolean;
  author?: string;
  version?: string;
  license?: string;
  source?: 'official' | 'community' | 'generated' | 'custom';
  /** When to avoid this style; part of the style documentation. */
  avoidWhen?: string[];
  /** Short visual-character summary for documentation. */
  visualCharacter?: string;
}

/** Provenance of a procedurally generated style (see engine/generator). */
export interface GenerationInfo {
  seed: number;
  mode: string;
  personality: string;
  visualFamily: string;
  generatorVersion: string;
  createdAt: string;
  /** Semantic decisions; kept so the style can be remixed with locks. */
  recipe: import('./generator/vocab').SemanticRecipe;
  /** Seed of the style this one was remixed from, if any. */
  parentSeed?: number;
  parentId?: string;
  /** Axes kept from the parent when this style was generated with locks. */
  keptAxes?: string[];
  dnaHash: string;
}

export interface StyleDefinition {
  metadata: StyleMetadata;
  tokens: DesignTokens;
  svgLanguage?: SVGLanguage;
  behavior?: ComponentBehavior;
  customCssVars?: Record<string, string>;
  generation?: GenerationInfo;
}

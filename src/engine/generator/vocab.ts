/**
 * UI Explorer — Generation Vocabulary
 * Canonical semantic values for every generated axis, the mapping from the
 * free-form personality labels to those values, and the materializers that turn
 * a semantic choice into concrete design tokens.
 */

import type {
  BorderTokens, ColorTokens, IconTokens, MaterialTokens, MotionTokens, ShadowTokens, SVGLanguage,
  ComponentBehavior, RadiusTokens, TypographyTokens
} from '../types';

export type SurfaceType =
  | 'flat' | 'solid' | 'transparent' | 'frosted' | 'glass' | 'acrylic' | 'clay'
  | 'elevated' | 'inset' | 'metallic' | 'crystal' | 'liquid' | 'paper' | 'experimental';

export type DepthType = 'flat' | 'soft' | 'floating' | 'deep' | 'glowing' | 'inset' | 'physical';

export type BorderType = 'none' | 'subtle' | 'thin' | 'strong' | 'dashed' | 'double' | 'glow';

export type MotionType = 'static' | 'subtle' | 'smooth' | 'physical' | 'expressive' | 'mechanical' | 'snappy' | 'elastic';

export type IconType = 'outline' | 'filled' | 'duotone' | 'geometric' | 'rounded' | '3d' | 'pixel' | 'skeuomorphic';

export type GeometryType = 'sharp' | 'small' | 'medium' | 'large' | 'pill';

export type DensityType = 'compact' | 'comfortable' | 'spacious';

export type BehaviorFamily = 'soft' | 'physical' | 'mechanical' | 'elastic' | 'glowing' | 'instant' | 'cinematic';

export type SvgShapeLanguage = 'curves' | 'geometry' | 'grid' | 'blobs' | 'lines' | 'reticle' | 'confetti' | 'liquid';
export type SvgGradientType = 'none' | 'linear' | 'radial' | 'mesh' | 'aurora' | 'metallic';
export type SvgStrokeLanguage = 'thin' | 'neon' | 'bold' | 'minimal' | 'pixel';

/** Generated SVG parameters. The generator chooses numbers, never raw markup. */
export interface GeneratedSvgLanguage {
  shapeLanguage: SvgShapeLanguage;
  gradientType: SvgGradientType;
  strokeLanguage: SvgStrokeLanguage;
  glowLevel: number;      // 0..1
  noiseLevel: number;     // 0..1
  gridLevel: number;      // 0..1
  particleDensity: number; // 0..1
  curveStrength: number;  // 0..1
  metallicReflection: number; // 0..1
  blurLevel: number;      // 0..1
}

export interface TypographyChoice {
  family: string;
  headingFamily: string;
  monoFamily: string;
  headingWeight: number;
  bodyWeight: number;
  letterSpacing: string;
  lineHeight: string;
  scale: 'tight' | 'regular' | 'generous';
}

/** All semantic decisions that fully describe a generated style. */
export interface SemanticRecipe {
  personality: string;
  visualFamily: string;
  harmony: string;
  typography: TypographyChoice;
  geometry: GeometryType;
  density: DensityType;
  surface: SurfaceType;
  depth: DepthType;
  border: BorderType;
  motion: MotionType;
  icons: IconType;
  svg: GeneratedSvgLanguage;
  behavior: BehaviorFamily;
}

export type RecipeAxis = 'colors' | 'typography' | 'geometry' | 'surface' | 'depth' | 'borders' | 'icons' | 'motion' | 'svg';

export const RECIPE_AXES: RecipeAxis[] = ['colors', 'typography', 'geometry', 'surface', 'depth', 'borders', 'icons', 'motion', 'svg'];

export const SURFACE_TYPES: SurfaceType[] = ['flat', 'solid', 'transparent', 'frosted', 'glass', 'acrylic', 'clay', 'elevated', 'inset', 'metallic', 'crystal', 'liquid', 'paper', 'experimental'];
export const DEPTH_TYPES: DepthType[] = ['flat', 'soft', 'floating', 'deep', 'glowing', 'inset', 'physical'];
export const BORDER_TYPES: BorderType[] = ['none', 'subtle', 'thin', 'strong', 'dashed', 'double', 'glow'];
export const MOTION_TYPES: MotionType[] = ['static', 'subtle', 'smooth', 'physical', 'expressive', 'mechanical', 'snappy', 'elastic'];
export const ICON_TYPES: IconType[] = ['outline', 'filled', 'duotone', 'geometric', 'rounded', '3d', 'pixel', 'skeuomorphic'];
export const GEOMETRY_TYPES: GeometryType[] = ['sharp', 'small', 'medium', 'large', 'pill'];

/* ------------------------------------------------------------------ */
/* Personality label → canonical value                                  */
/* ------------------------------------------------------------------ */

export const SURFACE_LABELS: Record<string, SurfaceType> = {
  'Aurora Gradient': 'liquid', 'Border Container': 'flat', 'Clay Pillow': 'clay', 'Crisp Solid': 'solid',
  'Dark Metallic': 'metallic', 'Dark Slate': 'solid', 'Distorted Liquid': 'experimental', 'Earthy Matte': 'paper',
  'Fine Border': 'flat', 'Flat': 'flat', 'Frosted Glass': 'frosted', 'Glass Translucent': 'glass',
  'Glossy Acrylic': 'acrylic', 'Glow Box': 'transparent', 'Grid Surface': 'transparent', 'Hard Border': 'solid',
  'Hard Solid': 'solid', 'Paper Stock': 'paper', 'Pitch Black Card': 'solid', 'Polished Obsidian': 'crystal',
  'Pure White/Dark': 'flat', 'Soft Recessed': 'inset', 'Soft Solid': 'elevated', 'Solid Soft': 'elevated',
  'Subtle Border': 'flat', 'Telemetry Panel': 'transparent', 'Vivid Solid': 'solid'
};

export const DEPTH_LABELS: Record<string, DepthType> = {
  'Border Shadow': 'flat', 'Clay Inner Shadow': 'physical', 'Deep Shadow': 'deep', 'Extreme Glow': 'glowing',
  'Flat Border': 'flat', 'Flat Sharp': 'flat', 'Flat': 'flat', 'Floating': 'floating', 'Gentle Shadow': 'soft',
  'Hard Offset Shadow': 'physical', 'Minimal Shadow': 'soft', 'Neon Glow': 'glowing', 'OLED Shadow': 'deep',
  'Paper Shadow': 'soft', 'Soft Shadow': 'soft', 'Subtle Elevation': 'soft', 'Subtle Glow': 'glowing', 'Subtle Inset': 'inset'
};

export const MOTION_LABELS: Record<string, MotionType> = {
  Cinematic: 'expressive', Elastic: 'elastic', Expressive: 'expressive', Instant: 'static',
  Mechanical: 'mechanical', Smooth: 'smooth', Snappy: 'snappy', Subtle: 'subtle'
};

export const SVG_LABELS: Record<string, Partial<GeneratedSvgLanguage>> = {
  'Aurora Mesh': { shapeLanguage: 'curves', gradientType: 'aurora', glowLevel: 0.6, curveStrength: 0.8, blurLevel: 0.6 },
  'Blob Curves': { shapeLanguage: 'blobs', gradientType: 'radial', curveStrength: 0.9 },
  'Bold Outline': { shapeLanguage: 'geometry', strokeLanguage: 'bold', gradientType: 'none' },
  'Clean Grid': { shapeLanguage: 'grid', gridLevel: 0.6, strokeLanguage: 'thin' },
  'Confetti Dots': { shapeLanguage: 'confetti', particleDensity: 0.8 },
  'Dark Grid': { shapeLanguage: 'grid', gridLevel: 0.8, glowLevel: 0.3 },
  'Distorted Lines': { shapeLanguage: 'liquid', strokeLanguage: 'neon', noiseLevel: 0.7, curveStrength: 0.7 },
  'Fine Lines': { shapeLanguage: 'lines', strokeLanguage: 'thin' },
  'Grain Overlay': { noiseLevel: 0.8 },
  'Minimal Lines': { shapeLanguage: 'lines', strokeLanguage: 'minimal' },
  'Minimal Strokes': { shapeLanguage: 'lines', strokeLanguage: 'minimal' },
  'Natural Gradients': { gradientType: 'radial', curveStrength: 0.6 },
  'Natural Texture': { noiseLevel: 0.5, curveStrength: 0.6 },
  'Neon Stroke': { strokeLanguage: 'neon', glowLevel: 0.9, shapeLanguage: 'geometry' },
  'Print Grid': { shapeLanguage: 'grid', gridLevel: 0.4, strokeLanguage: 'thin' },
  'Pure Geometry': { shapeLanguage: 'geometry', gradientType: 'none' },
  'Reflective Gradients': { gradientType: 'metallic', metallicReflection: 0.9, shapeLanguage: 'liquid' },
  'Reticle Corners': { shapeLanguage: 'reticle', strokeLanguage: 'thin', gridLevel: 0.5, glowLevel: 0.5 },
  'Scanlines': { gridLevel: 0.9, noiseLevel: 0.3, strokeLanguage: 'neon' },
  'Sharp Angles': { shapeLanguage: 'geometry', strokeLanguage: 'bold' },
  'Soft Curves': { shapeLanguage: 'curves', curveStrength: 0.7, gradientType: 'linear' },
  'Specular Highlights': { metallicReflection: 0.8, gradientType: 'metallic', glowLevel: 0.4 },
  'Squiggles': { shapeLanguage: 'confetti', curveStrength: 0.9, particleDensity: 0.6, strokeLanguage: 'bold' }
};

export const toSurface = (label: string): SurfaceType => SURFACE_LABELS[label] ?? 'solid';
export const toDepth = (label: string): DepthType => DEPTH_LABELS[label] ?? 'soft';
export const toMotion = (label: string): MotionType => MOTION_LABELS[label] ?? 'smooth';

export function toSvgLanguage(label: string, base?: GeneratedSvgLanguage): GeneratedSvgLanguage {
  const defaults: GeneratedSvgLanguage = base ?? {
    shapeLanguage: 'curves', gradientType: 'linear', strokeLanguage: 'thin',
    glowLevel: 0.1, noiseLevel: 0, gridLevel: 0, particleDensity: 0, curveStrength: 0.4, metallicReflection: 0, blurLevel: 0
  };
  return { ...defaults, ...(SVG_LABELS[label] ?? {}) };
}

export const radiusToGeometry = (radius: string): GeometryType => {
  const px = parseInt(radius, 10);
  if (Number.isNaN(px)) return 'medium';
  if (px === 0) return 'sharp';
  if (px <= 6) return 'small';
  if (px <= 14) return 'medium';
  if (px <= 24) return 'large';
  return 'pill';
};

/* ------------------------------------------------------------------ */
/* Materializers: semantic value → tokens                               */
/* ------------------------------------------------------------------ */

export function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((ch) => ch + ch).join('');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}

export const rgba = (hex: string, alpha: number): string => {
  if (!hex.startsWith('#')) return hex;
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 100) / 100})`;
};

const isDarkHex = (hex: string): boolean => {
  if (!hex.startsWith('#')) return false;
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

export interface SurfaceMaterialization {
  surface: string;
  surfaceHover: string;
  materials: MaterialTokens;
}

export function materializeSurface(surface: SurfaceType, colors: ColorTokens): SurfaceMaterialization {
  const dark = isDarkHex(colors.bg);
  const solid = colors.surface;
  const hover = colors.surfaceHover || colors.surface;
  const light = dark ? '#ffffff' : '#000000';

  switch (surface) {
    case 'flat':
      return { surface: colors.bg, surfaceHover: hover, materials: { opacity: 1 } };
    case 'transparent':
      return { surface: rgba(light, dark ? 0.04 : 0.03), surfaceHover: rgba(light, dark ? 0.08 : 0.06), materials: { opacity: 0.9 } };
    case 'frosted':
      return { surface: rgba(light, dark ? 0.08 : 0.55), surfaceHover: rgba(light, dark ? 0.14 : 0.7), materials: { backdropBlur: '16px', opacity: 0.85 } };
    case 'glass':
      return { surface: rgba(light, dark ? 0.06 : 0.35), surfaceHover: rgba(light, dark ? 0.12 : 0.5), materials: { backdropBlur: '24px', opacity: 0.75, reflection: true } };
    case 'acrylic':
      return { surface: rgba(light, dark ? 0.1 : 0.6), surfaceHover: rgba(light, dark ? 0.16 : 0.75), materials: { backdropBlur: '32px', opacity: 0.8, texture: 'noise' } };
    case 'crystal':
      return { surface: rgba(light, dark ? 0.05 : 0.25), surfaceHover: rgba(light, dark ? 0.1 : 0.4), materials: { backdropBlur: '12px', opacity: 0.7, reflection: true, gradient: `linear-gradient(135deg, ${rgba(light, 0.18)}, transparent 55%)` } };
    case 'clay':
      return { surface: solid, surfaceHover: hover, materials: { opacity: 1, gradient: `linear-gradient(145deg, ${rgba('#ffffff', 0.35)}, transparent 60%)` } };
    case 'elevated':
      return { surface: solid, surfaceHover: hover, materials: { opacity: 1 } };
    case 'inset':
      return { surface: colors.bg, surfaceHover: hover, materials: { opacity: 1 } };
    case 'metallic':
      return { surface: solid, surfaceHover: hover, materials: { opacity: 1, reflection: true, gradient: `linear-gradient(180deg, ${rgba('#ffffff', dark ? 0.16 : 0.6)} 0%, transparent 45%, ${rgba('#000000', 0.25)} 100%)` } };
    case 'liquid':
      return { surface: solid, surfaceHover: hover, materials: { opacity: 0.95, backdropBlur: '8px', gradient: `linear-gradient(120deg, ${rgba(colors.accent, 0.18)}, transparent 50%, ${rgba(colors.accentHover, 0.14)})` } };
    case 'paper':
      return { surface: solid, surfaceHover: hover, materials: { opacity: 1, texture: 'grain' } };
    case 'experimental':
      return { surface: rgba(colors.accent, dark ? 0.12 : 0.1), surfaceHover: rgba(colors.accent, 0.2), materials: { opacity: 0.9, backdropBlur: '20px', texture: 'scanline', gradient: `linear-gradient(90deg, ${rgba(colors.accent, 0.25)}, transparent)` } };
    case 'solid':
    default:
      return { surface: solid, surfaceHover: hover, materials: { opacity: 1 } };
  }
}

export function materializeDepth(depth: DepthType, colors: ColorTokens): ShadowTokens {
  const dark = isDarkHex(colors.bg);
  const ink = colors.shadowColor || (dark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(15, 23, 42, 0.12)');
  const strongInk = dark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(15, 23, 42, 0.22)';
  const glow = colors.glowColor || colors.accent;

  switch (depth) {
    case 'flat':
      return { none: 'none', sm: 'none', md: 'none', lg: 'none', glow: 'none' };
    case 'soft':
      return { sm: `0 1px 3px ${ink}`, md: `0 6px 16px ${ink}`, lg: `0 14px 32px ${ink}`, glow: 'none' };
    case 'floating':
      return { sm: `0 4px 10px ${ink}`, md: `0 16px 40px ${ink}`, lg: `0 30px 70px ${strongInk}`, glow: 'none' };
    case 'deep':
      return { sm: `0 2px 6px ${strongInk}`, md: `0 12px 28px ${strongInk}`, lg: `0 28px 60px ${strongInk}`, glow: 'none' };
    case 'glowing':
      return { sm: `0 0 8px ${rgba(glow, 0.35)}`, md: `0 0 20px ${rgba(glow, 0.45)}`, lg: `0 0 40px ${rgba(glow, 0.55)}`, glow: `0 0 18px ${rgba(glow, 0.8)}` };
    case 'inset':
      return { sm: `inset 0 1px 2px ${ink}`, md: `inset 0 2px 6px ${ink}, 0 1px 0 ${rgba('#ffffff', dark ? 0.06 : 0.6)}`, lg: `inset 0 4px 12px ${strongInk}`, inset: `inset 0 3px 8px ${strongInk}`, glow: 'none' };
    case 'physical': {
      const hard = colors.textPrimary;
      return { sm: `2px 2px 0 ${hard}`, md: `5px 5px 0 ${hard}`, lg: `8px 8px 0 ${hard}`, inset: `inset 3px 3px 0 ${rgba(hard, 0.35)}`, glow: 'none' };
    }
    default:
      return { sm: `0 1px 3px ${ink}`, md: `0 6px 16px ${ink}`, lg: `0 14px 32px ${ink}`, glow: 'none' };
  }
}

export function materializeBorder(border: BorderType, colors: ColorTokens): BorderTokens {
  const dark = isDarkHex(colors.bg);
  switch (border) {
    case 'none':
      return { width: '0px', style: 'none', color: 'transparent', opacity: 0 };
    case 'subtle':
      return { width: '1px', style: 'solid', color: rgba(dark ? '#ffffff' : '#0f172a', dark ? 0.12 : 0.08), opacity: 0.12 };
    case 'thin':
      return { width: '1px', style: 'solid', color: colors.border, opacity: 1 };
    case 'strong':
      return { width: '3px', style: 'solid', color: colors.textPrimary, opacity: 1 };
    case 'dashed':
      return { width: '2px', style: 'dashed', color: colors.border, opacity: 1 };
    case 'double':
      return { width: '4px', style: 'double', color: colors.border, opacity: 1 };
    case 'glow':
      return { width: '1px', style: 'solid', color: colors.accent, opacity: 1 };
    default:
      return { width: '1px', style: 'solid', color: colors.border, opacity: 1 };
  }
}

export function materializeMotion(motion: MotionType): MotionTokens {
  switch (motion) {
    case 'static':
      return { durationFast: '0ms', durationNormal: '0ms', durationSlow: '0ms', easing: 'linear', hoverScale: 1, activeScale: 1 };
    case 'subtle':
      return { durationFast: '120ms', durationNormal: '200ms', durationSlow: '320ms', easing: 'ease-out', hoverScale: 1.01, activeScale: 0.99 };
    case 'smooth':
      return { durationFast: '160ms', durationNormal: '260ms', durationSlow: '420ms', easing: 'cubic-bezier(0.4, 0, 0.2, 1)', hoverScale: 1.02, activeScale: 0.98 };
    case 'physical':
      return { durationFast: '100ms', durationNormal: '180ms', durationSlow: '300ms', easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', hoverScale: 1.03, activeScale: 0.96 };
    case 'expressive':
      return { durationFast: '200ms', durationNormal: '380ms', durationSlow: '650ms', easing: 'cubic-bezier(0.16, 1, 0.3, 1)', hoverScale: 1.05, activeScale: 0.97 };
    case 'mechanical':
      return { durationFast: '80ms', durationNormal: '120ms', durationSlow: '200ms', easing: 'steps(4, end)', hoverScale: 1, activeScale: 1 };
    case 'snappy':
      return { durationFast: '80ms', durationNormal: '140ms', durationSlow: '220ms', easing: 'cubic-bezier(0.2, 0, 0, 1)', hoverScale: 1.02, activeScale: 0.97 };
    case 'elastic':
      return { durationFast: '180ms', durationNormal: '320ms', durationSlow: '560ms', easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', hoverScale: 1.06, activeScale: 0.94 };
    default:
      return { durationFast: '150ms', durationNormal: '250ms', durationSlow: '400ms', easing: 'ease-out', hoverScale: 1.02, activeScale: 0.98 };
  }
}

export function materializeIcons(icon: IconType): IconTokens {
  switch (icon) {
    case 'outline': return { strokeWidth: 2, filled: false, styleVariant: 'outline' };
    case 'filled': return { strokeWidth: 2, filled: true, styleVariant: 'filled' };
    case 'duotone': return { strokeWidth: 1.75, filled: true, styleVariant: 'duotone' };
    case 'geometric': return { strokeWidth: 2.5, filled: false, styleVariant: 'sharp' };
    case 'rounded': return { strokeWidth: 2, filled: false, styleVariant: 'rounded' };
    case '3d': return { strokeWidth: 2.25, filled: true, styleVariant: 'filled' };
    case 'pixel': return { strokeWidth: 3, filled: true, styleVariant: 'sharp' };
    case 'skeuomorphic': return { strokeWidth: 1.5, filled: true, styleVariant: 'filled' };
    default: return { strokeWidth: 2, filled: false, styleVariant: 'outline' };
  }
}

export function materializeGeometry(geometry: GeometryType, density: DensityType): RadiusTokens & { density: DensityType } {
  const radii: Record<GeometryType, RadiusTokens> = {
    sharp: { sm: '0px', md: '0px', lg: '0px', xl: '0px', full: '0px' },
    small: { sm: '2px', md: '4px', lg: '8px', xl: '12px', full: '9999px' },
    medium: { sm: '6px', md: '10px', lg: '16px', xl: '22px', full: '9999px' },
    large: { sm: '10px', md: '18px', lg: '26px', xl: '32px', full: '9999px' },
    pill: { sm: '14px', md: '24px', lg: '32px', xl: '40px', full: '9999px' }
  };
  return { ...radii[geometry], density };
}

export function materializeTypography(choice: TypographyChoice): TypographyTokens {
  const scales = {
    tight: { xs: '0.7rem', sm: '0.8rem', base: '0.9375rem', lg: '1.0625rem', xl: '1.1875rem', '2xl': '1.375rem', '3xl': '1.75rem' },
    regular: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '2rem' },
    generous: { xs: '0.8125rem', sm: '0.9375rem', base: '1.0625rem', lg: '1.25rem', xl: '1.5rem', '2xl': '1.875rem', '3xl': '2.5rem' }
  }[choice.scale];
  return {
    fontFamilySans: choice.family,
    fontFamilyHeading: choice.headingFamily,
    fontFamilyMono: choice.monoFamily,
    fontSizeXs: scales.xs,
    fontSizeSm: scales.sm,
    fontSizeBase: scales.base,
    fontSizeLg: scales.lg,
    fontSizeXl: scales.xl,
    fontSize2xl: scales['2xl'],
    fontSize3xl: scales['3xl'],
    fontWeightNormal: choice.bodyWeight,
    fontWeightMedium: Math.min(choice.headingWeight, choice.bodyWeight + 100),
    fontWeightBold: choice.headingWeight,
    letterSpacing: choice.letterSpacing,
    lineHeight: choice.lineHeight
  };
}

export function materializeSvg(svg: GeneratedSvgLanguage, geometry: GeometryType): SVGLanguage {
  const corner: SVGLanguage['cornerStyle'] =
    svg.shapeLanguage === 'reticle' ? 'bevel' :
    geometry === 'sharp' ? (svg.strokeLanguage === 'bold' ? 'brutalist' : 'sharp') : 'rounded';
  const pattern =
    svg.gridLevel > 0.6 ? 'grid' :
    svg.noiseLevel > 0.6 ? 'noise' :
    svg.particleDensity > 0.6 ? 'dots' :
    svg.gradientType === 'aurora' ? 'aurora' : undefined;
  return {
    cornerStyle: corner,
    decorativeShapes: svg.particleDensity > 0.3 || svg.shapeLanguage === 'blobs' || svg.shapeLanguage === 'confetti',
    patternOverlay: pattern,
    borderDecoration: svg.shapeLanguage === 'reticle' || svg.strokeLanguage === 'bold'
  };
}

export function materializeBehavior(family: BehaviorFamily, depth: DepthType): ComponentBehavior {
  const hover: Record<BehaviorFamily, ComponentBehavior['buttonHoverAction']> = {
    soft: 'lift', physical: 'shift', mechanical: 'invert', elastic: 'lift', glowing: 'glow', instant: 'none', cinematic: 'lift'
  };
  const focus: Record<BehaviorFamily, ComponentBehavior['focusRingStyle']> = {
    soft: 'outline', physical: 'solid-border', mechanical: 'solid-border', elastic: 'outline', glowing: 'glow', instant: 'outline', cinematic: 'double-ring'
  };
  const card: ComponentBehavior['cardElevationType'] =
    depth === 'flat' ? 'border' : depth === 'inset' ? 'inset' : depth === 'glowing' ? 'gradient-border' : 'shadow';
  return { buttonHoverAction: hover[family], cardElevationType: card, focusRingStyle: focus[family] };
}

export function motionToBehavior(motion: MotionType, depth: DepthType): BehaviorFamily {
  if (depth === 'glowing') return 'glowing';
  switch (motion) {
    case 'static': return 'instant';
    case 'mechanical': return 'mechanical';
    case 'elastic': return 'elastic';
    case 'physical': return 'physical';
    case 'expressive': return 'cinematic';
    default: return 'soft';
  }
}

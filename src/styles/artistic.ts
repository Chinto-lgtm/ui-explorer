import type { StyleDefinition } from '../engine/types';

export const bauhaus: StyleDefinition = {
  metadata: {
    id: 'bauhaus',
    name: 'Bauhaus Movement',
    category: 'Expressive',
    description: 'Form follows function — primary geometric shapes (circle, triangle, square), bold primary colors (red, blue, yellow), and clean sans-serif typography.',
    tags: ['bauhaus', 'geometric', 'primary-colors', 'constructivist', 'historical'],
    personality: 'Functional, artistic, geometric, bold simplicity',
    history: 'Founded by Walter Gropius in Weimar, Germany (1919).',
    bestUsedFor: ['Architectural portfolios', 'Art museums', 'Educational design sites'],
    relatedStyles: ['swiss-style', 'memphis']
  },
  tokens: {
    colors: {
      bg: '#f0ede6',
      surface: '#ffffff',
      surfaceHover: '#e6e1d5',
      textPrimary: '#121212',
      textSecondary: '#333333',
      textTertiary: '#666666',
      border: '#121212',
      accent: '#d92b2b',
      accentHover: '#b51f1f',
      shadowColor: '#121212'
    },
    typography: {
      fontFamilySans: 'Century Gothic, Futura, sans-serif',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.25rem',
      fontSizeXl: '1.5rem',
      fontSize2xl: '2.25rem',
      fontSize3xl: '3.25rem',
      fontWeightNormal: 400,
      fontWeightMedium: 700,
      fontWeightBold: 900,
      letterSpacing: '0',
      lineHeight: '1.3'
    },
    radii: {
      sm: '0px',
      md: '0px',
      lg: '0px',
      full: '9999px'
    },
    shadows: {
      sm: '4px 4px 0px #121212',
      md: '8px 8px 0px #121212',
      lg: '12px 12px 0px #121212'
    },
    borders: {
      width: '2px',
      style: 'solid',
      color: '#121212'
    },
    motion: {
      durationFast: '120ms',
      durationNormal: '200ms',
      durationSlow: '300ms',
      easing: 'ease-out'
    }
  }
};

export const organicBiophilic: StyleDefinition = {
  metadata: {
    id: 'organic-biophilic',
    name: 'Organic / Biophilic',
    category: 'Minimalist',
    description: 'Earthy natural colors (moss green, warm terracotta, soft sand), gentle rounded curves, leaf motifs, and soothing visual harmony.',
    tags: ['organic', 'biophilic', 'nature', 'earthy', 'calm'],
    personality: 'Natural, calming, grounding, sustainable',
    history: 'Emerged from architecture biophilic design principles connecting humans with nature.',
    bestUsedFor: ['Eco-friendly products', 'Gardening apps', 'Wellness & meditation'],
    relatedStyles: ['minimal-warm', 'editorial']
  },
  tokens: {
    colors: {
      bg: '#f4f6f0',
      surface: '#e2e8da',
      surfaceHover: '#d4dcab',
      textPrimary: '#283618',
      textSecondary: '#606c38',
      textTertiary: '#8a9a5b',
      border: '#ccd5ae',
      accent: '#dda15e',
      accentHover: '#bc6c25'
    },
    typography: {
      fontFamilySans: 'DM Sans, system-ui, sans-serif',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '2rem',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      letterSpacing: '0',
      lineHeight: '1.6'
    },
    radii: {
      sm: '12px',
      md: '20px',
      lg: '32px',
      full: '9999px'
    },
    shadows: {
      sm: '0 4px 12px rgba(40, 54, 24, 0.05)',
      md: '0 8px 20px rgba(40, 54, 24, 0.08)',
      lg: '0 16px 36px rgba(40, 54, 24, 0.12)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#ccd5ae'
    },
    motion: {
      durationFast: '200ms',
      durationNormal: '300ms',
      durationSlow: '500ms',
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    }
  }
};

export const industrial: StyleDefinition = {
  metadata: {
    id: 'industrial',
    name: 'Industrial / Safety Caution',
    category: 'Expressive',
    description: 'Heavy machinery utility style with black & yellow hazard stripes, stencil typography, steel grey panels, and rugged construction feel.',
    tags: ['industrial', 'hazard', 'stencil', 'rugged', 'utility'],
    personality: 'Rugged, heavy-duty, cautious, industrial',
    history: 'Inspired by heavy machinery, factory safety warnings, and military hardware.',
    bestUsedFor: ['Logistics platforms', 'Heavy equipment management', 'DevOps tools'],
    relatedStyles: ['sci-fi-hud', 'neo-brutalism']
  },
  tokens: {
    colors: {
      bg: '#1c1d21',
      surface: '#2a2b32',
      surfaceHover: '#383a44',
      textPrimary: '#f5c518',
      textSecondary: '#d0d0d0',
      textTertiary: '#888888',
      border: '#f5c518',
      accent: '#f5c518',
      accentHover: '#d4a810'
    },
    typography: {
      fontFamilySans: 'Impact, Space Grotesk, sans-serif',
      fontFamilyMono: 'Courier, monospace',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.25rem',
      fontSizeXl: '1.5rem',
      fontSize2xl: '2rem',
      fontSize3xl: '2.75rem',
      fontWeightNormal: 500,
      fontWeightMedium: 700,
      fontWeightBold: 900,
      letterSpacing: '0.04em',
      lineHeight: '1.3'
    },
    radii: {
      sm: '2px',
      md: '4px',
      lg: '6px',
      full: '0px'
    },
    shadows: {
      sm: '0 2px 4px rgba(0,0,0,0.8)',
      md: '0 4px 10px rgba(0,0,0,0.9)',
      lg: '0 8px 20px rgba(0,0,0,1)'
    },
    borders: {
      width: '2px',
      style: 'solid',
      color: '#f5c518'
    },
    motion: {
      durationFast: '100ms',
      durationNormal: '180ms',
      durationSlow: '280ms',
      easing: 'ease'
    }
  }
};

export const paperSkeuomorphic: StyleDefinition = {
  metadata: {
    id: 'paper-skeuomorphic',
    name: 'Paper / Craft Notebook',
    category: 'Retro',
    description: 'Textured cardstock paper background, folded corners, subtle drop shadows, and handwritten font elements.',
    tags: ['paper', 'notebook', 'craft', 'textured', 'handwritten'],
    personality: 'Personal, tactile, warm, artistic',
    history: 'Popular in early web design for digital notebooks and journaling apps.',
    bestUsedFor: ['Journaling apps', 'Recipe books', 'Personal blogs'],
    relatedStyles: ['minimal-warm', 'skeuomorphism']
  },
  tokens: {
    colors: {
      bg: '#f7f4eb',
      surface: '#fffdf7',
      surfaceHover: '#f0ebd8',
      textPrimary: '#2b261f',
      textSecondary: '#665e52',
      textTertiary: '#998f80',
      border: '#ded7c5',
      accent: '#2b6cb0',
      accentHover: '#1a4971'
    },
    typography: {
      fontFamilySans: 'Georgia, serif',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '2rem',
      fontWeightNormal: 400,
      fontWeightMedium: 600,
      fontWeightBold: 700,
      letterSpacing: '0',
      lineHeight: '1.6'
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 5px rgba(43, 38, 31, 0.08)',
      md: '0 5px 15px rgba(43, 38, 31, 0.12)',
      lg: '0 10px 25px rgba(43, 38, 31, 0.16)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#ded7c5'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '350ms',
      easing: 'ease-out'
    },
    materials: {
      texture: 'grain'
    }
  }
};

export const highContrast: StyleDefinition = {
  metadata: {
    id: 'high-contrast',
    name: 'High Contrast Accessibility (WCAG AAA)',
    category: 'Minimalist',
    description: 'Maximum visual accessibility meeting WCAG AAA standard (>7:1 contrast ratio) with thick focus rings, bold text, and clear targets.',
    tags: ['accessible', 'wcag-aaa', 'high-contrast', 'inclusive'],
    personality: 'Clear, direct, functional, maximum legibility',
    history: 'Built according to W3C Web Content Accessibility Guidelines.',
    bestUsedFor: ['Government portals', 'Healthcare web apps', 'Accessibility modes'],
    relatedStyles: ['swiss-style', 'flat-design']
  },
  tokens: {
    colors: {
      bg: '#000000',
      surface: '#000000',
      surfaceHover: '#1a1a1a',
      textPrimary: '#ffffff',
      textSecondary: '#ffff00',
      textTertiary: '#00ffff',
      border: '#ffffff',
      accent: '#ffff00',
      accentHover: '#e6e600'
    },
    typography: {
      fontFamilySans: 'Arial, sans-serif',
      fontSizeXs: '0.875rem',
      fontSizeSm: '1rem',
      fontSizeBase: '1.125rem',
      fontSizeLg: '1.375rem',
      fontSizeXl: '1.625rem',
      fontSize2xl: '2rem',
      fontSize3xl: '2.5rem',
      fontWeightNormal: 700,
      fontWeightMedium: 700,
      fontWeightBold: 900,
      letterSpacing: '0.02em',
      lineHeight: '1.6'
    },
    radii: {
      sm: '0px',
      md: '0px',
      lg: '0px',
      full: '0px'
    },
    shadows: {
      sm: 'none',
      md: 'none',
      lg: 'none'
    },
    borders: {
      width: '3px',
      style: 'solid',
      color: '#ffffff'
    },
    motion: {
      durationFast: '0ms',
      durationNormal: '100ms',
      durationSlow: '200ms',
      easing: 'linear'
    }
  }
};

export const monochrome: StyleDefinition = {
  metadata: {
    id: 'monochrome',
    name: 'Monochrome Grayscale',
    category: 'Minimalist',
    description: 'Pure black, white, and shades of grey without any chromatic hue, relying purely on tone, typography, and spacing for visual order.',
    tags: ['monochrome', 'grayscale', 'minimal', 'pure', 'stark'],
    personality: 'Stark, pure, quiet, serious',
    history: 'Classic photography and minimalist art principles applied to digital UI.',
    bestUsedFor: ['Photography portfolios', 'Architectural showcases', 'Distraction-free editors'],
    relatedStyles: ['swiss-style', 'editorial']
  },
  tokens: {
    colors: {
      bg: '#ffffff',
      surface: '#f5f5f5',
      surfaceHover: '#e5e5e5',
      textPrimary: '#000000',
      textSecondary: '#555555',
      textTertiary: '#888888',
      border: '#cccccc',
      accent: '#000000',
      accentHover: '#333333'
    },
    typography: {
      fontFamilySans: 'Inter, system-ui, sans-serif',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '2rem',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      letterSpacing: '0',
      lineHeight: '1.5'
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 4px rgba(0,0,0,0.06)',
      md: '0 4px 8px rgba(0,0,0,0.1)',
      lg: '0 8px 16px rgba(0,0,0,0.15)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#cccccc'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '350ms',
      easing: 'ease'
    }
  }
};

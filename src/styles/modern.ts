import type { StyleDefinition } from '../engine/types';

export const bentoGrid: StyleDefinition = {
  metadata: {
    id: 'bento-grid',
    name: 'Bento Grid',
    category: 'Modern',
    description: 'Modular compartmentalized card layouts inspired by Japanese bento boxes, featuring clean micro-borders and subtle gradients.',
    tags: ['bento', 'modular', 'apple-style', 'clean', 'cards'],
    personality: 'Structured, organized, high density, crisp modern minimalism',
    history: 'Popularized by Apple event slides and modern SaaS dashboards (2022-present).',
    bestUsedFor: ['Feature showcase sections', 'Metrics dashboards', 'Product highlights', 'Portfolios'],
    relatedStyles: ['swiss-style', 'minimal-warm', 'glassmorphism']
  },
  tokens: {
    colors: {
      bg: '#000000',
      surface: '#111111',
      surfaceHover: '#1c1c1e',
      textPrimary: '#f5f5f7',
      textSecondary: '#86868b',
      textTertiary: '#6e6e73',
      border: 'rgba(255, 255, 255, 0.1)',
      accent: '#2997ff',
      accentHover: '#0077ed',
      glowColor: 'rgba(41, 151, 255, 0.3)'
    },
    typography: {
      fontFamilySans: 'Inter, system-ui, sans-serif',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '2.25rem',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      letterSpacing: '-0.022em',
      lineHeight: '1.47059'
    },
    radii: {
      sm: '12px',
      md: '20px',
      lg: '28px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.4)',
      md: '0 4px 16px rgba(0, 0, 0, 0.6)',
      lg: '0 12px 32px rgba(0, 0, 0, 0.8)',
      inset: 'inset 0 1px 1px rgba(255, 255, 255, 0.1)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: 'rgba(255, 255, 255, 0.08)'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      hoverScale: 1.015,
      activeScale: 0.985
    },
    materials: {
      backdropBlur: '12px',
      gradient: 'radial-gradient(ellipse at top, rgba(255,255,255,0.05) 0%, transparent 70%)'
    }
  },
  behavior: {
    buttonHoverAction: 'lift',
    cardElevationType: 'border',
    focusRingStyle: 'glow'
  }
};

export const swissStyle: StyleDefinition = {
  metadata: {
    id: 'swiss-style',
    name: 'Swiss Style (International Typographic)',
    category: 'Modern',
    description: 'Grid-bound strict layout, asymmetrical balance, objective clarity, high typography contrast, and minimal decorative ornament.',
    tags: ['swiss', 'grid', 'typography', 'helvetica', 'constructivist'],
    personality: 'Objective, authoritative, precise, timeless structural purity',
    history: 'Developed in Switzerland in the 1950s by Josef Müller-Brockmann and Armin Hofmann.',
    bestUsedFor: ['Design systems documentation', 'Editorial sites', 'Infographics', 'Poster layouts'],
    relatedStyles: ['editorial', 'bauhaus', 'bento-grid']
  },
  tokens: {
    colors: {
      bg: '#f4f4f0',
      surface: '#ffffff',
      surfaceHover: '#eaeae4',
      textPrimary: '#111111',
      textSecondary: '#444444',
      textTertiary: '#777777',
      border: '#111111',
      accent: '#ff3b30',
      accentHover: '#d70015'
    },
    typography: {
      fontFamilySans: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      fontFamilyHeading: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      fontFamilyMono: 'Courier, monospace',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.25rem',
      fontSizeXl: '1.5rem',
      fontSize2xl: '2.25rem',
      fontSize3xl: '3.5rem',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      letterSpacing: '-0.03em',
      lineHeight: '1.2'
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
      width: '2px',
      style: 'solid',
      color: '#111111'
    },
    motion: {
      durationFast: '100ms',
      durationNormal: '150ms',
      durationSlow: '250ms',
      easing: 'linear'
    },
    icons: {
      strokeWidth: 2,
      filled: false,
      styleVariant: 'sharp'
    }
  },
  behavior: {
    buttonHoverAction: 'invert',
    cardElevationType: 'border',
    focusRingStyle: 'solid-border'
  }
};

export const editorial: StyleDefinition = {
  metadata: {
    id: 'editorial',
    name: 'Editorial / High Magazine',
    category: 'Modern',
    description: 'Serif-driven magazine publishing aesthetic with elegant typographic hierarchy, generous white space, and warm muted tones.',
    tags: ['editorial', 'serif', 'magazine', 'publishing', 'luxurious'],
    personality: 'Refined, cultured, literary, quiet luxury',
    history: 'Rooted in classic print publications like Vogue, The New Yorker, and Kinfolk.',
    bestUsedFor: ['Long-form blogs', 'Luxury e-commerce', 'Portfolio showcases', 'Publishing sites'],
    relatedStyles: ['swiss-style', 'minimal-warm']
  },
  tokens: {
    colors: {
      bg: '#faf8f5',
      surface: '#ffffff',
      surfaceHover: '#f4f0eb',
      textPrimary: '#1a1816',
      textSecondary: '#5a5652',
      textTertiary: '#8c8781',
      border: '#e6e1da',
      accent: '#8c2d19',
      accentHover: '#6e2313'
    },
    typography: {
      fontFamilySans: 'DM Sans, system-ui, sans-serif',
      fontFamilyHeading: 'Playfair Display, Georgia, serif',
      fontFamilyMono: 'Courier New, monospace',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1.0625rem',
      fontSizeLg: '1.25rem',
      fontSizeXl: '1.625rem',
      fontSize2xl: '2.25rem',
      fontSize3xl: '3.25rem',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      letterSpacing: '0.02em',
      lineHeight: '1.65'
    },
    radii: {
      sm: '2px',
      md: '4px',
      lg: '8px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 6px rgba(26, 24, 22, 0.04)',
      md: '0 6px 18px rgba(26, 24, 22, 0.06)',
      lg: '0 12px 36px rgba(26, 24, 22, 0.08)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#e6e1da'
    },
    motion: {
      durationFast: '200ms',
      durationNormal: '350ms',
      durationSlow: '500ms',
      easing: 'ease-out'
    }
  }
};

export const flatDesign: StyleDefinition = {
  metadata: {
    id: 'flat-design',
    name: 'Flat Design 2.0',
    category: 'Modern',
    description: 'Clean 2D surfaces, vibrant solid colors, clear vector shapes, crisp contrast without heavy shadows or gradients.',
    tags: ['flat', '2d', 'vector', 'clean', 'simple'],
    personality: 'Direct, clear, colorful, approachable',
    history: 'Dominated digital design in the 2010s post-skeuomorphism.',
    bestUsedFor: ['SaaS dashboards', 'Mobile apps', 'Educational tools'],
    relatedStyles: ['material-design-3', 'swiss-style']
  },
  tokens: {
    colors: {
      bg: '#f8fafc',
      surface: '#ffffff',
      surfaceHover: '#f1f5f9',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textTertiary: '#94a3b8',
      border: '#e2e8f0',
      accent: '#2563eb',
      accentHover: '#1d4ed8'
    },
    typography: {
      fontFamilySans: 'Inter, system-ui, sans-serif',
      fontFamilyMono: 'monospace',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '1.875rem',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      letterSpacing: '0',
      lineHeight: '1.5'
    },
    radii: {
      sm: '6px',
      md: '10px',
      lg: '16px',
      full: '9999px'
    },
    shadows: {
      sm: 'none',
      md: '0 2px 4px rgba(0,0,0,0.05)',
      lg: '0 4px 8px rgba(0,0,0,0.08)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#e2e8f0'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '200ms',
      durationSlow: '300ms',
      easing: 'ease'
    }
  }
};

export const materialDesign3: StyleDefinition = {
  metadata: {
    id: 'material-design-3',
    name: 'Material Design 3 (Material You)',
    category: 'Modern',
    description: 'Google’s adaptive design system with dynamic color extraction, pill shapes, tonal elevation, and smooth motion curves.',
    tags: ['material', 'google', 'dynamic-color', 'android', 'tonal'],
    personality: 'Expressive, accessible, personal, fluid',
    history: 'Released in 2021 as Google’s flagship multi-platform design language.',
    bestUsedFor: ['Android web apps', 'Productivity tools', 'Google ecosystem apps'],
    relatedStyles: ['fluent-design', 'flat-design']
  },
  tokens: {
    colors: {
      bg: '#fef7ff',
      surface: '#f3edf7',
      surfaceHover: '#e8def8',
      textPrimary: '#1d1b20',
      textSecondary: '#49454f',
      textTertiary: '#79747e',
      border: '#79747e',
      accent: '#6750a4',
      accentHover: '#4f378b'
    },
    typography: {
      fontFamilySans: 'Roboto, Inter, sans-serif',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.375rem',
      fontSize2xl: '1.75rem',
      fontSize3xl: '2.25rem',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      letterSpacing: '0.1px',
      lineHeight: '1.4'
    },
    radii: {
      sm: '8px',
      md: '16px',
      lg: '28px',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.12)',
      md: '0 4px 8px rgba(0,0,0,0.15)',
      lg: '0 8px 16px rgba(0,0,0,0.18)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: 'rgba(121, 116, 126, 0.2)'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: 'cubic-bezier(0.2, 0, 0, 1)'
    }
  }
};

export const fluentDesign: StyleDefinition = {
  metadata: {
    id: 'fluent-design',
    name: 'Fluent Design (Windows 11)',
    category: 'Modern',
    description: 'Microsoft system featuring acrylic blur, subtle drop shadow elevation, rounded corners, and soft lighting effects.',
    tags: ['fluent', 'microsoft', 'windows11', 'acrylic', 'mica'],
    personality: 'Productive, clean, natural, subtle depth',
    history: 'Introduced by Microsoft in 2017 and refined for Windows 11.',
    bestUsedFor: ['Enterprise web apps', 'Desktop web tools', 'Dashboards'],
    relatedStyles: ['glassmorphism', 'material-design-3']
  },
  tokens: {
    colors: {
      bg: '#f3f3f3',
      surface: 'rgba(255, 255, 255, 0.7)',
      surfaceHover: 'rgba(255, 255, 255, 0.9)',
      textPrimary: '#1b1b1b',
      textSecondary: '#5d5d5d',
      textTertiary: '#8d8d8d',
      border: 'rgba(0, 0, 0, 0.08)',
      accent: '#0078d4',
      accentHover: '#005a9e'
    },
    typography: {
      fontFamilySans: 'Segoe UI, system-ui, sans-serif',
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
      lineHeight: '1.4'
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 4px rgba(0,0,0,0.06)',
      md: '0 8px 16px rgba(0,0,0,0.14)',
      lg: '0 16px 32px rgba(0,0,0,0.2)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: 'rgba(0, 0, 0, 0.08)'
    },
    motion: {
      durationFast: '125ms',
      durationNormal: '250ms',
      durationSlow: '375ms',
      easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)'
    },
    materials: {
      backdropBlur: '30px',
      opacity: 0.8
    }
  }
};

export const minimalWarm: StyleDefinition = {
  metadata: {
    id: 'minimal-warm',
    name: 'Minimal Warm',
    category: 'Minimalist',
    description: 'Soft beige/cream backgrounds with warm terracotta accents, high readability, and calming organic feel.',
    tags: ['warm', 'cream', 'minimal', 'calm', 'terracotta'],
    personality: 'Calm, comforting, human, organic simplicity',
    history: 'Popularized by modern lifestyle brands, Notion-like apps, and wellness platforms.',
    bestUsedFor: ['Note-taking apps', 'Wellness & mindfulness platforms', 'Personal blogs'],
    relatedStyles: ['editorial', 'bento-grid']
  },
  tokens: {
    colors: {
      bg: '#fdfbf7',
      surface: '#f5f0eb',
      surfaceHover: '#eee7df',
      textPrimary: '#2c2825',
      textSecondary: '#6e6760',
      textTertiary: '#9e968d',
      border: '#e6ded5',
      accent: '#c86d51',
      accentHover: '#ab5439'
    },
    typography: {
      fontFamilySans: 'Manrope, system-ui, sans-serif',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '2rem',
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      letterSpacing: '-0.01em',
      lineHeight: '1.6'
    },
    radii: {
      sm: '8px',
      md: '14px',
      lg: '20px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 8px rgba(44, 40, 37, 0.04)',
      md: '0 6px 16px rgba(44, 40, 37, 0.06)',
      lg: '0 12px 28px rgba(44, 40, 37, 0.08)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#e6ded5'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '350ms',
      easing: 'ease-out'
    }
  }
};

/**
 * Themes contributed by the community, credited to their authors. They are
 * ordinary theme definitions: adding a theme means adding one definition like
 * these and running the tests.
 */

import type { StyleDefinition } from '../engine/types';

export const auroraGlass: StyleDefinition = {
  metadata: {
    id: 'community-aurora-glass',
    name: 'Aurora Glass',
    category: 'Morphism',
    description: 'Vibrant translucent glass with holographic aurora gradients drifting behind every surface.',
    tags: ['community', 'aurora', 'glass', 'holographic'],
    personality: 'Ethereal, vibrant, futuristic glass',
    bestUsedFor: ['Creative portals', 'Web3 dashboards', 'Launch pages'],
    avoidWhen: ['Long-form reading', 'Data-dense admin tools'],
    visualCharacter: 'Frosted panes over moving colour fields, light edges, soft glow',
    history: 'A community take on glassmorphism that borrows the colour language of aurora and holographic foil finishes.',
    relatedStyles: ['glassmorphism', 'auroramorphism'],
    author: 'alex_designer',
    version: '1.0.0',
    license: 'MIT',
    source: 'community'
  },
  tokens: {
    colors: {
      bg: '#0a0d18',
      surface: 'rgba(255, 255, 255, 0.08)',
      surfaceHover: 'rgba(255, 255, 255, 0.15)',
      textPrimary: '#ffffff',
      textSecondary: '#a5b4fc',
      textTertiary: '#6366f1',
      border: 'rgba(255, 255, 255, 0.2)',
      accent: '#818cf8',
      accentHover: '#6366f1',
      glowColor: '#818cf8'
    },
    typography: {
      fontFamilySans: 'Plus Jakarta Sans, sans-serif',
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
      sm: '10px',
      md: '18px',
      lg: '24px',
      full: '9999px'
    },
    shadows: {
      sm: '0 4px 12px rgba(129, 140, 248, 0.2)',
      md: '0 8px 24px rgba(129, 140, 248, 0.3)',
      lg: '0 16px 36px rgba(129, 140, 248, 0.4)',
      glow: '0 0 24px rgba(129, 140, 248, 0.6)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: 'rgba(255, 255, 255, 0.2)'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    },
    materials: {
      backdropBlur: '20px',
      opacity: 0.85,
      backgroundImage: 'radial-gradient(60% 50% at 15% 10%, rgba(129, 140, 248, 0.35), transparent 70%), radial-gradient(50% 45% at 85% 85%, rgba(34, 211, 238, 0.25), transparent 70%), radial-gradient(40% 40% at 70% 20%, rgba(236, 72, 153, 0.18), transparent 70%)'
    }
  },
  svgLanguage: {
    cornerStyle: 'rounded',
    decorativeShapes: true,
    patternOverlay: 'aurora'
  },
  behavior: {
    buttonHoverAction: 'glow',
    cardElevationType: 'gradient-border',
    focusRingStyle: 'glow'
  }
};

export const deepBloom: StyleDefinition = {
  metadata: {
    id: 'community-deep-bloom',
    name: 'Deep Bloom',
    category: 'Futuristic',
    description: 'Dark liquid surfaces with a slow accent gradient, glowing depth and a warm bloom-red accent.',
    tags: ['community', 'dark', 'liquid', 'glow', 'warm'],
    personality: 'Quiet, warm, luminous — a dark room lit by one colour',
    bestUsedFor: ['Music and media players', 'Night-mode dashboards', 'Portfolio sites'],
    source: 'community',
    version: '1.0.0',
    visualCharacter: 'liquid · glowing · smooth',
    author: 'Chinto-lgtm',
    license: 'MIT',
    avoidWhen: ['Print-adjacent layouts', 'Bright ambient light', 'Dense spreadsheets']
  },
  tokens: {
    colors: {
      bg: '#1c1717',
      surface: '#2c2626',
      surfaceHover: '#3c3434',
      surfaceActive: '#3c3434',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      textTertiary: '#64748b',
      border: '#463e3e',
      borderHover: '#d65c5c',
      accent: '#d65c5c',
      accentHover: '#e08585',
      accentText: '#ffffff',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      shadowColor: 'rgba(0,0,0,0.6)',
      glowColor: '#d65c5c'
    },
    typography: {
      fontFamilySans: 'Inter, sans-serif',
      fontFamilyHeading: 'Inter, sans-serif',
      fontFamilyMono: 'JetBrains Mono, monospace',
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
      sm: '6px',
      md: '10px',
      lg: '16px',
      xl: '22px',
      full: '9999px'
    },
    shadows: {
      sm: '0 0 8px rgba(214, 92, 92, 0.35)',
      md: '0 0 20px rgba(214, 92, 92, 0.45)',
      lg: '0 0 40px rgba(214, 92, 92, 0.55)',
      glow: '0 0 18px rgba(214, 92, 92, 0.8)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#463e3e',
      opacity: 1
    },
    motion: {
      durationFast: '160ms',
      durationNormal: '260ms',
      durationSlow: '420ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      hoverScale: 1.02,
      activeScale: 0.98
    },
    materials: {
      opacity: 0.95,
      backdropBlur: '8px',
      gradient: 'linear-gradient(120deg, rgba(214, 92, 92, 0.18), transparent 50%, rgba(224, 133, 133, 0.14))'
    },
    icons: {
      strokeWidth: 2,
      filled: false,
      styleVariant: 'rounded'
    }
  },
  svgLanguage: {
    cornerStyle: 'rounded',
    decorativeShapes: false,
    patternOverlay: 'grid',
    borderDecoration: false
  },
  behavior: {
    buttonHoverAction: 'glow',
    cardElevationType: 'gradient-border',
    focusRingStyle: 'glow'
  }
};

export const retroCyber: StyleDefinition = {
  metadata: {
    source: 'community',
    id: 'community-retro-cyber',
    name: 'Neon Arcade',
    category: 'Expressive',
    description: 'High-octane neon cabinet aesthetic: magenta and cyan phosphor on near-black, chunky borders and a CRT scanline sheen.',
    tags: ['community', 'cyberpunk', 'neon', 'arcade', 'crt'],
    personality: 'Loud, nostalgic, electric',
    history: 'Extends the built-in Cyberpunk style with an 80s arcade cabinet palette and heavier borders.',
    bestUsedFor: ['Game launchers', 'Event microsites', 'Music players'],
    relatedStyles: ['retrofuturism', 'sci-fi-hud', 'neo-brutalism', 'cyberpunk'],
    visualCharacter: 'Phosphor glow on black, thick borders, scanlines',
    avoidWhen: ['Accessibility-critical forms', 'Print-adjacent content'],
    principles: ['Darkness as canvas', 'Neon for signal only', 'Angular, technical geometry'],
    author: 'hacker_dev',
    version: '1.0.0',
    license: 'MIT'
  },
  tokens: {
    colors: {
      bg: '#050010',
      surface: '#0f0520',
      surfaceHover: '#1a0a33',
      textPrimary: '#f8f0ff',
      textSecondary: '#c084fc',
      textTertiary: '#ffe600',
      border: '#ff2bd6',
      accent: '#ff2bd6',
      accentHover: '#ff6be6',
      glowColor: '#22d3ee'
    },
    typography: {
      fontFamilySans: 'Space Grotesk, Orbitron, sans-serif',
      fontFamilyMono: 'Fira Code, monospace',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.25rem',
      fontSizeXl: '1.5rem',
      fontSize2xl: '2rem',
      fontSize3xl: '2.75rem',
      fontWeightNormal: 400,
      fontWeightMedium: 700,
      fontWeightBold: 900,
      letterSpacing: '0.05em',
      lineHeight: '1.3'
    },
    radii: {
      sm: '0px',
      md: '2px',
      lg: '4px',
      full: '0px'
    },
    shadows: {
      sm: '0 0 8px rgba(255, 43, 214, 0.5)',
      md: '0 0 20px rgba(255, 43, 214, 0.6)',
      lg: '0 0 40px rgba(34, 211, 238, 0.6)',
      glow: '0 0 18px rgba(34, 211, 238, 0.9)'
    },
    borders: {
      width: '3px',
      style: 'solid',
      color: '#ff2bd6'
    },
    motion: {
      durationFast: '100ms',
      durationNormal: '180ms',
      durationSlow: '300ms',
      easing: 'steps(4, end)'
    },
    materials: {
      texture: 'scanline',
      gradient: 'linear-gradient(90deg, rgba(0,240,255,0.15) 0%, rgba(255,0,85,0.15) 100%)'
    },
    icons: {
      strokeWidth: 2,
      filled: false,
      styleVariant: 'sharp'
    }
  },
  behavior: {
    buttonHoverAction: 'glow',
    cardElevationType: 'gradient-border',
    focusRingStyle: 'glow'
  },
  svgLanguage: {
    cornerStyle: 'sharp',
    decorativeShapes: true,
    patternOverlay: 'grid',
    borderDecoration: false
  }
};

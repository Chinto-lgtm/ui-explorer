import type { StyleDefinition } from '../engine/types';

export const sciFiHud: StyleDefinition = {
  metadata: {
    id: 'sci-fi-hud',
    name: 'Sci-Fi / FUI / HUD',
    category: 'Futuristic',
    description: 'Heads-Up Display style with angular corner reticles, telemetry data readouts, monospaced typography, and glowing cyan/amber lines.',
    tags: ['hud', 'fui', 'sci-fi', 'telemetry', 'hacker'],
    personality: 'Analytical, military-tech, precise, futuristic-tactical',
    history: 'Derived from movie UI design (Iron Man, Minority Report, Oblivion).',
    bestUsedFor: ['Monitoring dashboards', 'Server telemetry', 'Cybersecurity tools'],
    relatedStyles: ['cyberpunk', 'dark-oled']
  },
  tokens: {
    colors: {
      bg: '#020b14',
      surface: '#051829',
      surfaceHover: '#0a253e',
      textPrimary: '#00e5ff',
      textSecondary: '#0099b8',
      textTertiary: '#005f73',
      border: '#00e5ff',
      accent: '#ff9e00',
      accentHover: '#e68e00',
      glowColor: '#00e5ff'
    },
    typography: {
      fontFamilySans: 'Share Tech Mono, Fira Code, monospace',
      fontFamilyMono: 'Fira Code, monospace',
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
      letterSpacing: '0.06em',
      lineHeight: '1.4'
    },
    radii: {
      sm: '0px',
      md: '0px',
      lg: '2px',
      full: '0px'
    },
    shadows: {
      sm: '0 0 8px rgba(0, 229, 255, 0.4)',
      md: '0 0 16px rgba(0, 229, 255, 0.6)',
      lg: '0 0 24px rgba(255, 158, 0, 0.7)',
      glow: '0 0 15px #00e5ff'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#00e5ff'
    },
    motion: {
      durationFast: '100ms',
      durationNormal: '200ms',
      durationSlow: '350ms',
      easing: 'linear'
    },
    materials: {
      texture: 'grid'
    },
    icons: {
      strokeWidth: 1.5,
      filled: false,
      styleVariant: 'sharp'
    }
  },
  svgLanguage: {
    cornerStyle: 'bevel',
    decorativeShapes: true,
    borderDecoration: true
  }
};

export const darkOled: StyleDefinition = {
  metadata: {
    id: 'dark-oled',
    name: 'Dark Mode / OLED Pitch Black',
    category: 'Futuristic',
    description: 'True #000000 black background optimized for OLED power saving, subtle dark grey cards, high-contrast white text, and vivid accent dots.',
    tags: ['oled', 'dark-mode', 'pitch-black', 'minimal', 'power-saving'],
    personality: 'Sleek, battery-friendly, focused, high contrast',
    history: 'Emerged alongside mobile OLED displays for power and dark room readability.',
    bestUsedFor: ['Mobile apps', 'Late night dashboards', 'Developer tools'],
    relatedStyles: ['bento-grid', 'minimal-warm']
  },
  tokens: {
    colors: {
      bg: '#000000',
      surface: '#121212',
      surfaceHover: '#1e1e1e',
      textPrimary: '#ffffff',
      textSecondary: '#a0a0a0',
      textTertiary: '#666666',
      border: '#262626',
      accent: '#6366f1',
      accentHover: '#4f46e5'
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
      fontWeightBold: 600,
      letterSpacing: '0',
      lineHeight: '1.5'
    },
    radii: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 4px rgba(0,0,0,0.8)',
      md: '0 4px 12px rgba(0,0,0,0.9)',
      lg: '0 8px 24px rgba(0,0,0,1)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#262626'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '350ms',
      easing: 'ease'
    }
  }
};

export const chromeMetallic: StyleDefinition = {
  metadata: {
    id: 'chrome-metallic',
    name: 'Chrome / Metallic Liquid',
    category: 'Futuristic',
    description: 'High-gloss metallic silver gradients, liquid reflections, bevel highlights, and futuristic luxury vibe.',
    tags: ['chrome', 'metallic', 'silver', 'glossy', 'liquid'],
    personality: 'High-tech, futuristic-luxury, reflective, sleek',
    history: 'Trending in modern 3D design, luxury fashion tech, and Web3.',
    bestUsedFor: ['Luxury Web3 apps', 'High-end audio plug-ins', 'Creative showcases'],
    relatedStyles: ['y2k-aesthetic', 'glassmorphism']
  },
  tokens: {
    colors: {
      bg: '#0d0e12',
      surface: 'linear-gradient(145deg, #2a2d36 0%, #12141a 100%)',
      surfaceHover: 'linear-gradient(145deg, #353945 0%, #1a1c24 100%)',
      textPrimary: '#e6ebf5',
      textSecondary: '#94a0b8',
      textTertiary: '#647087',
      border: '#4a5266',
      accent: '#e2e8f0',
      accentHover: '#ffffff',
      highlightColor: '#ffffff'
    },
    typography: {
      fontFamilySans: 'Space Grotesk, Inter, sans-serif',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '2.25rem',
      fontWeightNormal: 400,
      fontWeightMedium: 600,
      fontWeightBold: 800,
      letterSpacing: '0.02em',
      lineHeight: '1.4'
    },
    radii: {
      sm: '8px',
      md: '14px',
      lg: '20px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
      md: '0 6px 16px rgba(0, 0, 0, 0.8), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
      lg: '0 12px 32px rgba(0, 0, 0, 0.9), inset 0 2px 4px rgba(255, 255, 255, 0.7)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#4a5266'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    },
    materials: {
      gradient: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #475569 100%)'
    }
  }
};

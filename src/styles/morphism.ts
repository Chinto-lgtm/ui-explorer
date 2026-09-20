import type { StyleDefinition } from '../engine/types';

export const neumorphism: StyleDefinition = {
  metadata: {
    id: 'neumorphism',
    name: 'Neumorphism',
    category: 'Morphism',
    description: 'Soft 3D extrusion aesthetics with dual light & dark drop shadows, creating tactile tactile element feel.',
    tags: ['soft-ui', '3d', 'extruded', 'tactile', 'minimal'],
    personality: 'Tactile, calm, futuristic yet organic, soft depth',
    history: 'Popularized around 2019-2020 as a blend of flat design and classic skeuomorphism.',
    bestUsedFor: ['Smart home controllers', 'Audio player interfaces', 'Dashboard widgets', 'Calculator apps'],
    relatedStyles: ['glassmorphism', 'claymorphism', 'skeuomorphism']
  },
  tokens: {
    colors: {
      bg: '#e0e5ec',
      surface: '#e0e5ec',
      surfaceHover: '#e6ebf2',
      surfaceActive: '#d5dae1',
      textPrimary: '#2d3748',
      textSecondary: '#718096',
      textTertiary: '#a0aec0',
      border: 'transparent',
      accent: '#4c51bf',
      accentHover: '#434190',
      shadowColor: '#a3b1c6',
      highlightColor: '#ffffff',
      glowColor: 'rgba(76, 81, 191, 0.4)'
    },
    typography: {
      fontFamilySans: 'Inter, system-ui, sans-serif',
      fontFamilyMono: 'Fira Code, monospace',
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
      letterSpacing: '0.01em',
      lineHeight: '1.5'
    },
    radii: {
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      full: '9999px'
    },
    shadows: {
      sm: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff',
      md: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
      lg: '9px 9px 18px #a3b1c6, -9px -9px 18px #ffffff',
      inset: 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',
      glow: '0 0 15px rgba(76, 81, 191, 0.4)'
    },
    borders: {
      width: '0px',
      style: 'none',
      color: 'transparent'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      hoverScale: 1.01,
      activeScale: 0.98
    },
    materials: {
      backdropBlur: '0px',
      opacity: 1,
      texture: 'none'
    },
    icons: {
      strokeWidth: 2,
      filled: false,
      styleVariant: 'rounded'
    }
  },
  behavior: {
    buttonHoverAction: 'press',
    cardElevationType: 'shadow',
    focusRingStyle: 'glow'
  }
};

export const glassmorphism: StyleDefinition = {
  metadata: {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    category: 'Morphism',
    description: 'Frosted glass translucent surfaces with multi-layered depth, vivid background gradients, and delicate bright borders.',
    tags: ['frosted-glass', 'translucent', 'backdrop-blur', 'vivid-gradients', 'modern'],
    personality: 'Ethereal, premium, sleek, multi-layered depth',
    history: 'Pioneered in iOS 7 and elevated in Windows Vista / macOS Big Sur.',
    bestUsedFor: ['Crypto wallets', 'Overlays & Modals', 'Music players', 'Hero cards'],
    relatedStyles: ['auroramorphism', 'neumorphism']
  },
  tokens: {
    colors: {
      bg: '#0f172a',
      surface: 'rgba(255, 255, 255, 0.08)',
      surfaceHover: 'rgba(255, 255, 255, 0.15)',
      surfaceActive: 'rgba(255, 255, 255, 0.05)',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textTertiary: '#64748b',
      border: 'rgba(255, 255, 255, 0.18)',
      accent: '#38bdf8',
      accentHover: '#0284c7',
      shadowColor: 'rgba(0, 0, 0, 0.37)',
      highlightColor: 'rgba(255, 255, 255, 0.3)',
      glowColor: 'rgba(56, 189, 248, 0.5)'
    },
    typography: {
      fontFamilySans: 'Plus Jakarta Sans, system-ui, sans-serif',
      fontFamilyMono: 'JetBrains Mono, monospace',
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
      letterSpacing: '-0.01em',
      lineHeight: '1.5'
    },
    radii: {
      sm: '12px',
      md: '20px',
      lg: '28px',
      full: '9999px'
    },
    shadows: {
      sm: '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
      md: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      lg: '0 16px 48px 0 rgba(0, 0, 0, 0.5)',
      inset: 'inset 0 0 12px rgba(255, 255, 255, 0.1)',
      glow: '0 0 25px rgba(56, 189, 248, 0.4)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: 'rgba(255, 255, 255, 0.18)'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '350ms',
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      hoverScale: 1.02,
      activeScale: 0.98
    },
    materials: {
      backdropBlur: '16px',
      opacity: 0.85,
      gradient: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)'
    },
    icons: {
      strokeWidth: 1.75,
      filled: false,
      styleVariant: 'outline'
    }
  },
  behavior: {
    buttonHoverAction: 'glow',
    cardElevationType: 'gradient-border',
    focusRingStyle: 'glow'
  }
};

export const claymorphism: StyleDefinition = {
  metadata: {
    id: 'claymorphism',
    name: 'Claymorphism',
    category: 'Morphism',
    description: 'Chubby, inflated 3D clay-like elements with pillowy inner shadows and bright pastel color palettes.',
    tags: ['clay', '3d', 'pillowy', 'playful', 'chubby'],
    personality: 'Playful, friendly, tactile, soft and inflated',
    history: 'Emerging post-2021 trend as a friendly alternative to flat illustration.',
    bestUsedFor: ['Kids products', 'Gamified apps', 'Onboarding flows', 'Illustration UI'],
    relatedStyles: ['neumorphism', 'memphis']
  },
  tokens: {
    colors: {
      bg: '#f3e8ff',
      surface: '#ffffff',
      surfaceHover: '#faf5ff',
      textPrimary: '#4c1d95',
      textSecondary: '#6b21a8',
      textTertiary: '#9333ea',
      border: 'transparent',
      accent: '#a855f7',
      accentHover: '#9333ea',
      shadowColor: '#c084fc'
    },
    typography: {
      fontFamilySans: 'Poppins, system-ui, sans-serif',
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
      sm: '16px',
      md: '24px',
      lg: '36px',
      full: '9999px'
    },
    shadows: {
      sm: '8px 8px 16px #d8b4fe, inset -4px -4px 8px rgba(0,0,0,0.1), inset 4px 4px 8px rgba(255,255,255,0.7)',
      md: '12px 12px 24px #c084fc, inset -6px -6px 12px rgba(0,0,0,0.12), inset 6px 6px 12px rgba(255,255,255,0.8)',
      lg: '16px 16px 32px #a855f7, inset -8px -8px 16px rgba(0,0,0,0.15), inset 8px 8px 16px rgba(255,255,255,0.9)',
      inset: 'inset 6px 6px 12px rgba(0,0,0,0.15), inset -6px -6px 12px rgba(255,255,255,0.8)'
    },
    borders: {
      width: '0px',
      style: 'none',
      color: 'transparent'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      hoverScale: 1.04,
      activeScale: 0.95
    },
    icons: {
      strokeWidth: 2.5,
      filled: true,
      styleVariant: 'rounded'
    }
  }
};

export const auroramorphism: StyleDefinition = {
  metadata: {
    id: 'auroramorphism',
    name: 'Auroramorphism',
    category: 'Morphism',
    description: 'Vibrant, fluid mesh gradients resembling Northern Lights underneath soft glass surfaces.',
    tags: ['aurora', 'mesh-gradient', 'fluid', 'vivid', 'cosmic'],
    personality: 'Vibrant, magical, sleek, dynamic energy',
    history: 'Popularized by modern Web3 and AI marketing landing pages (2022+).',
    bestUsedFor: ['AI platforms', 'SaaS landing pages', 'Web3 dashboards', 'Creative portfolios'],
    relatedStyles: ['glassmorphism', 'cyberpunk']
  },
  tokens: {
    colors: {
      bg: '#090d16',
      surface: 'rgba(255, 255, 255, 0.05)',
      surfaceHover: 'rgba(255, 255, 255, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      textTertiary: '#64748b',
      border: 'rgba(255, 255, 255, 0.12)',
      accent: '#ec4899',
      accentHover: '#d946ef',
      glowColor: '#8b5cf6'
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
      letterSpacing: '-0.02em',
      lineHeight: '1.5'
    },
    radii: {
      sm: '12px',
      md: '20px',
      lg: '28px',
      full: '9999px'
    },
    shadows: {
      sm: '0 4px 20px rgba(236, 72, 153, 0.15)',
      md: '0 8px 30px rgba(139, 92, 246, 0.25)',
      lg: '0 12px 40px rgba(59, 130, 246, 0.35)',
      glow: '0 0 30px rgba(236, 72, 153, 0.4)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: 'rgba(255, 255, 255, 0.15)'
    },
    motion: {
      durationFast: '200ms',
      durationNormal: '300ms',
      durationSlow: '500ms',
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      hoverScale: 1.02
    },
    materials: {
      backdropBlur: '20px',
      opacity: 0.9,
      gradient: 'radial-gradient(at 0% 0%, rgba(236, 72, 153, 0.3) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.3) 0px, transparent 50%)'
    }
  }
};

export const aeroGlass: StyleDefinition = {
  metadata: {
    id: 'aero-glass',
    name: 'Windows Aero / Skeuomorphic Glass',
    category: 'Morphism',
    description: 'Nostalgic mid-2000s Windows Vista/7 translucent glass title bars, glossy highlights, sky blue gradients, and diagonal stripe refractions.',
    tags: ['aero', 'windows7', 'vista', 'glass', 'glossy'],
    personality: 'Nostalgic, glossy, optimistic, sky-high glass',
    history: 'Defined Windows Vista and Windows 7 design language (2006-2012).',
    bestUsedFor: ['Retro OS interfaces', 'Desktop web simulators', 'Media players'],
    relatedStyles: ['glassmorphism', 'skeuomorphism']
  },
  tokens: {
    colors: {
      bg: '#1e385b',
      surface: 'rgba(255, 255, 255, 0.25)',
      surfaceHover: 'rgba(255, 255, 255, 0.4)',
      textPrimary: '#ffffff',
      textSecondary: '#d0e2f7',
      textTertiary: '#a0c4e8',
      border: 'rgba(255, 255, 255, 0.4)',
      accent: '#2b95e9',
      accentHover: '#1b7ac7'
    },
    typography: {
      fontFamilySans: 'Segoe UI, Tahoma, sans-serif',
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
      sm: '6px',
      md: '10px',
      lg: '14px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      md: '0 6px 16px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.7)',
      lg: '0 12px 28px rgba(0, 0, 0, 0.5)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: 'rgba(255, 255, 255, 0.4)'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: 'ease'
    },
    materials: {
      backdropBlur: '24px',
      opacity: 0.8
    }
  }
};

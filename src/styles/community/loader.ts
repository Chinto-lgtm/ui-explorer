import type { StyleDefinition } from '../../engine/types';

export const communityStyles: StyleDefinition[] = [
  {
    metadata: {
      id: 'community-aurora-glass',
      name: 'Aurora Glass Community',
      category: 'Morphism',
      description: 'Vibrant translucent glass style with holographic aurora gradients contributed by alex_designer.',
      tags: ['community', 'aurora', 'glass'],
      personality: 'Ethereal, vibrant, futuristic glass',
      bestUsedFor: ['Creative portals', 'Web3 dashboards'],
      author: 'alex_designer'
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
        lg: '0 16px 36px rgba(129, 140, 248, 0.4)'
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
        opacity: 0.85
      }
    }
  }
];

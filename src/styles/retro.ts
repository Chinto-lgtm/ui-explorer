import type { StyleDefinition } from '../engine/types';

export const pixelArt: StyleDefinition = {
  metadata: {
    id: 'pixel-art',
    name: 'Pixel Art / 8-Bit Retro',
    category: 'Retro',
    description: 'Chunky pixelated grids, crisp 8-bit borders, limited arcade color palettes, retro gaming fonts, and zero antialiasing feel.',
    tags: ['pixel-art', '8-bit', 'arcade', 'retro-gaming', 'nostalgic'],
    personality: 'Playful, nostalgic, arcade-fun, blocky',
    history: 'Modeled after NES, Game Boy, and SNES arcade game UIs of the 80s and 90s.',
    bestUsedFor: ['Retro game portals', 'Gamified apps', 'NFT projects', 'Indie dev sites'],
    relatedStyles: ['memphis', 'retrofuturism']
  },
  tokens: {
    colors: {
      bg: '#181425',
      surface: '#262b44',
      surfaceHover: '#3a4466',
      textPrimary: '#f4f4f4',
      textSecondary: '#8b9bb4',
      textTertiary: '#5a6988',
      border: '#000000',
      accent: '#ff0044',
      accentHover: '#d9003a',
      shadowColor: '#000000'
    },
    typography: {
      fontFamilySans: '"Press Start 2P", VT323, monospace',
      fontFamilyMono: '"Press Start 2P", monospace',
      fontSizeXs: '0.625rem',
      fontSizeSm: '0.75rem',
      fontSizeBase: '0.875rem',
      fontSizeLg: '1rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '2rem',
      fontWeightNormal: 400,
      fontWeightMedium: 400,
      fontWeightBold: 400,
      letterSpacing: '0.05em',
      lineHeight: '1.8'
    },
    radii: {
      sm: '0px',
      md: '0px',
      lg: '0px',
      full: '0px'
    },
    shadows: {
      sm: '4px 4px 0px #000000',
      md: '6px 6px 0px #000000',
      lg: '8px 8px 0px #000000'
    },
    borders: {
      width: '4px',
      style: 'solid',
      color: '#000000'
    },
    motion: {
      durationFast: '0ms',
      durationNormal: '50ms',
      durationSlow: '100ms',
      easing: 'steps(2, jump-none)'
    },
    icons: {
      strokeWidth: 4,
      filled: true,
      styleVariant: 'sharp'
    }
  }
};

export const skeuomorphism: StyleDefinition = {
  metadata: {
    id: 'skeuomorphism',
    name: 'Classic Skeuomorphism (iOS 6 era)',
    category: 'Retro',
    description: 'Realistic textures (stitched leather, brushed metal, linen), glossy highlights, drop shadows, and bevel buttons replicating physical objects.',
    tags: ['skeuomorphic', 'ios6', 'realistic', 'leather', 'linen'],
    personality: 'Familiar, realistic, tactile, ornate',
    history: 'Pioneered in early iOS and Mac OS X (2007-2012) to make digital touch interfaces intuitive.',
    bestUsedFor: ['Retro app showcases', 'Audio software', 'Classic tool emulation'],
    relatedStyles: ['skeuomorphic-analog', 'neumorphism']
  },
  tokens: {
    colors: {
      bg: '#2d3238',
      surface: 'linear-gradient(180deg, #484f56 0%, #353b41 100%)',
      surfaceHover: '#505860',
      textPrimary: '#f0f3f6',
      textSecondary: '#b0b8c0',
      textTertiary: '#808890',
      border: '#1a1d20',
      accent: '#2b82c9',
      accentHover: '#1f65a0',
      shadowColor: 'rgba(0,0,0,0.5)',
      highlightColor: 'rgba(255,255,255,0.4)'
    },
    typography: {
      fontFamilySans: 'Helvetica Neue, Arial, sans-serif',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '2rem',
      fontWeightNormal: 400,
      fontWeightMedium: 700,
      fontWeightBold: 700,
      letterSpacing: '0',
      lineHeight: '1.4'
    },
    radii: {
      sm: '5px',
      md: '10px',
      lg: '15px',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 3px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
      md: '0 4px 8px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.4)',
      lg: '0 8px 16px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.5)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#1a1d20'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: 'ease-out'
    }
  }
};

export const skeuomorphicAnalog: StyleDefinition = {
  metadata: {
    id: 'skeuomorphic-analog',
    name: 'Analog Audio / Hardware Rack',
    category: 'Retro',
    description: 'Physical hardware rack aesthetic with brushed aluminum panels, rotary knobs, VU meters, LED indicators, and toggle switches.',
    tags: ['hardware', 'analog', 'audio-rack', 'knobs', 'vintage'],
    personality: 'Tactile, professional, analog warmth, mechanical',
    history: 'Rooted in physical studio music gear (Synthesizers, Equalizers, Compressors).',
    bestUsedFor: ['Audio DAWs', 'Synthesizer apps', 'Music production tools'],
    relatedStyles: ['skeuomorphism', 'industrial']
  },
  tokens: {
    colors: {
      bg: '#141416',
      surface: '#222328',
      surfaceHover: '#2a2b32',
      textPrimary: '#e0e0e0',
      textSecondary: '#999999',
      textTertiary: '#666666',
      border: '#33343c',
      accent: '#ff6600',
      accentHover: '#cc5200'
    },
    typography: {
      fontFamilySans: 'Trebuchet MS, Arial, sans-serif',
      fontFamilyMono: 'Courier, monospace',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '2rem',
      fontWeightNormal: 400,
      fontWeightMedium: 700,
      fontWeightBold: 700,
      letterSpacing: '0.05em',
      lineHeight: '1.4'
    },
    radii: {
      sm: '3px',
      md: '6px',
      lg: '8px',
      full: '9999px'
    },
    shadows: {
      sm: '0 2px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
      md: '0 4px 10px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.15)',
      lg: '0 8px 20px rgba(0,0,0,0.95)'
    },
    borders: {
      width: '1px',
      style: 'solid',
      color: '#33343c'
    },
    motion: {
      durationFast: '100ms',
      durationNormal: '200ms',
      durationSlow: '300ms',
      easing: 'ease'
    }
  }
};

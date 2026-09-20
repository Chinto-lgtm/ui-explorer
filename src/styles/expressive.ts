import type { StyleDefinition } from '../engine/types';

export const neoBrutalism: StyleDefinition = {
  metadata: {
    id: 'neo-brutalism',
    name: 'Neo Brutalism',
    category: 'Expressive',
    description: 'Raw high-contrast design featuring thick black borders, hard offset box-shadows, vivid primary colors, and unapologetic typography.',
    tags: ['brutalist', 'raw', 'thick-borders', 'hard-shadows', 'vivid'],
    personality: 'Rebellious, energetic, bold, raw, unapologetic',
    history: 'A digital reaction against soft flat minimalism and polished corporate gradients (2021+).',
    bestUsedFor: ['Developer tools', 'Creative portfolios', 'Figma plugins', 'Event websites'],
    relatedStyles: ['cyberpunk', 'memphis', 'swiss-style']
  },
  tokens: {
    colors: {
      bg: '#fffdf8',
      surface: '#ffea79',
      surfaceHover: '#ffd633',
      textPrimary: '#000000',
      textSecondary: '#1a1a1a',
      textTertiary: '#333333',
      border: '#000000',
      accent: '#ff5964',
      accentHover: '#ff2635',
      shadowColor: '#000000'
    },
    typography: {
      fontFamilySans: 'Space Grotesk, Inter, sans-serif',
      fontFamilyMono: 'JetBrains Mono, monospace',
      fontSizeXs: '0.8125rem',
      fontSizeSm: '0.9375rem',
      fontSizeBase: '1.0625rem',
      fontSizeLg: '1.25rem',
      fontSizeXl: '1.5rem',
      fontSize2xl: '2rem',
      fontSize3xl: '3rem',
      fontWeightNormal: 500,
      fontWeightMedium: 700,
      fontWeightBold: 900,
      letterSpacing: '-0.02em',
      lineHeight: '1.3'
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      full: '9999px'
    },
    shadows: {
      sm: '3px 3px 0px #000000',
      md: '5px 5px 0px #000000',
      lg: '8px 8px 0px #000000',
      inset: 'inset 3px 3px 0px #000000'
    },
    borders: {
      width: '3px',
      style: 'solid',
      color: '#000000'
    },
    motion: {
      durationFast: '80ms',
      durationNormal: '120ms',
      durationSlow: '200ms',
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
      hoverScale: 1.02,
      activeScale: 0.98
    },
    icons: {
      strokeWidth: 3,
      filled: false,
      styleVariant: 'sharp'
    }
  },
  behavior: {
    buttonHoverAction: 'shift',
    cardElevationType: 'shadow',
    focusRingStyle: 'double-ring'
  }
};

export const cyberpunk: StyleDefinition = {
  metadata: {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077 / Neon High-Tech',
    category: 'Expressive',
    description: 'High-contrast dark dystopian design with electric neon accents (cyan/magenta/yellow), angled clip-path cuts, scanlines, and glow effects.',
    tags: ['cyberpunk', 'neon', 'dystopian', 'sci-fi', 'glow'],
    personality: 'Rebellious, futuristic, intense, high-tech dystopian',
    history: 'Inspired by 80s cyberpunk culture, Akira, and CD Projekt Red’s Cyberpunk 2077.',
    bestUsedFor: ['Gaming portals', 'Crypto platforms', 'Hacker dashboards', 'Music players'],
    relatedStyles: ['retrofuturism', 'sci-fi-hud', 'neo-brutalism']
  },
  tokens: {
    colors: {
      bg: '#05050a',
      surface: '#0f0f1b',
      surfaceHover: '#1a1a2e',
      textPrimary: '#00f0ff',
      textSecondary: '#ff0055',
      textTertiary: '#ffe600',
      border: '#00f0ff',
      accent: '#ff0055',
      accentHover: '#cc0044',
      glowColor: '#00f0ff'
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
      sm: '0 0 10px rgba(0, 240, 255, 0.5)',
      md: '0 0 20px rgba(0, 240, 255, 0.7)',
      lg: '0 0 35px rgba(255, 0, 85, 0.8)',
      glow: '0 0 20px #00f0ff, 0 0 40px #ff0055'
    },
    borders: {
      width: '2px',
      style: 'solid',
      color: '#00f0ff'
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
  }
};

export const vaporwave: StyleDefinition = {
  metadata: {
    id: 'vaporwave',
    name: 'Retrofuturism / Vaporwave',
    category: 'Expressive',
    description: 'Nostalgic 80s/90s dreamscape aesthetic with neon pink & teal sunset gradients, perspective gridlines, and synthwave vibes.',
    tags: ['vaporwave', 'synthwave', '80s', 'retro', 'sunset-gradient'],
    personality: 'Nostalgic, surreal, dreamy, retro-futuristic',
    history: 'Emerged as an internet art culture in the early 2010s celebrating 80s/90s consumer aesthetics.',
    bestUsedFor: ['Music players', 'Retro game launchers', 'Creative portfolios'],
    relatedStyles: ['cyberpunk', 'y2k', 'memphis']
  },
  tokens: {
    colors: {
      bg: '#1a0933',
      surface: '#2d124d',
      surfaceHover: '#3d1866',
      textPrimary: '#00ffff',
      textSecondary: '#ff77ff',
      textTertiary: '#ffcc00',
      border: '#ff00aa',
      accent: '#ff00aa',
      accentHover: '#d4008d',
      glowColor: '#ff00aa'
    },
    typography: {
      fontFamilySans: 'Orbitron, VT323, sans-serif',
      fontFamilyMono: 'Courier, monospace',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.25rem',
      fontSizeXl: '1.5rem',
      fontSize2xl: '2rem',
      fontSize3xl: '2.5rem',
      fontWeightNormal: 400,
      fontWeightMedium: 600,
      fontWeightBold: 800,
      letterSpacing: '0.08em',
      lineHeight: '1.4'
    },
    radii: {
      sm: '4px',
      md: '8px',
      lg: '16px',
      full: '9999px'
    },
    shadows: {
      sm: '0 0 10px rgba(255, 0, 170, 0.4)',
      md: '0 0 20px rgba(0, 255, 255, 0.5)',
      lg: '0 0 30px rgba(255, 0, 170, 0.7)'
    },
    borders: {
      width: '2px',
      style: 'solid',
      color: '#ff00aa'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: 'ease-in-out'
    },
    materials: {
      texture: 'grid',
      gradient: 'linear-gradient(180deg, #ff00aa 0%, #00ffff 100%)'
    }
  }
};

export const memphis: StyleDefinition = {
  metadata: {
    id: 'memphis',
    name: 'Memphis Design',
    category: 'Retro',
    description: 'Postmodern 1980s aesthetic with squiggles, confetti geometric shapes, clashing pastel colors, and black accent lines.',
    tags: ['memphis', '80s', 'postmodern', 'patterns', 'playful'],
    personality: 'Eccentric, energetic, humorous, anti-minimalist',
    history: 'Founded by Ettore Sottsass and the Memphis Group in Milan (1981).',
    bestUsedFor: ['Event branding', 'Creative portfolios', 'Pop-culture web experiences'],
    relatedStyles: ['neo-brutalism', 'claymorphism']
  },
  tokens: {
    colors: {
      bg: '#fff9e6',
      surface: '#ff77aa',
      surfaceHover: '#ff5599',
      textPrimary: '#1a1a1a',
      textSecondary: '#333333',
      textTertiary: '#666666',
      border: '#000000',
      accent: '#00ddbb',
      accentHover: '#00bb99',
      shadowColor: '#000000'
    },
    typography: {
      fontFamilySans: 'Poppins, Arial Black, sans-serif',
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
      letterSpacing: '0.02em',
      lineHeight: '1.3'
    },
    radii: {
      sm: '0px',
      md: '8px',
      lg: '16px',
      full: '9999px'
    },
    shadows: {
      sm: '4px 4px 0px #000000',
      md: '6px 6px 0px #000000',
      lg: '10px 10px 0px #000000'
    },
    borders: {
      width: '3px',
      style: 'solid',
      color: '#000000'
    },
    motion: {
      durationFast: '100ms',
      durationNormal: '200ms',
      durationSlow: '300ms',
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    },
    materials: {
      texture: 'dot-pattern'
    }
  }
};

export const y2kAesthetic: StyleDefinition = {
  metadata: {
    id: 'y2k-aesthetic',
    name: 'Y2K Aesthetic / Metallic Futuristic',
    category: 'Expressive',
    description: 'Late 90s / early 2000s tech optimism with chrome gradients, translucent plastics, starburst flares, and silver/pink palettes.',
    tags: ['y2k', 'chrome', '2000s', 'cyber-pop', 'starburst'],
    personality: 'Futuristic-optimistic, shiny, pop-cultural, glossy',
    history: 'Defined the digital and music aesthetic around 1997-2003.',
    bestUsedFor: ['Fashion web apps', 'Pop music portfolios', 'Youth culture apps'],
    relatedStyles: ['chrome-metallic', 'vaporwave', 'acid-graphics']
  },
  tokens: {
    colors: {
      bg: '#eef2f7',
      surface: 'linear-gradient(135deg, #e6ecf5 0%, #cbd7e6 100%)',
      surfaceHover: '#d8e3f2',
      textPrimary: '#1a2536',
      textSecondary: '#41536b',
      textTertiary: '#7386a0',
      border: '#a3b8d4',
      accent: '#ff007f',
      accentHover: '#d9006c',
      glowColor: '#00d4ff'
    },
    typography: {
      fontFamilySans: 'Trebuchet MS, Orbitron, sans-serif',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.25rem',
      fontSizeXl: '1.5rem',
      fontSize2xl: '2rem',
      fontSize3xl: '2.5rem',
      fontWeightNormal: 400,
      fontWeightMedium: 600,
      fontWeightBold: 800,
      letterSpacing: '0.04em',
      lineHeight: '1.4'
    },
    radii: {
      sm: '10px',
      md: '18px',
      lg: '26px',
      full: '9999px'
    },
    shadows: {
      sm: '0 4px 8px rgba(0, 212, 255, 0.25)',
      md: '0 6px 16px rgba(255, 0, 127, 0.3)',
      lg: '0 10px 24px rgba(0, 0, 0, 0.15)'
    },
    borders: {
      width: '2px',
      style: 'solid',
      color: '#a3b8d4'
    },
    motion: {
      durationFast: '150ms',
      durationNormal: '250ms',
      durationSlow: '400ms',
      easing: 'ease'
    }
  }
};

export const acidGraphics: StyleDefinition = {
  metadata: {
    id: 'acid-graphics',
    name: 'Acid Graphics / Y2K Grunge',
    category: 'Expressive',
    description: 'Experimental rave culture aesthetic featuring distorted liquid typography, chrome warp textures, dark mode neon, and anti-design rules.',
    tags: ['acid', 'rave', 'grunge', 'distorted', 'experimental'],
    personality: 'Psychedelic, chaotic, underground, experimental',
    history: 'Born out of rave posters, techno cover art, and experimental web zines.',
    bestUsedFor: ['Music festivals', 'Underground fashion', 'Techno music sites'],
    relatedStyles: ['y2k-aesthetic', 'cyberpunk', 'neo-brutalism']
  },
  tokens: {
    colors: {
      bg: '#0a0a0a',
      surface: '#171717',
      surfaceHover: '#262626',
      textPrimary: '#ccff00',
      textSecondary: '#00ffaa',
      textTertiary: '#ff00aa',
      border: '#ccff00',
      accent: '#ccff00',
      accentHover: '#b3e600',
      glowColor: '#ccff00'
    },
    typography: {
      fontFamilySans: 'Space Grotesk, sans-serif',
      fontFamilyMono: 'Courier Prime, monospace',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeBase: '1rem',
      fontSizeLg: '1.25rem',
      fontSizeXl: '1.5rem',
      fontSize2xl: '2rem',
      fontSize3xl: '3rem',
      fontWeightNormal: 400,
      fontWeightMedium: 700,
      fontWeightBold: 900,
      letterSpacing: '-0.03em',
      lineHeight: '1.2'
    },
    radii: {
      sm: '0px',
      md: '4px',
      lg: '8px',
      full: '9999px'
    },
    shadows: {
      sm: '0 0 10px rgba(204, 255, 0, 0.4)',
      md: '0 0 20px rgba(204, 255, 0, 0.6)',
      lg: '0 0 35px rgba(255, 0, 170, 0.7)'
    },
    borders: {
      width: '2px',
      style: 'solid',
      color: '#ccff00'
    },
    motion: {
      durationFast: '100ms',
      durationNormal: '200ms',
      durationSlow: '350ms',
      easing: 'cubic-bezier(0.85, 0, 0.15, 1)'
    },
    materials: {
      texture: 'grain'
    }
  }
};

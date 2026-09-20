/**
 * UI Explorer — Design Personalities Engine
 * 12 core personalities with weighted preferences across visual families and token types.
 */

export type PersonalityType =
  | 'Calm'
  | 'Professional'
  | 'Luxury'
  | 'Technical'
  | 'Futuristic'
  | 'Playful'
  | 'Organic'
  | 'Editorial'
  | 'Dark'
  | 'Experimental'
  | 'Energetic'
  | 'Minimal';

export interface PersonalityRules {
  name: PersonalityType;
  description: string;
  visualFamilies: { family: string; weight: number }[];
  huePreferences: { hueMin: number; hueMax: number; weight: number }[];
  saturationRange: [number, number]; // 0..100
  lightnessRange: [number, number]; // 0..100
  darkBgProbability: number; // 0..1
  typographyWeights: { font: string; weight: number }[];
  radiusWeights: { radius: string; weight: number }[];
  surfaceWeights: { surface: string; weight: number }[];
  depthWeights: { depth: string; weight: number }[];
  motionWeights: { motion: string; weight: number }[];
  svgWeights: { svg: string; weight: number }[];
}

export const PERSONALITY_MAP: Record<PersonalityType, PersonalityRules> = {
  Calm: {
    name: 'Calm',
    description: 'Soft pastel tones, generous spacing, gentle rounded corners, and relaxing quiet atmosphere.',
    visualFamilies: [
      { family: 'Soft', weight: 50 },
      { family: 'Organic', weight: 30 },
      { family: 'Flat', weight: 20 }
    ],
    huePreferences: [
      { hueMin: 180, hueMax: 240, weight: 50 }, // Blues/teals
      { hueMin: 100, hueMax: 160, weight: 30 }, // Greens
      { hueMin: 30, hueMax: 60, weight: 20 }   // Warm sand
    ],
    saturationRange: [15, 40],
    lightnessRange: [90, 98],
    darkBgProbability: 0.05,
    typographyWeights: [
      { font: 'Inter, sans-serif', weight: 40 },
      { font: 'Manrope, sans-serif', weight: 40 },
      { font: 'DM Sans, sans-serif', weight: 20 }
    ],
    radiusWeights: [
      { radius: '16px', weight: 40 },
      { radius: '24px', weight: 40 },
      { radius: '12px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Solid Soft', weight: 50 },
      { surface: 'Frosted Glass', weight: 30 },
      { surface: 'Flat', weight: 20 }
    ],
    depthWeights: [
      { depth: 'Soft Shadow', weight: 60 },
      { depth: 'Flat', weight: 30 },
      { depth: 'Floating', weight: 10 }
    ],
    motionWeights: [
      { motion: 'Smooth', weight: 60 },
      { motion: 'Subtle', weight: 40 }
    ],
    svgWeights: [
      { svg: 'Soft Curves', weight: 60 },
      { svg: 'Natural Gradients', weight: 40 }
    ]
  },

  Professional: {
    name: 'Professional',
    description: 'Clean structured layouts, crisp contrast, authoritative blues, and high legibility.',
    visualFamilies: [
      { family: 'Bento', weight: 40 },
      { family: 'Swiss', weight: 30 },
      { family: 'Flat', weight: 30 }
    ],
    huePreferences: [
      { hueMin: 200, hueMax: 230, weight: 60 }, // Corporate Blue
      { hueMin: 150, hueMax: 175, weight: 20 }, // Emerald
      { hueMin: 0, hueMax: 0, weight: 20 }      // Neutral slate
    ],
    saturationRange: [20, 60],
    lightnessRange: [94, 99],
    darkBgProbability: 0.15,
    typographyWeights: [
      { font: 'Inter, sans-serif', weight: 60 },
      { font: 'Plus Jakarta Sans, sans-serif', weight: 25 },
      { font: 'Roboto, sans-serif', weight: 15 }
    ],
    radiusWeights: [
      { radius: '8px', weight: 50 },
      { radius: '6px', weight: 30 },
      { radius: '12px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Crisp Solid', weight: 60 },
      { surface: 'Border Container', weight: 40 }
    ],
    depthWeights: [
      { depth: 'Subtle Elevation', weight: 70 },
      { depth: 'Border Shadow', weight: 30 }
    ],
    motionWeights: [
      { motion: 'Snappy', weight: 60 },
      { motion: 'Smooth', weight: 40 }
    ],
    svgWeights: [
      { svg: 'Clean Grid', weight: 70 },
      { svg: 'Minimal Lines', weight: 30 }
    ]
  },

  Luxury: {
    name: 'Luxury',
    description: 'Deep opulent dark tones, refined serif typography, metallic accents, and quiet sophistication.',
    visualFamilies: [
      { family: 'Editorial', weight: 40 },
      { family: 'Metal', weight: 30 },
      { family: 'Glass', weight: 30 }
    ],
    huePreferences: [
      { hueMin: 35, hueMax: 50, weight: 50 },  // Gold / Bronze
      { hueMin: 220, hueMax: 260, weight: 30 }, // Midnight Royal
      { hueMin: 340, hueMax: 360, weight: 20 }  // Burgundy
    ],
    saturationRange: [10, 45],
    lightnessRange: [8, 18],
    darkBgProbability: 0.85,
    typographyWeights: [
      { font: 'Playfair Display, serif', weight: 50 },
      { font: 'Georgia, serif', weight: 30 },
      { font: 'DM Sans, sans-serif', weight: 20 }
    ],
    radiusWeights: [
      { radius: '4px', weight: 40 },
      { radius: '8px', weight: 40 },
      { radius: '2px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Dark Metallic', weight: 40 },
      { surface: 'Polished Obsidian', weight: 40 },
      { surface: 'Fine Border', weight: 20 }
    ],
    depthWeights: [
      { depth: 'Subtle Inset', weight: 50 },
      { depth: 'Deep Shadow', weight: 50 }
    ],
    motionWeights: [
      { motion: 'Cinematic', weight: 60 },
      { motion: 'Smooth', weight: 40 }
    ],
    svgWeights: [
      { svg: 'Specular Highlights', weight: 50 },
      { svg: 'Reflective Gradients', weight: 50 }
    ]
  },

  Technical: {
    name: 'Technical',
    description: 'Density-focused telemetry layout, monospaced fonts, sharp borders, and high functional clarity.',
    visualFamilies: [
      { family: 'HUD', weight: 40 },
      { family: 'Bento', weight: 30 },
      { family: 'Industrial', weight: 30 }
    ],
    huePreferences: [
      { hueMin: 180, hueMax: 200, weight: 50 }, // Cyan
      { hueMin: 40, hueMax: 55, weight: 30 },   // Amber
      { hueMin: 120, hueMax: 140, weight: 20 }  // Terminal Green
    ],
    saturationRange: [40, 85],
    lightnessRange: [5, 15],
    darkBgProbability: 0.9,
    typographyWeights: [
      { font: 'JetBrains Mono, monospace', weight: 50 },
      { font: 'Fira Code, monospace', weight: 35 },
      { font: 'Space Grotesk, sans-serif', weight: 15 }
    ],
    radiusWeights: [
      { radius: '0px', weight: 60 },
      { radius: '2px', weight: 40 }
    ],
    surfaceWeights: [
      { surface: 'Telemetry Panel', weight: 60 },
      { surface: 'Grid Surface', weight: 40 }
    ],
    depthWeights: [
      { depth: 'Neon Glow', weight: 50 },
      { depth: 'Flat Sharp', weight: 50 }
    ],
    motionWeights: [
      { motion: 'Mechanical', weight: 60 },
      { motion: 'Instant', weight: 40 }
    ],
    svgWeights: [
      { svg: 'Reticle Corners', weight: 50 },
      { svg: 'Scanlines', weight: 50 }
    ]
  },

  Futuristic: {
    name: 'Futuristic',
    description: 'High-tech neon glows, vibrant gradients, translucent glass, and sleek angled geometry.',
    visualFamilies: [
      { family: 'Glass', weight: 35 },
      { family: 'Cyberpunk', weight: 35 },
      { family: 'Liquid', weight: 30 }
    ],
    huePreferences: [
      { hueMin: 260, hueMax: 320, weight: 45 }, // Magenta/Purple
      { hueMin: 175, hueMax: 200, weight: 45 }, // Cyan
      { hueMin: 50, hueMax: 65, weight: 10 }    // Electric Yellow
    ],
    saturationRange: [60, 95],
    lightnessRange: [6, 16],
    darkBgProbability: 0.85,
    typographyWeights: [
      { font: 'Space Grotesk, sans-serif', weight: 50 },
      { font: 'Orbitron, sans-serif', weight: 30 },
      { font: 'Inter, sans-serif', weight: 20 }
    ],
    radiusWeights: [
      { radius: '12px', weight: 40 },
      { radius: '20px', weight: 40 },
      { radius: '0px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Frosted Glass', weight: 40 },
      { surface: 'Aurora Gradient', weight: 40 },
      { surface: 'Glossy Acrylic', weight: 20 }
    ],
    depthWeights: [
      { depth: 'Neon Glow', weight: 60 },
      { depth: 'Floating', weight: 40 }
    ],
    motionWeights: [
      { motion: 'Expressive', weight: 50 },
      { motion: 'Smooth', weight: 50 }
    ],
    svgWeights: [
      { svg: 'Aurora Mesh', weight: 50 },
      { svg: 'Neon Stroke', weight: 50 }
    ]
  },

  Playful: {
    name: 'Playful',
    description: 'Chubby rounded shapes, vibrant friendly pastels, bouncy animations, and pop-culture energy.',
    visualFamilies: [
      { family: 'Clay', weight: 50 },
      { family: 'Memphis', weight: 30 },
      { family: 'Soft', weight: 20 }
    ],
    huePreferences: [
      { hueMin: 270, hueMax: 330, weight: 35 }, // Pink/Purple
      { hueMin: 20, hueMax: 45, weight: 35 },   // Coral/Orange
      { hueMin: 160, hueMax: 190, weight: 30 }  // Mint/Sky
    ],
    saturationRange: [60, 90],
    lightnessRange: [85, 96],
    darkBgProbability: 0.05,
    typographyWeights: [
      { font: 'Poppins, sans-serif', weight: 60 },
      { font: 'Plus Jakarta Sans, sans-serif', weight: 40 }
    ],
    radiusWeights: [
      { radius: '24px', weight: 40 },
      { radius: '32px', weight: 40 },
      { radius: '9999px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Clay Pillow', weight: 60 },
      { surface: 'Soft Solid', weight: 40 }
    ],
    depthWeights: [
      { depth: 'Clay Inner Shadow', weight: 60 },
      { depth: 'Soft Shadow', weight: 40 }
    ],
    motionWeights: [
      { motion: 'Elastic', weight: 70 },
      { motion: 'Expressive', weight: 30 }
    ],
    svgWeights: [
      { svg: 'Confetti Dots', weight: 50 },
      { svg: 'Squiggles', weight: 50 }
    ]
  },

  Organic: {
    name: 'Organic',
    description: 'Earthy natural hues, soft irregular curves, biophilic leaf tones, and calming grounded surfaces.',
    visualFamilies: [
      { family: 'Organic', weight: 60 },
      { family: 'Soft', weight: 25 },
      { family: 'Editorial', weight: 15 }
    ],
    huePreferences: [
      { hueMin: 80, hueMax: 140, weight: 50 },  // Moss/Sage Green
      { hueMin: 25, hueMax: 45, weight: 35 },   // Terracotta/Sand
      { hueMin: 190, hueMax: 210, weight: 15 }  // River Blue
    ],
    saturationRange: [20, 50],
    lightnessRange: [88, 96],
    darkBgProbability: 0.05,
    typographyWeights: [
      { font: 'DM Sans, sans-serif', weight: 50 },
      { font: 'Manrope, sans-serif', weight: 30 },
      { font: 'Georgia, serif', weight: 20 }
    ],
    radiusWeights: [
      { radius: '20px', weight: 40 },
      { radius: '32px', weight: 40 },
      { radius: '14px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Earthy Matte', weight: 60 },
      { surface: 'Soft Recessed', weight: 40 }
    ],
    depthWeights: [
      { depth: 'Gentle Shadow', weight: 70 },
      { depth: 'Flat', weight: 30 }
    ],
    motionWeights: [
      { motion: 'Smooth', weight: 70 },
      { motion: 'Subtle', weight: 30 }
    ],
    svgWeights: [
      { svg: 'Blob Curves', weight: 60 },
      { svg: 'Natural Texture', weight: 40 }
    ]
  },

  Editorial: {
    name: 'Editorial',
    description: 'Classic print magazine feel, serif headings, warm paper tones, and generous white space.',
    visualFamilies: [
      { family: 'Editorial', weight: 60 },
      { family: 'Swiss', weight: 25 },
      { family: 'Flat', weight: 15 }
    ],
    huePreferences: [
      { hueMin: 30, hueMax: 45, weight: 50 },  // Warm Cream
      { hueMin: 0, hueMax: 20, weight: 30 },   // Deep Crimson Accent
      { hueMin: 0, hueMax: 0, weight: 20 }    // Charcoal
    ],
    saturationRange: [5, 30],
    lightnessRange: [92, 98],
    darkBgProbability: 0.1,
    typographyWeights: [
      { font: 'Playfair Display, serif', weight: 60 },
      { font: 'DM Sans, sans-serif', weight: 40 }
    ],
    radiusWeights: [
      { radius: '4px', weight: 50 },
      { radius: '2px', weight: 30 },
      { radius: '8px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Paper Stock', weight: 70 },
      { surface: 'Crisp Solid', weight: 30 }
    ],
    depthWeights: [
      { depth: 'Paper Shadow', weight: 60 },
      { depth: 'Flat Border', weight: 40 }
    ],
    motionWeights: [
      { motion: 'Subtle', weight: 70 },
      { motion: 'Smooth', weight: 30 }
    ],
    svgWeights: [
      { svg: 'Fine Lines', weight: 70 },
      { svg: 'Print Grid', weight: 30 }
    ]
  },

  Dark: {
    name: 'Dark',
    description: 'Pitch black OLED backgrounds, high-contrast crisp text, subtle dark grey cards, and focused indigo accents.',
    visualFamilies: [
      { family: 'Bento', weight: 40 },
      { family: 'Digital', weight: 30 },
      { family: 'Metal', weight: 30 }
    ],
    huePreferences: [
      { hueMin: 220, hueMax: 260, weight: 50 }, // Deep Blue/Indigo
      { hueMin: 0, hueMax: 0, weight: 30 },     // Pure Monochrome
      { hueMin: 160, hueMax: 180, weight: 20 }  // Cyan Accent
    ],
    saturationRange: [20, 70],
    lightnessRange: [0, 8],
    darkBgProbability: 1.0,
    typographyWeights: [
      { font: 'Inter, sans-serif', weight: 60 },
      { font: 'Space Grotesk, sans-serif', weight: 25 },
      { font: 'JetBrains Mono, monospace', weight: 15 }
    ],
    radiusWeights: [
      { radius: '12px', weight: 40 },
      { radius: '16px', weight: 40 },
      { radius: '8px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Pitch Black Card', weight: 50 },
      { surface: 'Dark Slate', weight: 30 },
      { surface: 'Glass Translucent', weight: 20 }
    ],
    depthWeights: [
      { depth: 'OLED Shadow', weight: 60 },
      { depth: 'Subtle Glow', weight: 40 }
    ],
    motionWeights: [
      { motion: 'Snappy', weight: 50 },
      { motion: 'Smooth', weight: 50 }
    ],
    svgWeights: [
      { svg: 'Dark Grid', weight: 60 },
      { svg: 'Minimal Strokes', weight: 40 }
    ]
  },

  Experimental: {
    name: 'Experimental',
    description: 'Unapologetic visual tension, liquid distortion, vibrant neon clashes, and rule-breaking anti-design.',
    visualFamilies: [
      { family: 'Brutalist', weight: 35 },
      { family: 'Acid', weight: 35 },
      { family: 'Cyberpunk', weight: 30 }
    ],
    huePreferences: [
      { hueMin: 70, hueMax: 90, weight: 35 },   // Acid Lime Green
      { hueMin: 300, hueMax: 330, weight: 35 }, // Neon Hot Pink
      { hueMin: 180, hueMax: 200, weight: 30 }  // Cyan Electric
    ],
    saturationRange: [75, 100],
    lightnessRange: [5, 95],
    darkBgProbability: 0.5,
    typographyWeights: [
      { font: 'Space Grotesk, sans-serif', weight: 50 },
      { font: 'JetBrains Mono, monospace', weight: 30 },
      { font: 'Orbitron, sans-serif', weight: 20 }
    ],
    radiusWeights: [
      { radius: '0px', weight: 50 },
      { radius: '4px', weight: 30 },
      { radius: '9999px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Distorted Liquid', weight: 40 },
      { surface: 'Hard Solid', weight: 40 },
      { surface: 'Glow Box', weight: 20 }
    ],
    depthWeights: [
      { depth: 'Hard Offset Shadow', weight: 50 },
      { depth: 'Extreme Glow', weight: 50 }
    ],
    motionWeights: [
      { motion: 'Mechanical', weight: 50 },
      { motion: 'Elastic', weight: 50 }
    ],
    svgWeights: [
      { svg: 'Distorted Lines', weight: 50 },
      { svg: 'Grain Overlay', weight: 50 }
    ]
  },

  Energetic: {
    name: 'Energetic',
    description: 'High-contrast bright primaries, bold offset box shadows, thick black borders, and rebellious punchy feel.',
    visualFamilies: [
      { family: 'Brutalist', weight: 60 },
      { family: 'Memphis', weight: 25 },
      { family: 'Flat', weight: 15 }
    ],
    huePreferences: [
      { hueMin: 45, hueMax: 55, weight: 40 },  // Electric Yellow
      { hueMin: 350, hueMax: 10, weight: 35 }, // Punch Red
      { hueMin: 200, hueMax: 230, weight: 25 } // Electric Blue
    ],
    saturationRange: [80, 100],
    lightnessRange: [92, 98],
    darkBgProbability: 0.1,
    typographyWeights: [
      { font: 'Space Grotesk, sans-serif', weight: 60 },
      { font: 'Poppins, sans-serif', weight: 40 }
    ],
    radiusWeights: [
      { radius: '8px', weight: 40 },
      { radius: '4px', weight: 40 },
      { radius: '12px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Vivid Solid', weight: 70 },
      { surface: 'Hard Border', weight: 30 }
    ],
    depthWeights: [
      { depth: 'Hard Offset Shadow', weight: 80 },
      { depth: 'Flat Border', weight: 20 }
    ],
    motionWeights: [
      { motion: 'Snappy', weight: 70 },
      { motion: 'Mechanical', weight: 30 }
    ],
    svgWeights: [
      { svg: 'Sharp Angles', weight: 60 },
      { svg: 'Bold Outline', weight: 40 }
    ]
  },

  Minimal: {
    name: 'Minimal',
    description: 'Stark monochrome simplicity, ultra-thin borders, subtle shadows, and zero decorative fluff.',
    visualFamilies: [
      { family: 'Swiss', weight: 50 },
      { family: 'Flat', weight: 35 },
      { family: 'Bento', weight: 15 }
    ],
    huePreferences: [
      { hueMin: 0, hueMax: 0, weight: 100 } // Pure neutral / grayscale
    ],
    saturationRange: [0, 5],
    lightnessRange: [96, 100],
    darkBgProbability: 0.2,
    typographyWeights: [
      { font: 'Inter, sans-serif', weight: 70 },
      { font: 'Helvetica Neue, sans-serif', weight: 30 }
    ],
    radiusWeights: [
      { radius: '6px', weight: 40 },
      { radius: '4px', weight: 40 },
      { radius: '8px', weight: 20 }
    ],
    surfaceWeights: [
      { surface: 'Pure White/Dark', weight: 70 },
      { surface: 'Subtle Border', weight: 30 }
    ],
    depthWeights: [
      { depth: 'Minimal Shadow', weight: 60 },
      { depth: 'Flat', weight: 40 }
    ],
    motionWeights: [
      { motion: 'Subtle', weight: 80 },
      { motion: 'Smooth', weight: 20 }
    ],
    svgWeights: [
      { svg: 'Pure Geometry', weight: 80 },
      { svg: 'Minimal Lines', weight: 20 }
    ]
  }
};

import { registry } from '../engine/registry';
import type { StyleDefinition } from '../engine/types';

import { neumorphism, glassmorphism, claymorphism, auroramorphism, aeroGlass } from './morphism';
import { bentoGrid, swissStyle, editorial, flatDesign, materialDesign3, fluentDesign, minimalWarm } from './modern';
import { neoBrutalism, cyberpunk, vaporwave, memphis, y2kAesthetic, acidGraphics } from './expressive';
import { sciFiHud, darkOled, chromeMetallic } from './futuristic';
import { pixelArt, skeuomorphism, skeuomorphicAnalog } from './retro';
import { bauhaus, organicBiophilic, industrial, paperSkeuomorphic, highContrast, monochrome } from './artistic';
import { auroraGlass, deepBloom, retroCyber } from './community';
import { withTreatmentDefaults } from './treatmentDefaults';
import { withDocs } from './docs';

const definitions: StyleDefinition[] = [
  // Morphism
  neumorphism,
  glassmorphism,
  claymorphism,
  auroramorphism,
  aeroGlass,

  // Modern
  bentoGrid,
  swissStyle,
  editorial,
  flatDesign,
  materialDesign3,
  fluentDesign,
  minimalWarm,

  // Expressive
  neoBrutalism,
  cyberpunk,
  vaporwave,
  memphis,
  y2kAesthetic,
  acidGraphics,

  // Futuristic
  sciFiHud,
  darkOled,
  chromeMetallic,

  // Retro
  pixelArt,
  skeuomorphism,
  skeuomorphicAnalog,

  // Artistic & Minimalist
  bauhaus,
  organicBiophilic,
  industrial,
  paperSkeuomorphic,
  highContrast,
  monochrome
];

/** Built-in styles with construction defaults (behaviour, texture, SVG language) applied. */
export const officialStyles: StyleDefinition[] = definitions.map(withTreatmentDefaults).map(withDocs).map((s) => ({ ...s, metadata: { source: 'official', ...s.metadata } }));

/** Themes contributed by the community (see ./community.ts), credited to their authors. */
export const communityStyles: StyleDefinition[] = [auroraGlass, deepBloom, retroCyber].map(withTreatmentDefaults);

export const allStyles: StyleDefinition[] = [...officialStyles, ...communityStyles];

// Register every theme on import
registry.registerMany(allStyles);

export {
  neumorphism,
  glassmorphism,
  claymorphism,
  auroramorphism,
  aeroGlass,
  bentoGrid,
  swissStyle,
  editorial,
  flatDesign,
  materialDesign3,
  fluentDesign,
  minimalWarm,
  neoBrutalism,
  cyberpunk,
  vaporwave,
  memphis,
  y2kAesthetic,
  acidGraphics,
  sciFiHud,
  darkOled,
  chromeMetallic,
  pixelArt,
  skeuomorphism,
  skeuomorphicAnalog,
  bauhaus,
  organicBiophilic,
  industrial,
  paperSkeuomorphic,
  highContrast,
  monochrome
};

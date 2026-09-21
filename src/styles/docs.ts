/**
 * UI Explorer — Style documentation
 * Extended documentation for every built-in style: how it looks, the
 * principles behind it and when not to reach for it. Merged into metadata at
 * registration time so the gallery, docs drawer and validator can rely on it.
 */

import type { StyleDefinition } from '../engine/types';

export interface StyleDocs {
  visualCharacter: string;
  principles: string[];
  avoidWhen: string[];
}

export const STYLE_DOCS: Record<string, StyleDocs> = {
  neumorphism: {
    visualCharacter: 'Elements extruded from a single matte surface with paired light and dark shadows; almost no lines.',
    principles: ['One background colour for everything', 'Depth from dual shadows, never borders', 'Low contrast, soft accent'],
    avoidWhen: ['Contrast-critical interfaces', 'Dense data screens', 'Anything printed or on e-ink']
  },
  glassmorphism: {
    visualCharacter: 'Frosted translucent panes over a colourful background, thin light borders, blur everywhere.',
    principles: ['Translucency over blur-able backgrounds', 'Light 1px edge to define the pane', 'Vivid backdrop to make the glass read'],
    avoidWhen: ['Plain flat backgrounds', 'Low-end devices where blur is expensive', 'Text-heavy reading views']
  },
  claymorphism: {
    visualCharacter: 'Puffy, rounded 3D shapes with an inner highlight and a chunky coloured drop shadow.',
    principles: ['Big radii and inflated forms', 'Inner shadow for softness, outer for lift', 'Pastel, friendly palette'],
    avoidWhen: ['Serious enterprise tools', 'Compact mobile layouts', 'Brands that need a sharp edge']
  },
  auroramorphism: {
    visualCharacter: 'Slow-moving gradient light fields behind glass panels; luminous accents.',
    principles: ['Backdrop is the hero', 'Glass panels stay quiet', 'Accent colours borrowed from the aurora'],
    avoidWhen: ['Reduced-motion audiences', 'Data-dense dashboards', 'Print-adjacent layouts']
  },
  'aero-glass': {
    visualCharacter: 'Glossy blue-tinted glass with specular highlights and reflective chrome-era sheen.',
    principles: ['Glossy top highlight on every surface', 'Cool blue translucency', 'Reflections and depth'],
    avoidWhen: ['Minimal or editorial brands', 'Very small components', 'Dark-mode-only products']
  },
  'bento-grid': {
    visualCharacter: 'Compartmentalised tiles of different sizes, generous gutters, rounded corners.',
    principles: ['Grid first, content second', 'Every tile is self-contained', 'Consistent radius and gutter'],
    avoidWhen: ['Long linear forms', 'Narrow single-column layouts', 'Content that resists chunking']
  },
  'swiss-style': {
    visualCharacter: 'Strict grid, big Helvetica-style type, black on white with a single red accent.',
    principles: ['Objective, grid-based layout', 'Typography does the work', 'Asymmetry within order'],
    avoidWhen: ['Playful consumer products', 'Interfaces needing rich imagery', 'Heavy decoration requirements']
  },
  editorial: {
    visualCharacter: 'Magazine pacing: serif display headlines, generous margins, restrained colour.',
    principles: ['Reading rhythm over density', 'Serif headlines, sans body', 'Whitespace as structure'],
    avoidWhen: ['Dashboards and tables', 'Tight mobile toolbars', 'Rapid transactional flows']
  },
  'flat-design': {
    visualCharacter: 'Solid colours, no shadows, no gradients; shape and colour carry the hierarchy.',
    principles: ['Remove every non-essential effect', 'Bold, saturated colour blocks', 'Clear geometry'],
    avoidWhen: ['Interfaces where affordance is unclear without depth', 'Luxury or tactile brands']
  },
  'material-design-3': {
    visualCharacter: 'Tonal surfaces, dynamic colour, large pill shapes, elevation via tint and shadow.',
    principles: ['Tonal elevation', 'Dynamic colour roles', 'Expressive shapes and motion'],
    avoidWhen: ['Brands that must not look like Android', 'Extremely dense enterprise tools']
  },
  'fluent-design': {
    visualCharacter: 'Acrylic translucency, reveal highlights, subtle depth and layered surfaces.',
    principles: ['Light, depth, motion, material, scale', 'Acrylic on secondary surfaces', 'Reveal on interaction'],
    avoidWhen: ['Web products that need to feel non-Windows', 'Low-power devices with blur cost']
  },
  'minimal-warm': {
    visualCharacter: 'Cream backgrounds, soft ink text, warm neutral accents and gentle radii.',
    principles: ['Warm neutrals instead of pure white', 'Quiet hierarchy', 'Comfortable reading contrast'],
    avoidWhen: ['High-energy consumer apps', 'Data visualisation with many hues']
  },
  'neo-brutalism': {
    visualCharacter: 'Thick black borders, hard offset shadows, raw saturated colour and no rounding.',
    principles: ['Expose the structure', 'Hard shadows, no blur', 'Unapologetic colour'],
    avoidWhen: ['Accessibility-sensitive government forms', 'Calm health or finance products']
  },
  cyberpunk: {
    visualCharacter: 'Neon accents on near-black, glitch textures, angular cuts and scanlines.',
    principles: ['Darkness as canvas', 'Neon for signal only', 'Angular, technical geometry'],
    avoidWhen: ['Daytime outdoor use', 'Long-form reading', 'Conservative brands']
  },
  vaporwave: {
    visualCharacter: 'Pink-cyan gradients, grids receding to the horizon, retro-futurist nostalgia.',
    principles: ['Sunset gradients', 'Perspective grids', 'Deliberate 80s kitsch'],
    avoidWhen: ['Serious business tools', 'Interfaces needing neutral colour']
  },
  memphis: {
    visualCharacter: 'Squiggles, confetti shapes, clashing pastels and playful asymmetry.',
    principles: ['Pattern and shape over restraint', 'Clashing colour on purpose', 'Playful geometry'],
    avoidWhen: ['Data-dense screens', 'Minimal brands', 'Reduced-visual-noise needs']
  },
  'y2k-aesthetic': {
    visualCharacter: 'Chrome bubbles, iridescent gradients, bubbly type and glossy buttons.',
    principles: ['Gloss and iridescence', 'Rounded bubbly forms', 'Optimistic tech nostalgia'],
    avoidWhen: ['Professional tools', 'Text-heavy content', 'Low-contrast-sensitive users']
  },
  'acid-graphics': {
    visualCharacter: 'Fluorescent greens and magentas, distorted type, noise and rave-poster energy.',
    principles: ['Maximum saturation', 'Distortion and noise as texture', 'Anti-grid layout'],
    avoidWhen: ['Anything requiring calm', 'Enterprise and finance', 'Accessibility-first contexts']
  },
  'sci-fi-hud': {
    visualCharacter: 'Thin cyan lines, bracketed corners, monospace readouts on deep navy.',
    principles: ['Frames and brackets define regions', 'Monospace data', 'Glow for state'],
    avoidWhen: ['Consumer lifestyle apps', 'Interfaces without data to display']
  },
  'dark-oled': {
    visualCharacter: 'True black backgrounds, minimal chrome, light text and a single vivid accent.',
    principles: ['Pure black saves power and frames content', 'Contrast through brightness, not colour', 'Restraint'],
    avoidWhen: ['Print or light-mode-only products', 'Bright ambient light']
  },
  'chrome-metallic': {
    visualCharacter: 'Brushed and polished metal gradients, specular highlights, bevelled edges.',
    principles: ['Gradients simulate metal', 'Highlight top edge, shade bottom', 'Bevels over flat borders'],
    avoidWhen: ['Flat or minimal brands', 'Small text-heavy UIs', 'Low-end rendering budgets']
  },
  'pixel-art': {
    visualCharacter: '8-bit blocks, hard pixel shadows, bitmap type and limited palettes.',
    principles: ['Pixel grid alignment', 'No anti-aliasing', 'Limited palette'],
    avoidWhen: ['Body text at length', 'Professional productivity tools', 'High-DPI fine detail needs']
  },
  skeuomorphism: {
    visualCharacter: 'Leather, wood and stitched textures; realistic bevels, gloss and shadows.',
    principles: ['Mimic real materials', 'Realistic light and shadow', 'Affordance through familiarity'],
    avoidWhen: ['Modern flat brands', 'Data-dense dashboards', 'Performance-sensitive screens']
  },
  'skeuomorphic-analog': {
    visualCharacter: 'Dials, gauges, brushed panels and analogue instrument details.',
    principles: ['Instrument-panel metaphor', 'Tactile controls', 'Warm metal and glass'],
    avoidWhen: ['Text-first products', 'Minimal brands', 'Mobile-first small screens']
  },
  bauhaus: {
    visualCharacter: 'Primary colours, circles, squares and triangles; geometric sans type.',
    principles: ['Form follows function', 'Primary colour + black', 'Geometric primitives'],
    avoidWhen: ['Soft, organic brands', 'Photography-heavy layouts']
  },
  'organic-biophilic': {
    visualCharacter: 'Earth tones, leaf-like curves, soft blobs and natural textures.',
    principles: ['Nature-derived palette', 'Asymmetric organic shapes', 'Gentle motion'],
    avoidWhen: ['Technical or industrial products', 'Strict grid layouts']
  },
  industrial: {
    visualCharacter: 'Concrete greys, steel accents, stencil type and utilitarian hardware details.',
    principles: ['Utility over ornament', 'Raw materials', 'Heavy structural lines'],
    avoidWhen: ['Consumer lifestyle or luxury', 'Playful brands']
  },
  'paper-skeuomorphic': {
    visualCharacter: 'Layered paper sheets, soft drop shadows, folded corners and warm off-whites.',
    principles: ['Paper as material', 'Stacking for hierarchy', 'Subtle shadows only'],
    avoidWhen: ['Dark mode products', 'High-density tables']
  },
  'high-contrast': {
    visualCharacter: 'Pure black and white, thick focus rings, no grey, maximum legibility.',
    principles: ['WCAG AAA everywhere', 'No information by colour alone', 'Visible focus'],
    avoidWhen: ['Brands relying on subtle tone', 'Photography-led experiences']
  },
  monochrome: {
    visualCharacter: 'A single hue in many tints; hierarchy through value alone.',
    principles: ['One hue', 'Value contrast carries meaning', 'Typographic hierarchy'],
    avoidWhen: ['Charts needing many categories', 'Status colour requirements']
  }
};

/** Merge documentation into a style's metadata without overriding what the style already declares. */
export function withDocs(style: StyleDefinition): StyleDefinition {
  const docs = STYLE_DOCS[style.metadata.id];
  if (!docs) return style;
  return {
    ...style,
    metadata: {
      ...style.metadata,
      visualCharacter: style.metadata.visualCharacter ?? docs.visualCharacter,
      avoidWhen: style.metadata.avoidWhen ?? docs.avoidWhen,
      principles: style.metadata.principles ?? docs.principles
    }
  };
}

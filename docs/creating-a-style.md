# Creating a style

A style in UI Explorer is a **token system**, not a colour palette. One JSON
file declares colours, typography, radii, shadows, borders, motion and —
optionally — materials, icons, an SVG language and component behaviour. The
engine resolves it to CSS custom properties and data attributes, and every
component (buttons, cards, tables, charts, overlays…) reads from those.

This guide covers three routes: generate, customise by hand, or write JSON.

## 1. Start in the app

### Generate

Open **Style Generator**. Enter a seed (any number or word), pick a mode:

| Mode | What it does |
| --- | --- |
| Coherent | every pairing is weighted by the compatibility matrix and weak pairings are repaired |
| Experimental | weaker weighting, one level of tension allowed |
| Extreme | no weighting, no repair |

Lock the axes you like (colours, surface, depth…) and regenerate, or *Remix*
with a strength. The *Recipe*, *Why*, *Constraints*, *DNA* and *Debug* tabs
explain every decision. *Save* keeps the style in your browser.

### Customise

Open **Style Customizer** (Ctrl+E). Every token has a control — colours with
a real picker and contrast readout, background modes, typography, radius /
shadow / border / surface presets, density, icons, motion and behaviour. The
whole app previews your draft live; Ctrl+Z / Ctrl+Shift+Z undo and redo.
*Save as new style* prompts for a name, description and tags.

### Package

Sidebar → **Contribute Package** downloads:

- `style.json` — the full definition with your author, version, licence and
  `source: "community"` in `metadata`
- `metadata.json` — the entry for `styles/community/index.json`
- `README.md`

## 2. Write the JSON by hand

Minimal package (`styles/community/my-style/style.json`):

```json
{
  "metadata": {
    "id": "community-my-style",
    "name": "My Style",
    "category": "Modern",
    "description": "One sentence on what it is.",
    "tags": ["community"],
    "personality": "Calm, precise",
    "bestUsedFor": ["Dashboards"],
    "avoidWhen": ["Long-form reading"],
    "author": "your_github_handle",
    "version": "1.0.0",
    "license": "MIT",
    "source": "community"
  },
  "tokens": {
    "colors": { "bg": "#0f172a", "surface": "#1e293b", "surfaceHover": "#273449", "textPrimary": "#f8fafc", "textSecondary": "#94a3b8", "textTertiary": "#64748b", "border": "#334155", "accent": "#6366f1", "accentHover": "#818cf8" },
    "typography": { "fontFamilySans": "Inter, sans-serif", "fontSizeXs": "0.75rem", "fontSizeSm": "0.875rem", "fontSizeBase": "1rem", "fontSizeLg": "1.125rem", "fontSizeXl": "1.25rem", "fontSize2xl": "1.5rem", "fontSize3xl": "2rem", "fontWeightNormal": 400, "fontWeightMedium": 500, "fontWeightBold": 700, "letterSpacing": "0", "lineHeight": "1.5" },
    "radii": { "sm": "6px", "md": "10px", "lg": "16px", "full": "9999px" },
    "shadows": { "sm": "0 1px 3px rgba(0,0,0,0.4)", "md": "0 6px 16px rgba(0,0,0,0.4)", "lg": "0 14px 32px rgba(0,0,0,0.5)" },
    "borders": { "width": "1px", "style": "solid", "color": "#334155" },
    "motion": { "durationFast": "150ms", "durationNormal": "250ms", "durationSlow": "400ms", "easing": "ease-out" }
  },
  "svgLanguage": { "cornerStyle": "rounded", "decorativeShapes": false },
  "behavior": { "buttonHoverAction": "lift", "cardElevationType": "shadow", "focusRingStyle": "outline" }
}
```

The full shape, with every optional field, is in
[`schemas/style.schema.json`](../schemas/style.schema.json) and
`src/engine/types.ts`.

### Extend a built-in style

Declare `extends` and only override what differs; the parent is deep-merged
underneath at load time (arrays and primitives replace, objects merge):

```json
{
  "extends": "cyberpunk",
  "metadata": { "id": "community-neon-arcade", "name": "Neon Arcade", "category": "Expressive", "description": "…", "author": "…", "license": "MIT", "source": "community" },
  "tokens": {
    "colors": { "accent": "#ff2bd6", "accentHover": "#ff6be6", "border": "#ff2bd6" },
    "borders": { "width": "3px", "style": "solid", "color": "#ff2bd6" }
  }
}
```

The gallery shows the *extends* relationship in the Relations tab and on the
relationship map.

### What makes a style feel different

The construction layer reads these fields, so set them deliberately:

- `tokens.materials` — `backdropBlur`, `opacity`, `texture`
  (`noise` | `grain` | `scanline`), `gradient`, `backgroundImage`, `density`
- `tokens.icons` — `strokeWidth`, `filled`, `styleVariant`
- `svgLanguage` — `cornerStyle` (`sharp` | `rounded` | `bevel` | `brutalist`),
  `decorativeShapes`, `patternOverlay`, `borderDecoration`
- `behavior` — `buttonHoverAction`, `cardElevationType`, `focusRingStyle`

The *Validator* tab in the Styles gallery lists which systems a package
defines and how deep its optional coverage goes.

## 3. Validate and submit

```sh
cd tools/style-engine
python -m style_engine validate ../../styles/community/my-style
python -m style_engine registry ../../styles/community/index.json
cd ../..
npm test
```

Then add the `metadata.json` entry to `styles/community/index.json` and open
a pull request — see [CONTRIBUTING.md](../CONTRIBUTING.md).

## Sharing without a pull request

Any style can be shared as a link: the gallery's *Share* button (or the
Customizer's) copies a URL that carries the full definition, and generated
styles carry their seed and lineage so they reproduce exactly. *Export &
Import* in the sidebar produces JSON tokens or CSS variables for your own
project.

# Styles

Open **Styles** in the sidebar (or `Ctrl+K` → "Browse all styles").

![Styles gallery](/screenshots/styles-gallery.png)

## The gallery

Every registered style is a card with a **live thumbnail** — a miniature
interface rendered with the real components under that style's tokens, so a
thumbnail can never drift from what the style does.

Cards carry an *Official* or *Community* badge, the category, and three
traits derived from the tokens (material · mood · depth). **Use** switches the
whole app to that style; **Details** opens the drawer.

## Discovery

The left panel filters by:

- **Source** — official, community, your own, favourites
- **Category** — Morphism, Modern, Expressive, Futuristic, Retro, Minimalist
- **Discover** facets computed from the tokens themselves:
  material (glass / solid / textured / gradient), mood (light / dark), depth
  (flat / soft / hard / glow / inset), motion (instant / normal / expressive)
  and complexity (minimal / moderate / rich)

Search matches names, descriptions, tags, use cases and authors.

## The detail drawer

| Tab | What it shows |
| --- | --- |
| **Docs** | Description, visual character, personality, history, design principles, best used for, avoid when, traits, tags, author, licence |
| **Validator** | Which of the eleven systems the style defines (typography, colour, surface, depth, borders, radius, motion, icons, components, SVG, documentation) and how deep its optional coverage goes. A development indicator, not a ranking. |
| **Similar** | The closest styles in DNA space, with the traits they share |
| **Relations** | Declared relations, `extends` inheritance, remix lineage and duplicates — each a link |
| **Source** | The package JSON (and README for community styles), copy button, and a link to the file on GitHub |

Actions: **Use**, **Remix** (opens the Generator with this style as the base),
**Duplicate**, **Diff** (against the current style), **Share** (copies a link
that opens this drawer), **Favorite**.

The drawer is deep-linkable: `/styles?style=<id>`.

## The relationship map

Switch the stage to **Map** for a radial view: styles cluster by category;
edges show declared relations (grey), inheritance (violet, dashed), remixes
(cyan, dotted) and duplicates (amber). Hover to focus a style's
neighbourhood; click to open its drawer.

## Official vs community

The 30 built-ins are `source: official`. Community styles are JSON packages
under `styles/community/` on GitHub, loaded at build time and shown with the
author and licence from their package. They can be used, remixed, mixed,
diffed and shared exactly like built-ins — see [Community styles](../community-styles).

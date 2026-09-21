# Design tokens

Everything in UI Explorer is driven by a `StyleDefinition` — a JSON token
system. This page is about getting tokens **out** (and back in).

## Export

`Ctrl+Shift+E`, or **Export & Import** in the sidebar. Five formats, all
deterministic (the same style always exports byte-for-byte the same):

| Format | File | Use it for |
| --- | --- | --- |
| **Design tokens** | `<id>.tokens.json` | A semantic tree — `color.background`, `color.primary`, `radius.md`, `shadow.md`, `motion.fast`, `font.family` … — for design-token pipelines and other tools |
| **CSS variables** | `<id>.css` | `:root { --color-accent: …; --radius-md: …; }` exactly as the engine resolves them |
| **Theme CSS** | `<id>.theme.css` | The variables plus base rules for body, headings, links, buttons, inputs and cards, derived from the style's `behavior` — drop it into a plain HTML page |
| **Preview SVG** | `<id>.svg` | A miniature interface rendered from the tokens |
| **Style package** | `<id>.json` | The full `StyleDefinition`, importable here and valid for `styles/community` |

### The semantic token structure

```text
color.background   color.surface   color.surface.hover   color.text   color.textMuted
color.primary      color.primary.hover   color.accent   color.success   color.warning   color.error
font.family        font.family.heading   font.size.{xs…3xl}   font.weight.{normal,medium,bold}
radius.{sm,md,lg,xl,full}      shadow.{sm,md,lg,inset,glow}      border.{width,style,color}
motion.{fast,normal,slow,easing,hoverScale,activeScale}          material.{blur,opacity,texture}
icon.{strokeWidth,filled,variant}      behavior.*      svg.*
```

## Import

Choose a `.json` file or paste a package. The importer parses, validates
(required fields, safe ranges, CSS safety), resolves `extends` against the
registered styles, and shows a **live preview card** before anything is
added. Errors list the exact missing or invalid paths; nothing is repaired
silently.

## Contribution package

**Contribute Package** exports the four files a community package needs
(`style.json`, `metadata.json`, `preview.svg`, `README.md`) with your author
name and licence — see [Community styles](../community-styles).

## In code

The same functions power the UI: `src/engine/exporters.ts`
(`exportSemanticTokens`, `exportCssVariables`, `exportThemeCss`,
`exportPackage`) and `src/engine/preview.ts` (`renderStylePreviewSvg`).

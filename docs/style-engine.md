# Style engine

How a `StyleDefinition` becomes a rendered interface.

## Registration

`src/styles/index.ts` builds the registry:

```text
built-in definitions ─► withTreatmentDefaults ─► withDocs ─► source: official
community packages   ─► resolveInheritance ─► validate ─► withTreatmentDefaults
                                                            ─► source: community
```

`withTreatmentDefaults` (`src/styles/treatmentDefaults.ts`) fills `behavior`,
`materials.texture` and `svgLanguage` for built-ins that predate those fields
so every style has a complete construction description. `withDocs`
(`src/styles/docs.ts`) merges `visualCharacter`, `principles` and `avoidWhen`.

## Resolution

`resolveStyleToCssVars(style)` (`src/engine/resolver.ts`) maps tokens to CSS
custom properties:

| Token | Variable |
| --- | --- |
| `colors.accent` | `--color-accent` |
| `typography.fontFamilySans` | `--font-family-sans` |
| `radii.md` | `--radius-md` |
| `shadows.md` | `--shadow-md` |
| `borders.width` | `--border-width` |
| `motion.durationNormal` | `--duration-normal` |
| `materials.backdropBlur` | `--backdrop-blur` |
| `materials.backgroundImage` | `--background-image` |
| `materials.density` | `--density-scale` |
| `customCssVars` | as given |

Settings apply on top: *reduce motion* zeroes durations, *motion intensity*
scales them, *experimental* enables the heavier blur/glow paths.

## Treatments

`getStyleDataAttributes(style)` (`src/engine/styleAttributes.ts`) derives:

- `data-family` — glass, clay, brutalist, neon, paper, metal, pixel, hud … from
  the material, shadow and border tokens;
- `data-texture`, `data-hover`, `data-focus`, `data-elevation`, `data-corner`.

`src/styles/treatments.css` keys construction rules off these attributes:
hard-offset shadows for brutalist, specular highlights for metal, scanlines
for neon, pixel-stepped corners, paper grain, and so on. Components stay
generic; the attribute layer gives each family its bespoke build.

## Component contract

Every component in `src/components/ui` reads only variables and data
attributes. Overlays portal into the nearest `[data-style]` container so
modals, menus and tooltips inherit the tokens of the surface that opened
them. Charts (`src/components/charts`) read the same variables through
`useChartStyle`.

## Preview override

`StyleProvider` exposes `setPreviewStyle(style | undefined)`. The Generator,
Customizer and Mixer set it while the user is working so the whole app
previews the draft; leaving the page clears it. `renderedStyle` is what the
canvas shows; `currentStyle` is what is saved.

## Sharing

`src/engine/share.ts` encodes a built-in as `?style=<id>` and a custom style
as `?style=j.<base64url JSON>`; `AppShell` decodes and registers it on load.
Generated styles are shared by seed (`/generator?seed=…&mode=…&personality=…`)
and, for remixes, the full lineage chain (`&chain=…`) so the result is
reproduced rather than transmitted.

## Python engine

`tools/style-engine` re-implements the generator and validator; see
[procedural-generation.md](procedural-generation.md) and
`tools/style-engine/README.md`.

# Architecture

UI Explorer is a single-page React application. There is no server: styles,
generation, validation and sharing all run in the browser, and state lives in
`localStorage`. A Python package mirrors the generator for tooling and CI.

```text
                 ┌──────────────────────────────────────────────┐
                 │ StyleDefinition (JSON)                        │
                 │  metadata · tokens · svgLanguage · behavior   │
                 └───────────────┬──────────────────────────────┘
   built-ins ──► registry ◄── community loader ◄── styles/community/*/style.json
   generator ──►    │                                (validated, `extends` resolved)
   customizer ──►   │
                    ▼
            StyleProvider (context)
      current · preview override · favorites · recents · settings
                    │
        resolveStyleToCssVars ──► CSS custom properties on the canvas
        getStyleDataAttributes ──► data-style / family / texture / hover …
                    │
                    ▼
     component library + treatments.css (bespoke construction per family)
                    │
   pages: Dashboard · Styles · Generator · Components Lab · Labs · Customizer
```

## Layers

| Layer | Where | Responsibility |
| --- | --- | --- |
| Types & schema | `src/engine/types.ts`, `schemas/style.schema.json` | The `StyleDefinition` contract shared by TypeScript, JSON packages and Python |
| Registry | `src/engine/registry.ts`, `src/styles/index.ts` | Registers built-ins (with treatment defaults and docs) and community packages |
| Resolver | `src/engine/resolver.ts` | Tokens → CSS custom properties |
| Treatments | `src/engine/styleAttributes.ts`, `src/styles/treatments.css` | Tokens → data attributes → per-family construction rules |
| Context | `src/engine/context.tsx` | Current style, app-wide preview override, custom styles, favorites, settings |
| Validation | `src/engine/validate.ts`, `validator.ts`, `inherit.ts` | Required fields, ranges, CSS safety, completeness, `extends` |
| Generator | `src/engine/generator/` | Seeded procedural engine (see [procedural-generation.md](procedural-generation.md)) |
| Sharing | `src/engine/share.ts` | `?style=<id>` / `?style=j.<payload>` links; generated styles carry seed + lineage |
| Components | `src/components/ui`, `charts`, `svg`, `preview` | Everything reads tokens; nothing hard-codes a style |
| Features | `src/features/*` | Anatomy, compare, diff, inspector, mixer, export, search, shortcuts |
| Pages | `src/pages/*` | Routed views; tool pages are code-split |
| Python engine | `tools/style-engine/` | Same algorithm for batch generation, CI validation and determinism tests |

## Principles

- **A style is a token system, not a palette.** Switching styles changes
  radius, depth, borders, motion, icons, SVG language and component behaviour,
  not only colours.
- **One source of truth.** The same `StyleDefinition` feeds the canvas,
  thumbnails, exports, previews and the Python engine.
- **Packages are data.** Community contributions are JSON; nothing from a
  package is executed. Values are range-checked and CSS-sanitised at load.
- **Determinism.** Generation depends only on (seed, mode, locks, base,
  version). Same input, same style, in the browser and in Python.
- **No accounts, no server.** Everything works offline once loaded; sharing is
  by URL.

## Data flow for a page render

1. `StyleProvider` picks `renderedStyle` (a preview override if the Generator,
   Customizer or Mixer is previewing; otherwise the current style).
2. `resolveStyleToCssVars(renderedStyle)` produces `--color-*`, `--radius-*`,
   `--shadow-*`, `--duration-*`, `--font-*`, `--density-scale` … applied to
   `.style-preview-canvas`.
3. `getStyleDataAttributes(renderedStyle)` sets `data-style`, `data-family`,
   `data-texture`, `data-hover`, `data-focus`, `data-elevation`, `data-corner`;
   `treatments.css` keys bespoke rules off these.
4. Components render with the variables; overlays portal into the nearest
   `[data-style]` so they inherit the same tokens.

## Persistence

`src/engine/storage.ts` owns every `localStorage` key (`STORAGE_KEYS`):
current style, custom styles, favorites, recents, settings, generator history,
recent colours, onboarding flag. Corrupt values fall back to defaults.

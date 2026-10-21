# Architecture

UI Explorer is a single-page React application. There is no server: styles,
validation, editing and sharing all run in the browser, and state lives in
`localStorage`.

```text
                 ┌──────────────────────────────────────────────┐
                 │ StyleDefinition (JSON)                        │
                 │  metadata · tokens · svgLanguage · behavior   │
                 └───────────────┬──────────────────────────────┘
   themes (src/styles) ──► registry
   customizer ──►   │
                    ▼
            StyleProvider (context)
      current · preview override · tweaks · favorites · recents · settings
                    │
        applyTweaks ──► resolveStyleToCssVars ──► CSS custom properties on the canvas
        getStyleDataAttributes ──► data-style / family / texture / hover …
                    │
                    ▼
     component library + treatments.css (bespoke construction per family)
                    │
   app shell (header · rail · Workspace layout · tools) from src/config/routes.ts
   pages: Templates · Components · Customizer   (landing page at /)
```

## Layers

| Layer | Where | Responsibility |
| --- | --- | --- |
| Types | `src/engine/types.ts` | The `StyleDefinition` (theme) contract |
| Registry | `src/engine/registry.ts`, `src/styles/index.ts` | Registers the built-in and community themes (with treatment defaults and docs) |
| Resolver | `src/engine/resolver.ts` | Tokens → CSS custom properties |
| Treatments | `src/engine/styleAttributes.ts`, `src/styles/treatments.css` | Tokens → data attributes → per-family construction rules |
| Context | `src/engine/context.tsx` | Current style, app-wide preview override, tweaks, custom styles, favorites, settings; `renderStyle()` paints any style (a compare frame) exactly like the canvas |
| Tweaks | `src/engine/tweaks.ts` | Global dials (radius, borders, shadows, density, type, accent) layered over any style; see [Tweaks](guide/tweaks.md) |
| Validation | `src/engine/validate.ts` | Required fields, ranges and CSS safety for imported and shared themes |
| Vocabulary | `src/engine/vocab.ts` | Named choices per axis (surface, depth, borders, motion, icons, SVG art) and the materialisers the Customizer presets use |
| Sharing | `src/engine/share.ts` | `?style=<id>` / `?style=j.<payload>` links; custom themes travel inside the link |
| Components | `src/components/ui`, `charts`, `svg`, `preview` | Everything reads tokens; nothing hard-codes a style |
| Templates | `src/templates/`, `src/pages/Templates/` | Product screens (landing site, mobile app) built from the components, plus visitor edits (`src/templates/edit/`); see [Templates](guide/templates.md) |
| Routes & tools | `src/config/routes.ts` | The single list of pages and tools: router, rail, search, landing page and 404 page all read it; compare and tool URL conventions |
| Layout | `src/components/layout`, `src/components/workspace` | App shell, style picker, the shared `Workspace` (panel + stage) and `DeviceFrame` every page uses |
| URL state | `src/hooks/useUrlState.ts`, `src/hooks/useCompare.ts` | Page state in the address (`?device=`, `?compare=`, `?tool=`, `?edit`) so everything can be linked |
| Motion | `src/motion/` | One set of motion presets and the policy (reduce motion) for every animation of the tool |
| Features | `src/features/*` | Tweaks, inspector, export, search, shortcuts |
| Pages | `src/pages/*` | Routed views; every page is code-split except the landing page |

## Principles

- **A style is a token system, not a palette.** Switching styles changes
  radius, depth, borders, motion, icons, SVG language and component behaviour,
  not only colours.
- **One source of truth.** The same `StyleDefinition` feeds the canvas,
  thumbnails, exports and previews.
- **No accounts, no server.** Everything works offline once loaded; sharing is
  by URL.

## Data flow for a page render

1. `StyleProvider` picks the base style (a preview override while the Customizer
   is editing; otherwise the current style) and lays the
   tweaks over it: that is `renderedStyle`.
2. `resolveStyleToCssVars(renderedStyle)`, adjusted for the motion settings, produces `--color-*`, `--radius-*`,
   `--shadow-*`, `--duration-*`, `--font-*`, `--density-scale` … applied to
   `.style-preview-canvas`.
3. `getStyleDataAttributes(renderedStyle)` sets `data-style`, `data-family`,
   `data-texture`, `data-hover`, `data-focus`, `data-elevation`, `data-corner`;
   `treatments.css` keys bespoke rules off these.
4. Components render with the variables; overlays portal into the nearest
   `[data-style]` so they inherit the same tokens.

## Two theme systems, deliberately separate

| | Source of truth | Consumers | Changed by |
| --- | --- | --- | --- |
| **Application chrome** | `src/theme.css` (`--chrome-*` tokens) | header, sidebar, workspaces, gallery, modals, panels, docs site | editing that one file |
| **Design styles** | each `StyleDefinition` (30 built-ins in `src/styles/*.ts`, 3 community themes in `src/styles/community.ts`) | the preview canvas and every component inside it, via `resolveStyleToCssVars` | switching / tweaking / editing a theme |

Components in `src/components/ui` read only style tokens (`--color-*`,
`--radius-*` …) and data attributes; they never reference `--chrome-*`. When
such a component renders outside a styled container (a modal button), it
falls back to `:root` defaults in `src/index.css`, which alias the chrome
tokens. `src/theme.test.ts` fails the build if a chrome file gains a literal
colour, so the single-file guarantee holds as the code grows.

## Persistence

`src/engine/storage.ts` owns every `localStorage` key (`STORAGE_KEYS`):
current style, custom styles, favorites, recents, settings, tweaks, template
edits, recent colours, onboarding flag. Corrupt values fall back to defaults.

## Repository layout

The source is a single Vite app with an `src/engine`, `src/components`,
`src/features`, `src/pages` split rather than a `packages/*` monorepo: with
one deployable and no published npm packages, workspaces would add tooling
without a consumer. The boundaries a monorepo would enforce are kept by
convention (engine has no React imports; components read only tokens;
pages compose features) and by the folder names above. Themes are plain
definitions in `src/styles`, so adding one never touches application code.

## Hosting

Static only. `npm run build` → `dist/`, deployed to GitHub Pages by
`.github/workflows/deploy.yml` (base path `/ui-explorer/`, `404.html` fallback
for deep links). Any other static host works with `VITE_BASE_PATH=/`.

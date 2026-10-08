<p align="center"><img src="public/favicon.svg" width="96" height="96" alt="UI Explorer logo: three style cards fanned from one point"></p>

# UI Explorer

> An open-source laboratory for exploring, understanding and experimenting with interface design systems.

Thirty design styles — from Neumorphism to Neo Brutalism — each defined as a
complete token system rather than a palette swap, rendered through one real
component library. Switch a style and every button, card, table, chart,
overlay and icon changes construction. Generate new systems from a seed,
remix them, mix axes from different styles, tune every token by hand, inspect
why anything looks the way it does, and export the result.

![Styles gallery](docs/public/screenshots/styles-gallery.png)

## Features

### Styles

- 30 built-in styles across Morphism, Modern, Expressive, Futuristic, Retro and
  Minimalist, each with documentation (visual character, history, principles,
  best used for, avoid when) and related styles.
- A gallery with live thumbnails, search, category filters and discovery
  facets derived from the tokens themselves (material, mood, depth, motion,
  complexity), plus a relationship map showing declared relations,
  inheritance, remixes and duplicates.
- A detail drawer per style: docs, a completeness validator, similar styles by
  DNA, relations, and the package source with a link to the file on GitHub.

### Components

- A full component library (buttons, inputs, selection, navigation, feedback,
  overlays, data display, tables, notifications, content and marketing blocks,
  mobile patterns) and SVG charts (line, area, bar, donut, radial, sparkline,
  scatter, waveform) that all read the active style.
- One Components page with three sets of sections: Foundations (tokens,
  motion, materials, icons, SVG art), Components and Data (charts, table,
  notifications). Desktop, tablet, mobile and custom viewports, rulers, a
  responsive inspector and A / B / C comparison.

### Templates

- One fictional product, Orbit, in three templates built only from the
  component library: a desktop landing site (7 pages), the same site on a
  phone, and a mobile app (17 screens across onboarding, home, goals, wallet,
  chat and account). Every style restyles all of them.
- Fully clickable with no backend: links, forms, dialogs, sheets, menus,
  toasts, loading and empty states.
- Screen, Flow (every screen on one board) and A / B / C views, a live list of
  the components on screen that outlines them in the frame, share links, a
  full-screen preview, and an optional image of your own that stays in the
  tab's memory.
- **Editable in place:** rewrite any text right in the frame, hide and reorder
  landing sections, keep the edits in your browser and export them as JSON.

### Generation

- Procedural engine 2.0: seed → personality → semantic recipe → compatibility
  weighting → repair → tokens. Coherent, Experimental and Extreme modes,
  per-axis locks, remix with strength, batch generation with near-duplicate
  rejection, a decision trace, Style DNA and a deterministic identity hash.
- Share links that reproduce a generated style exactly, including its remix
  lineage.

### Tools

- **Tweaks** on every page: sliders for corner radius, border width, shadow
  depth, spacing, type size, accent colour and motion speed, live in the
  preview and every compare frame, saved as a new style in one click.
- Style Customizer with a real colour picker and contrast readout, presets
  for every system, undo/redo, section resets and app-wide live preview.
- Style Anatomy, token inspector (click any element to see its tokens),
  style diff, A / B / C compare and the Style Mixer for cross-style hybrids.
- Export as JSON tokens, CSS variables or a contribution package; import
  styles with validation; command palette (Ctrl+K) and keyboard shortcuts.

### The app

- One layout everywhere: a collapsible navigation rail, a searchable style
  picker, a left panel that hides or becomes a drawer on phones, and a
  preview stage.
- Real addresses: every page, section, filter, device, comparison and open
  tool lives in the URL, so anything you see can be linked and Back works.
- Motion throughout (Framer Motion): page entrances, gliding indicators,
  panels and an animated landing page, all respecting reduced motion.

### Community

- Community styles are plain JSON packages under
  [`styles/community/`](styles/community/), indexed at build time, validated
  in CI and shown with author, licence and source. A package can `extends` a
  built-in style and override only what differs.
- A Python implementation of the engine for batch generation, validation and
  CI, verified bit-for-bit against the browser engine.

## Screenshots

| | |
| --- | --- |
| ![Landing page](docs/public/screenshots/landing.png) | ![Tweaks](docs/public/screenshots/tweaks.png) |
| ![Style detail](docs/public/screenshots/styles-detail.png) | ![Relationship map](docs/public/screenshots/styles-map.png) |
| ![Components](docs/public/screenshots/components.png) | ![Charts compared in three styles](docs/public/screenshots/components-compare.png) |
| ![Templates](docs/public/screenshots/templates.png) | ![Editing a template](docs/public/screenshots/templates-edit.png) |
| ![Templates compared in three styles](docs/public/screenshots/templates-compare.png) | ![The flow board](docs/public/screenshots/templates-flow.png) |
| ![Generator](docs/public/screenshots/generator.png) | ![Customizer](docs/public/screenshots/customizer.png) |

**Live:** <https://chinto-lgtm.github.io/ui-explorer/> · **Docs:** <https://chinto-lgtm.github.io/ui-explorer/docs/> — both built from `main` by GitHub Actions.

## Getting started

Requires Node.js 20+ (Python 3.10+ for the engine tools).

```sh
npm install
npm run dev        # http://localhost:5173
```

```sh
npm test           # vitest: engine, registry, app
npm run lint       # oxlint
npm run build      # tsc + vite
```

Keyboard: `Ctrl+K` search · `Ctrl+.` tweaks · `Ctrl+E` customizer ·
`Ctrl+Shift+A` anatomy · `Ctrl+Shift+C` compare · `Ctrl+Shift+D` diff ·
`Ctrl+Shift+X` inspect · `?` all shortcuts.

## Deploying

The app is a static site with no backend. `npm run build` writes `dist/`,
which any static host serves as-is (Netlify, Vercel, Cloudflare Pages, S3…).
For hosts that serve under a sub-path, set `VITE_BASE_PATH=/sub-path/` at
build time; `.github/workflows/deploy.yml` does this for GitHub Pages and
copies `index.html` to `404.html` so deep links resolve.

## Theming the app itself

The tool's own look — header, sidebar, workspaces, modals, the docs site —
comes from one file: [`src/theme.css`](src/theme.css). Change a value there
and everything follows; a test (`src/theme.test.ts`) fails if any chrome file
introduces a literal colour. The 30 design styles are separate data
(`src/styles/*.ts`, `styles/community/*/style.json`) and are never affected.

## Project layout

```text
src/
  config/         routes.ts: the one list of pages and tools (router, rail, search, landing)
  engine/         types, resolver, registry, context, tweaks, validation, inheritance, share links
  engine/generator/  procedural engine: vocab, personalities, compatibility, colour, DNA
  styles/         30 built-in style definitions, treatments, docs, community loader
  components/     ui primitives, charts, svg, preview, layout (shell), workspace (panel, stage, device frame)
  features/       tweaks, anatomy, diff, inspector, mixer, export, search, shortcuts
  hooks/          URL state, compare, keyboard shortcuts
  motion/         motion presets and the reduced-motion policy
  pages/          Landing, Styles, Templates, Components, Generator, Customizer
  templates/      the Orbit landing site and mobile app, their content, catalogue and visitor edits
styles/community/ community style packages + index.json
schemas/          JSON schema for a style definition
tools/style-engine/  Python engine + validator (see its README)
docs/             guides and screenshots
```

## Creating and contributing styles

- [docs/creating-a-style.md](docs/creating-a-style.md) — generate, customise
  or hand-write a style; extend a built-in; validate.
- [CONTRIBUTING.md](CONTRIBUTING.md) — how to submit a package or code.
- [styles/community/README.md](styles/community/README.md) — the registry
  format.

The same pages are published as a documentation site (`npm run docs:dev`
locally; built by VitePress into `dist/docs`). Developer documentation:
[architecture](docs/architecture.md) ·
[style engine](docs/style-engine.md) · [style schema](docs/style-schema.md) ·
[procedural generation](docs/procedural-generation.md) ·
[community styles](docs/community-styles.md).

## Python engine

```sh
cd tools/style-engine
python -m style_engine generate --seed 847291
python -m style_engine inspect --seed 847291
python -m style_engine validate ../../styles/community/aurora-glass
```

The browser engine is the source of truth; the Python engine follows the same
algorithm and draw order and is checked against exported reference output by
`npm run engine:test`. Details in
[tools/style-engine/README.md](tools/style-engine/README.md).

## License

[MIT](LICENSE)

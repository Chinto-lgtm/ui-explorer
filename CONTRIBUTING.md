# Contributing to UI Explorer

UI Explorer is an open-source laboratory for interface design systems. The
two most useful contributions are **new styles** and **fixes to the engine or
components**. Both are welcome.

## Contributing a style

A style is a plain JSON package under `styles/community/<slug>/`:

```text
styles/community/<slug>/
├── style.json   # StyleDefinition — see schemas/style.schema.json
└── README.md    # optional notes, credits, screenshots
```

1. **Design it in the app.** Use the Style Generator or Customizer, then
   *Contribute Package* in the sidebar. It downloads `style.json`,
   `metadata.json` and a `README.md` with your author name and licence.
2. **Add the folder** `styles/community/<slug>/` with `style.json` (and the
   README if you like).
3. **Register it**: append the contents of `metadata.json` as an entry in
   `styles/community/index.json`.
4. **Validate**:

   ```sh
   npm run registry:check      # schema + colours + index consistency
   npm test                    # loads the registry through the app
   ```

5. **Open a pull request.** The *Validate community style contributions*
   workflow runs the same checks.

Guidelines:

- `metadata.id` is lowercase letters, digits and hyphens, prefixed
  `community-`; it must match the `id` in `index.json`.
- Aim for WCAG AA (4.5:1) between `textPrimary` and `bg`. The Styles gallery
  shows the contrast per colour and the *Validator* tab lists which systems
  your package defines.
- Set `metadata.license` (MIT recommended). You keep authorship; it is shown
  in the gallery and stored in the package.
- A package may `extends` a built-in style and only override what differs —
  see `styles/community/retro-cyber/style.json` and
  [docs/creating-a-style.md](docs/creating-a-style.md).

## Contributing code

```sh
npm install
npm run dev          # http://localhost:5173
npm test             # vitest (engine, registry, app)
npm run lint         # oxlint
npm run build        # tsc + vite
npm run engine:test  # Python engine: determinism + TypeScript parity
```

- The browser engine (`src/engine/generator`) is the source of truth for
  generation. If you change it, bump `GENERATOR_VERSION`, run
  `npm run engine:data` to re-export the shared tables and reference fixtures,
  and port the change to `tools/style-engine` so `npm run engine:test` passes.
- Styles are token systems, not palettes: a new built-in style should define
  colours, typography, radii, shadows, borders, motion and, ideally, materials,
  icons, `svgLanguage` and `behavior`. Add its documentation to
  `src/styles/docs.ts`.
- Keep pull requests focused and include the test that proves the change.

## Reporting problems

Open an issue with the style, the page, the browser and — for generation
issues — the seed and mode shown in the Generator's status bar.

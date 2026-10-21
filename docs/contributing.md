<!-- This page mirrors CONTRIBUTING.md at the repository root. -->

# Contributing to UI Explorer

UI Explorer shows one product in many themes. The two most useful
contributions are **new themes** and **fixes to the components and
templates**. Both are welcome.

## Adding a theme

A theme is one TypeScript definition of design tokens: colours, typography,
radii, shadows, borders, motion and, ideally, materials, icons, `svgLanguage`
and `behavior`. It is a construction, not a palette swap.

1. **Shape it in the app.** Use the Customizer to tune a theme, then export it
   as JSON (*Export & import* → Package).
2. **Add the definition** to `src/styles/community.ts` (or the matching
   category file for a built-in theme) and list it in `src/styles/index.ts`.
   Credit yourself in `metadata.author`.
3. **Check it**:

   ```sh
   npm run dev   # it appears in the theme picker at once
   npm test      # validates the tokens and renders every template in it
   ```

4. **Open a pull request** with a screenshot of the theme on a template.

Guidelines:

- `metadata.id` is lowercase letters, digits and hyphens. Community themes are
  prefixed `community-`.
- Aim for WCAG AA (4.5:1) between `textPrimary` and `bg`; the header warns when
  a theme falls short.
- Built-in themes can add their documentation to `src/styles/docs.ts`.

## Contributing code

```sh
npm install
npm run dev     # http://localhost:5173
npm test        # vitest: engine, themes, components, templates, app
npm run lint    # oxlint
npm run build   # tsc + vite
```

Keep pull requests focused and include the test that proves the change.

## Releasing

Bump the version in `package.json` (shown in the app as `APP_VERSION`), tag
`vX.Y.Z` and create a release. `main` deploys automatically.

## Reporting problems

Open an issue with the theme, the page and the browser.

# Community style registry

Every folder in this directory is one style package:

```
styles/community/<slug>/
├── style.json   # the StyleDefinition (see ../../schemas/style.schema.json)
└── README.md    # optional: author notes, screenshots, credits
```

Packages are picked up at build time (`src/styles/community/loader.ts` globs
this directory), validated with the same rules the app uses for imports, and
shown in the **Styles** gallery with a *Community* badge, the author, the
licence and a link back to the source file.

## Adding a style

1. Copy `aurora-glass/` to a new folder named after your style (lowercase,
   hyphens).
2. Edit `style.json`. `metadata.id` must be unique and is conventionally
   prefixed with `community-`.
3. Add an entry to `index.json` (id, name, author, version, license, category,
   description, tags, path, repository).
4. Validate:

   ```sh
   python tools/style-engine/cli.py registry
   npm test
   ```

5. Open a pull request.

## Extending a built-in style

A package may declare `"extends": "<built-in id>"` and only override what
differs — tokens are deep-merged underneath the parent at load time. See
`retro-cyber/style.json`, which extends `cyberpunk` and only changes colours,
shadows and borders. Files that use `extends` still need a complete
`metadata` block.

## Licence

Submit styles under MIT (or another OSI licence named in `metadata.license`).
You keep authorship; it is shown in the gallery and stored in the package.

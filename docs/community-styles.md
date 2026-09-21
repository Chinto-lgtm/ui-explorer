# Community styles

## Registry

```text
styles/community/
├── index.json            one entry per package (id, name, author, version,
│                         license, category, description, tags, path, repository)
├── README.md
└── <slug>/
    ├── style.json        the StyleDefinition (may use `extends`)
    ├── metadata.json     the index entry, kept next to the package
    ├── preview.svg       rendered from the tokens (npm run registry:previews)
    └── README.md         optional
```

## Build-time loading

`src/styles/community/loader.ts` globs `styles/community/*/style.json` with
`import.meta.glob` (eager). For each file it:

1. resolves `extends` against the built-in styles (`src/engine/inherit.ts`,
   deep merge, parent recorded in `relatedStyles`);
2. validates required fields, ranges and CSS safety (`validateStyleDefinition`);
3. stamps `source: "community"`, and fills `author`, `license` and `version`
   from `index.json` when the file omits them;
4. keeps the raw source text and README for the *Source* tab;
5. registers the style. Problems are collected in `communityProblems` rather
   than crashing the app, and the test suite asserts the list is empty.

There is no runtime fetch and no contributor code: a package is JSON only.

## Official vs community

Built-ins are stamped `source: "official"`; the gallery shows *Official* and
*Community* badges, the author and licence, and the source file on GitHub.
Community styles are first-class everywhere else — they can be used, remixed,
duplicated, diffed, mixed and shared like any built-in.

## Inheritance

`"extends": "<built-in id>"` deep-merges the package over the parent:
objects merge recursively, arrays and primitives replace. `metadata` must be
complete in the child. The relation shows as *extends* in the drawer and on
the relationship map.

## Validation and CI

```sh
npm run registry:check    # python -m style_engine registry
npm test                  # src/styles/community/registry.test.ts
```

`.github/workflows/validate-style.yml` runs both on pull requests that touch
`styles/community/**`, `schemas/**` or `tools/style-engine/**`.

## Contribution flow

See [CONTRIBUTING.md](../CONTRIBUTING.md) and
[creating-a-style.md](creating-a-style.md). In short: design in the app →
*Contribute Package* → add the folder → append to `index.json` → validate →
pull request.

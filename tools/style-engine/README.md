# Style engine (Python)

A Python implementation of UI Explorer's procedural style generator, plus the
validator used by CI for community packages. Standard library only.

```
tools/style-engine/
├── style_engine/
│   ├── __main__.py     CLI
│   ├── prng.py         Mulberry32 + seed hashing (bit-exact with the browser)
│   ├── data.py         loads data/engine-data.json (personalities, vocab, matrix)
│   ├── rules.py        compatibility relations, coherence report, mode factors
│   ├── palettes.py     harmony-based palette generation, WCAG contrast
│   ├── typography.py   font pairing, weights, type scale
│   ├── materials.py    surface / depth / border / icon materialisers
│   ├── geometry.py     corner radius sets and density
│   ├── motion.py       motion tokens and component behaviour
│   ├── svg.py          SVG shape language
│   ├── repair.py       repair loop (re-choose the weakest pairing)
│   ├── scoring.py      Style DNA, identity hash, near-duplicate check
│   ├── validator.py    schema-level validation shared with the app
│   └── generator.py    the pipeline
└── tests/
    ├── test_determinism.py   same seed → same style; different seeds differ
    ├── test_parity.py        every fixture from the TypeScript engine reproduces
    └── fixtures/ts-reference.json
```

## Commands

```sh
cd tools/style-engine

python -m style_engine generate --seed 847291            # summary
python -m style_engine generate --seed 847291 --json     # full StyleDefinition
python -m style_engine generate --seed myseed --count 20 # batch, near-duplicates rejected
python -m style_engine generate --seed 7 --mode Extreme --personality Playful
python -m style_engine inspect --seed 847291             # every decision, coherence, DNA
python -m style_engine export --seed 847291 --out my-style.json
python -m style_engine validate ../../styles/community/aurora-glass
python -m style_engine registry ../../styles/community/index.json
```

Or from the repository root: `npm run engine:test`, `npm run registry:check`.

## Determinism

`tests/test_determinism.py` proves that the same seed and rules produce an
identical style (tokens, trace and DNA hash) and that different seeds do not
collapse to the same output.

## TypeScript ↔ Python consistency

The browser engine (`src/engine/generator`) is the runtime source of truth.
Both implementations follow the same conceptual pipeline —

```
seed → personality → visual family → palette (harmony) → surface → geometry
     → depth → borders → typography → icons → motion → svg → behaviour
     → repair loop → materialised tokens → name, DNA, hash
```

— and consume the same draws from the same PRNG in the same order. The static
data (personalities, vocabulary labels, compatibility matrix, generator
tables) is exported from TypeScript into `style_engine/data/engine-data.json`
by `npm run engine:data`, which also writes `tests/fixtures/ts-reference.json`
(8 seeds × 3 modes of full browser output). `tests/test_parity.py` requires
every case to reproduce exactly; `src/engine/generator/parity.test.ts` checks
the other direction by running this CLI from vitest when Python is installed.

After changing the browser engine: bump `GENERATOR_VERSION`, run
`npm run engine:data`, port the change here, then `npm run engine:test`.

What is intentionally not ported: remixing with locks (needs a base style from
the browser session), the human-readable "why this style" explanations, and
the generation cache.

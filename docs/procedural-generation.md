# Procedural generation

How the generator turns a seed into a complete, coherent style — and why
every decision is reproducible and explainable. The algorithm is part of the
open-source value of the project; this document is the reference for it.
Implementation: `src/engine/generator/` (browser, source of truth) and
`tools/style-engine/style_engine/` (Python, verified against it).

```text
seed ─► PRNG ─► personality ─► visual family ─► palette
     ─► surface ─► geometry ─► depth ─► borders ─► typography ─► icons ─► motion ─► svg
     ─► behaviour ─► coherence check ─► repair loop ─► materialise tokens
     ─► name · category · DNA · hash
```

## 1. Seed and PRNG

Any string or number is hashed to a positive 32-bit integer (`hashSeed`):
numbers are used as-is (absolute, non-zero), strings go through the classic
`hash * 31 + charCode` loop. The integer seeds a **Mulberry32** generator
(`src/engine/random/prng.ts`). Every random decision draws from this one
stream, in a fixed order, so the same seed always yields the same style.
Some draws happen even when the value is overridden (personality, family) so
that forcing the value a seed would have drawn produces an identical result.

## 2. Personality

Twelve personalities (`personalities.ts`): Calm, Professional, Luxury,
Technical, Futuristic, Playful, Organic, Editorial, Dark, Experimental,
Energetic, Minimal. Each carries weighted preferences:

- visual families (e.g. Playful → Memphis 30, Clay 50, Soft 20)
- hue ranges, saturation range, probability of a dark background
- typography, radius, surface, depth, motion and SVG-language weights

The personality is drawn uniformly unless the user pins one.

## 3. Weighted selection

`prng.weightedChoice(options)` picks proportionally to weight. Weights come
from the personality, are merged into the canonical vocabulary
(`vocab.ts`: 14 surfaces, 7 depths, 7 borders, 8 motions, 8 icon types, 5
geometries), and every value stays reachable with a small floor weight so the
Experimental and Extreme modes can wander.

## 4. Dependencies and the compatibility matrix

Axes are chosen in dependency order. Each candidate's weight is multiplied by
its relationship with what has already been chosen (`compatibility.ts`):

| Pairing | Example |
| --- | --- |
| surface ↔ depth | glass + glowing **+2**, glass + physical **−2** |
| surface ↔ border | clay + none **+2**, glass + strong **−2** |
| geometry ↔ surface | pill + clay **+2**, sharp + clay **−2** |
| depth ↔ border | physical + strong **+2**, physical + none **−2** |
| icons ↔ surface | pixel + flat **+2**, pixel + glass **−2** |
| motion ↔ depth | expressive + glowing **+2**, static + floating **−1** |
| typography ↔ surface / personality | mono on HUD-like surfaces **+2**, serif for Futuristic **−2** |
| svg ↔ surface | aurora gradients on glass **+2**, pixel strokes on glass **−2** |

Relations are −2 … +2 and map to multipliers per mode:

| Relation | Coherent | Experimental | Extreme |
| --- | --- | --- | --- |
| −2 incompatible | ×0.05 | ×0.4 | ×1 |
| −1 tension | ×0.35 | ×0.8 | ×1 |
| 0 neutral | ×1 | ×1 | ×1 |
| +1 compatible | ×1.6 | ×1.2 | ×1 |
| +2 strong | ×2.4 | ×1.4 | ×1 |

Every decision is recorded with its candidates, base weight, factor and the
reasons behind the factor — this is the *Debug* / rule-inspector view and the
Python `inspect` command.

## 5. Colour

`colorEngine.ts`: a base hue from the personality's hue preferences, a harmony
(Analogous 40, Monochromatic 25, Complementary 15, Split-complementary 10,
Triadic 10) that offsets the accent hue, a dark/light decision from the
personality's probability, and saturation from its range. Backgrounds,
surfaces, borders and text are derived in HSL at fixed lightness steps;
accents are boosted +30 saturation. WCAG contrast is computed for the result.

## 6. Scoring

`evaluateRecipe` scores every pairing, weights them (surface 1.5, depth 1.3,
typography 1.2 … svg 0.7) and reports a 0..1 coherence score plus the
**weakest axis**. The score is internal — it drives repair and explanation,
it is never shown as a quality rating.

## 7. Repair

If the weakest relation is below the mode's threshold (Coherent: < 0,
Experimental: < −1, Extreme: never), that axis is re-chosen with coherent
weighting using a derived PRNG (`seed + iteration × 1013`), up to three times.
Locked axes are never repaired. Repairs are listed in the trace and in the
"why this style" explanation.

## 8. Materialisation

Semantic values become tokens (`vocab.ts` materialisers): a `glass` surface
becomes `rgba(...)` with `backdropBlur: 24px`; `physical` depth becomes hard
offset shadows in the text colour; `pill` geometry becomes the 14/24/32/40px
radius set; `elastic` motion becomes a spring easing with 1.06 hover scale;
the SVG language becomes `cornerStyle`, `patternOverlay`, `decorativeShapes`;
motion + depth become the behaviour family (hover, elevation, focus ring).

## 9. Identity

A name is composed from the palette mood and the material (`Midnight Glass`,
`Neon Clay`), the category from personality and surface, and the **Style
DNA** (`dna.ts`) — nine 0..10 axes describing how expressive each dimension
is — is hashed with FNV-1a into `XXXX-XXXX-XXXX`. The hash detects duplicates
in batches and identifies shared styles; it is descriptive, not a score.

## Worked example — seed 847291, Coherent

```text
Neon Clay  (Expressive)  seed 847291  DNA 3D8E-79F1-0104
  Playful / Memphis · Monochromatic harmony
  surface clay · depth physical · border thin · corners pill · motion expressive · icons 3d
  bg #f8f8f6 · surface #efeeec · accent #e6a800 · text #0f172a  (AAA, 16.79:1)
  repaired: borders

Decisions
  personality  Playful
  family       Memphis      alternatives: Clay (50), Soft (20)
  colors       Monochromatic (#e6a800)
  surface      clay         alternatives: elevated (40), flat (2), solid (2)
  geometry     pill         alternatives: large (96), medium (3), small (1)
  depth        physical     alternatives: soft (96), inset (4.8), deep (3.2)
  borders      subtle       alternatives: thin (48), none (6), dashed (3)
  typography   Plus Jakarta Sans
  icons        3d           alternatives: rounded (84), outline (40)
  motion       expressive   alternatives: elastic (70), physical (4.8)
  svg          Squiggles    alternatives: Confetti Dots (50)
  behavior     cinematic
  borders      thin (repair 1)

Coherence  Surface↔Depth +1 · Geometry↔Surface +2 · Icons↔Surface +2 · Depth↔Border +1 … score 0.73
```

Why *subtle* borders were repaired: `physical` depth with `subtle` border is
a tension (−1), below the Coherent threshold, so the border axis was
re-drawn; `thin` (+1 with physical depth, 0 with clay) won.

Reproduce it yourself:

```sh
cd tools/style-engine && python -m style_engine inspect --seed 847291
```

or open `/generator?seed=847291&mode=Coherent&personality=Playful&family=Memphis`.

## Remix, locks, batches

- **Locks** keep chosen axes from a base style; only unlocked axes are drawn.
- **Remix** (`remixStyle`) derives a semantic recipe from any style — built-in,
  community or generated — and regenerates a subset of axes (Subtle 2,
  Balanced 4, Strong all) with a fresh seed, recording the parent for lineage.
- **Batches** (`generateBatch`) step the seed by 7919 and reject near-duplicates
  by DNA distance.

## Versioning

`GENERATOR_VERSION` is stored in every generated style. Changing the
algorithm or its tables bumps the version, and `npm run engine:data`
re-exports the shared data and reference fixtures so the Python engine can be
updated and re-verified.

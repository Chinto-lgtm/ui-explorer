# Style schema

The canonical definition is `src/engine/types.ts` (`StyleDefinition`); the
JSON Schema at `schemas/style.schema.json` mirrors it for editors and CI.

## Shape

```text
StyleDefinition
├── extends?        id of a built-in to inherit from (packages only)
├── metadata        id, name, category, description, tags, personality,
│                   bestUsedFor, avoidWhen?, history?, visualCharacter?,
│                   principles?, relatedStyles?, author?, version?, license?,
│                   source? (official | community | generated | custom), isCustom?
├── tokens
│   ├── colors      bg, surface, surfaceHover?, surfaceActive?, textPrimary,
│   │               textSecondary, textTertiary, border, borderHover?, accent,
│   │               accentHover, accentText?, success?, warning?, error?, info?,
│   │               shadowColor?, glowColor?
│   ├── typography  fontFamilySans, fontFamilyHeading?, fontFamilyMono?,
│   │               fontSizeXs … fontSize3xl, fontWeightNormal/Medium/Bold,
│   │               letterSpacing, lineHeight
│   ├── radii       sm, md, lg, xl?, full
│   ├── shadows     sm, md, lg, inset?, glow?, colored?, none?
│   ├── borders     width, style, color, opacity?
│   ├── motion      durationFast/Normal/Slow, easing, hoverScale?, activeScale?
│   ├── materials?  backdropBlur?, opacity?, texture?, gradient?, reflection?,
│   │               backgroundImage?, density?
│   └── icons?      strokeWidth, filled, styleVariant
├── svgLanguage?    cornerStyle, decorativeShapes, patternOverlay?, borderDecoration?
├── behavior?       buttonHoverAction, cardElevationType, focusRingStyle
├── customCssVars?  extra `--name: value` pairs
└── generation?     seed, mode, personality, visualFamily, generatorVersion,
                    createdAt, recipe, parentSeed?, parentId?, keptAxes?, dnaHash
```

## Required fields

`metadata.id/name/category/description`, every colour listed without `?`,
the full typography block, `radii.sm/md/lg/full`, `shadows.sm/md/lg`,
`borders.width/style/color`, `motion.durationFast/Normal/Slow/easing`. A file
with `extends` only needs `metadata`; token groups it omits come from the
parent.

## Ranges and safety

Validation (`src/engine/validate.ts`, mirrored in
`tools/style-engine/style_engine/validator.py`) rejects:

| Property | Range |
| --- | --- |
| `radii.sm/md/lg/xl` | 0–64px |
| `borders.width` | 0–12px |
| `materials.backdropBlur` | 0–60px |
| `materials.opacity` | 0–1 |
| `motion.duration*` | 0–1000ms |
| `motion.hoverScale/activeScale` | 0.5–1.5 |
| `typography.fontWeight*` | 100–900 |
| `icons.strokeWidth` | 0.5–4 |

and any token value containing `url(`, `expression(`, `@import`,
`javascript:`, `behavior:`, `-moz-binding`, inline event handlers, `<script>`
or other tags, or `; { }` (which could break out of a declaration).
Packages are data: nothing in them is executed.

## Categories

`Morphism` · `Modern` · `Expressive` · `Futuristic` · `Retro` · `Minimalist` ·
`Custom`

## Example

See `styles/community/aurora-glass/style.json` (complete) and
`styles/community/retro-cyber/style.json` (uses `extends`).

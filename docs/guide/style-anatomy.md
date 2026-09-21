# Style Anatomy

`Ctrl+Shift+A`, or **Anatomy** in the header. It answers one question:
*why does this style look the way it does?*

## Sections

The panel groups the active style's definition into eight readable sections:

1. **Identity** — name, category, personality, history, best used for, avoid when
2. **Colour** — every colour token with its value, and the contrast ratio and
   WCAG level for text on background, muted text on surface, and accent text on accent
3. **Typography** — families, scale, weights, tracking, line height
4. **Shape & space** — radii, density
5. **Surface & material** — blur, opacity, texture, gradient, background image
6. **Depth** — shadows, glow, inset
7. **Borders** — width, style, colour, opacity
8. **Motion & behaviour** — durations, easing, scales, hover action, elevation type, focus ring

Each row is the actual token: the CSS variable name, its value and a copy
button. Click a row to **highlight every element on the page that uses that
token**, so "what does `--radius-lg` affect?" has a visible answer.

## Contrast

Contrast is computed, not asserted. A style that fails WCAG AA for body text
shows an amber **`2.8:1`** warning next to the style selector in the header;
clicking it opens Anatomy at the colour section. Experimental styles are
allowed to fail — the problem is surfaced, never silently corrected.

## Token inspector

`Ctrl+Shift+X` (or **Inspect** in the header) turns on inspect mode: hover
outlines any component; clicking shows its computed values and the design
tokens behind them — background, colour, radius, shadow, border, font,
transition, blur, padding — each with *copy token*, *copy CSS* and *copy
value*. **Open in Style Anatomy** jumps to the relevant section.

## Style diff

`Ctrl+Shift+D` compares two styles token by token with changed rows
highlighted; *only differences* is the default. The gallery's **Diff** button
opens it against the current style.

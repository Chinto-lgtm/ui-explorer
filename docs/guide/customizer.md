# Customizer

`Ctrl+E`, or **Style Customizer** in the sidebar. Every token of the current
style has a control; the whole app previews your draft live.

![Customizer](/screenshots/customizer.png)

## Controls

| Group | What you can change |
| --- | --- |
| Colours | Twelve colour tokens with a real picker (HSV field, hue / saturation / lightness / alpha sliders, HEX · RGB · HSL, eyedropper, presets, recent colours) and a live contrast readout for each pairing |
| Background | Solid, gradient, mesh, aurora, noise, grid — sets `materials.backgroundImage` |
| Typography | Body, heading and mono families, scale, weights, tracking, line height |
| Radius | Sharp, small, medium, large, pill presets or per-size values |
| Shadow | Flat, soft, floating, deep, glowing, inset, physical |
| Border | None, subtle, thin, strong, dashed, double, glow |
| Surface | Flat, solid, transparent, frosted, glass, acrylic, clay, elevated, inset, metallic, liquid, paper |
| Density | Compact, comfortable, spacious |
| Icons | Stroke width, filled, variant |
| Motion | Durations, easing, hover and press scale |
| Behaviour | Button hover action, card elevation type, focus ring style |

Presets use the same materialisers as the procedural engine, so a "glass"
surface here is the same glass the generator produces.

## Editing safely

- **Undo / redo** — `Ctrl+Z`, `Ctrl+Shift+Z`, up to 50 steps.
- **Reset** — per property (the ↺ next to a changed control), per section, or
  everything. Changed controls are marked so you can see what you touched.
- The header style selector still works: switching styles re-opens the
  editor on the new base; an unsaved draft is kept until you leave the page.

## Saving and sharing

- **Save as new style** asks for a name, description and tags; the result
  appears in the header selector, the gallery (as *Custom*) and everywhere
  else. Saved styles can be renamed, duplicated, exported and deleted.
- **Share** copies a link that carries the full definition, so the recipient
  sees exactly your style without an account.
- **Export** (`Ctrl+Shift+E`) — see [Design tokens](design-tokens).

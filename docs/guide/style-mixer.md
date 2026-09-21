# Style Mixer

**Style Mixer** in the sidebar builds a hybrid by taking each design axis
from a different style.

## Sources

| Axis | Taken from the chosen style |
| --- | --- |
| Typography | families, weights, scale |
| Surface | material, blur, texture, gradient |
| Colour | palette and accent |
| Border | width, style, colour |
| Depth | shadows, glow, elevation |
| Radius | corner geometry |
| Icons | stroke and family |
| Motion | durations, easing, behaviour |
| SVG | shape and pattern language |

The formula line reads like a recipe — *Editorial × Glassmorphism × Neo
Brutalism* — and the preview card on the right renders the hybrid with real
components. **Surprise me** picks random sources for every axis.

**Preview across the app** applies the hybrid everywhere while the modal is
open; **Save hybrid style** stores it as a custom style with a description of
where each axis came from.

## Generator remixes

The Mixer combines existing styles axis by axis. For *new* values, use the
Generator's **Remix** instead: it derives a semantic recipe from any style
(built-in, community or custom), keeps the axes you lock and regenerates the
rest with a fresh seed, recording the lineage so the result is reproducible.
See [Procedural generation](../procedural-generation).

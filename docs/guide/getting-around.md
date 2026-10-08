# Getting around

UI Explorer opens on its landing page at `/`. **Start exploring** (or **Back
to the lab** on later visits) takes you into the app, where every page shares
one layout.

![The app layout](/screenshots/styles-gallery.png)

## The layout

| Part | What it does |
| --- | --- |
| Header | Logo (back to the landing page), the current page, search, the **style picker**, **Tweaks**, **Compare** and **Inspect** |
| Navigation rail | Every page and tool, your favourite styles, the docs and the GitHub repository. **Collapse** shrinks it to icons; the choice is remembered |
| Left panel | The page's settings: filters, sections, screens, controls. Hide it with the panel button to give the preview the full width; on a phone it opens as a drawer from **Controls** |
| Stage | The preview, with a status line and the page's actions above it |

## Pages

| Page | Address | For |
| --- | --- | --- |
| Styles | `/styles`, `/styles/<style>/<tab>` | Browse, filter and read about every style |
| Templates | `/templates/<template>/<screen>` | A landing site and a mobile app in any style; edit them in place |
| Components | `/components/<section>` | Every component and token, on any device |
| Generator | `/generator` | New styles from a seed |
| Customizer | `/customizer/<section>` | Edit every token of a style |

Everything you choose on a page lives in its address: filters
(`/styles?category=Retro&facets=mood:Dark`), the device and comparison
(`/components/charts?device=mobile&compare`), the template view
(`?view=flow`, `?compare`, `?edit`) and the open tool (`?tool=tweaks`). Copy
the address to share exactly what you see; **Back** closes a tool before it
leaves the page. Old addresses (`/welcome`, `/labs/...`, `/data`) redirect to
their new homes.

## Tools

Tools work on top of any page. Open them from the rail, the search
(<kbd>Ctrl</kbd>+<kbd>K</kbd>) or a shortcut:

| Tool | Shortcut | What it does |
| --- | --- | --- |
| [Tweaks](/guide/tweaks) | <kbd>Ctrl</kbd>+<kbd>.</kbd> | Sliders for radius, borders, shadows, spacing, type, accent and motion speed |
| [Anatomy](/guide/style-anatomy) | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> | Every value behind the current style, explained |
| Inspect | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> | Click any element to see its tokens |
| [Mixer](/guide/style-mixer) | | Typography from one style, surfaces from another |
| Diff | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd> | Every token that differs between two styles |
| Export & import | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>E</kbd> | CSS variables, JSON tokens, theme CSS, or import a style |
| Contribute | | Package a style for the community registry |
| Shortcuts | <kbd>?</kbd> | Every keyboard shortcut |

## The style picker

The picker in the header lists your favourites, recently used styles and every
style by category. Type to filter, use the arrow keys and press
<kbd>Enter</kbd>. The star next to it adds the current style to your
favourites, which then also appear in the rail.

## Motion

The interface animates page changes, panels and menus, and the landing page
reveals itself as you scroll. **Reduce motion** in Tweaks (or your operating
system's setting) keeps fades and drops all movement.

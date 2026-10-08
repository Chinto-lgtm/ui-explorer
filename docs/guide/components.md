# Components

**Components** shows the whole library under the active style, from tokens to
data views. Change the style in the header and every component rebuilds: not
just its colours but its corners, depth, borders, motion, icon treatment and
hover and focus behaviour.

![Components](/screenshots/components.png)

Every section has its own address, `/components/<section>`, so you can link
straight to it. The device, width, rulers and comparison live in the address
too (`/components/table?device=mobile&compare`).

## Sections

The left panel groups the sections in three sets. Search matches component
names and synonyms ("otp", "toast", "combobox"), so you do not need to know
which section holds what.

**Foundations**

| Section | What it shows |
| --- | --- |
| Tokens | Colour swatches, type scale, spacing, radius, elevation, borders and motion values |
| Motion | Tune duration, easing, hover and press scale and translation across real interactions |
| Material | Fourteen surface materials, flat to liquid, with highlight, shadow, reflection, texture, blur and transparency broken out |
| Icons | Outline, filled, duotone, geometric, rounded, 3D, pixel and skeuomorphic treatments inside buttons, navigation, cards and inputs |
| SVG art | Procedural decoration from the style's `svgLanguage`: mesh, aurora, grid, blobs, waves, rings, glow, noise, liquid and chrome |

**Components**

| Section | Components |
| --- | --- |
| Buttons | Primary, secondary, outline, ghost, destructive, sizes, icon-only, loading, success, error, disabled |
| Inputs | Text, password with reveal, textarea, number, search, prefix and suffix, states, validation |
| Selection | Checkbox, radio, switch, slider, segmented control, select, multi-select, combobox |
| Navigation | Navbar, side navigation, tabs, breadcrumbs, pagination, stepper |
| Feedback | Alerts, toasts, progress bars and rings, skeletons, spinners, empty states |
| Overlays | Modal, drawer, tooltip, popover, dropdown menu, context menu |
| Cards, badges, lists | Card variants, stat tiles, badges, avatars, lists, timeline, activity feed |
| Content & marketing | Accordion, chips, carousel, rating, pricing card, testimonial |
| Mobile patterns | Status bar, app bar, tab bar, chat bubble, code input, bottom sheet |

**Data**

| Section | What it shows |
| --- | --- |
| Charts | Line, area, bar, donut, radial, scatter, sparkline and waveform, all SVG, following the style's curves, corners, glow and colours |
| Table | Search, sort, filter, paginate, select, hide columns, row actions, loading, empty and error |
| Notifications | A notification centre with read state, counters, actions and a bell popover |

The deep-dive sections (Motion, Material, Icons, SVG art and the Data set)
bring their own settings into the left panel. The other sections offer
**Disabled** and **Loading** switches that apply to every interactive
component in the preview.

To see the components working together in real product screens, open
[Templates](/guide/templates).

## Interaction states

Every interactive component exposes its full state set: default, hover,
focus-visible, active, disabled, loading, success and error. Focus rings, hover
motion and press feedback follow the style's `behavior` block, so a Neo
Brutalist button shifts with a hard shadow while a Cyberpunk one glows.

## Viewports

**Desktop** is a fluid browser window. **Tablet** (768px) and **Mobile**
(390px) render at their true size inside a device frame and zoom to fit the
stage. **Custom** takes any width from 280 to 2560px, with presets. **Rulers &
grid** overlays a 100px grid, and the **responsive inspector** reports the
real width, the matching breakpoint and how many columns the card grid uses.

## Compare

Turn on **Compare three styles** in the panel, or press **Compare** in the
header (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd>). The section renders in
three frames, A, B and C, each with its own style picker. Settings of the deep
dives are shared, so a chart setting or a motion curve changes in all three
frames at once.

## Overlays inherit the style

Modals, menus, tooltips and popovers portal into the nearest themed container
rather than the document body, so they always carry the tokens of the frame
that opened them, including inside compare frames.

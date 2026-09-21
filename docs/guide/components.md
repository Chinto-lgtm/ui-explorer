# Components

**Components Lab** shows the whole component library under the active style.
Change the style in the header and every component rebuilds — not just its
colours but its corners, depth, borders, motion, icon treatment and hover /
focus behaviour.

![Components Lab](/screenshots/components-lab.png)

## Sections

| Section | Components |
| --- | --- |
| Foundations | Colour swatches, type scale, spacing, radius, elevation, borders, motion |
| Buttons | Primary, secondary, outline, ghost, danger, sizes, icon-only, loading, success, error, disabled |
| Inputs | Text, password with reveal, textarea, number, search, prefix/suffix, states, validation |
| Selection | Checkbox, radio, toggle, slider, segmented control, select, multi-select, combobox |
| Navigation | Tabs, breadcrumbs, pagination, stepper, navbar, side navigation |
| Feedback | Alerts, toasts, progress bars and rings, skeletons, spinners, empty states |
| Overlays | Modal, drawer, tooltip, popover, dropdown menu, context menu |
| Data | Avatars, lists, timeline, activity feed, stats, tables, charts |

Use the search box in the left panel to jump to a component.

## Interaction states

Every interactive component exposes its full state set — default, hover,
focus-visible, active, disabled, loading, success and error — and the lab
shows them side by side. Focus rings, hover motion and press feedback follow
the style's `behavior` block, so a Neo Brutalist button shifts with a hard
shadow while a Cyberpunk one glows.

## Viewports

The stage bar switches between **Desktop**, **Tablet**, **Mobile** and a
**Custom** width with presets. Rulers and a grid overlay can be toggled, and
the **responsive inspector** reports the current width, the matching
breakpoint and the computed density.

## Compare

**Compare** in the header opens two styles side by side; **Triple** shows
three (A | B | C). Scrolling and component state are synchronised across
panels, and **Diff** lists every token that differs.

## Overlays inherit the style

Modals, menus, tooltips and popovers portal into the nearest themed container
rather than the document body, so they always carry the tokens of the
surface that opened them — including inside compare panels.

---
layout: home
hero:
  name: UI Explorer
  text: Thirty design languages, one real interface.
  tagline: An open-source laboratory for exploring, understanding and experimenting with interface design systems — in the browser, with no account and no server.
  image:
    src: /screenshots/styles-gallery.png
    alt: The Styles gallery
  actions:
    - theme: brand
      text: Open the app
      link: https://chinto-lgtm.github.io/ui-explorer/
    - theme: alt
      text: Create a style
      link: /creating-a-style
    - theme: alt
      text: How generation works
      link: /procedural-generation
features:
  - title: Styles are token systems
    details: Switching a style changes radius, depth, borders, motion, icons, SVG language and component behaviour — not just colours. Every one of the 30 built-ins is documented.
  - title: A real component library
    details: Buttons, inputs, selection, navigation, feedback, overlays, tables, notifications and SVG charts all read the active style, with desktop, tablet and mobile framing.
  - title: A procedural engine you can read
    details: Seed → personality → recipe → compatibility → repair → tokens. Every decision is recorded and explained; the same seed reproduces the same style in the browser and in Python.
  - title: Tools for understanding
    details: Style Anatomy, a click-to-inspect token inspector, diffs, side-by-side and three-way compare, and a mixer for cross-style hybrids.
  - title: Yours to change and export
    details: A full customizer with a real colour picker, undo and resets; export as design tokens, CSS variables, theme CSS, SVG or a style package.
  - title: Community by pull request
    details: Styles are plain JSON packages on GitHub, validated in CI, shown with author and licence. A package can extend a built-in and override only what differs.
---

## Where to start

| I want to… | Read |
| --- | --- |
| Browse and compare the styles | [Styles](/guide/styles) |
| See how components change per style | [Components](/guide/components) |
| Understand *why* a style looks the way it does | [Style Anatomy](/guide/style-anatomy) |
| Make my own style | [Creating a style](/creating-a-style) |
| Submit a style to the registry | [Community styles](/community-styles) · [Contributing](/contributing) |
| Read the generator algorithm | [Procedural generation](/procedural-generation) |
| Work on the code | [Architecture](/architecture) · [Style engine](/style-engine) · [Style schema](/style-schema) |

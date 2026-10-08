# Templates

**Templates** shows what a style looks like on a real product. Orbit is a
fictional personal-money app with three templates: a desktop landing site, the
same site on a phone, and the mobile app. Every screen is built only from the
component library, so switching the style in the header restyles all of them.

![Templates](/screenshots/templates.png)

## The three templates

| Template | Frame | Screens |
| --- | --- | --- |
| Desktop landing | 1440px browser | Home, Features, Pricing, About, Blog, Contact, Sign in |
| Mobile landing | 390px phone browser | The same seven pages, laid out for a phone |
| Mobile app | 390px phone | 17 screens in six flows (below) |

The landing site is **one responsive site**. Its layout responds to the width
of the frame through CSS container queries, not to the browser window. The
phone version is therefore the real responsive behaviour: a menu button that
opens a side drawer, stacked sections, swipeable testimonials and a compact
product demo.

The app screens are grouped into the flows a person walks through:

| Flow | Screens |
| --- | --- |
| Onboarding | Splash, Welcome (carousel), Sign in, Verify (6-digit code), Permissions |
| Everyday | Home, Discover, Notifications |
| Goals | Goal, New goal (three steps), Goal created |
| Money | Wallet: cards, card designer, charts, transactions, statements |
| Social | Chats, Chat with a playable voice note |
| Account | Profile, Settings, App states (loading, empty, error, offline) |

## Everything is clickable

There is no backend, but everything responds the way the real product would:

- Links and tabs move between screens.
- Forms validate.
- Dialogs, sheets, menus and popovers open and close.
- Toasts confirm actions.
- Loading and empty states appear when you filter.

A few examples to try:

- **Pricing:** switch to yearly or student pricing, then start a trial.
- **Sign in:** sign in with any password of six or more characters, then paste
  any six digits as the code.
- **Blog:** filter or search until nothing matches.
- **Chat (app):** play the voice note, send a message, or right-click a
  message for its menu.

## Viewing modes

The toolbar above the frame switches between three views:

- **Screen:** one screen at its true size, zoomed to fit. Use **Fit** or a
  fixed zoom (50%, 75%, 100%) and the arrows to step through the screens.
- **Flow:** every screen of the template on one board, grouped by flow.
  Click a thumbnail to open it.
- **A / B / C:** the same screen in three styles side by side. Pick each style
  above its frame. Links you follow apply to all three frames. The header's
  **Compare** button opens this view too.

![Comparing three styles](/screenshots/templates-compare.png)

## Edit a template

Press **Edit** above the frame (or turn on **Edit text on the page** in the
left panel) and the screen becomes a page you can rewrite:

- **Text:** click any headline, button label or paragraph and type. Press
  <kbd>Enter</kbd> to keep it or <kbd>Esc</kbd> to undo. While editing, links
  and buttons wait, so a click never leaves the page.
- **Sections (landing pages):** the panel lists the page's sections. Drag them
  into a new order, or use the arrows, and hide any with the eye.

![Editing a template](/screenshots/templates-edit.png)

Edits are saved in this browser and show everywhere the screen appears: in
compare, on the flow board and in full screen. The desktop and phone landing
templates are one website, so they share their edits. Edited screens carry a
dot in the screen list.

- **Reset page** removes this screen's edits; the link below it removes all of
  them.
- **Export** downloads your edits as `orbit-template-edits.json`; **Import**
  loads such a file, for example on another computer.

Editing works on one screen at a time, in the Screen view. The address
remembers it (`?edit`), so a link can open a template ready to edit.

## Components on this screen

The **Components** panel lists every library component rendered in the frame,
with a count for each. The list updates live as you interact, for example when
a dialog opens.

- Hover a name to outline those components in the frame.
- Click a name to scroll to the first one.
- **Opens on interaction** lists components behind a button, such as a modal
  or a sheet.

In the Flow view the panel covers the whole template. Each template uses every
component in the library. The one exception is the desktop navigation bar,
which the app replaces with its tab bar. A test fails if a template stops
using a component.

Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd> to turn on the token
inspector, then click any element in a frame to see the tokens behind it.

![The flow board](/screenshots/templates-flow.png)

## Sharing and full screen

- **Copy link** copies a URL that opens the same template, screen, view and
  style. A custom or generated style travels inside the link, as everywhere
  else in UI Explorer.
- **Full screen** opens `/preview/<template>/<screen>`, which shows only the
  template. A small bar lets you change screen and style or go back. On a
  phone, the app and the mobile site fill the screen edge to edge.

## Your own image

The templates ship without photos. Every picture slot draws art generated
from the active style instead. To see a real picture, use **Add an image** in
the left panel and every picture slot shows it. The image is never uploaded:
it stays in this browser tab's memory and is gone when you reload or press
**Remove**.

## How it is built

| Part | Where |
| --- | --- |
| Templates, screens and flows | `src/templates/registry.ts` |
| Story content (copy, numbers, people) | `src/templates/content.ts` |
| Landing site | `src/templates/landing/` with `landing.css` (container queries) |
| Mobile app | `src/templates/app/` with `app.css` |
| Themed screen container | `src/templates/TemplateScreen.tsx` |
| Visitor edits (store, overlay, editing) | `src/templates/edit/` |
| Component catalogue for the panel and tests | `src/templates/catalog.ts` |
| Viewer, frames, flow board, panel, full screen | `src/pages/Templates/` |

Template code reads only style tokens (`var(--color-*)`, `var(--radius-*)`
and so on), never literal colours. A test enforces this the same way the app
chrome is guarded. Overlays portal into the screen container, so modals and
sheets stay inside the device frame and carry that frame's style.

Visitor edits never touch the template code. They are laid over the rendered
screen: only the values of text nodes change, and sections are hidden and
reordered with CSS, so React keeps working and dynamic text (prices, counters)
still updates.

To add a screen, write a component that uses the library components and add
it to a template's screen list in `registry.ts`. Links inside a template call
`go('<screen id>')` from `useTemplateNav()`. The tests check that every
target exists.

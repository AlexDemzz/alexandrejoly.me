# DESIGN — react-easy-modals

The palette, typography, radii, motion tokens and base styles come from the alexandrejoly.me design system (`DESIGN.md` at the repository root, tokens in `packages/ui/src/styles/theme.css`). The docs pages use Fumadocs' `DocsLayout`, themed by `@portfolio/docs-theme`. This file covers what this site adds on top, and where it departs from the root rules.

## Landing

- Follows the responsivecn home: the mark with an outline GitHub button at the end, a 20px statement that opens with the `h1` name, a large "Read the docs" button, then the hero card and the Get started, Features, shadcn/ui and Docs sections in the 624px column. The primitives come from `@portfolio/ui`.
- **Mark:** the static stacked-window mark (`LogoMark`), 40px, on every page.
- **Hero card:** the one card the landing allows, wider than the column (`max-w-breakout`, 816px). A `rounded-3xl` hairline card with an 8px inset holds two `rounded-xl` tiles, so the radii stay concentric (24px − 8px = 16px): on the left a tile on the page background with "Show modal" and the resolved value in mono (`"delete"`, `"cancel"`, `undefined`, or "No answer yet" before the first run); on the right a `CodeBlock` whose header tabs (default variant) switch between `project-settings.tsx` and `confirm-delete.tsx`. The code keeps one fixed height across both files. The modal itself explains the promise, since its backdrop hides the page.
- **Features:** one default-variant tab per feature (Stack, Nested, Guards, Transitions, Lazy). Each panel holds a one-line summary, a demo `Preview` at a fixed 320px, the demo's code collapsed to 144px behind "Show more", and a link to its docs page; the fixed heights keep tab switches from moving the page. A feature's code is the demo's own code, trimmed to the parts it shows.
- **Demo output:** what a demo reports stays readable once its modal closes: the Stack and Nested traces (14px mono, the six latest calls, the newest in ink), the Guards close value, the Transitions counter.
- **Docs:** one `Item` per page (title and description, no media), separated by `ItemSeparator`. Each item is pulled out by its own padding (`-mx-3`), so its text and the separators line up with the section title and the hover fill keeps its room.
- **Code cards:** `CodeBlock` from `@portfolio/ui`, one `CodeBlockLine` per highlighted line (`HastLines`). Shiki's vitesse themes ride on CSS variables, and the colour scheme picks one. The landing and the MDX code blocks share one Shiki config (`src/lib/shiki.ts`).
- **Diff card:** the `removed` and `added` line variants draw the markers, with screen-reader labels.

## Demos

- Landing demos open the registry Modal (`@portfolio/ui/components/modal`), so the page shows the component it ships; nested Modals scale and drop under their child (`--nested-dialogs`).
- Docs demos sit in a hairline `Preview` card and draw their own backdrop and panel (`demo-modal.tsx`), to show that the library is headless.

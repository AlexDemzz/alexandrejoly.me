# DESIGN — react-easy-modals

The palette, typography, radii, motion tokens and base styles come from the alexandrejoly.me design system (`DESIGN.md` at the repository root, tokens in `packages/ui/src/styles/theme.css`). The docs pages use Fumadocs' `DocsLayout`, themed by `@portfolio/docs-theme`. This file covers only what this site adds on top.

## Landing

- Reads like the portfolio home: the identity, two paragraphs, then a runnable code card where `await modals.open()` resolves into the code, followed by Get started, Features, shadcn/ui and Docs sections stacked in one column. The primitives come from `@portfolio/ui`; the registry Modal (`ui/modal.tsx`) and the demo modals are local.
- **Identity:** the stacked-window mark over the statement "React Easy Modals: modals you can await." On the landing the name is the page `h1`; elsewhere, such as the 404 page, the name is plain text and the mark and statement link home. The stack fans out while the identity is hovered or, as a link, holds keyboard focus (`identity-active`), `ease-settle` over 250ms: the front layer rises, the back ones drop and fade to 80% and 60%, staggered 30ms and 60ms.
- **Hero card:** runs `deleteProject()`. The `await` line is a highlighted `CodeBlockLine` with a pulsing "pending" dot (1.2s); when the modal closes, the resolved value types itself in as a highlighted comment line (clip from the start over 600ms, `ease-settle`). The Run button becomes "Run again".
- **Code cards:** `CodeBlock` from `@portfolio/ui`, one `CodeBlockLine` per highlighted line. Shiki's vitesse themes ride on CSS variables, and the colour scheme picks one. The landing and the MDX code blocks share one Shiki config (`src/lib/shiki.ts`).
- **Diff card:** the `removed` and `added` line variants draw the markers, with screen-reader labels.

## Demos

- Landing demos open the registry Modal (`@/components/ui/modal`), so the page shows the component it ships.
- Docs demos sit in a hairline `Preview` card and draw their own backdrop and panel (`demo-modal.tsx`), to show that the library is headless.

## States

- `prefers-reduced-motion`: the mark stays at rest, and the pending and resolved animations are off.

# DESIGN — react-easy-modals

The palette, typography, radii, motion tokens and base styles come from the alexandrejoly.me design system (`DESIGN.md` at the repository root, tokens in `packages/ui/src/styles/theme.css`). The docs pages use Fumadocs' `DocsLayout`, themed by `@portfolio/docs-theme`. This file covers only what this site adds on top.

## Landing

- Reads like the portfolio home: the identity, two paragraphs, then a runnable code card where `await modals.open()` resolves into the code, followed by Get started, Features, shadcn/ui and Docs sections stacked in one column.
- **Identity:** the stacked-window mark over the name and the tagline "Modals you can await." The stack fans out while the identity is hovered or holds keyboard focus (`identity-active`), `ease-settle` over 250ms: the front layer rises, the back ones drop and fade to 80% and 60%, staggered 30ms and 60ms.
- **Hero card:** runs `deleteProject()`. The `await` line takes the `accent` fill and a pulsing "pending" dot (1.2s); when the modal closes, the resolved value types itself in as a comment (clip from the start over 600ms, `ease-settle`, on a 6% ink wash). The Run button becomes "Run again".
- **Code cards** (`CodeBlock`): a `muted` card at 16px radius with no border, a ghost copy button pinned to the top end. Shiki's vitesse themes ride on CSS variables, and the colour scheme picks one. The landing and the MDX code blocks share one Shiki config (`src/lib/shiki.ts`).
- **Diff card:** removed lines keep their colours at 55% opacity, led by faint `-`/`+` markers with screen-reader labels.

## Demos

- Landing demos open the registry Modal (`@/components/ui/modal`), so the page shows the component it ships.
- Docs demos sit in a hairline `Preview` card and draw their own backdrop and panel (`demo-modal.tsx`), to show that the library is headless.

## States

- `prefers-reduced-motion`: the mark stays at rest, and the pending and resolved animations are off.

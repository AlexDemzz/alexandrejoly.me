# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

React developers, often on shadcn/ui, who need modals in an app and are tired of wiring an `open` state, a trigger and a callback for each one. They land on the docs from npm, GitHub or the shadcn registry directory, decide in a minute whether the API fits, then come back to the reference pages while coding.

## Product Purpose

`react-easy-modals` is a modal stack manager for React. You open a modal with `await modals.open(Modal, props)` and get its close value back as a promise. The docs site explains the API, shows every feature running live, and serves the shadcn registry items and LLM-readable docs.

## Positioning

Promise-based: a modal is a function call that resolves with a value, not a piece of state. Headless and zero-dependency, with a LIFO stack, nested modals (`open`, `nested`, `useModalAt`), close guards (`useBeforeClose`) and a drop-in shadcn `Modal` component on the Base UI Dialog (`@alexandrejoly/easy-modal`).

## Operating Context

- Install: `npm install react-easy-modals`, then wrap the app in `ModalProvider`.
- shadcn: `npx shadcn@latest add @alexandrejoly/easy-modal` (Base UI). The legacy `@react-easy-modals/modal` registry URL `/r/styles/{style}/{name}.json` is persisted in users' `components.json`, so it must keep resolving forever (old `react-easy-modals-docs.vercel.app` host redirects with a 308).
- LLM tooling reads `/llms.txt`, `/llms-full.txt` and per-page `.md`.

## Capabilities and Constraints

- API: `ModalProvider`, `useModals` (`open`, `close`, `closeById`, `closeAll`, `stack`, `action`), `useModal`, `useModalAt`, `useBeforeClose`, `ModalProps`.
- Lazy-loaded modals via `React.lazy`, exit transitions via `useBeforeClose`.
- Site: Fumadocs + TanStack Start on Cloudflare Workers at `https://react-easy-modals.alexandrejoly.me`, the `react-easy-modals` app of the alexandrejoly.me monorepo.

## Brand Commitments

- Same author as alexandrejoly.me: the site draws its palette, typography and motion from the portfolio's design system, through the shared docs theme (`@portfolio/docs-theme`). The docs use Fumadocs' `DocsLayout`, like responsivecn (user decision, 2026-10-25).
- Theme: no toggle; dark follows `prefers-color-scheme`, like the portfolio (user decision, 2026-10-20).
- Logo: the stacked-window mark used as the shadcn directory logo (`src/app/icon.svg` in the old site).

## Evidence on Hand

- Live examples in `src/components/modals/**`.
- npm package `react-easy-modals@1.6.0`, GitHub `AlexDemzz/react-easy-modals`, listed in the shadcn registry directory as `@react-easy-modals`.
- No testimonials, user counts or benchmarks: do not invent any.

## Product Principles

- Show, then tell: every feature has a live demo next to its code.
- The code is the pitch: `await modals.open()` should be readable from the first screen.
- Never break an installed user: registry URLs and old links keep resolving.

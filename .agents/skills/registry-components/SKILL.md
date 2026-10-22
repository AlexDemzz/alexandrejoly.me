---
name: registry-components
description: Registry components in apps/web/registry/. Use when building or changing one, its docs page, demos or usage snippet, or the CSS it installs.
---

# Registry components

## New component

1. Add the item to `apps/web/registry.json` and its name to `REGISTRY_ITEM_NAMES` (`apps/web/src/lib/registry.ts`).
2. Fill every `Record<RegistryItemName, …>` the type checker then flags: docs entry, usage snippet, code chunk, home icon.
3. Name its demos `<name>-*.tsx` (see Code blocks).

Done when `pnpm --filter web check-types` and `pnpm --filter web test` pass.

## Source

A registry file reads like stock shadcn source: code only, with no comments, since it ships verbatim to every install. Oxlint ignores `apps/web/registry/**`, so the file needs no `oxlint-disable` directive. Behaviour, caveats and browser support go on the component's docs page.

## Forwarding props

Every part spreads its remaining props onto one element or component: its _target_.

- When a part sets its own handler on the target, merge it with the consumer's props through Base UI `mergeProps`. Both handlers then run, the consumer's first, and a consumer's `onClick` cannot replace ours. Example: `OnboardingPrevButton`.
- The docs entry names the target in `extends`, which renders "Takes every prop of …": the element (`div`, `span`), or a link to the Base UI or shadcn docs for a wrapped component.

## Polymorphism

A part takes `render` (Base UI `useRender` + `mergeProps`) when a consumer plausibly renders it as another element: a link or a button, as shadcn's `Item`, `Badge` and `SidebarMenuButton` do, or an `li`, as `InfiniteScrollSentinel` does. Every other part is a plain element typed from it, `React.ComponentProps<"div">`, as every part of shadcn's `Card`, `Empty` and `Field` is. A part wrapping a shadcn or Base UI component spreads its props, so the wrapped component's `render` comes through as is.

## Spacing

Model every compound component on shadcn `Card`: it renders well with no `className` on any part, and carries the least spacing that gets it there.

- The root is `flex flex-col` with a `gap` between its parts. Each part spaces its own children with `gap`.
- Padding belongs to surfaces only: a part with its own background, border or ring. A component without a surface, like `Onboarding`, lines its parts up on the root's edge. One exception: `MarqueeItem` spaces items with padding, because a `gap` leaves no space at the seam between the two copies and the loop jumps.
- Parts that sit closer together get their own grouping part, as `CardHeader` groups title and description.
- A slot for user content takes the size of what goes in it: `OnboardingMedia` has no height of its own.
- Every class earns its place: drop `relative`, `flex-1` and the like once nothing relies on them.
- Done when every part renders right bare. A demo passes `className` only for its own needs, such as a width or a placeholder size; when it needs more to look right, fix the component.

## SSR-ready

Every component is SSR-ready: the HTML the server sends is the first frame, identical to the client's first render. The server runs no effects, so whatever shapes that frame comes from props and initial state.

- Take what the component must know up front as a prop, as `useStep(maxStep)` in usehooks-ts does: `Onboarding` takes `totalSteps`.
- Let each part read the context and render itself, as `OnboardingStep` returns `null` while it is not current. Reading `children` through `Children` is fragile and breaks once a step is wrapped.
- Keep effects for syncing with the outside world after mount: listeners, observers, measurements.

Done when the server HTML already shows the right state: `curl` the docs page from the dev server and check the markup (for `Onboarding`: one progress bar per step and "Continue" on step 1), with no warning about hydration in the browser console.

## Code blocks

`apps/web/plugins/component-code.ts` highlights every code block of a docs page at build time, so the page loads no Shiki and has no pending state. It reads:

- the source in `apps/web/registry/<name>.tsx`;
- the usage snippet in `apps/web/src/components/docs/registry-usage.ts`: `imports` and `markup` as two plain strings, shown as two cards as in the shadcn docs, kept apart from the JSX of `registry-docs.tsx`;
- every demo named `<name>-*.tsx` in `apps/web/src/components/demos/`. Name a component's demo and examples after it, or their code tab stays empty.

## Demos

A demo file ships whole in its code tab, so it holds exactly what a reader copies: no docs-only UI, no `oxlint-disable`, no selector reaching into the docs page such as `[data-slot=preview]`. What only explains the component goes through its docs entry:

- a browser-support caveat above the preview: `notice` (see Browser support);
- a trace over part of the component: `inspector`. The preview renders the toggle and sets `data-inspect` to its `name`; the trace lives in `apps/web/src/index.css`, keyed by that name and the part's `data-slot`, in the `inspect` color. Example: the notification badge's "Show hole".

## API reference

Each table lists only the props the part adds, as the shadcn docs do: `extends` already covers everything the target accepts. List `render` on each part that takes it (see Polymorphism).

## Browser support

When an example relies on a CSS feature some browsers lack, give its docs entry a `notice`: what needs the feature, what the example looks like without it, and a feature query such as `hidden not-supports-[animation-timeline:scroll()]:grid`. The page shows it as an `Alert` only in those browsers, so it disappears once they ship the feature; the Markdown twin always carries it. Example: the marquee's "Content that fits" example.

## Markdown twin

Each docs page has a Markdown twin at its path plus `.md`, which "View as Markdown" opens and "Copy Markdown" copies. `componentMarkdown` in `apps/web/src/lib/markdown.ts` builds it from the same docs entry and highlighted code as the page, each preview replaced by its demo's code. Put what the page says in the docs entry as data, never as JSX, or the twin cannot carry it. `markdown.test.ts` fails when a page shows an example, an API part or an accessibility paragraph that the twin lacks.

## CSS an item installs

`shadcn add` merges an item's `css` into the user's global stylesheet rule by rule, keyed by selector. A reinstall adds new selectors and properties but never removes old ones, so an old, more specific rule can keep winning.

- Prefer shipping behaviour in the component file: `--overwrite` replaces it whole. Tailwind arbitrary variants can even style a parent from the child's classes, as `[[data-slot=item]:has(>&)]:relative` does in `item-inset-separator`.
- Keep `css` for what a class cannot carry, such as `@keyframes`. Once published, its selectors and property names are a frozen contract: change values only, or ship a migration note telling the user to delete the old block before reinstalling.

@AGENTS.md

# Registry components

- When a registry component relies on a CSS feature some browsers lack, its docs page shows an `Alert` explaining what differs there and why. Gate it with a feature query, such as `hidden not-supports-[animation-timeline:scroll()]:grid`, never a user-agent check, so it disappears once the browser ships the feature. Give it `role="note"`. Example: the marquee's `Content that fits` example in `apps/web/src/components/docs/registry-docs.tsx`.
- API reference tables follow the shadcn docs: list only the props a part adds, with no `className` row and no rows for props inherited from what it wraps. Every part that spreads its props sets `extends` in `registry-docs.tsx`, which renders "Takes every prop of …": the element name for a plain element (`div`, `span`), or a link to the Base UI or shadcn docs for a wrapped component. List `render` only where rendering another element is the expected use, like `InfiniteScrollSentinel` as an `li`.
- A part that spreads props after its own handlers lets a consumer's `onClick` replace them. Merge with Base UI `mergeProps` instead, so the consumer's handler runs first and ours still runs.

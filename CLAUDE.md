@AGENTS.md

# Registry components

- When a registry component relies on a CSS feature some browsers lack, its docs page shows an `Alert` explaining what differs there and why. Gate it with a feature query, such as `hidden not-supports-[animation-timeline:scroll()]:grid`, never a user-agent check, so it disappears once the browser ships the feature. Give it `role="note"`. Example: the marquee's `Content that fits` example in `apps/web/src/components/docs/registry-docs.tsx`.

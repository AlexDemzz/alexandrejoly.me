# react-easy-modals docs

Docs for [react-easy-modals](https://github.com/AlexDemzz/react-easy-modals), served at <https://react-easy-modals.alexandrejoly.me>.

The shadcn Modal ships from the `@alexandrejoly` registry: `npx shadcn@latest add @alexandrejoly/easy-modal`. Its source lives in `packages/ui/src/components/modal.tsx`, which this site imports from `@portfolio/ui/components/modal`.

Built with [Fumadocs](https://fumadocs.dev) and [TanStack Start](https://tanstack.com/start), deployed as a Cloudflare Worker.

## Development

This site is the `react-easy-modals` app of the alexandrejoly.me monorepo. It takes its theme and docs layout from `@portfolio/docs-theme`. From the repository root:

```sh
pnpm install
pnpm --filter react-easy-modals dev          # http://localhost:3000
pnpm --filter react-easy-modals test         # unit tests
pnpm --filter react-easy-modals check-types
pnpm --filter react-easy-modals build        # builds dist/
pnpm --filter react-easy-modals deploy       # builds and deploys with Wrangler
```

## Layout

- `content/docs/*.mdx`: doc pages; `meta.json` sets the sidebar order.
- `src/components/modals`: live examples used in the docs.
- `src/components/landing`: the landing page's hero and feature demos.
- `public/r`: the legacy registry index and Radix item (see below), frozen.
- `src/routes`: pages and server routes.

Modal components that the examples open with `modals.open` are function declarations: react-easy-modals treats a function without a prototype, such as an arrow function, as a lazy import.

## Public URLs that must keep working

- `/r/styles/{style}/{name}.json`: the URL listed in the shadcn directory and saved in users' `components.json`. `base-*` styles get the Base UI modal, other styles the Radix one.
- `/r/registry.json`, `/r/modal.json`, `/r/modal-baseui.json` (redirects).
- `/llms.txt`, `/llms-full.txt`, `/docs/{slug}.md`.
- The old host `react-easy-modals-docs.vercel.app` must keep its permanent redirect to this domain: users' `components.json` files still point at it. That redirect is served by the Vercel project of the former standalone repository, not by this app.

The `/r/` URLs are legacy. The Base UI ones (`/r/modal-baseui.json` and `/r/styles/base-*/modal.json`) redirect with a 308 to `@alexandrejoly/easy-modal`, which installs the same `modal.tsx`. The Radix ones serve the last build of the item, frozen as static JSON in `public/r`, since `@alexandrejoly` ships no Radix variant. Nothing rebuilds them.

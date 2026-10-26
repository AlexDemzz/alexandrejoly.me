# responsivecn

Responsive shadcn overlays. Each component renders the desktop component at 768px and up, and its mobile counterpart below:

| Pair             | Responsive component |
| ---------------- | -------------------- |
| Dialog → Drawer  | `DialogDrawer`       |
| Sheet → Drawer   | `SheetDrawer`        |
| Popover → Drawer | `PopoverDrawer`      |

Each component is one file that builds on your own shadcn components, so it works on Base UI and Radix. It is a drop-in replacement for the desktop component: same props, on the root and on every part.

## Install

The components ship from the [`@alexandrejoly`](https://alexandrejoly.me) registry, listed in the shadcn registry directory. In a shadcn project:

```bash
npx shadcn@latest add @alexandrejoly/dialog-drawer
```

Or by URL:

```bash
npx shadcn@latest add https://alexandrejoly.me/r/dialog-drawer.json
```

To pin the namespace, add it to the `registries` field of `components.json`:

```json
{
  "registries": {
    "@alexandrejoly": "https://alexandrejoly.me/r/{name}.json"
  }
}
```

## Docs

Read the docs at [responsivecn.alexandrejoly.me/docs](https://responsivecn.alexandrejoly.me/docs).

## Development

This site is the `responsivecn` app of the alexandrejoly.me monorepo. It takes its theme and docs layout from `@portfolio/docs-theme`. From the repository root:

```bash
pnpm install
pnpm --filter responsivecn dev     # docs site on http://localhost:3000
pnpm --filter responsivecn test    # unit tests
```

The component source lives in `packages/ui/src/components/`, shared with the other apps; its tests live in `apps/web/src/`. This site imports it from `@portfolio/ui/components/<name>`. The `@alexandrejoly` registry ships the same file, its imports rewritten to the stock shadcn aliases (`apps/web/scripts/registry-imports.mjs`).

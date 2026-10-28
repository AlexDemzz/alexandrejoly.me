# responsivecn — Ubiquitous Language

Glossary only. Implementation decisions live in the wayfinder map ([#1](https://github.com/AlexDemzz/responsivecn/issues/1)) and its closed tickets.

## Pair

A curated desktop→mobile component combination. Exactly three exist: Dialog→Drawer, Sheet→Drawer, Popover→Drawer. The list is closed: no other combination is valid.

## Slug

The kebab-case name of a pair: `<desktop>-<mobile>`, e.g. `dialog-drawer`. One slug names everything: the component, its source file, its registry item, and its docs URL. There are no per-base variants: the same item installs on Base UI and Radix (see Base-agnostic source).

## Responsive component

The component a pair produces (e.g. `DialogDrawer`). It renders the desktop component at or above the breakpoint and the mobile one below. It is a drop-in replacement for the desktop component: desktop props map 1:1 on the root and its parts.

## Override prop

The prop named after the mobile side of the pair (`drawer={{...}}` on DialogDrawer, SheetDrawer and PopoverDrawer), on the root and on each part that has a mobile counterpart (PopoverDrawerAnchor has none). It is typed 1:1 on the user's installed mobile wrapper (`React.ComponentProps<typeof Drawer>` minus `children`, distributive so Vaul's `fadeFromIndex` union survives). `className` merges (`cn(shared, mobile)`), root state callbacks compose (shared first); other props replace. Read Drawer-only details (e.g. `reason === "swipe"`) on the override's `onOpenChange`: the shared one keeps the desktop signature.

## Breakpoint

Fixed at 768px, read via the standard shadcn `useIsMobile` hook (`@/hooks/use-mobile`). Not a parameter: it briefly was one, then was dropped for shadcn parity ([#6](https://github.com/AlexDemzz/responsivecn/issues/6)).

## Registry

The `@alexandrejoly` shadcn registry at https://alexandrejoly.me/r/{name}.json, built from the alexandrejoly.me repository (`apps/web/registry.json`): one item JSON per slug, `/r/<slug>.json`. Each item is `registry:ui` with one source file `packages/ui/src/components/<slug>.tsx` (symlinked from `apps/web/registry/`), bare `registryDependencies` (`dialog`, `drawer`, `sheet`, `popover`, `button`, `use-mobile`) that shadcn resolves to the user's own base, and empty npm `dependencies`. This site imports the same source from `@portfolio/ui/components/<slug>`; the build rewrites its `@portfolio/ui` imports to the stock aliases below, so installs never see them.

## Catalog

The flattened registry index served at https://alexandrejoly.me/r/registry.json: the three items, beside the author's other components, without file contents. Powers `search`/`list`/MCP and the official directory listing for `@alexandrejoly`.

## Base-agnostic source

Decision (2026-10-24, supersedes the dual-base trees of [#16](https://github.com/AlexDemzz/responsivecn/issues/16)): one source file per pair for every base. It imports only the user's shadcn wrappers (`@/components/ui/*`), `@/hooks/use-mobile` and `@/lib/utils`, never `@base-ui/react`, `radix-ui` or `vaul`. Its public types are exactly the user's desktop wrapper props (`React.ComponentProps<typeof Dialog>`, …), so it is a drop-in on Base UI or Radix. Forwarding shared props to the mobile side goes through small internal helpers (`mergeClassNames`, `composeRootCallbacks`, `omitKeys`) that hold the only casts. Accepted loss: narrowing `reason === "swipe"` on the shared `onOpenChange`. SheetDrawer passes the Sheet's side as both `swipeDirection` (Base UI) and `direction` (Vaul). React Aria is not supported: its wrappers have a different part structure. Proven by a prototype compiled on fresh `base-nova` and `radix-nova` projects; the usage checks beside the tests in alexandrejoly.me keep the Base UI side compiling.

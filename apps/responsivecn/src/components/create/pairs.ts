import { registryNamespace, registryUrl } from "@/lib/shared";

// Pair matrix and install-command strings for the home playground.
// The matrix is a function: each desktop component has exactly one valid
// mobile side (CONTEXT.md), so the UI only ever asks for the desktop one.

export const PAIRS = [
  { desktop: "Dialog", mobile: "Drawer", slug: "dialog-drawer" },
  { desktop: "Sheet", mobile: "Drawer", slug: "sheet-drawer" },
  { desktop: "Popover", mobile: "Drawer", slug: "popover-drawer" },
] as const;

export type Pair = (typeof PAIRS)[number];
export type PairSlug = Pair["slug"];
export type DesktopName = Pair["desktop"];

export const DEFAULT_PAIR: Pair = PAIRS[0];

export const isPairSlug = (value: unknown): value is PairSlug =>
  PAIRS.some((pair) => pair.slug === value);

export interface PreviewSearch {
  pair: PairSlug;
  open: boolean;
}

// The /preview iframe's search params. `open` mounts the demo open, so the
// landing stage shows the overlay itself rather than its trigger.
export const parsePreviewSearch = (
  search: Record<string, unknown>
): PreviewSearch => ({
  pair: isPairSlug(search.pair) ? search.pair : DEFAULT_PAIR.slug,
  open: search.open === true,
});

// Total lookup from desktop name to its pair. `satisfies` forces the record to
// cover every DesktopName at compile time, so pairByDesktop needs no fallback.
const PAIR_BY_DESKTOP = {
  Dialog: PAIRS[0],
  Sheet: PAIRS[1],
  Popover: PAIRS[2],
} satisfies Record<DesktopName, Pair>;

export const pairByDesktop = (desktop: DesktopName): Pair =>
  PAIR_BY_DESKTOP[desktop];

export const BREAKPOINT = 768;
export const MIN_WIDTH = 320;
export const MAX_WIDTH = 1200;
export const DEFAULT_WIDTH = 375;

export const clampWidth = (width: number): number =>
  Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(width)));

export const npxCommand = (item: string): string =>
  `npx shadcn add ${registryNamespace}/${item}`;

export const itemUrl = (item: string): string => `${registryUrl}/${item}.json`;

import type { Register } from "@/lib/registry";
import { isRegister, items } from "@/lib/registry";

/** Light to dark: the order the page descends in. */
export const CHAPTER_REGISTERS: Register[] = ["machined", "strata", "readout"];

/**
 * Each sheet row by row, as it reads from two columns up, so the numbers,
 * the tab order and the eye all run the same way.
 */
const ROWS: Record<Register, string[][]> = {
  machined: [
    ["button"],
    ["knob", "number-input"],
    ["toggle", "checkbox"],
    ["switch", "tile"],
  ],
  readout: [
    ["meter", "progress"],
    ["slider", "glass"],
  ],
  strata: [
    ["tabs", "accordion"],
    ["radio", "segmented-control"],
  ],
};

/** A component the rows do not name yet still shows, in a last row. */
export const rowsIn = (register: Register) => {
  const rows = ROWS[register].map((row) =>
    row.flatMap((name) => items.find((item) => item.name === name) ?? [])
  );
  const listed = new Set(ROWS[register].flat());
  const rest = items.filter(
    (item) => item.register === register && !listed.has(item.name)
  );
  return rest.length > 0 ? [...rows, rest] : rows;
};

export const itemsIn = (register: Register) => rowsIn(register).flat();

export const sharedItems = items.filter((item) => !isRegister(item.register));

const numbers = new Map<string, string>();
for (const item of [
  ...CHAPTER_REGISTERS.flatMap((register) => itemsIn(register)),
  ...sharedItems,
]) {
  numbers.set(item.name, String(numbers.size + 1).padStart(2, "0"));
}

export const numberOf = (name: string) => numbers.get(name) ?? "";

export const tileId = (name: string) => `home-tile-${name}`;

const SOURCES = import.meta.glob<string>("../../demos/*.tsx", {
  eager: true,
  import: "default",
  query: "?raw",
});

// The CLI puts the files in components/ui/formula/, not in the registry.
const REGISTRY_PATH = /@\/registry\/formula\/ui\/formula\//gu;

/** The demo's source as a consumer would write it, or undefined. */
export const usageOf = (name: string) => {
  const entry = Object.entries(SOURCES).find(([path]) =>
    path.endsWith(`/${name}.tsx`)
  );
  return entry?.[1].replace(REGISTRY_PATH, "@/components/ui/formula/").trim();
};

const SITE_IMPORT = /from "(?<path>@\/(?!components\/ui\/formula\/)[^"]+)"/gu;

const FORMULA_IMPORT = /from "@\/components\/ui\/formula\/(?<name>[a-z-]+)"/gu;

/** Other Formula components the usage imports, by title. */
export const needsOf = (name: string, code: string) =>
  [
    ...new Set(
      [...code.matchAll(FORMULA_IMPORT)]
        .map((match) => match.groups?.name ?? name)
        .filter((other) => other !== name)
    ),
  ].map((other) => items.find((item) => item.name === other)?.title ?? other);

/** Modules of this site the usage imports, which a consumer has to replace. */
export const siteImportsOf = (code: string) => [
  ...new Set(
    [...code.matchAll(SITE_IMPORT)].map((match) => match.groups?.path ?? "")
  ),
];

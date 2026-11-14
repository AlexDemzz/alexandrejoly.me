import type { ComponentType } from "react";

interface RegistryFile {
  path: string;
  target?: string;
  type: string;
}

interface RegistryItemJson {
  categories?: string[];
  description: string;
  files: RegistryFile[];
  meta?: { register?: string };
  name: string;
  title: string;
  type: string;
}

export const REGISTERS = ["readout", "strata", "machined"] as const;
export type Register = (typeof REGISTERS)[number];

export const REGISTER_INFO: Record<
  Register,
  { gloss: string; title: string; verb: string }
> = {
  machined: {
    gloss: "Ice tiles, spun-aluminium knobs, keys that sink and one gold part.",
    title: "Machined",
    verb: "Actuate",
  },
  readout: {
    gloss: "Black glass, hairline tick scales and a square marker.",
    title: "Readout",
    verb: "Measure",
  },
  strata: {
    gloss:
      "Flat tonal bands stepping dark to light, with a block of ink for the choice.",
    title: "Strata",
    verb: "Choose",
  },
};

export const isRegister = (value: string): value is Register =>
  (REGISTERS as readonly string[]).includes(value);

export interface FormulaItem {
  Demo: ComponentType | undefined;
  description: string;
  name: string;
  primitives: string[];
  register: string;
  title: string;
}

const THEME_ITEM = "formula";

const itemFiles = import.meta.glob<RegistryItemJson>(
  "../../../../packages/formula2030/registry/items/*.json",
  { eager: true, import: "default" }
);

const sources = import.meta.glob<string>(
  "../../../../packages/formula2030/registry/formula/ui/formula/*.tsx",
  { eager: true, import: "default", query: "?raw" }
);

const demos = import.meta.glob<{ default: ComponentType }>("../demos/*.tsx", {
  eager: true,
});

// `primitive` is UI SDK's rendering helper, not a component an item is built on.
const SDK_IMPORT = /from "@ui-sdk\/react\/(?!primitive")(?<module>[a-z-]+)"/gu;

const titleCase = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const sourceOf = (file: RegistryFile) =>
  Object.entries(sources).find(([path]) =>
    path.endsWith(`/${file.path}`)
  )?.[1] ?? "";

const primitivesOf = (item: RegistryItemJson) => {
  const names = new Set<string>();
  for (const file of item.files) {
    if (file.path.endsWith(".tsx")) {
      for (const match of sourceOf(file).matchAll(SDK_IMPORT)) {
        names.add(titleCase(match.groups?.module ?? ""));
      }
    }
  }
  return [...names];
};

const demoOf = (name: string) =>
  Object.entries(demos).find(([path]) => path.endsWith(`/${name}.tsx`))?.[1]
    .default;

// Surfaces such as glass and tile hold other controls, so they close each
// group after the controls they carry.
const isSurface = (item: RegistryItemJson) =>
  primitivesOf(item).length === 0 &&
  item.meta?.register !== undefined &&
  isRegister(item.meta.register);

const all = Object.values(itemFiles).toSorted(
  (a, b) =>
    Number(isSurface(a)) - Number(isSurface(b)) || a.name.localeCompare(b.name)
);

export const themeItem = all.find((item) => item.name === THEME_ITEM);

export const items: FormulaItem[] = all
  .filter((item) => item.name !== THEME_ITEM)
  .map((item) => ({
    Demo: demoOf(item.name),
    description: item.description,
    name: item.name,
    primitives: primitivesOf(item),
    register: item.meta?.register ?? "other",
    title: item.title,
  }));

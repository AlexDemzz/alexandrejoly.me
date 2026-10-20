import registry from "../../registry.json";

/** Every item of `registry.json`, in its order; a test keeps the two in sync. */
export const REGISTRY_ITEM_NAMES = [
  "notification-badge",
  "onboarding",
  "hint",
  "infinite-scroll",
  "marquee",
] as const;

export type RegistryItemName = (typeof REGISTRY_ITEM_NAMES)[number];

export interface RegistryItem {
  dependencies?: string[];
  description: string;
  files: { path: string; type: string }[];
  name: RegistryItemName;
  registryDependencies?: string[];
  title: string;
}

export const isRegistryItemName = (name: string): name is RegistryItemName =>
  (REGISTRY_ITEM_NAMES as readonly string[]).includes(name);

const isRegistryItem = (
  item: (typeof registry.items)[number]
): item is (typeof registry.items)[number] & RegistryItem =>
  isRegistryItemName(item.name);

export const REGISTRY_ITEMS: RegistryItem[] =
  registry.items.filter(isRegistryItem);

const REGISTRY_ORIGIN = new URL(registry.homepage).origin;
const SHADCN = "pnpm dlx shadcn@latest";

export const getRegistryItem = (name: RegistryItemName): RegistryItem => {
  const item = REGISTRY_ITEMS.find((candidate) => candidate.name === name);
  if (!item) {
    throw new Error(`registry.json has no item named ${name}`);
  }
  return item;
};

export const registryItemUrl = (name: string) =>
  `${REGISTRY_ORIGIN}/r/${name}.json`;

/** The `registries` entry a project adds to its `components.json`. */
export const registryConfig = () =>
  JSON.stringify(
    {
      registries: { [`@${registry.name}`]: `${REGISTRY_ORIGIN}/r/{name}.json` },
    },
    null,
    2
  );

export interface Installation {
  /** `shadcn add` through the namespace declared in `components.json`. */
  cli: string;
  /** `shadcn add` straight from the item's URL, no configuration needed. */
  cliFromUrl: string;
  /** Installs the npm packages the source imports, or `null` when none. */
  dependencies: string | null;
  /** Adds the shadcn primitives the source imports, or `null` when none. */
  registryDependencies: string | null;
  /** Where the copied source goes in a default shadcn project. */
  targetPath: string;
}

export const getInstallation = ({
  dependencies = [],
  name,
  registryDependencies = [],
}: RegistryItem): Installation => ({
  cli: `${SHADCN} add @${registry.name}/${name}`,
  cliFromUrl: `${SHADCN} add ${registryItemUrl(name)}`,
  dependencies:
    dependencies.length > 0 ? `pnpm add ${dependencies.join(" ")}` : null,
  registryDependencies:
    registryDependencies.length > 0
      ? `${SHADCN} add ${registryDependencies.join(" ")}`
      : null,
  targetPath: `components/ui/${name}.tsx`,
});

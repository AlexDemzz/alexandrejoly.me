import registry from "../../registry.json";

/**
 * Every item of `registry.json` documented on this site, in its order: newest
 * first. A test keeps the two in sync. An item whose `meta.docs` links to another site is
 * only served under `/r/`: no page, sitemap entry or Open Graph card.
 */
export const REGISTRY_ITEM_NAMES = [
  "lightbox",
  "item-inset-separator",
  "notification-badge",
  "onboarding",
  "hint",
  "infinite-scroll",
  "marquee",
] as const;

export type RegistryItemName = (typeof REGISTRY_ITEM_NAMES)[number];

/**
 * Items documented on their lab page instead of under `/components`. Their
 * `meta.docs` points there, so they are served under `/r/` with no component
 * page, sitemap entry or components Open Graph card.
 */
export const LAB_ITEM_NAMES = ["toaster"] as const;

export type LabItemName = (typeof LAB_ITEM_NAMES)[number];

/** CSS rules keyed by at-rule or selector, nested as shadcn's `css` field. */
export interface CssRules {
  [selectorOrProperty: string]: string | CssRules;
}

export interface RegistryItem {
  css?: CssRules;
  cssVars?: Partial<Record<CssVarScope, Record<string, string>>>;
  dependencies?: string[];
  description: string;
  files: { path: string; type: string }[];
  name: RegistryItemName;
  registryDependencies?: string[];
  title: string;
}

/** The registry's index page, from the site root without a leading slash. */
export const COMPONENTS_PATH = "components";

/** A component's docs page, from the site root without a leading slash. */
export const componentPath = (name: RegistryItemName) =>
  `${COMPONENTS_PATH}/${name}`;

export const isRegistryItemName = (name: string): name is RegistryItemName =>
  (REGISTRY_ITEM_NAMES as readonly string[]).includes(name);

const isRegistryItem = (
  item: (typeof registry.items)[number]
): item is (typeof registry.items)[number] & RegistryItem =>
  isRegistryItemName(item.name);

export const REGISTRY_ITEMS: RegistryItem[] =
  registry.items.filter(isRegistryItem);

const SHADCN = "pnpm dlx shadcn@latest";

/** `shadcn add` through the `@alexandrejoly` namespace. */
export const installCommand = (name: RegistryItemName | LabItemName) =>
  `${SHADCN} add @${registry.name}/${name}`;

export const getRegistryItem = (name: RegistryItemName): RegistryItem => {
  const item = REGISTRY_ITEMS.find((candidate) => candidate.name === name);
  if (!item) {
    throw new Error(`registry.json has no item named ${name}`);
  }
  return item;
};

/** Where `shadcn add` writes each `cssVars` group in a Tailwind v4 project. */
const CSS_VAR_SELECTORS = {
  theme: "@theme inline",
  light: ":root",
  dark: ".dark",
} as const;

type CssVarScope = keyof typeof CSS_VAR_SELECTORS;

const cssBlock = (selector: string, body: string[]) => [
  `${selector} {`,
  ...body.map((line) => `  ${line}`),
  "}",
];

const cssLines = (rules: CssRules): string[] =>
  Object.entries(rules).flatMap(([key, value]) =>
    typeof value === "string"
      ? [`${key}: ${value};`]
      : cssBlock(key, cssLines(value))
  );

/** The CSS `shadcn add` merges into the global stylesheet, or `null` when none. */
const getStyles = ({ css = {}, cssVars = {} }: RegistryItem): string | null => {
  const varBlocks = Object.entries(CSS_VAR_SELECTORS).flatMap(
    ([scope, selector]) => {
      const vars = cssVars[scope as CssVarScope];
      if (!vars) {
        return [];
      }
      const declarations = Object.entries(vars).map(
        ([name, value]) => `--${name}: ${value};`
      );
      return [cssBlock(selector, declarations)];
    }
  );
  const ruleBlocks = Object.entries(css).map(([key, value]) =>
    cssLines({ [key]: value })
  );
  const blocks = [...varBlocks, ...ruleBlocks];
  return blocks.length > 0
    ? blocks.map((block) => block.join("\n")).join("\n\n")
    : null;
};

export interface Installation {
  /** `shadcn add` through the `@alexandrejoly` namespace. */
  cli: string;
  /** Installs the npm packages the source imports, or `null` when none. */
  dependencies: string | null;
  /** Adds the shadcn primitives the source imports, or `null` when none. */
  registryDependencies: string | null;
  /** The CSS to add to the global stylesheet, or `null` when none. */
  styles: string | null;
  /** Where the copied source goes in a default shadcn project. */
  targetPath: string;
}

export const getInstallation = (item: RegistryItem): Installation => {
  const { dependencies = [], name, registryDependencies = [] } = item;
  return {
    cli: installCommand(name),
    dependencies:
      dependencies.length > 0 ? `pnpm add ${dependencies.join(" ")}` : null,
    registryDependencies:
      registryDependencies.length > 0
        ? `${SHADCN} add ${registryDependencies.join(" ")}`
        : null,
    styles: getStyles(item),
    targetPath: `components/ui/${name}.tsx`,
  };
};

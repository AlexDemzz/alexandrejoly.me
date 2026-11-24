import type {
  Installation,
  LabItemName,
  RegistryItemName,
} from "@/lib/registry";

/** A tuple rather than an object keeps each page's chunk about a quarter smaller. */
export type HighlightedToken = [content: string, light: string, dark: string];

export interface HighlightedCode {
  code: string;
  lines: HighlightedToken[][];
}

/** `Installation` with each snippet highlighted. */
export interface HighlightedInstallation {
  cli: HighlightedCode;
  dependencies: HighlightedCode | null;
  registryDependencies: HighlightedCode | null;
  styles: HighlightedCode | null;
  targetPath: Installation["targetPath"];
}

/** Every code block of a component page, highlighted at build time. */
export interface ComponentCode {
  /** Keyed by demo file name. */
  demos: Record<string, HighlightedCode>;
  installation: HighlightedInstallation;
  source: HighlightedCode;
  usage: { imports: HighlightedCode; markup: HighlightedCode };
}

// One chunk per page, built by plugins/component-code.ts.
const COMPONENT_CODE: Record<
  RegistryItemName,
  () => Promise<{ default: ComponentCode }>
> = {
  hint: () => import("virtual:component-code/hint"),
  "infinite-scroll": () => import("virtual:component-code/infinite-scroll"),
  "item-inset-separator": () =>
    import("virtual:component-code/item-inset-separator"),
  lightbox: () => import("virtual:component-code/lightbox"),
  marquee: () => import("virtual:component-code/marquee"),
  "notification-badge": () =>
    import("virtual:component-code/notification-badge"),
  onboarding: () => import("virtual:component-code/onboarding"),
};

export const getComponentCode = async (
  name: RegistryItemName
): Promise<ComponentCode> => {
  const { default: code } = await COMPONENT_CODE[name]();
  return code;
};

/** The code blocks of an item documented on its lab page: no manual install, its source spans many files. */
export interface LabItemCode {
  cli: HighlightedCode;
  /** Keyed by demo file name. */
  demos: Record<string, HighlightedCode>;
  usage: { imports: HighlightedCode; markup: HighlightedCode };
}

const LAB_ITEM_CODE: Record<
  LabItemName,
  () => Promise<{ default: LabItemCode }>
> = {
  toaster: () => import("virtual:lab-item-code/toaster"),
};

export const getLabItemCode = async (
  name: LabItemName
): Promise<LabItemCode> => {
  const { default: code } = await LAB_ITEM_CODE[name]();
  return code;
};

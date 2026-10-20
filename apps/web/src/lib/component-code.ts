import type { Installation, RegistryItemName } from "@/lib/registry";

/** Every code block of a component page, highlighted to HTML at build time. */
export interface ComponentCode {
  /** Keyed by demo file name. */
  demos: Record<string, string>;
  installation: Installation;
  source: string;
  usage: string;
}

// One chunk per page, built by plugins/component-code.ts.
const COMPONENT_CODE: Record<
  RegistryItemName,
  () => Promise<{ default: ComponentCode }>
> = {
  hint: () => import("virtual:component-code/hint"),
  "infinite-scroll": () => import("virtual:component-code/infinite-scroll"),
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

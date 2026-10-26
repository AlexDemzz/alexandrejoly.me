import modal from "../../public/r/modal.json";

type RegistryItem = typeof modal;

export const BASE_UI_MODAL_URL = "https://alexandrejoly.me/r/easy-modal.json";

export type RegistryResolution =
  | { kind: "item"; item: RegistryItem }
  | { kind: "redirect"; url: string };

// The shadcn directory lists @react-easy-modals as /r/styles/{style}/{name}.json.
// base-* styles moved to @alexandrejoly/easy-modal; every other style gets the
// Radix item, frozen JSON in public/r kept for existing installs.
export const resolveRegistryItem = (
  style: string,
  name: string
): RegistryResolution | undefined => {
  if (name !== "modal.json") {
    return undefined;
  }

  const isBaseUI = style === "base" || style.startsWith("base-");
  if (isBaseUI) {
    return { kind: "redirect", url: BASE_UI_MODAL_URL };
  }

  return { kind: "item", item: modal };
};

import { describe, expect, it } from "vitest";

import { BASE_UI_MODAL_URL, resolveRegistryItem } from "./registry";

describe("resolveRegistryItem", () => {
  it.each(["base-nova", "base-vega", "base"])(
    "redirects the %s style to @alexandrejoly/easy-modal",
    (style) => {
      expect(resolveRegistryItem(style, "modal.json")).toEqual({
        kind: "redirect",
        url: BASE_UI_MODAL_URL,
      });
    }
  );

  it.each(["radix-nova", "new-york-v4", "default", "baseline"])(
    "serves the frozen Radix item for the %s style",
    (style) => {
      expect(resolveRegistryItem(style, "modal.json")?.kind).toBe("item");
    }
  );

  it("returns nothing for unknown items", () => {
    expect(resolveRegistryItem("base-nova", "button.json")).toBeUndefined();
    expect(resolveRegistryItem("radix-nova", "modal")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";

import { legacyDocsRedirect } from "./legacy-docs";

describe("legacyDocsRedirect", () => {
  it("sends the old per-base pages to the single page of the pair", () => {
    expect(legacyDocsRedirect(["base", "dialog-drawer"])).toBe("dialog-drawer");
    expect(legacyDocsRedirect(["radix", "tooltip-popover"])).toBe(
      "tooltip-popover"
    );
  });

  it("leaves current pages alone", () => {
    expect(legacyDocsRedirect(["dialog-drawer"])).toBeUndefined();
    expect(legacyDocsRedirect([])).toBeUndefined();
  });

  it("leaves unknown pages under the old prefixes to the 404", () => {
    expect(legacyDocsRedirect(["base", "accordion"])).toBeUndefined();
    expect(
      legacyDocsRedirect(["radix", "dialog-drawer", "extra"])
    ).toBeUndefined();
  });

  it("sends the old base index pages to the introduction", () => {
    expect(legacyDocsRedirect(["base"])).toBe("");
    expect(legacyDocsRedirect(["radix"])).toBe("");
  });
});

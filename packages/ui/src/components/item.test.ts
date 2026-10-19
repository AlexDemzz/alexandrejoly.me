import { describe, expect, it } from "vitest";

import { itemMediaVariants, itemVariants } from "./item";

describe("item (DESIGN.md › Components › Row)", () => {
  it("never fills or rounds the row: hover only underlines the title", () => {
    expect(itemVariants()).not.toMatch(/bg-|rounded-/u);
  });

  it("keeps a visible focus outline on the row", () => {
    expect(itemVariants()).toContain("focus-visible:outline-2");
  });

  it("draws logos as 36px circles on the hairline shadow", () => {
    const logo = itemMediaVariants({ variant: "logo" });
    expect(logo).toContain("size-9");
    expect(logo).toContain("rounded-full");
    expect(logo).toContain("shadow-hairline");
  });
});

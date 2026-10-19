import { describe, expect, it } from "vitest";

import { itemMediaVariants, itemVariants } from "./item";

describe("item (DESIGN.md › Components › Row)", () => {
  it("never fills the row on hover: the arrow is the only hover signal", () => {
    expect(itemVariants()).not.toMatch(/hover:bg-/u);
  });

  it("keeps the text on the column edge while padding the hit area", () => {
    expect(itemVariants()).toContain("-mx-2");
    expect(itemVariants()).toContain("p-2");
    expect(itemVariants()).toContain("before:-inset-y-1");
  });

  it("frames thumbnails as a 40×48 card inside a 3px frame", () => {
    const frame = itemMediaVariants({ variant: "frame" });
    expect(frame).toContain("p-[3px]");
    expect(frame).toContain("*:h-12");
    expect(frame).toContain("*:w-10");
    expect(frame).toContain("shadow-hairline");
  });
});

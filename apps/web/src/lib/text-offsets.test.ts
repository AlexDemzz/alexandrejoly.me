import { describe, expect, it } from "vitest";

import { withOffsets } from "@/lib/text-offsets";

describe("withOffsets", () => {
  it("gives repeated parts distinct offsets", () => {
    const parts = ["ab", "ab", "c"];

    expect(withOffsets(parts, (part) => part.length)).toEqual([
      { offset: 0, part: "ab" },
      { offset: 2, part: "ab" },
      { offset: 4, part: "c" },
    ]);
  });

  it("counts the separator a split dropped", () => {
    const parts = "a<b<<c".split("<");

    expect(
      withOffsets(parts, (part) => part.length, 1).map(({ offset }) => offset)
    ).toEqual([0, 2, 4, 5]);
  });
});

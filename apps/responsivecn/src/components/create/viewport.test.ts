import { describe, expect, it } from "vitest";

import { fitScale } from "./viewport";

describe("fitScale", () => {
  it("keeps a frame that fits at its real size", () => {
    expect(fitScale(375, 1000)).toBe(1);
  });

  it("shrinks a frame wider than the room it has", () => {
    expect(fitScale(1200, 600)).toBe(0.5);
  });
});

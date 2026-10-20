import { describe, expect, it } from "vitest";

import { levelScale } from "./contribution-levels";

const levelsOf = (counts: number[]) => counts.map(levelScale(counts));

describe("levelScale", () => {
  it("keeps empty days at level 0", () => {
    expect(levelsOf([0, 3, 0])).toEqual([0, 1, 0]);
  });

  it("spreads active days evenly even when one day dwarfs the rest", () => {
    expect(levelsOf([1, 2, 3, 4, 5, 6, 7, 300])).toEqual([
      1, 1, 1, 2, 2, 3, 3, 4,
    ]);
  });

  it("puts every day on one level when activity is flat", () => {
    expect(levelsOf([4, 4, 4])).toEqual([1, 1, 1]);
  });
});

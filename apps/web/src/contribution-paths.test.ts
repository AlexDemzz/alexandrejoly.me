import { describe, expect, it } from "vitest";

import { graphSvg, graphViewBox, levelPaths } from "./contribution-paths";

describe("levelPaths", () => {
  it("puts each day in its level's path, as a 6px square inset by 2px", () => {
    const paths = levelPaths([[0, 4, 4, 4, 4, 4, 4]]);

    expect(paths[0]).toBe("M2 2h6v6h-6z");
    expect(paths[4]?.match(/h6v6h-6z/gu)).toHaveLength(6);
    expect(paths.slice(1, 4)).toEqual(["", "", ""]);
  });

  it("aligns a short first week to Saturday and later weeks to Sunday", () => {
    const paths = levelPaths([[1], [2, 3]]);

    expect(paths[1]).toBe("M2 80h6v6h-6z");
    expect(paths[2]).toBe("M15 2h6v6h-6z");
    expect(paths[3]).toBe("M15 15h6v6h-6z");
  });

  it("moves to each further cell of a level from the one before it", () => {
    const paths = levelPaths([[1, 0, 1, 0, 0, 0, 0], [1]]);

    expect(paths[1]).toBe("M2 2h6v6h-6zm0 26h6v6h-6zm13-26h6v6h-6z");
  });
});

describe("graphViewBox", () => {
  it("fits the weeks without a trailing gap", () => {
    expect(graphViewBox(53)).toBe("0 0 686 88");
  });
});

describe("graphSvg", () => {
  it("draws only the levels that have days, each at its own strength", () => {
    const svg = graphSvg([[0, 4]]);

    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/u);
    expect(svg.match(/<path /gu)).toHaveLength(2);
    expect(svg).toContain('opacity="0.12"');
    expect(svg).toContain('opacity="1"');
  });
});

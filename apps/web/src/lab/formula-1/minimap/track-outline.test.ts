import { describe, expect, it } from "vitest";

import { CORNERS, LAP_LENGTH_M } from "../model/track";
import {
  OUTLINE,
  STEP_M,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  poseAt,
  traceOpen,
} from "./track-outline";

const gap = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

/** Signed change of heading between two distances, wrapped to ±π. */
const turnBetween = (fromM: number, toM: number): number => {
  const delta = poseAt(toM).heading - poseAt(fromM).heading;
  return Math.atan2(Math.sin(delta), Math.cos(delta));
};

describe("track outline", () => {
  it("closes on itself, the driven line missing its start by under 10 m", () => {
    const open = traceOpen();
    expect(gap(open[0], open.at(-1) ?? open[0])).toBeLessThan(10);
    expect(gap(OUTLINE[0], OUTLINE.at(-1) ?? OUTLINE[0])).toBeLessThan(1e-9);
  });

  it("spreads the closing error, so the seam is a step like any other", () => {
    const steps = OUTLINE.slice(1).map((point, index) =>
      gap(point, OUTLINE[index])
    );
    const shortest = Math.min(...steps);
    const longest = Math.max(...steps);
    expect(longest / shortest).toBeLessThan(1.1);
    expect(steps.at(-1)).toBeCloseTo(steps[0], 1);
  });

  it("stays inside its view box", () => {
    for (const point of OUTLINE) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(VIEW_WIDTH);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(VIEW_HEIGHT);
    }
  });

  it("moves forward along its heading as the distance grows, all the way round", () => {
    for (let at = 0; at < LAP_LENGTH_M; at += STEP_M / 2) {
      const here = poseAt(at);
      const next = poseAt(at + STEP_M / 2);
      const along =
        (next.x - here.x) * Math.cos(here.heading) +
        (next.y - here.y) * Math.sin(here.heading);
      expect(along).toBeGreaterThan(0);
    }
  });

  it("wraps over the control line", () => {
    const before = poseAt(LAP_LENGTH_M - 1);
    const after = poseAt(LAP_LENGTH_M + 1);
    expect(gap(before, after)).toBeLessThan(gap(poseAt(0), poseAt(100)));
    expect(poseAt(LAP_LENGTH_M + 250)).toEqual(poseAt(250));
  });

  it("turns each corner the way the track says, and runs straight between", () => {
    for (const turn of CORNERS) {
      const swing = turnBetween(turn.startM - STEP_M, turn.endM + STEP_M);
      expect(Math.sign(swing)).toBe(turn.turn === "right" ? 1 : -1);
    }
    expect(Math.abs(turnBetween(100, 700))).toBeLessThan(0.05);
  });
});

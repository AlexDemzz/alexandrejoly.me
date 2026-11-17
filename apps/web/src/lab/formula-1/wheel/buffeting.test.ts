import { describe, expect, it } from "vitest";

import {
  BUFFET_MAX_DEGREES,
  buffetAmplitude,
  shakeAt,
  shakePhases,
} from "./buffeting";
import type { BuffetInputs } from "./buffeting";

const MID_STRAIGHT_M = 400;
const T1_ENTRY_M = 780;

const at = (overrides: Partial<BuffetInputs>): number =>
  buffetAmplitude({
    brake: 0,
    distanceM: MID_STRAIGHT_M,
    rpm: 11_000,
    session: "track",
    speedKph: 0,
    ...overrides,
  });

describe("buffetAmplitude", () => {
  it("is still in the garage, whatever the readings say", () => {
    expect(at({ session: "garage", speedKph: 300 })).toBe(0);
  });

  it("is a faint buzz on the grid with the engine running, and nothing with it off", () => {
    expect(at({ rpm: 4000 })).toBeGreaterThan(0);
    expect(at({ rpm: 4000 })).toBeLessThan(0.05);
    expect(at({ rpm: 0 })).toBe(0);
  });

  it("grows with speed to about half a degree flat out", () => {
    const slow = at({ speedKph: 100 });
    const quick = at({ speedKph: 200 });
    const flatOut = at({ speedKph: 320 });
    expect(slow).toBeLessThan(quick);
    expect(quick).toBeLessThan(flatOut);
    expect(flatOut).toBeGreaterThanOrEqual(0.4);
    expect(flatOut).toBeLessThanOrEqual(BUFFET_MAX_DEGREES);
  });

  it("rumbles harder under heavy braking and over the kerbs at a corner's entry", () => {
    expect(at({ brake: 1, speedKph: 250 })).toBeGreaterThan(
      at({ speedKph: 250 })
    );
    expect(at({ distanceM: T1_ENTRY_M, speedKph: 250 })).toBeGreaterThan(
      at({ speedKph: 250 })
    );
  });
});

describe("shakeAt", () => {
  it("stays within ±1 and crosses zero at 6 to 20 Hz, not as a slow wobble or a hiss", () => {
    const phases = shakePhases();
    let crossings = 0;
    let previous = shakeAt(0, phases).roll;
    for (let ms = 1; ms <= 1000; ms += 1) {
      const { lift, roll } = shakeAt(ms / 1000, phases);
      expect(Math.abs(roll)).toBeLessThanOrEqual(1);
      expect(Math.abs(lift)).toBeLessThanOrEqual(1);
      if (Math.sign(roll) !== Math.sign(previous)) {
        crossings += 1;
      }
      previous = roll;
    }
    expect(crossings).toBeGreaterThanOrEqual(12);
    expect(crossings).toBeLessThanOrEqual(40);
  });
});

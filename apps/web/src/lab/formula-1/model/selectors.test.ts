import { describe, expect, it } from "vitest";

import { FULL_FLOW_RPM, SHIFT_RPM } from "./car";
import { initialState, toTrack } from "./initial-state";
import {
  BLINK_MS,
  SHIFT_FLASH_MS,
  selectDeployCapKW,
  selectDeployLeftMJ,
  ledsEqual,
  rotaryDetent,
  selectLeds,
  selectMode,
} from "./selectors";
import type { LedColor, WheelState } from "./types";

const wheel = (overrides: Partial<WheelState> = {}): WheelState => ({
  ...initialState(0),
  ...overrides,
});

const track = (overrides: Partial<WheelState> = {}): WheelState => ({
  ...toTrack(initialState(0)),
  ...overrides,
});

const repeat = (length: number, color: LedColor): LedColor[] =>
  Array.from({ length }, () => color);

describe("rev lights", () => {
  it("stay dark with the engine off, whatever the gear", () => {
    expect(selectLeds(wheel({ gear: 5 })).shift).toEqual(repeat(15, "off"));
  });

  it("blink alternate LEDs blue with the pit limiter on", () => {
    const even = selectLeds(wheel({ now: 0, pitLimiter: true })).shift;
    const odd = selectLeds(wheel({ now: BLINK_MS, pitLimiter: true })).shift;
    expect([even[0], even[1], odd[0], odd[1]]).toEqual([
      "blue",
      "off",
      "off",
      "blue",
    ]);
  });
});

describe("flag repeaters", () => {
  it("stay dark: no race, no flags, even on a warning", () => {
    const leds = selectLeds(
      wheel({ message: { text: "SHIFT REJECTED", tone: "warn", until: 2000 } })
    );
    expect(leds.left).toEqual(repeat(3, "off"));
    expect(leds.right).toEqual(repeat(3, "off"));
  });
});

describe("status indicators", () => {
  it("l2 amber on CHR, l3 blue on radio", () => {
    const { indicators } = selectLeds(
      wheel({ ers: "chr", ersLatched: "chr", radio: true })
    );
    expect(indicators).toMatchObject({ l2: "amber", l3: "blue" });
  });

  it("r1 green on K1, r2 green with K2 latched, r3 green with the pit limiter", () => {
    const { indicators } = selectLeds(
      wheel({ ers: "k1", ersLatched: "k2", pitLimiter: true })
    );
    expect(indicators).toMatchObject({ r1: "green", r2: "green", r3: "green" });
  });

  it("l1 stays off: DRS is never available standing still", () => {
    const { indicators } = selectLeds(
      wheel({ ers: "k1", ersLatched: "k2", pitLimiter: true, radio: true })
    );
    expect(indicators.l1).toBe("off");
  });

  it("all off in the base state", () => {
    expect(Object.values(selectLeds(wheel()).indicators)).toEqual(
      repeat(6, "off")
    );
  });
});

describe("ledsEqual", () => {
  it("matches LEDs built on different calls and tells changes apart", () => {
    const state = wheel();
    expect(ledsEqual(selectLeds(state), selectLeds({ ...state }))).toBe(true);
    expect(
      ledsEqual(selectLeds(state), selectLeds({ ...state, radio: true }))
    ).toBe(false);
  });
});

describe("rotary selectors", () => {
  it("names the MODE position and gives every rotary's detent from 0", () => {
    const state = wheel({
      rotaries: { ...initialState(0).rotaries, eng: 1, mode: 6 },
    });
    expect(selectMode(state)).toBe("PSH");
    expect(rotaryDetent(state, "eng")).toBe(0);
    expect(rotaryDetent(state, "mode")).toBe(6);
  });
});

describe("rev lights on track", () => {
  it("stay dark below full fuel flow (10,500 rpm)", () => {
    expect(selectLeds(track({ rpm: FULL_FLOW_RPM - 100 })).shift).toEqual(
      repeat(15, "off")
    );
  });

  it("fill 5 green, 5 red, 5 blue toward the shift point", () => {
    const span = SHIFT_RPM - FULL_FLOW_RPM;
    expect(selectLeds(track({ rpm: FULL_FLOW_RPM + span / 3 })).shift).toEqual([
      ...repeat(5, "green"),
      ...repeat(10, "off"),
    ]);
    expect(selectLeds(track({ rpm: SHIFT_RPM - 1 })).shift).toEqual([
      ...repeat(5, "green"),
      ...repeat(5, "red"),
      ...repeat(5, "blue"),
    ]);
  });

  it("all flash at the shift point", () => {
    const on = selectLeds(track({ now: 0, rpm: SHIFT_RPM })).shift;
    const off = selectLeds(
      track({ now: SHIFT_FLASH_MS, rpm: SHIFT_RPM })
    ).shift;
    expect(on.includes("off")).toBe(false);
    expect(off).toEqual(repeat(15, "off"));
  });

  it("show DRS on the first two: green when enabled, white when open", () => {
    const revving = { rpm: SHIFT_RPM - 1 };
    expect(
      selectLeds(track({ ...revving, drs: "enabled" })).shift.slice(0, 3)
    ).toEqual(["green", "green", "green"]);
    expect(
      selectLeds(track({ ...revving, drs: "open" })).shift.slice(0, 3)
    ).toEqual(["white", "white", "green"]);
  });
});

describe("on-track lights", () => {
  it("show blue flags with the car behind within a second", () => {
    expect(selectLeds(track({ gapBehindS: 0.7 })).left).toEqual(
      repeat(3, "blue")
    );
    expect(selectLeds(track({ gapBehindS: 1.4 })).right).toEqual(
      repeat(3, "off")
    );
  });

  it("light l1 green from DRS available to open", () => {
    expect(selectLeds(track({ drs: "available" })).indicators.l1).toBe("green");
    expect(selectLeds(track({ drs: "disabled" })).indicators.l1).toBe("off");
  });
});

describe("energy selectors", () => {
  it("report nothing to deploy in the garage or past the lap's 4 MJ", () => {
    expect(selectDeployCapKW(wheel())).toBe(0);
    expect(selectDeployCapKW(track({ deployedThisLapMJ: 4 }))).toBe(0);
    expect(selectDeployCapKW(track({ deployedThisLapMJ: 1 }))).toBeGreaterThan(
      0
    );
    expect(selectDeployLeftMJ(track({ deployedThisLapMJ: 1.5 }))).toBe(2.5);
  });
});

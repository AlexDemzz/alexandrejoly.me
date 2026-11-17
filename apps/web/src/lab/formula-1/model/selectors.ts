import {
  DEPLOY_CAP_MJ,
  FULL_FLOW_RPM,
  HARVEST_CAP_MJ,
  SHIFT_RPM,
  SOC_MAX_MJ,
  deployCapKW,
} from "./car";
import { MODE_POSITIONS } from "./types";
import type {
  IndicatorLed,
  LedColor,
  Leds,
  ModePosition,
  Rotary,
  WheelState,
} from "./types";

const SHIFT_LEDS = 15;
const SIDE_LEDS = 3;
/** The rev lights under the "DRS" legend that show DRS status [INV]. */
export const DRS_LEDS = 2;
const LEDS_PER_COLOR = 5;
/** The pit limiter's blink half-period, ms [INV]. */
export const BLINK_MS = 250;
/** The shift-point flash half-period, ms [INV]. */
export const SHIFT_FLASH_MS = 60;
/** Within this of the car behind, the flag repeaters show blue [INV]. */
export const BLUE_GAP_S = 1;

const SHIFT_RAMP: readonly LedColor[] = ["green", "red", "blue"];

const row = (length: number, color: (index: number) => LedColor): LedColor[] =>
  Array.from({ length }, (_, index) => color(index));

const OFF_SHIFT = row(SHIFT_LEDS, () => "off");
const OFF_SIDE = row(SIDE_LEDS, () => "off");

const blinkOn = (now: number, periodMs: number): boolean =>
  Math.floor(now / periodMs) % 2 === 0;

const rampColor = (index: number): LedColor =>
  SHIFT_RAMP[Math.floor(index / LEDS_PER_COLOR)] ?? "blue";

/** 5 green, 5 red, 5 blue from full fuel flow (10,500 rpm) to the shift point, all flashing there. */
const revLights = (state: WheelState): readonly LedColor[] => {
  if (state.session !== "track") {
    return OFF_SHIFT;
  }
  if (state.rpm >= SHIFT_RPM) {
    return blinkOn(state.now, SHIFT_FLASH_MS)
      ? row(SHIFT_LEDS, rampColor)
      : OFF_SHIFT;
  }
  const share = (state.rpm - FULL_FLOW_RPM) / (SHIFT_RPM - FULL_FLOW_RPM);
  const count = Math.max(0, Math.round(share * SHIFT_LEDS));
  return row(SHIFT_LEDS, (index) => (index < count ? rampColor(index) : "off"));
};

const drsLight = (state: WheelState): LedColor | null => {
  if (state.drs === "open") {
    return "white";
  }
  return state.drs === "enabled" ? "green" : null;
};

const shiftLights = (state: WheelState): readonly LedColor[] => {
  if (state.pitLimiter) {
    const phase = blinkOn(state.now, BLINK_MS) ? 0 : 1;
    return row(SHIFT_LEDS, (index) => (index % 2 === phase ? "blue" : "off"));
  }
  const revs = revLights(state);
  const drs = drsLight(state);
  return drs === null
    ? revs
    : revs.map((color, index) => (index < DRS_LEDS ? drs : color));
};

/** Flag repeaters: blue with the car behind within a second, on track. */
const flagLights = (state: WheelState): readonly LedColor[] =>
  state.session === "track" && state.gapBehindS < BLUE_GAP_S
    ? row(SIDE_LEDS, () => "blue")
    : OFF_SIDE;

const lit = (on: boolean, color: LedColor): LedColor => (on ? color : "off");

/**
 * l1 green: DRS available, enabled or open. l2 amber: CHR. l3 blue: radio.
 * r1 green: K1. r2 green: K2. r3 green: pit limiter.
 */
const indicators = (state: WheelState): Record<IndicatorLed, LedColor> => ({
  l1: lit(state.drs !== "disabled", "green"),
  l2: lit(state.ers === "chr", "amber"),
  l3: lit(state.radio, "blue"),
  r1: lit(state.ers === "k1", "green"),
  r2: lit(state.ersLatched === "k2", "green"),
  r3: lit(state.pitLimiter, "green"),
});

export const selectLeds = (state: WheelState): Leds => {
  const flags = flagLights(state);
  return {
    indicators: indicators(state),
    left: flags,
    right: flags,
    shift: shiftLights(state),
  };
};

const sameColors = (a: readonly LedColor[], b: readonly LedColor[]): boolean =>
  a.length === b.length && a.every((color, index) => color === b[index]);

const INDICATORS: readonly IndicatorLed[] = [
  "l1",
  "l2",
  "l3",
  "r1",
  "r2",
  "r3",
];

/** Pass to `useWheel(selectLeds, ledsEqual)` so the LEDs only re-render when a light changes. */
export const ledsEqual = (a: Leds, b: Leds): boolean =>
  sameColors(a.shift, b.shift) &&
  sameColors(a.left, b.left) &&
  sameColors(a.right, b.right) &&
  INDICATORS.every((led) => a.indicators[led] === b.indicators[led]);

export const selectMode = (state: WheelState): ModePosition =>
  MODE_POSITIONS[state.rotaries.mode];

/** The rotary's detent, 0..11 clockwise, whatever it stores. */
export const rotaryDetent = (state: WheelState, rotary: Rotary): number => {
  const value = state.rotaries[rotary];
  return rotary === "mode" || rotary === "mfl" || rotary === "mfr"
    ? value
    : value - 1;
};

export const selectOnTrack = (state: WheelState): boolean =>
  state.session === "track";

/** What the MGU-K would deploy at full throttle now, kW: 0 off track, in the pit lane, empty, or past the lap's 4 MJ. */
export const selectDeployCapKW = (state: WheelState): number => {
  const blocked =
    state.session !== "track" ||
    state.pitLimiter ||
    state.socMJ <= 0 ||
    state.deployedThisLapMJ >= DEPLOY_CAP_MJ;
  return blocked ? 0 : deployCapKW(state);
};

/** What is left of this lap's 4 MJ deployment allowance (ES → K), MJ. */
export const selectDeployLeftMJ = (state: WheelState): number =>
  Math.max(0, DEPLOY_CAP_MJ - state.deployedThisLapMJ);

/** What is left of this lap's 2 MJ recovery allowance (K → ES), MJ. */
export const selectHarvestLeftMJ = (state: WheelState): number =>
  Math.max(0, HARVEST_CAP_MJ - state.harvestedThisLapMJ);

/** Battery charge as a share of the 4 MJ window, 0..1. */
export const selectSocShare = (state: WheelState): number =>
  state.socMJ / SOC_MAX_MJ;

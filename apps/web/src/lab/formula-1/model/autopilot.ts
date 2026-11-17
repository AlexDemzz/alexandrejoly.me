// The hidden driver: does the start (1st gear, launch revs, clutch at lights
// out), works the pedals around the lap, and the gears in auto. It never
// touches DRS or the ERS buttons.

import {
  GRAVITY,
  KPH_PER_MS,
  SHIFT_RPM,
  brakingFactor,
  gripFactor,
  maxBrakeG,
  rpmAtSpeed,
} from "./car";
import { isShiftRejected, requestShift, shiftTarget } from "./gearbox";
import type { ShiftRequest } from "./gearbox";
import { PIT_LIMIT_KPH, clamp, isForwardGear } from "./ranges";
import { DRIVER_REACTION_MS } from "./start";
import { cornerAt, upcomingCorners } from "./track";
import type { WheelState } from "./types";

const PEDAL_RATE_PER_S = 8;
/** Throttle held on the grid against the launch limiter [INV]. */
const LAUNCH_THROTTLE = 0.7;
/** How long the clutch takes to come fully home after lights out [INV]. */
const LAUNCH_RELEASE_MS = 300;
const LOOKAHEAD_M = 1500;
/** The hidden driver leaves a little grip on the table in every corner [INV]. */
const CORNER_SPEED_SHARE = 0.97;
const PLAN_DECEL_SHARE = 0.85;
const BRAKE_FEED_FORWARD = 0.55;
const BRAKE_GAIN_KPH = 4;
const BRAKE_MIN = 0.1;
const BRAKE_RELEASE_KPH = 2;
const COAST_BAND_KPH = 3;
const CORNER_THROTTLE_BASE = 0.35;
const CORNER_THROTTLE_GAIN_KPH = 6;
const DOWNSHIFT_INTO_RPM = 11_300;
const LUG_RPM = 8500;

interface Pedals {
  brake: number;
  throttle: number;
}

/** The fastest the driver wants to be going here, braking for what's ahead. */
export const targetSpeedKph = (state: WheelState): number => {
  const grip = gripFactor(state) * CORNER_SPEED_SHARE;
  let target = state.pitLimiter ? PIT_LIMIT_KPH : Number.POSITIVE_INFINITY;
  for (const { corner, distanceM } of upcomingCorners(
    state.distanceM,
    LOOKAHEAD_M
  )) {
    const cornerMs = (corner.apexKph * grip) / KPH_PER_MS;
    const decel =
      PLAN_DECEL_SHARE *
      maxBrakeG(corner.apexKph) *
      brakingFactor(state) *
      GRAVITY;
    const reachKph =
      Math.sqrt(cornerMs ** 2 + 2 * decel * distanceM) * KPH_PER_MS;
    target = Math.min(target, reachKph);
  }
  return target;
};

const pedalTargets = (state: WheelState): Pedals => {
  const target = targetSpeedKph(state);
  const over = state.speedKph - target;
  const braking = state.brake > 0 ? over > -BRAKE_RELEASE_KPH : over > 0;
  if (braking && !(state.pitLimiter && target === PIT_LIMIT_KPH)) {
    return {
      brake: clamp(BRAKE_FEED_FORWARD + over / BRAKE_GAIN_KPH, BRAKE_MIN, 1),
      throttle: 0,
    };
  }
  if (cornerAt(state.distanceM) !== null) {
    const throttle =
      CORNER_THROTTLE_BASE +
      (target - state.speedKph) / CORNER_THROTTLE_GAIN_KPH;
    return { brake: 0, throttle: clamp(throttle, 0, 1) };
  }
  if (state.pitLimiter) {
    return { brake: 0, throttle: 1 };
  }
  return { brake: 0, throttle: over > -COAST_BAND_KPH ? 0 : 1 };
};

const approach = (current: number, target: number, dtMs: number): number => {
  const step = (PEDAL_RATE_PER_S * dtMs) / 1000;
  return current + clamp(target - current, -step, step);
};

const tryShift = (state: WheelState, request: ShiftRequest): WheelState => {
  const to = shiftTarget(state.gear, request);
  if (to === null || isShiftRejected(state, to)) {
    return state;
  }
  return requestShift(state, request);
};

const autoShift = (state: WheelState): WheelState => {
  if (state.shift !== null) {
    return state;
  }
  if (!isForwardGear(state.gear)) {
    return tryShift(state, "up");
  }
  const engineRpm = rpmAtSpeed(state.speedKph, state.gear);
  if (engineRpm >= SHIFT_RPM) {
    return tryShift(state, "up");
  }
  const lower = shiftTarget(state.gear, "down");
  const wantsLower = state.brake > 0 || engineRpm < LUG_RPM;
  if (
    lower !== null &&
    wantsLower &&
    rpmAtSpeed(state.speedKph, lower) <= DOWNSHIFT_INTO_RPM
  ) {
    return tryShift(state, "down");
  }
  return state;
};

/** On the grid: clutch pulled, 1st selected, launch revs once the lights come on. */
const holdOnGrid = (state: WheelState): WheelState => {
  const pulled: WheelState = {
    ...state,
    brake: 0,
    clutch: 1,
    throttle: state.start.kind === "lights" ? LAUNCH_THROTTLE : 0,
  };
  return pulled.gear === "N" && pulled.shift === null
    ? requestShift(pulled, "up")
    : pulled;
};

/** The clutch after lights out: held through the reaction, then let home. */
const launchClutch = (state: WheelState): number => {
  if (state.start.kind !== "go") {
    return state.clutch;
  }
  const released = state.start.elapsedMs - DRIVER_REACTION_MS;
  return released <= 0 ? 1 : clamp(1 - released / LAUNCH_RELEASE_MS, 0, 1);
};

export const drive = (state: WheelState, dtMs: number): WheelState => {
  if (state.start.kind !== "go") {
    return holdOnGrid(state);
  }
  const reacting = state.start.elapsedMs < DRIVER_REACTION_MS;
  const pedals = reacting
    ? { brake: 0, throttle: LAUNCH_THROTTLE }
    : pedalTargets(state);
  const driven: WheelState = {
    ...state,
    brake: approach(state.brake, pedals.brake, dtMs),
    clutch: launchClutch(state),
    throttle: approach(state.throttle, pedals.throttle, dtMs),
  };
  return driven.gearControl === "auto" ? autoShift(driven) : driven;
};

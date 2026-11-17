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
import {
  CORNER_APEX_AT,
  cornerAt,
  cornerProfile,
  cornerProgress,
  upcomingCorners,
} from "./track";
import type { TrackCorner } from "./track";
import type { WheelState } from "./types";

/** Throttle held on the grid against the launch limiter [INV]. */
const LAUNCH_THROTTLE = 0.7;
/** How long the clutch takes to come fully home after lights out [INV]. */
const LAUNCH_RELEASE_MS = 300;
const LOOKAHEAD_M = 1500;
/** The hidden driver leaves a little grip on the table in every corner [INV]. */
const CORNER_SPEED_SHARE = 0.92;
const PLAN_DECEL_SHARE = 0.85;

// Pedal rates, per second [INV]: the brake goes on hard and comes off over
// about 200 ms (trail-braking into turn-in), the throttle lifts at once, rolls
// on progressively out of a corner and goes flat on a straight.
const BRAKE_APPLY_RATE = 10;
const BRAKE_RELEASE_RATE = 5;
const THROTTLE_LIFT_RATE = 10;
const THROTTLE_STRAIGHT_RATE = 8;
const THROTTLE_ROLL_ON_RATE = 2;

// Straight-line braking [INV]
const BRAKE_FEED_FORWARD = 0.55;
const BRAKE_GAIN_KPH = 4;
const BRAKE_MIN = 0.1;
const BRAKE_RELEASE_KPH = 2;
/** The driver lifts this long before the braking point, so the brake can go on as the throttle comes off. */
const LIFT_LEAD_S = 0.15;

// In a corner [INV]
/** A light throttle that keeps the car balanced from turn-in to the apex. */
const MAINTENANCE_THROTTLE = 0.2;
/** Brake mid-corner only this far over the corner's speed, and stop once back within the second band. */
const CORNER_RESCUE_KPH = 8;
const CORNER_RESCUE_RELEASE_KPH = 3;
const CORNER_RESCUE_BRAKE = 0.3;
const CORNER_RESCUE_GAIN_KPH = 20;
/** This far over the corner's speed the driver stops feeding in throttle. */
const CORNER_HOLD_KPH = 2;

const DOWNSHIFT_INTO_RPM = 11_300;
const LUG_RPM = 8500;

interface Pedals {
  brake: number;
  throttle: number;
  /** How fast the throttle may rise towards its target. */
  rollOn: number;
}

/** The speed the driver takes this point of a corner at. */
const cornerSpeedKph = (
  state: WheelState,
  corner: TrackCorner,
  distanceM: number
): number =>
  corner.apexKph *
  gripFactor(state) *
  CORNER_SPEED_SHARE *
  cornerProfile(corner, distanceM);

/** The fastest the driver wants to be going here: the corner's speed inside one, else braking for the next turn-in. */
export const targetSpeedKph = (state: WheelState): number => {
  let target = state.pitLimiter ? PIT_LIMIT_KPH : Number.POSITIVE_INFINITY;
  for (const { corner, distanceM } of upcomingCorners(
    state.distanceM,
    LOOKAHEAD_M
  )) {
    const turnInKph =
      distanceM === 0
        ? cornerSpeedKph(state, corner, state.distanceM)
        : cornerSpeedKph(state, corner, corner.startM);
    const decel =
      PLAN_DECEL_SHARE *
      maxBrakeG(corner.apexKph) *
      brakingFactor(state) *
      GRAVITY;
    const reachKph =
      Math.sqrt((turnInKph / KPH_PER_MS) ** 2 + 2 * decel * distanceM) *
      KPH_PER_MS;
    target = Math.min(target, reachKph);
  }
  return target;
};

/** Brake in a straight line to the turn-in speed, else flat out. */
const straightPedals = (state: WheelState): Pedals => {
  const over = state.speedKph - targetSpeedKph(state);
  const braking = state.brake > 0 ? over > -BRAKE_RELEASE_KPH : over > 0;
  if (braking && !state.pitLimiter) {
    return {
      brake: clamp(BRAKE_FEED_FORWARD + over / BRAKE_GAIN_KPH, BRAKE_MIN, 1),
      rollOn: THROTTLE_STRAIGHT_RATE,
      throttle: 0,
    };
  }
  const liftBandKph =
    PLAN_DECEL_SHARE *
    maxBrakeG(state.speedKph) *
    GRAVITY *
    LIFT_LEAD_S *
    KPH_PER_MS;
  const coasting = !state.pitLimiter && over > -liftBandKph;
  return {
    brake: 0,
    rollOn: THROTTLE_STRAIGHT_RATE,
    throttle: coasting ? 0 : 1,
  };
};

/**
 * Off the brake at turn-in, a light maintenance throttle to the apex, then a
 * roll-on that reaches full throttle at the exit, held while the car runs over
 * the corner's speed. The brake comes back only if the car is well over it.
 */
const cornerPedals = (state: WheelState, corner: TrackCorner): Pedals => {
  const over = state.speedKph - cornerSpeedKph(state, corner, state.distanceM);
  const rescuing =
    state.brake > 0 && state.throttle === 0
      ? over > CORNER_RESCUE_RELEASE_KPH
      : over > CORNER_RESCUE_KPH;
  if (rescuing) {
    const wanted = clamp(
      CORNER_RESCUE_BRAKE + over / CORNER_RESCUE_GAIN_KPH,
      0,
      1
    );
    // Trail-braking past turn-in only ever eases off.
    const brake = state.brake > 0 ? Math.min(state.brake, wanted) : wanted;
    return { brake, rollOn: THROTTLE_ROLL_ON_RATE, throttle: 0 };
  }
  if (cornerProgress(corner, state.distanceM) < CORNER_APEX_AT) {
    return {
      brake: 0,
      rollOn: THROTTLE_ROLL_ON_RATE,
      throttle: MAINTENANCE_THROTTLE,
    };
  }
  const fromApex =
    (cornerProgress(corner, state.distanceM) - CORNER_APEX_AT) /
    (1 - CORNER_APEX_AT);
  const rollOn = MAINTENANCE_THROTTLE + (1 - MAINTENANCE_THROTTLE) * fromApex;
  const holding = over > CORNER_HOLD_KPH;
  return {
    brake: 0,
    rollOn: THROTTLE_ROLL_ON_RATE,
    throttle: holding ? state.throttle : Math.max(state.throttle, rollOn),
  };
};

const pedalTargets = (state: WheelState): Pedals => {
  const corner = cornerAt(state.distanceM);
  return corner === null ? straightPedals(state) : cornerPedals(state, corner);
};

const approach = (
  current: number,
  target: number,
  upPerS: number,
  downPerS: number,
  dtMs: number
): number => {
  const up = (upPerS * dtMs) / 1000;
  const down = (downPerS * dtMs) / 1000;
  return current + clamp(target - current, -down, up);
};

/** One pedal at a time: the throttle waits for the brake to come off, and the other way round. */
const movePedals = (
  state: WheelState,
  pedals: Pedals,
  dtMs: number
): Pick<WheelState, "brake" | "throttle"> => {
  const throttleTarget = state.brake > 0 ? 0 : pedals.throttle;
  const brakeTarget = state.throttle > 0 ? 0 : pedals.brake;
  return {
    brake: approach(
      state.brake,
      brakeTarget,
      BRAKE_APPLY_RATE,
      BRAKE_RELEASE_RATE,
      dtMs
    ),
    throttle: approach(
      state.throttle,
      throttleTarget,
      pedals.rollOn,
      THROTTLE_LIFT_RATE,
      dtMs
    ),
  };
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
  // Gear by gear, each blip closed before the next: every downshift gets its own flare.
  const settled = state.blip === 0;
  const wantsLower = settled && (state.brake > 0 || engineRpm < LUG_RPM);
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
    ? { brake: 0, rollOn: THROTTLE_STRAIGHT_RATE, throttle: LAUNCH_THROTTLE }
    : pedalTargets(state);
  const driven: WheelState = {
    ...state,
    ...movePedals(state, pedals, dtMs),
    clutch: launchClutch(state),
  };
  return driven.gearControl === "auto" ? autoShift(driven) : driven;
};

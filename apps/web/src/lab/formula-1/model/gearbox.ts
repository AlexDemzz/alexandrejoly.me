import { LIMITER_RPM, REVERSE_SELECT_KPH, rpmAtSpeed } from "./car";
import { withMessage } from "./feedback";
import { DOWNSHIFT_MS, TOP_GEAR, UPSHIFT_MS, isForwardGear } from "./ranges";
import { GEARS } from "./types";
import type { Gear, WheelState } from "./types";

export type ShiftRequest = "up" | "down" | "neutral" | "reverse";

/** The gear a request asks for, or null when there is nothing to change. */
export const shiftTarget = (gear: Gear, request: ShiftRequest): Gear | null => {
  if (request === "neutral") {
    return gear === "N" ? null : "N";
  }
  if (request === "reverse") {
    return gear === "R" ? "N" : "R";
  }
  if (request === "up") {
    return gear === TOP_GEAR ? null : GEARS[GEARS.indexOf(gear) + 1];
  }
  // Neutral and reverse have their own button and lever.
  return isForwardGear(gear) && gear > 1
    ? GEARS[GEARS.indexOf(gear) - 1]
    : null;
};

/** "One gear change is permitted after the race … has started and before the car speed has reached 80km/h" [R T25 9.9.2]. */
export const START_SHIFT_KPH = 80;

/** Off the line in 1st, the one change has been used once the car is in another gear. */
const isStartLocked = (state: WheelState): boolean =>
  state.session === "track" &&
  state.start.kind === "go" &&
  state.timing.lap === 1 &&
  state.speedKph < START_SHIFT_KPH &&
  state.gear !== 1;

/**
 * Over-rev protection refuses a shift that would put the engine past the
 * limiter [R T25 9.9.3]; reverse needs neutral and a car that has stopped.
 */
export const isShiftRejected = (state: WheelState, to: Gear): boolean => {
  if (to === "R") {
    return state.gear !== "N" || state.speedKph >= REVERSE_SELECT_KPH;
  }
  return rpmAtSpeed(state.speedKph, to) > LIMITER_RPM || isStartLocked(state);
};

/**
 * One request at a time: while a shift is in progress every other request is
 * ignored, and a refused one has to be made again [R T25 9.9.3]; up in
 * 200 ms and down in 300 ms at most [R T25 9.9.4].
 */
export const requestShift = (
  state: WheelState,
  request: ShiftRequest
): WheelState => {
  if (state.shift !== null) {
    return state;
  }
  const to = shiftTarget(state.gear, request);
  if (to === null) {
    return state;
  }
  if (isShiftRejected(state, to)) {
    return withMessage(state, "SHIFT REJECTED", "warn");
  }
  const duration = request === "up" ? UPSHIFT_MS : DOWNSHIFT_MS;
  return { ...state, shift: { doneAt: state.now + duration, to } };
};

export const completeShift = (state: WheelState, now: number): WheelState => {
  if (state.shift === null || state.shift.doneAt > now) {
    return state;
  }
  return { ...state, gear: state.shift.to, shift: null };
};

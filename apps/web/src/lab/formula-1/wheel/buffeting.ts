import { cornerAt } from "../model/track";
import type { WheelState } from "../model/types";

export type BuffetInputs = Pick<
  WheelState,
  "brake" | "distanceM" | "rpm" | "session" | "speedKph"
>;

/** The most the wheel ever shakes either way, in degrees. */
export const BUFFET_MAX_DEGREES = 0.8;
/** A running engine on the grid: felt more than seen. */
const IDLE_DEGREES = 0.03;
/** Speed takes the shake to about ±0.55° at 320 km/h, little below 120. */
const SPEED_DEGREES = 0.55;
const SPEED_SCALE_KPH = 320;
const SPEED_CURVE = 1.6;
/** Heavy braking at speed: the front end loads up and rumbles. */
const BRAKE_DEGREES = 0.18;
const BRAKE_FULL_KPH = 150;
/** Kerbs at a corner's entry and exit, hit at speed. */
const KERB_DEGREES = 0.3;
const KERB_FULL_KPH = 200;
const KERB_REACH_M = 25;

const kerbNear = (distanceM: number): number => {
  const ahead = cornerAt(distanceM + KERB_REACH_M);
  const here = cornerAt(distanceM);
  const behind = cornerAt(distanceM - KERB_REACH_M);
  const nearest = [here, ahead, behind]
    .flatMap((corner) => (corner ? [corner.startM, corner.endM] : []))
    .map((edge) => Math.abs(distanceM - edge));
  const closest = Math.min(Number.POSITIVE_INFINITY, ...nearest);
  return Math.max(0, 1 - closest / KERB_REACH_M);
};

/**
 * How far the wheel shakes either way at this moment, in degrees: nothing in
 * the garage, an engine's buzz on the grid, then more with speed, kerbs and
 * heavy braking.
 */
export const buffetAmplitude = (state: BuffetInputs): number => {
  if (state.session !== "track") {
    return 0;
  }
  const speed = Math.max(0, state.speedKph);
  const idle = state.rpm > 0 ? IDLE_DEGREES : 0;
  const cruising =
    SPEED_DEGREES * Math.min(1.2, speed / SPEED_SCALE_KPH) ** SPEED_CURVE;
  const braking =
    BRAKE_DEGREES * state.brake * Math.min(1, speed / BRAKE_FULL_KPH);
  const kerbs =
    KERB_DEGREES *
    kerbNear(state.distanceM) *
    Math.min(1, speed / KERB_FULL_KPH);
  return Math.min(BUFFET_MAX_DEGREES, idle + cruising + braking + kerbs);
};

/** Sines that never line up: road and aero buffeting, 6 to 20 Hz. */
const ROLL_HZ = [6.3, 9.7, 13.1, 17.9] as const;
const LIFT_HZ = [7.1, 11.3, 19.3] as const;

export interface Shake {
  /** −1 to 1, the twist about the hub. */
  roll: number;
  /** −1 to 1, the up-and-down. */
  lift: number;
}

/** Typical swing as a share of the full amplitude; peaks are clipped to it. */
const BAND_RMS = 0.55;

const band = (
  seconds: number,
  hertz: readonly number[],
  phases: readonly number[]
): number => {
  const sum = hertz.reduce(
    (total, frequency, index) =>
      total +
      Math.sin(2 * Math.PI * frequency * seconds + (phases[index] ?? 0)),
    0
  );
  const unitRms = sum / Math.sqrt(hertz.length / 2);
  return Math.max(-1, Math.min(1, unitRms * BAND_RMS));
};

/** Random phases for one wheel, so two never shake in step. */
export const shakePhases = (): number[] =>
  Array.from(
    { length: ROLL_HZ.length + LIFT_HZ.length },
    () => Math.random() * 2 * Math.PI
  );

/** Band-limited noise at `seconds`, not a regular wobble. */
export const shakeAt = (seconds: number, phases: readonly number[]): Shake => ({
  lift: band(seconds, LIFT_HZ, phases.slice(ROLL_HZ.length)),
  roll: band(seconds, ROLL_HZ, phases),
});

// What the power unit sounds like on one frame of the wheel's state. The
// model drives the car, revs included (a downshift's blip flares them, with
// the ECU's own throttle in `blip`); this reads it and adds what a microphone
// hears that the state doesn't name: the ignition cut of an upshift, the
// limiters' stutter and neutral revs.

import { IDLE_RPM, LIMITER_RPM } from "../../model/car";
import { PIT_LIMIT_KPH, isForwardGear } from "../../model/ranges";
import type { Gear, WheelState } from "../../model/types";

export type Limiter = "off" | "rev" | "pit";

export interface EngineFrame {
  running: boolean;
  rpm: number;
  /** 0 off throttle to 1 flat out: how hard the cylinders fire. */
  load: number;
  /** Road speed: the wind and the gearbox follow it. */
  speedKph: number;
  /** Lifted at speed, 0..1: the exhaust burbles on the overrun. */
  overrun: number;
  /** The ignition cut that carries an upshift. */
  cut: boolean;
  limiter: Limiter;
}

export interface EngineMemory {
  /** When the current neutral blip started, ms, or null between blips. */
  blipAt: number | null;
}

/** The cut runs over the end of the shift, until the next gear lands [INV, within the 50–80 ms of a seamless shift]. */
export const CUT_MS = 65;
const LIFT = 0.05;
const FLOORED = 0.5;
const OVERRUN_FROM_RPM = 6500;
/** The limiter bounces the engine just under 12,500 rpm. */
const LIMITER_BAND_RPM = 150;
const PIT_SPEED_BAND_KPH = 1.5;
/** Neutral on track: the driver blips rather than holds the revs [INV]. */
const NEUTRAL_BLIP_RPM = 9500;
const NEUTRAL_RISE_MS = 120;
const NEUTRAL_FALL_MS = 450;
const NEUTRAL_EVERY_MS = 1100;
const NEUTRAL_IDLE_LOAD = 0.15;

export const createEngineFrame = (): EngineFrame => ({
  cut: false,
  limiter: "off",
  load: 0,
  overrun: 0,
  rpm: 0,
  running: false,
  speedKph: 0,
});

export const createEngineMemory = (): EngineMemory => ({ blipAt: null });

const isUpshift = (from: Gear, to: Gear): boolean =>
  isForwardGear(from) && isForwardGear(to) && to > from;

const limiterFor = (state: WheelState): Limiter => {
  const floored = state.throttle > FLOORED && isForwardGear(state.gear);
  if (!floored) {
    return "off";
  }
  if (state.pitLimiter) {
    return state.speedKph >= PIT_LIMIT_KPH - PIT_SPEED_BAND_KPH ? "pit" : "off";
  }
  return state.rpm >= LIMITER_RPM - LIMITER_BAND_RPM ? "rev" : "off";
};

/** Blips while the driver's foot is down in neutral: up in 120 ms, back to idle in 450 ms, about once a second. */
const neutralRpm = (state: WheelState, memory: EngineMemory): number => {
  if (state.throttle <= FLOORED) {
    memory.blipAt = null;
    return IDLE_RPM;
  }
  if (memory.blipAt === null || state.now - memory.blipAt >= NEUTRAL_EVERY_MS) {
    memory.blipAt = state.now;
  }
  const since = state.now - memory.blipAt;
  const rise = Math.min(1, since / NEUTRAL_RISE_MS);
  const fall = Math.max(0, (since - NEUTRAL_RISE_MS) / NEUTRAL_FALL_MS);
  const share = since < NEUTRAL_RISE_MS ? rise : Math.max(0, 1 - fall);
  return IDLE_RPM + (NEUTRAL_BLIP_RPM - IDLE_RPM) * share;
};

const overrunFor = (load: number, rpm: number): number =>
  load < LIFT
    ? Math.min(
        1,
        Math.max(0, (rpm - OVERRUN_FROM_RPM) / (LIMITER_RPM - OVERRUN_FROM_RPM))
      )
    : 0;

/** Fills `out` from the state, so a frame allocates nothing. */
export const readEngine = (
  state: WheelState,
  memory: EngineMemory,
  out: EngineFrame
): EngineFrame => {
  out.running = state.session === "track" && state.rpm > 0;
  if (!out.running) {
    memory.blipAt = null;
    out.rpm = 0;
    out.load = 0;
    out.speedKph = 0;
    out.overrun = 0;
    out.cut = false;
    out.limiter = "off";
    return out;
  }

  let { rpm } = state;
  let load = Math.max(state.throttle, state.blip);
  const { shift } = state;
  if (state.gear === "N") {
    rpm = neutralRpm(state, memory);
    load = rpm > IDLE_RPM ? state.throttle : NEUTRAL_IDLE_LOAD;
  } else {
    memory.blipAt = null;
  }
  // The blip fires the cylinders; as it closes, the lift crackles on the overrun.
  const blipping = shift !== null && state.blip > 0;

  out.rpm = rpm;
  out.load = load;
  out.speedKph = state.speedKph;
  out.overrun = blipping ? 0 : overrunFor(state.throttle, rpm);
  out.cut =
    shift !== null &&
    isUpshift(state.gear, shift.to) &&
    shift.doneAt - state.now <= CUT_MS;
  out.limiter = limiterFor(state);
  return out;
};

// The race on track, from the grid: physics, energy, fuel, the cars around, timing.
// Runs only inside `tick`, so nothing it changes makes a sound.

import { drive } from "./autopilot";
import {
  AIR_DENSITY,
  BLIP_FLARE_RPM,
  BLIP_OPENING,
  BLIP_RISE_MS,
  BLIP_SETTLE_MS,
  CAR_MASS_KG,
  CLUTCH_CLOSED,
  CLUTCH_OPEN,
  LAUNCH_LIMITER_RPM,
  WHEEL_RADIUS_M,
  clutchTorqueNm,
  DEPLOY_CAP_MJ,
  DRAG_AREA,
  DRS_DRAG_AREA,
  GRAVITY,
  HARVEST_CAP_MJ,
  IDLE_RPM,
  KPH_PER_MS,
  LIMITER_RPM,
  RACE_LAPS,
  ROLLING_RESISTANCE_N,
  SOC_MAX_MJ,
  SWEET_SPOT,
  BRAKE_BALANCE_IDEAL,
  brakingFactor,
  energyMJ,
  engineBrakeN,
  fuelBurnKgPerS,
  fuelTargetKg,
  gripFactor,
  icePowerKW,
  maxBrakeG,
  mguhKW,
  mgukFlowKW,
  modeProfile,
  rpmAtSpeed,
  tractionFactor,
  tractionG,
} from "./car";
import { updateDrs } from "./drs";
import { expireFeedback, withMessage } from "./feedback";
import { completeShift } from "./gearbox";
import { TRACE_STEP_M, pressuresFor, toGarage } from "./initial-state";
import { PIT_LIMIT_KPH, clamp, isForwardGear } from "./ranges";
import { advanceStart } from "./start";
import {
  LAP_LENGTH_M,
  cornerAt,
  cornerProfile,
  referenceSpeedKph,
} from "./track";
import type { Corner, Gear, WheelState } from "./types";

/** Each tick runs in steps of at most this long. */
export const STEP_MS = 20;
/** A tick never simulates more than this, so a hidden tab resumes where it left off. */
export const MAX_ELAPSED_MS = 100;

const LIFT_THRESHOLD = 0.05;
const MIN_FORCE_SPEED_MS = 4;
const RPM_TIME_CONSTANT_MS = 60;
const MS_PER_S = 1000;
const SCRUB_G = 2;

// The cars ahead and behind drive the reference lap at a share of its speed [INV].
const AHEAD_PACE = 0.961;
const BEHIND_PACE = 0.96;
const FIELD_SIZE = 20;
const PASS_GAP_S = 0.1;
/** Off the line every car runs the same launch; the gaps only start to move from here [INV]. */
const START_GAP_HOLD_M = 700;
/** A better getaway turns into a place on the run to T1, not on the grid [INV]. */
const START_PASS_M = 200;
const NEXT_CAR_GAP_S = 1.4;
const PASSED_CAR_GAP_S = 1;
const MAX_GAP_S = 30;

// Handling notes [INV]: only far from the sweet spots, at most one a lap.
const LOCK_UP_BB_OFF = 4;
const LOCK_UP_BS_OFF = 3;
const LOCK_UP_BRAKE = 0.8;
const LOCK_UP_MIN_KPH = 150;
const UNDERSTEER_DIFF_OFF = 4;

// Thermal [INV]
const TYRE_AMBIENT_C = 50;
const TYRE_SPEED_HEAT_C_PER_KPH = 0.12;
const TYRE_OUTER_LOAD_C = 40;
const TYRE_INNER_LOAD_C = 15;
const TYRE_BRAKING_C_PER_G = 6;
const TYRE_TRACTION_C_PER_G = 15;
const TYRE_TIME_CONSTANT_MS = 8000;
const BRAKE_AMBIENT_C = 200;
const BRAKE_HEAT_C_PER_S = 1800;
const BRAKE_HEAT_REF_KPH = 330;
const BRAKE_COOL_TIME_S = 4;
const BRAKE_MAX_C = 1200;
const BRAKE_SHARE_REF = 50;

// Engine and drive

const isDownshifting = (state: WheelState): boolean => {
  const { gear, shift } = state;
  return (
    shift !== null &&
    isForwardGear(gear) &&
    isForwardGear(shift.to) &&
    shift.to < gear
  );
};

/** The crank speed: the displayed rpm lags, the limiter does not. */
const engineRpm = (state: WheelState): number => {
  const engaged = Math.max(IDLE_RPM, rpmAtSpeed(state.speedKph, state.gear));
  // A blip spins the engine against an open clutch: none of it reaches the wheels.
  return isDownshifting(state) ? engaged : Math.max(state.rpm, engaged);
};

const iceKW = (state: WheelState): number =>
  state.fuelKg > 0 && isForwardGear(state.gear)
    ? state.throttle * icePowerKW(engineRpm(state), state)
    : 0;

const massKg = (state: WheelState): number => CAR_MASS_KG + state.fuelKg;

const driveForceN = (state: WheelState, mgukKW: number): number => {
  const limited = state.pitLimiter && state.speedKph >= PIT_LIMIT_KPH;
  if (!isForwardGear(state.gear) || limited) {
    return 0;
  }
  const clipping = mgukKW < 0 && state.throttle >= LIFT_THRESHOLD;
  const electricKW = mgukKW > 0 || clipping ? mgukKW : 0;
  const powerKW = Math.max(0, iceKW(state) + electricKW);
  const speed = Math.max(state.speedKph / KPH_PER_MS, MIN_FORCE_SPEED_MS);
  const traction =
    tractionG(state.speedKph) * tractionFactor(state) * massKg(state) * GRAVITY;
  const clutch = clutchTorqueNm(state.clutch) / WHEEL_RADIUS_M;
  return Math.min((powerKW * MS_PER_S) / speed, traction, clutch);
};

const resistanceN = (state: WheelState, mgukKW: number): number => {
  const speed = state.speedKph / KPH_PER_MS;
  if (speed <= 0) {
    return 0;
  }
  const dragArea = state.drs === "open" ? DRS_DRAG_AREA : DRAG_AREA;
  const drag = 0.5 * AIR_DENSITY * dragArea * speed ** 2;
  const brakes =
    state.brake *
    maxBrakeG(state.speedKph) *
    brakingFactor(state) *
    massKg(state) *
    GRAVITY;
  const lifted = state.throttle < LIFT_THRESHOLD && isForwardGear(state.gear);
  const engineBrake = lifted ? engineBrakeN(state.thumbwheels.eb) : 0;
  const liftRegen =
    mgukKW < 0 && state.brake === 0 && lifted
      ? (-mgukKW * MS_PER_S) / Math.max(speed, MIN_FORCE_SPEED_MS)
      : 0;
  return drag + brakes + engineBrake + liftRegen + ROLLING_RESISTANCE_N;
};

const updateEnergy = (
  state: WheelState,
  mgukKW: number,
  dtMs: number
): WheelState => {
  const deployed = energyMJ(Math.max(0, mgukKW), dtMs);
  const harvested = energyMJ(Math.max(0, -mgukKW), dtMs);
  const burnt = (fuelBurnKgPerS(iceKW(state), state) * dtMs) / MS_PER_S;
  const deployedThisLapMJ = Math.min(
    DEPLOY_CAP_MJ,
    state.deployedThisLapMJ + deployed
  );
  const next: WheelState = {
    ...state,
    deployedThisLapMJ,
    fuelKg: Math.max(0, state.fuelKg - burnt),
    harvestedThisLapMJ: Math.min(
      HARVEST_CAP_MJ,
      state.harvestedThisLapMJ + harvested
    ),
    mgukKW,
    socMJ: clamp(
      state.socMJ - deployed + harvested + energyMJ(mguhKW(state), dtMs),
      0,
      SOC_MAX_MJ
    ),
  };
  const spent =
    state.deployedThisLapMJ < DEPLOY_CAP_MJ &&
    deployedThisLapMJ >= DEPLOY_CAP_MJ;
  return spent ? withMessage(next, "DEPLOY LIMIT", "info") : next;
};

/** Revs with the clutch pulled: the throttle against the lower launch limiter [R T25 5.8 c]. */
const freeRevs = (state: WheelState): number =>
  IDLE_RPM + state.throttle * (LAUNCH_LIMITER_RPM - IDLE_RPM);

const targetRpm = (state: WheelState): number => {
  if (!isForwardGear(state.gear)) {
    return IDLE_RPM;
  }
  if (state.clutch >= CLUTCH_OPEN) {
    return freeRevs(state);
  }
  const engaged = clamp(
    rpmAtSpeed(state.speedKph, state.gear),
    IDLE_RPM,
    LIMITER_RPM
  );
  return state.clutch >= CLUTCH_CLOSED
    ? Math.max(engaged, freeRevs(state))
    : engaged;
};

/** The revs a downshift's blip aims at: the lower gear's, plus the flare. */
const blipRpm = (state: WheelState, to: Gear): number =>
  Math.min(LIMITER_RPM, rpmAtSpeed(state.speedKph, to) + BLIP_FLARE_RPM);

/** The ECU's blip: open through a downshift, closing over the settle once the gear lands. */
const nextBlip = (state: WheelState, dtMs: number): number =>
  isDownshifting(state)
    ? BLIP_OPENING
    : Math.max(0, state.blip - (BLIP_OPENING * dtMs) / BLIP_SETTLE_MS);

const settleRpm = (state: WheelState, dtMs: number): WheelState => {
  const downshift = isDownshifting(state) ? state.shift : null;
  const target =
    downshift === null ? targetRpm(state) : blipRpm(state, downshift.to);
  const timeConstant = downshift === null ? RPM_TIME_CONSTANT_MS : BLIP_RISE_MS;
  const share = Math.min(1, dtMs / timeConstant);
  return {
    ...state,
    blip: nextBlip(state, dtMs),
    rpm: state.rpm + (target - state.rpm) * share,
  };
};

const integrateCar = (state: WheelState, dtMs: number): WheelState => {
  const mgukKW = mgukFlowKW(state);
  const accel =
    (driveForceN(state, mgukKW) - resistanceN(state, mgukKW)) / massKg(state);
  const raw = Math.max(
    0,
    state.speedKph + ((accel * dtMs) / MS_PER_S) * KPH_PER_MS
  );
  const speedKph = state.pitLimiter ? Math.min(raw, PIT_LIMIT_KPH) : raw;
  const meanSpeed = (state.speedKph + speedKph) / 2 / KPH_PER_MS;
  const travelled = (meanSpeed * dtMs) / MS_PER_S;
  const moved = {
    ...updateEnergy(state, mgukKW, dtMs),
    distanceM: state.distanceM + travelled,
    speedKph,
  };
  return settleRpm(moved, dtMs);
};

/** Past the corner's grip at this point of it the tyres scrub speed off: the physical ceiling. */
const scrubInCorner = (state: WheelState, dtMs: number): WheelState => {
  const corner = cornerAt(state.distanceM);
  if (corner === null) {
    return state;
  }
  const limit =
    corner.apexKph * gripFactor(state) * cornerProfile(corner, state.distanceM);
  if (state.speedKph <= limit) {
    return state;
  }
  const scrubbed =
    state.speedKph - ((SCRUB_G * GRAVITY * dtMs) / MS_PER_S) * KPH_PER_MS;
  return { ...state, speedKph: Math.max(limit, scrubbed) };
};

// Handling notes

const handlingNote = (state: WheelState): string | null => {
  const hardBraking =
    state.brake >= LOCK_UP_BRAKE && state.speedKph >= LOCK_UP_MIN_KPH;
  const bbOff = state.brakeBalance - BRAKE_BALANCE_IDEAL;
  const bsOff = state.thumbwheels.bs - SWEET_SPOT.bs;
  if (hardBraking && (bbOff >= LOCK_UP_BB_OFF || bsOff >= LOCK_UP_BS_OFF)) {
    return "LOCK-UP FRONT";
  }
  if (hardBraking && (bbOff <= -LOCK_UP_BB_OFF || bsOff <= -LOCK_UP_BS_OFF)) {
    return "LOCK-UP REAR";
  }
  const diffOff = Math.max(
    Math.abs(state.thumbwheels.difIn - SWEET_SPOT.difIn),
    Math.abs(state.thumbwheels.dMid - SWEET_SPOT.dMid)
  );
  const cornering = cornerAt(state.distanceM) !== null && state.throttle > 0;
  return cornering && diffOff >= UNDERSTEER_DIFF_OFF ? "UNDERSTEER" : null;
};

const noteHandling = (state: WheelState): WheelState => {
  if (state.lastNoteLap === state.timing.lap || state.message !== null) {
    return state;
  }
  const note = handlingNote(state);
  return note === null
    ? state
    : withMessage({ ...state, lastNoteLap: state.timing.lap }, note, "warn");
};

// Race: timing, laps, the cars around

const recordTrace = (state: WheelState): WheelState => {
  const bucket = Math.floor(
    Math.min(state.distanceM, LAP_LENGTH_M - 1) / TRACE_STEP_M
  );
  const missing = bucket + 1 - state.lapTrace.length;
  if (missing <= 0) {
    return state;
  }
  const filled = Array.from({ length: missing }, () => state.timing.currentMs);
  return { ...state, lapTrace: [...state.lapTrace, ...filled] };
};

const completeLap = (state: WheelState): WheelState => {
  const { timing } = state;
  const lapMs = timing.currentMs;
  if (timing.lap >= RACE_LAPS) {
    return withMessage(toGarage(state), "CHEQUERED FLAG", "info");
  }
  const isBest = timing.bestMs === null || lapMs < timing.bestMs;
  return {
    ...state,
    bestTrace: isBest ? state.lapTrace : state.bestTrace,
    deployedThisLapMJ: 0,
    distanceM: state.distanceM - LAP_LENGTH_M,
    harvestedThisLapMJ: 0,
    lapTrace: [0],
    timing: {
      ...timing,
      bestMs: isBest ? lapMs : timing.bestMs,
      currentMs: 0,
      lap: timing.lap + 1,
      lapTimesMs: [...timing.lapTimesMs, lapMs],
      lastMs: lapMs,
    },
  };
};

const gapRate = (state: WheelState, pace: number): number =>
  state.speedKph / Math.max(referenceSpeedKph(state.distanceM) * pace, 1);

const passAhead = (state: WheelState): WheelState => {
  const position = state.position - 1;
  return withMessage(
    {
      ...state,
      gapAheadS: position === 1 ? Number.POSITIVE_INFINITY : NEXT_CAR_GAP_S,
      gapBehindS: PASSED_CAR_GAP_S,
      position,
    },
    `P${position}`,
    "info"
  );
};

const passedBehind = (state: WheelState): WheelState => {
  const position = state.position + 1;
  return withMessage(
    {
      ...state,
      gapAheadS: PASSED_CAR_GAP_S,
      gapBehindS:
        position === FIELD_SIZE ? Number.POSITIVE_INFINITY : NEXT_CAR_GAP_S,
      position,
    },
    `P${position}`,
    "warn"
  );
};

/** Gaps follow the car's speed against the cars ahead and behind; places change on straights. */
const updateGaps = (state: WheelState, dtMs: number): WheelState => {
  const launching =
    state.timing.lap === 1 && state.distanceM < START_GAP_HOLD_M;
  const dt = launching ? 0 : dtMs / MS_PER_S;
  const next = {
    ...state,
    gapAheadS:
      state.position === 1
        ? state.gapAheadS
        : clamp(
            state.gapAheadS + dt * (1 - gapRate(state, AHEAD_PACE)),
            0,
            MAX_GAP_S
          ),
    gapBehindS:
      state.position === FIELD_SIZE
        ? state.gapBehindS
        : clamp(
            state.gapBehindS + dt * (gapRate(state, BEHIND_PACE) - 1),
            0,
            MAX_GAP_S
          ),
  };
  const onGrid = state.timing.lap === 1 && state.distanceM < START_PASS_M;
  if (onGrid || cornerAt(state.distanceM) !== null) {
    return next;
  }
  if (next.gapAheadS <= PASS_GAP_S) {
    return passAhead(next);
  }
  return next.gapBehindS <= PASS_GAP_S ? passedBehind(next) : next;
};

/** Lap time at this distance on a recorded trace, interpolated between samples. */
export const traceTimeAt = (
  trace: readonly number[],
  lapMs: number,
  distanceM: number
): number => {
  const index = Math.floor(distanceM / TRACE_STEP_M);
  const from = trace[index] ?? lapMs;
  const to = trace[index + 1] ?? lapMs;
  const startM = index * TRACE_STEP_M;
  const endM = Math.min(startM + TRACE_STEP_M, LAP_LENGTH_M);
  return from + ((to - from) * (distanceM - startM)) / (endM - startM);
};

const withDeltas = (state: WheelState): WheelState => {
  const { bestMs, currentMs, lap } = state.timing;
  const deltaMs =
    state.bestTrace === null || bestMs === null
      ? 0
      : currentMs - traceTimeAt(state.bestTrace, bestMs, state.distanceM);
  return {
    ...state,
    fuelDeltaKg:
      state.fuelKg - fuelTargetKg(lap, state.distanceM / LAP_LENGTH_M),
    timing: { ...state.timing, deltaMs },
  };
};

const advanceRace = (
  state: WheelState,
  beforeM: number,
  dtMs: number
): WheelState => {
  const timed = recordTrace({
    ...state,
    timing: { ...state.timing, currentMs: state.timing.currentMs + dtMs },
  });
  const drs = updateDrs(timed, beforeM);
  const lapped = drs.distanceM >= LAP_LENGTH_M ? completeLap(drs) : drs;
  if (lapped.session !== "track") {
    return lapped;
  }
  return withDeltas(updateGaps(lapped, dtMs));
};

// Thermal

const settle = (
  value: number,
  target: number,
  dtMs: number,
  timeConstantMs: number
): number => value + (target - value) * Math.min(1, dtMs / timeConstantMs);

const updateTyres = (
  state: WheelState,
  accelG: number,
  dtMs: number
): Corner => {
  const corner = cornerAt(state.distanceM);
  const load = corner === null ? 0 : state.speedKph / corner.apexKph;
  const outer = load * TYRE_OUTER_LOAD_C;
  const inner = load * TYRE_INNER_LOAD_C;
  const leftLoad = corner?.turn === "right" ? outer : inner;
  const rightLoad = corner?.turn === "right" ? inner : outer;
  const base =
    TYRE_AMBIENT_C +
    state.speedKph * TYRE_SPEED_HEAT_C_PER_KPH +
    modeProfile(state).tyreHeatC;
  const front = base + Math.max(0, -accelG) * TYRE_BRAKING_C_PER_G;
  const rear = base + Math.max(0, accelG) * TYRE_TRACTION_C_PER_G;
  const { fl, fr, rl, rr } = state.tyreTempsC;
  return {
    fl: settle(fl, front + leftLoad, dtMs, TYRE_TIME_CONSTANT_MS),
    fr: settle(fr, front + rightLoad, dtMs, TYRE_TIME_CONSTANT_MS),
    rl: settle(rl, rear + leftLoad, dtMs, TYRE_TIME_CONSTANT_MS),
    rr: settle(rr, rear + rightLoad, dtMs, TYRE_TIME_CONSTANT_MS),
  };
};

const brakeTemp = (temp: number, heatPerS: number, dtMs: number): number => {
  const cool = (temp - BRAKE_AMBIENT_C) / BRAKE_COOL_TIME_S;
  return clamp(
    temp + ((heatPerS - cool) * dtMs) / MS_PER_S,
    BRAKE_AMBIENT_C,
    BRAKE_MAX_C
  );
};

const updateBrakes = (state: WheelState, dtMs: number): Corner => {
  const heat =
    state.brake * (state.speedKph / BRAKE_HEAT_REF_KPH) * BRAKE_HEAT_C_PER_S;
  const front = (heat * state.brakeBalance) / BRAKE_SHARE_REF;
  const rear = (heat * (100 - state.brakeBalance)) / BRAKE_SHARE_REF;
  const { fl, fr, rl, rr } = state.brakeTempsC;
  return {
    fl: brakeTemp(fl, front, dtMs),
    fr: brakeTemp(fr, front, dtMs),
    rl: brakeTemp(rl, rear, dtMs),
    rr: brakeTemp(rr, rear, dtMs),
  };
};

const updateThermal = (
  state: WheelState,
  speedBeforeKph: number,
  dtMs: number
): WheelState => {
  const accelG =
    (state.speedKph - speedBeforeKph) /
    KPH_PER_MS /
    (dtMs / MS_PER_S) /
    GRAVITY;
  const tyreTempsC = updateTyres(state, accelG, dtMs);
  return {
    ...state,
    brakeTempsC: updateBrakes(state, dtMs),
    tyrePressuresPsi: pressuresFor(tyreTempsC),
    tyreTempsC,
  };
};

/** Before lights out the car is held on its slot: only the engine moves. */
const holdOnGrid = (state: WheelState, dtMs: number): WheelState =>
  settleRpm({ ...drive(state, dtMs), mgukKW: 0, speedKph: 0 }, dtMs);

const step = (state: WheelState, dtMs: number, now: number): WheelState => {
  const settled = advanceStart(
    completeShift(expireFeedback({ ...state, now }, now), now),
    dtMs,
    now
  );
  if (settled.start.kind !== "go") {
    return holdOnGrid(settled, dtMs);
  }
  const driven = drive(settled, dtMs);
  const moved = integrateCar(driven, dtMs);
  const raced = advanceRace(moved, driven.distanceM, dtMs);
  if (raced.session !== "track") {
    return raced;
  }
  const handled = noteHandling(scrubInCorner(raced, dtMs));
  return updateThermal(handled, driven.speedKph, dtMs);
};

/** Runs the car from `state.now` to `now` in small steps, capped at `MAX_ELAPSED_MS`. */
export const advance = (state: WheelState, now: number): WheelState => {
  const elapsed = Math.min(now - state.now, MAX_ELAPSED_MS);
  let next = state;
  let clock = state.now;
  let remaining = elapsed;
  while (remaining > 0 && next.session === "track") {
    const dtMs = Math.min(STEP_MS, remaining);
    clock += dtMs;
    remaining -= dtMs;
    next = step(next, dtMs, clock);
  }
  return { ...next, now };
};

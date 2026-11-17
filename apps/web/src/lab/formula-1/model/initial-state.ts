import {
  DEPLOY_CAP_MJ,
  FUEL_START_KG,
  HARVEST_CAP_MJ,
  rpmAtSpeed,
  fuelTargetKg,
} from "./car";
import { BRAKE_BALANCE_START, MULTI_DEFAULT } from "./ranges";
import { LAP_LENGTH_M, referenceTimeMs } from "./track";
import { MFL_POSITIONS, MFR_POSITIONS } from "./types";
import type { Corner, WheelState } from "./types";

const AMBIENT_C = 25;
const COLD_TEMP_C = 20;
const KELVIN = 273.15;
const COLD_FRONT_PSI = 18.5;
const COLD_REAR_PSI = 17;
export const TRACE_STEP_M = 50;

// Joining the race [INV]: a flying lap 3 of 20, P4, on the straight before T2.
const JOIN_LAP = 3;
const JOIN_DISTANCE_M = 1100;
const JOIN_GEAR = 6;
const JOIN_SPEED_KPH = 240;
const JOIN_POSITION = 4;
const JOIN_GAP_AHEAD_S = 0.75;
const JOIN_GAP_BEHIND_S = 0.7;
const JOIN_SOC_MJ = 2.5;
const JOIN_TYRE_C = 95;
const JOIN_BRAKE_C = 450;
/** The car runs this much slower than the reference envelope; the joined lap's first metres are timed at it. */
export const OWN_PACE = 0.94;

const even = (value: number): Corner => ({
  fl: value,
  fr: value,
  rl: value,
  rr: value,
});

const warmRatio = (temp: number): number =>
  (temp + KELVIN) / (COLD_TEMP_C + KELVIN);

/** Pressures follow temperature from the cold set-up, as a gas does. */
export const pressuresFor = (temps: Corner): Corner => ({
  fl: COLD_FRONT_PSI * warmRatio(temps.fl),
  fr: COLD_FRONT_PSI * warmRatio(temps.fr),
  rl: COLD_REAR_PSI * warmRatio(temps.rl),
  rr: COLD_REAR_PSI * warmRatio(temps.rr),
});

const neutral = <T extends string>(params: readonly T[]): Record<T, number> =>
  Object.fromEntries(params.map((param) => [param, MULTI_DEFAULT])) as Record<
    T,
    number
  >;

/** The car in the garage: engine off, standing still, nothing driven. */
export const initialState = (now: number): WheelState => ({
  bestTrace: null,
  brake: 0,
  brakeBalance: BRAKE_BALANCE_START,
  brakeTempsC: even(AMBIENT_C),
  dashSwitch: "P",
  deployedThisLapMJ: 0,
  distanceM: 0,
  drs: "disabled",
  ers: "base",
  ersLatched: "base",
  fuelDeltaKg: 0,
  fuelKg: FUEL_START_KG,
  gapAheadS: Number.POSITIVE_INFINITY,
  gapBehindS: Number.POSITIVE_INFINITY,
  gear: "N",
  gearControl: "auto",
  harvestedThisLapMJ: 0,
  lapTrace: [],
  lastNoteLap: 0,
  manualIdleM: 0,
  message: null,
  mgukKW: 0,
  multi: { mfl: neutral(MFL_POSITIONS), mfr: neutral(MFR_POSITIONS) },
  multiMenu: null,
  now,
  page: "race",
  pitLimiter: false,
  popup: null,
  position: 0,
  radio: false,
  rotaries: { eng: 3, mfl: 11, mfr: 11, mode: 0, target: 7, tyrePhase: 1 },
  rpm: 0,
  session: "garage",
  shift: null,
  socMJ: 4,
  speedKph: 0,
  thumbwheels: { bs: 0, dMid: 0, difIn: 1, eb: 0, soc: 6, trq: 4 },
  throttle: 0,
  timing: {
    bestMs: null,
    currentMs: 0,
    deltaMs: 0,
    lap: 0,
    lapTimesMs: [],
    lastMs: null,
  },
  tyrePressuresPsi: pressuresFor(even(AMBIENT_C)),
  tyreTempsC: even(AMBIENT_C),
});

/** What the driver set on the wheel, carried between the garage and the track. */
const setUp = (state: WheelState) => ({
  brakeBalance: state.brakeBalance,
  dashSwitch: state.dashSwitch,
  ers: state.ersLatched,
  ersLatched: state.ersLatched,
  multi: state.multi,
  now: state.now,
  page: state.page,
  pitLimiter: state.pitLimiter,
  radio: state.radio,
  rotaries: state.rotaries,
  thumbwheels: state.thumbwheels,
});

export const toGarage = (state: WheelState): WheelState => ({
  ...initialState(state.now),
  ...setUp(state),
});

/** Reference-paced lap time at a distance, for the metres of the joined lap the car didn't drive. */
const joinedTimeMs = (distanceM: number): number =>
  referenceTimeMs(distanceM) / OWN_PACE;

export const toTrack = (state: WheelState): WheelState => {
  const lapShare = JOIN_DISTANCE_M / LAP_LENGTH_M;
  const tyreTempsC = even(JOIN_TYRE_C);
  const buckets = Math.floor(JOIN_DISTANCE_M / TRACE_STEP_M) + 1;
  return {
    ...initialState(state.now),
    ...setUp(state),
    brakeTempsC: even(JOIN_BRAKE_C),
    deployedThisLapMJ: DEPLOY_CAP_MJ * lapShare,
    distanceM: JOIN_DISTANCE_M,
    fuelKg: fuelTargetKg(JOIN_LAP, lapShare),
    gapAheadS: JOIN_GAP_AHEAD_S,
    gapBehindS: JOIN_GAP_BEHIND_S,
    gear: JOIN_GEAR,
    harvestedThisLapMJ: HARVEST_CAP_MJ * lapShare,
    lapTrace: Array.from({ length: buckets }, (_, index) =>
      joinedTimeMs(index * TRACE_STEP_M)
    ),
    position: JOIN_POSITION,
    rpm: rpmAtSpeed(JOIN_SPEED_KPH, JOIN_GEAR),
    session: "track",
    socMJ: JOIN_SOC_MJ,
    speedKph: JOIN_SPEED_KPH,
    throttle: 1,
    timing: {
      bestMs: null,
      currentMs: joinedTimeMs(JOIN_DISTANCE_M),
      deltaMs: 0,
      lap: JOIN_LAP,
      lapTimesMs: [],
      lastMs: null,
    },
    tyrePressuresPsi: pressuresFor(tyreTempsC),
    tyreTempsC,
  };
};

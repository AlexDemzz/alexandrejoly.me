import { FUEL_START_KG, IDLE_RPM } from "./car";
import { BRAKE_BALANCE_START, MULTI_DEFAULT } from "./ranges";
import { GRID_GAP_S } from "./start";
import { MFL_POSITIONS, MFR_POSITIONS } from "./types";
import type { Corner, WheelState } from "./types";

const AMBIENT_C = 25;
const COLD_TEMP_C = 20;
const KELVIN = 273.15;
const COLD_FRONT_PSI = 18.5;
const COLD_REAR_PSI = 17;
export const TRACE_STEP_M = 50;

// The grid [INV unless marked]: P4 of 20, tyres off the blankets, brakes
// cool, a full fuel load and a full store, engine idling in neutral. The car
// starts on the control line; real grid slots sit behind it.
const GRID_POSITION = 4;
const BLANKET_TYRE_C = 70;
const COOL_BRAKE_C = 200;
const FULL_STORE_MJ = 4;
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
  clutch: 0,
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
  socMJ: FULL_STORE_MJ,
  speedKph: 0,
  start: { elapsedMs: 0, kind: "grid" },
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
  gearControl: state.gearControl,
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

/** Start: on the grid of lap 1, with the start procedure under way. */
export const toTrack = (state: WheelState): WheelState => {
  const tyreTempsC = even(BLANKET_TYRE_C);
  return {
    ...initialState(state.now),
    ...setUp(state),
    brakeTempsC: even(COOL_BRAKE_C),
    gapAheadS: GRID_GAP_S,
    gapBehindS: GRID_GAP_S,
    position: GRID_POSITION,
    rpm: IDLE_RPM,
    session: "track",
    socMJ: FULL_STORE_MJ,
    start: { elapsedMs: 0, kind: "grid" },
    timing: { ...initialState(state.now).timing, lap: 1 },
    tyrePressuresPsi: pressuresFor(tyreTempsC),
    tyreTempsC,
  };
};

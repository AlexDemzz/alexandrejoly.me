// The car under the wheel on track, after the 2022–2025 rules. [R] marks a
// regulation figure (FIA 2025 Technical/Sporting), [INV] an invented one.

import { MULTI_DEFAULT, clamp, isForwardGear } from "./ranges";
import type { ForwardGear } from "./ranges";
import { MODE_POSITIONS } from "./types";
import type {
  Gear,
  MflParam,
  MfrParam,
  ModePosition,
  WheelState,
} from "./types";

// Engine. The rules allow up to 15,000 rpm, but fuel flow is capped at
// 100 kg/h from 10,500 rpm [R T25 5.2.3–5.2.4], so real shift points sit
// around 11,500–12,500 rpm; ours are picked inside that band [INV].
export const IDLE_RPM = 4000;
/** Full fuel flow, and the first rev light [R T25 5.2.4]. */
export const FULL_FLOW_RPM = 10_500;
export const SHIFT_RPM = 12_000;
export const LIMITER_RPM = 12_500;
/** Below this the engine bogs: too high a gear out of a slow corner [INV]. */
const BOG_RPM = 6000;

/** Road speed at the limiter in each gear [INV]; every gear clears 80 km/h at 15,000 rpm [R T25 9.9.2]. */
export const GEAR_TOP_KPH: Record<ForwardGear, number> = {
  1: 105,
  2: 140,
  3: 170,
  4: 200,
  5: 232,
  6: 262,
  7: 300,
  8: 350,
};
export const REVERSE_TOP_KPH = 40;
/** The R lever only engages this slow [INV]. */
export const REVERSE_SELECT_KPH = 2;

// Power [R T25 5.2: 100 kg/h of fuel; ICE about 560 kW in 2022–2025]
export const ICE_MAX_KW = 560;
const MAX_FUEL_FLOW_KG_H = 100;
const FUEL_FLOW_PER_RPM = 0.009;
const FUEL_FLOW_OFFSET = 5.5;
/** ENG rotary: 1 is full power; each step up trims power and saves fuel [INV]. */
const ENG_POWER_STEP = 0.008;
const ENG_FUEL_STEP = 0.012;

// Energy [R T25 5.3: MGU-K 120 kW, ES→K 4 MJ and K→ES 2 MJ a lap, MGU-H unlimited, 4 MJ window]
export const ERS_MAX_KW = 120;
export const MAX_HARVEST_KW = 120;
export const SOC_MAX_MJ = 4;
export const DEPLOY_CAP_MJ = 4;
export const HARVEST_CAP_MJ = 2;
/** Full regen from this much brake pedal [INV]. */
const HARVEST_FULL_BRAKE = 0.3;
const LIFT_HARVEST_KW = 60;
/** The MGU-H tops the store up, flat out at speed, outside the lap caps [INV]. */
export const MGUH_HARVEST_KW = 50;
export const MGUH_MIN_KPH = 220;
/** CHR flat out on a long straight: the MGU-K harvests part of the ICE's power ("clipping") [INV]. */
const CLIP_HARVEST_KW = 40;
const CLIP_MIN_KPH = 250;
/** K2: the attack preset deploys in full above this speed [INV]. */
const K2_MIN_KPH = 180;
/** SOC thumbwheel: the base mode deploys this share of 120 kW at 1 (save), plus a step per detent to 12 (spend) [INV]. */
const SOC_DEPLOY_AT_ONE = 0.3;
const SOC_DEPLOY_STEP = 0.05;
const CHR_DEPLOY_SHARE = 0.2;
const CHR_HARVEST_GAIN = 1.4;
const LIFT_THRESHOLD = 0.05;
const FLAT_OUT = 0.95;
const J_PER_MJ = 1e6;
/** Each EB step adds this much lift-off recovery [INV]. */
const EB_HARVEST_STEP = 0.05;

// Multi-function parameters, 1..12 with 6 neutral [INV]
const ERS_PARAM_STEP = 0.04;
const REC_PARAM_STEP = 0.05;
const MIX_FUEL_STEP = 0.015;
const MIX_POWER_STEP = 0.004;

/** MODE short-cuts: one profile per position [INV beyond RACE/SC/WU/FOR/BOX's names]. */
export interface ModeProfile {
  power: number;
  deploy: number;
  harvest: number;
  fuel: number;
  /** Extra tyre temperature the mode works the tyres to, °C. */
  tyreHeatC: number;
}

const profile = (
  power: number,
  deploy: number,
  harvest: number,
  fuel: number,
  tyreHeatC = 0
): ModeProfile => ({ deploy, fuel, harvest, power, tyreHeatC });

export const MODE_PROFILES: Record<ModePosition, ModeProfile> = {
  AD: profile(1, 1.25, 0.9, 1.05),
  BOX: profile(0.85, 0.5, 1.3, 0.85),
  FOR: profile(0.6, 0.3, 1.2, 0.6, 15),
  FS1: profile(0.96, 0.9, 1.1, 0.88),
  FS2: profile(0.92, 0.8, 1.2, 0.78),
  PSH: profile(1.03, 1.3, 0.9, 1.12),
  RACE: profile(1, 1, 1, 1),
  SC: profile(0.6, 0.3, 1.3, 0.6),
  SLO: profile(0.5, 0.2, 1.3, 0.5),
  TS: profile(0.97, 0.95, 1.05, 0.96, -8),
  WU: profile(0.9, 0.8, 1.1, 0.95, 20),
  WUS: profile(0.9, 0.8, 1.1, 0.95, 12),
};

export const modeProfile = (state: Pick<WheelState, "rotaries">): ModeProfile =>
  MODE_PROFILES[MODE_POSITIONS[state.rotaries.mode]];

// Fuel [R T25 30.5: 110 kg max; the 20-lap race is a compressed demo, INV]
export const FUEL_START_KG = 100;
export const FUEL_FINISH_KG = 1;
export const RACE_LAPS = 20;
/** Burn at full ICE power, kg/s: about 5 kg a lap, so 100 kg lasts the 20 laps [INV]. */
const FUEL_BURN_KG_PER_S = 0.0905;

// Body [INV]
export const CAR_MASS_KG = 800;
export const GRAVITY = 9.81;
export const KPH_PER_MS = 3.6;
export const AIR_DENSITY = 1.225;
/** Drag area (Cd x A), m²; an open DRS flap takes about 12% off, ~10–12 km/h at the end of a straight. */
export const DRAG_AREA = 1.5;
export const DRS_DRAG_AREA = 1.32;
export const ROLLING_RESISTANCE_N = 120;
const ENGINE_BRAKE_N = 2500;
const EB_ENGINE_BRAKE_STEP = 0.08;
const BRAKE_LOW_G = 2.2;
const BRAKE_HIGH_G = 5;
const BRAKE_FULL_KPH = 250;
const TRACTION_BASE_G = 1.3;
const TRACTION_KPH_PER_G = 200;

// Set-up sweet spots and costs [INV]
export const BRAKE_BALANCE_IDEAL = 56.5;
const BRAKE_BALANCE_LOSS_PER_PERCENT = 0.012;
export const SWEET_SPOT = { bs: 0, dMid: 0, difIn: 1, eb: 0, trq: 4 } as const;
const DIFF_STEP_LOSS = 0.004;
const EB_STEP_LOSS = 0.0025;
const BS_STEP_LOSS = 0.01;
const TRQ_STEP_LOSS = 0.012;
const TYRE_WINDOW_LOW_C = 85;
const TYRE_WINDOW_HIGH_C = 115;
const TYRE_LOSS_PER_C = 0.003;
const TYRE_MAX_LOSS = 0.12;
/** TYRE PHASE should follow the stint: one phase every two laps [INV]. */
const LAPS_PER_TYRE_PHASE = 2;
const TYRE_PHASE_STEP_LOSS = 0.003;
const GRIP_MIN = 0.75;
const GRIP_MAX = 1.06;

export const rpmAtSpeed = (speedKph: number, gear: Gear): number => {
  if (gear === "N") {
    return 0;
  }
  const top = gear === "R" ? REVERSE_TOP_KPH : GEAR_TOP_KPH[gear];
  return (speedKph / top) * LIMITER_RPM;
};

const paramFactor = (value: number, step: number): number =>
  1 + (value - MULTI_DEFAULT) * step;

const mfl = (
  state: Pick<WheelState, "multi">,
  param: MflParam,
  step: number
): number => paramFactor(state.multi.mfl[param], step);

const mfr = (
  state: Pick<WheelState, "multi">,
  param: MfrParam,
  step: number
): number => paramFactor(state.multi.mfr[param], step);

type PowerInputs = Pick<WheelState, "multi" | "rotaries">;

/** ICE power at full throttle: the fuel-flow ramp below 10,500 rpm, a bog below 6,000, nothing at the limiter. */
export const icePowerKW = (rpm: number, state: PowerInputs): number => {
  if (rpm >= LIMITER_RPM) {
    return 0;
  }
  const flow =
    rpm >= FULL_FLOW_RPM
      ? MAX_FUEL_FLOW_KG_H
      : FUEL_FLOW_PER_RPM * rpm + FUEL_FLOW_OFFSET;
  const bog = Math.min(1, rpm / BOG_RPM);
  const trim =
    (1 - (state.rotaries.eng - 1) * ENG_POWER_STEP) *
    mfl(state, "MIX", MIX_POWER_STEP) *
    modeProfile(state).power;
  return ICE_MAX_KW * (flow / MAX_FUEL_FLOW_KG_H) * bog * trim;
};

/** Fuel burnt per second for this much ICE power. */
export const fuelBurnKgPerS = (iceKW: number, state: PowerInputs): number =>
  FUEL_BURN_KG_PER_S *
  (iceKW / ICE_MAX_KW) *
  (1 - (state.rotaries.eng - 1) * ENG_FUEL_STEP) *
  mfl(state, "MIX", MIX_FUEL_STEP) *
  modeProfile(state).fuel;

/** The fuel the engineer wants left at this point of the race. */
export const fuelTargetKg = (lap: number, lapShare: number): number => {
  const progress = clamp((lap - 1 + lapShare) / RACE_LAPS, 0, 1);
  return FUEL_START_KG - (FUEL_START_KG - FUEL_FINISH_KG) * progress;
};

type DeployInputs = Pick<
  WheelState,
  "ers" | "multi" | "rotaries" | "speedKph" | "thumbwheels"
>;

/** What the MGU-K deploys at full throttle in this ERS mode, before the charge and lap budget. */
export const deployCapKW = (state: DeployInputs): number => {
  if (state.ers === "k1") {
    return ERS_MAX_KW;
  }
  if (state.ers === "k2" && state.speedKph >= K2_MIN_KPH) {
    return ERS_MAX_KW;
  }
  const base =
    (SOC_DEPLOY_AT_ONE + (state.thumbwheels.soc - 1) * SOC_DEPLOY_STEP) *
    modeProfile(state).deploy *
    mfl(state, "ERS", ERS_PARAM_STEP);
  const share = state.ers === "chr" ? base * CHR_DEPLOY_SHARE : base;
  return ERS_MAX_KW * clamp(share, 0, 1);
};

type HarvestInputs = Pick<WheelState, "ers" | "multi" | "rotaries">;

/** How hard the MGU-K recovers: MODE, REC, and CHR with its own parameter. */
export const harvestGain = (state: HarvestInputs): number => {
  const chr =
    state.ers === "chr"
      ? CHR_HARVEST_GAIN * mfr(state, "CHR", REC_PARAM_STEP)
      : 1;
  return modeProfile(state).harvest * mfr(state, "REC", REC_PARAM_STEP) * chr;
};

export type EnergyInputs = Pick<
  WheelState,
  | "brake"
  | "deployedThisLapMJ"
  | "ers"
  | "gear"
  | "harvestedThisLapMJ"
  | "multi"
  | "pitLimiter"
  | "rotaries"
  | "socMJ"
  | "speedKph"
  | "throttle"
  | "thumbwheels"
>;

const harvestKW = (state: EnergyInputs): number => {
  const full =
    state.socMJ >= SOC_MAX_MJ || state.harvestedThisLapMJ >= HARVEST_CAP_MJ;
  if (full) {
    return 0;
  }
  const gain = harvestGain(state);
  if (state.brake > 0) {
    return Math.min(
      MAX_HARVEST_KW,
      MAX_HARVEST_KW * Math.min(1, state.brake / HARVEST_FULL_BRAKE) * gain
    );
  }
  if (state.throttle < LIFT_THRESHOLD) {
    return (
      LIFT_HARVEST_KW * gain * (1 + state.thumbwheels.eb * EB_HARVEST_STEP)
    );
  }
  const clipping =
    state.ers === "chr" &&
    state.throttle >= FLAT_OUT &&
    state.speedKph >= CLIP_MIN_KPH;
  return clipping ? CLIP_HARVEST_KW * gain : 0;
};

/** MGU-K flow: positive while deploying, negative while harvesting, within ±120 kW. */
export const mgukFlowKW = (state: EnergyInputs): number => {
  const harvest = harvestKW(state);
  if (harvest > 0) {
    return -Math.min(MAX_HARVEST_KW, harvest);
  }
  const allowed =
    !state.pitLimiter &&
    state.socMJ > 0 &&
    state.deployedThisLapMJ < DEPLOY_CAP_MJ &&
    isForwardGear(state.gear);
  return allowed ? state.throttle * deployCapKW(state) : 0;
};

/** The MGU-H's charge to the store, outside the MGU-K's lap caps. */
export const mguhKW = (state: EnergyInputs): number => {
  const working =
    state.throttle >= FLAT_OUT &&
    state.speedKph >= MGUH_MIN_KPH &&
    state.socMJ < SOC_MAX_MJ;
  return working ? MGUH_HARVEST_KW * harvestGain(state) : 0;
};

/** kW over a step, in MJ. */
export const energyMJ = (kW: number, dtMs: number): number =>
  (kW * dtMs) / J_PER_MJ;

export const engineBrakeN = (eb: number): number =>
  ENGINE_BRAKE_N * (1 + eb * EB_ENGINE_BRAKE_STEP);

/** Peak braking deceleration; downforce adds grip with speed. */
export const maxBrakeG = (speedKph: number): number => {
  const share = Math.min(1, (speedKph / BRAKE_FULL_KPH) ** 2);
  return BRAKE_LOW_G + (BRAKE_HIGH_G - BRAKE_LOW_G) * share;
};

/** Braking lost to a balance or brake shaping away from the ideal. */
export const brakingFactor = (
  state: Pick<WheelState, "brakeBalance" | "thumbwheels">
): number =>
  (1 -
    Math.abs(state.brakeBalance - BRAKE_BALANCE_IDEAL) *
      BRAKE_BALANCE_LOSS_PER_PERCENT) *
  (1 - Math.abs(state.thumbwheels.bs - SWEET_SPOT.bs) * BS_STEP_LOSS);

export const tractionG = (speedKph: number): number =>
  TRACTION_BASE_G + speedKph / TRACTION_KPH_PER_G;

/** The TYRE PHASE that matches the tyres at this point of the stint. */
export const idealTyrePhase = (lap: number): number =>
  clamp(1 + Math.floor(Math.max(0, lap - 1) / LAPS_PER_TYRE_PHASE), 1, 12);

type GripInputs = Pick<
  WheelState,
  "rotaries" | "thumbwheels" | "timing" | "tyreTempsC"
>;

const tyreFactor = (state: GripInputs): number => {
  const { fl, fr, rl, rr } = state.tyreTempsC;
  const mean = (fl + fr + rl + rr) / 4;
  const outside =
    Math.max(0, TYRE_WINDOW_LOW_C - mean) +
    Math.max(0, mean - TYRE_WINDOW_HIGH_C);
  const temperature = 1 - Math.min(TYRE_MAX_LOSS, outside * TYRE_LOSS_PER_C);
  const phase =
    1 -
    Math.abs(state.rotaries.tyrePhase - idealTyrePhase(state.timing.lap)) *
      TYRE_PHASE_STEP_LOSS;
  return temperature * phase;
};

const away = (value: number, sweetSpot: number, loss: number): number =>
  1 - Math.abs(value - sweetSpot) * loss;

/** Corner grip: tyres, DIF IN, D MID and engine braking (entry stability). */
export const gripFactor = (state: GripInputs): number => {
  const { difIn, dMid, eb } = state.thumbwheels;
  return clamp(
    tyreFactor(state) *
      away(difIn, SWEET_SPOT.difIn, DIFF_STEP_LOSS) *
      away(dMid, SWEET_SPOT.dMid, DIFF_STEP_LOSS) *
      away(eb, SWEET_SPOT.eb, EB_STEP_LOSS),
    GRIP_MIN,
    GRIP_MAX
  );
};

/** Traction out of corners: tyres and the TRQ map. */
export const tractionFactor = (state: GripInputs): number =>
  clamp(
    tyreFactor(state) *
      away(state.thumbwheels.trq, SWEET_SPOT.trq, TRQ_STEP_LOSS),
    GRIP_MIN,
    GRIP_MAX
  );

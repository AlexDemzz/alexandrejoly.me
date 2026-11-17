import type { Gear } from "./types";

export type ForwardGear = Extract<Gear, number>;

export const TOP_GEAR: ForwardGear = 8;

/** Seamless-shift times, within the 200 ms up / 300 ms down the rules allow [R T25 9.9]. */
export const UPSHIFT_MS = 120;
export const DOWNSHIFT_MS = 180;

/** What the pit limiter holds the car to once it moves [R B1.6.3a]. */
export const PIT_LIMIT_KPH = 80;

// Brake balance, % front [INV]
export const BRAKE_BALANCE_MIN = 50;
export const BRAKE_BALANCE_MAX = 65;
export const BRAKE_BALANCE_STEP = 0.5;
export const BRAKE_BALANCE_START = 56.5;

// Multi-function parameters [INV]
export const MULTI_MIN = 1;
export const MULTI_MAX = 12;
export const MULTI_DEFAULT = 6;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const isForwardGear = (gear: Gear): gear is ForwardGear =>
  typeof gear === "number";

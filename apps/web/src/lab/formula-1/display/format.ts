import type { ErsMode } from "../model/types";
import type { Screen } from "./screen";

const MINUS = "−";
const MS_PER_S = 1000;
const MS_PER_MIN = 60_000;

/** What the dash shows for a reading the car can't give, e.g. standing still. */
export const NOTHING = "—";

/** A signed number with a true minus sign: "+2", "−1.3", "+0". */
export const formatSigned = (value: number, decimals = 0): string => {
  const fixed = Math.abs(value).toFixed(decimals);
  const negative = value < 0 && Number(fixed) !== 0;
  return `${negative ? MINUS : "+"}${fixed}`;
};

/** "01:15.493". */
export const formatLapTime = (ms: number): string => {
  const minutes = Math.floor(ms / MS_PER_MIN);
  const seconds = ((ms - minutes * MS_PER_MIN) / MS_PER_S)
    .toFixed(3)
    .padStart(6, "0");
  return `${String(minutes).padStart(2, "0")}:${seconds}`;
};

/** Seconds from milliseconds, signed: "−0.02". */
export const formatDeltaS = (ms: number, decimals = 2): string =>
  formatSigned(ms / MS_PER_S, decimals);

export const PAGE_NAMES: Record<Screen, string> = {
  energy: "ENERGY",
  laps: "LAPS",
  race: "RACE",
  setup: "SETUP",
  temps: "TEMPS",
};

export const PAGE_SPOKEN: Record<Screen, string> = {
  energy: "Energy",
  laps: "Lap times",
  race: "Race",
  setup: "Setup",
  temps: "Temperatures",
};

export const ERS_NAMES: Record<ErsMode, string> = {
  base: "BASE",
  chr: "CHR",
  k1: "K1",
  k2: "K2",
};

// The contract between the wheel's state (model/), its face (wheel/) and its
// screen (display/). The wheel is Leclerc's 2025 Ferrari SF-25 face, under the
// 2022–2025 rules. In the garage the car stands still; on track a hidden
// driver works the pedals (and the gears until the human takes them) while
// every wheel function behaves as the rules say.

export const GEARS = ["R", "N", 1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Gear = (typeof GEARS)[number];

/** Pages the dash cycles through with + / − while the P/S switch is on S. */
export const DISPLAY_PAGES = [
  "race",
  "temps",
  "energy",
  "setup",
  "laps",
] as const;
export type DisplayPage = (typeof DISPLAY_PAGES)[number];

/** The centre "short-cut" rotary, clockwise from the top (12 detents). */
export const MODE_POSITIONS = [
  "RACE",
  "TS",
  "FS1",
  "FS2",
  "SC",
  "SLO",
  "PSH",
  "WU",
  "WUS",
  "FOR",
  "BOX",
  "AD",
] as const;
export type ModePosition = (typeof MODE_POSITIONS)[number];

/** Left multi-function rotary: picks the parameter + / − adjust. */
export const MFL_POSITIONS = [
  "A",
  "B",
  "C",
  "D",
  "DO",
  "STR",
  "RB",
  "MIX",
  "SPK",
  "GX",
  "TUR",
  "ERS",
] as const;
/** Right multi-function rotary: recover mode and lesser-used functions. */
export const MFR_POSITIONS = [
  "CHR",
  "BM",
  "KC",
  "FM",
  "WG",
  "D",
  "FC",
  "MOT",
  "DG",
  "SAT",
  "LT",
  "REC",
] as const;
export type MflParam = (typeof MFL_POSITIONS)[number];
export type MfrParam = (typeof MFR_POSITIONS)[number];
/** "D" sits on both rotaries, so a parameter is only unique with its rotary. */
export type MultiParam = MflParam | MfrParam;

/** Rotaries with 12 numbered detents store 1..12; the others store a legend index 0..11. */
export type Rotary = "mode" | "mfl" | "mfr" | "target" | "tyrePhase" | "eng";

export type Thumbwheel = "difIn" | "dMid" | "soc" | "eb" | "bs" | "trq";
/** Inclusive ranges; `wrap` thumbwheels roll past the ends. */
export const THUMBWHEEL_RANGES: Record<
  Thumbwheel,
  { min: number; max: number; wrap: boolean }
> = {
  bs: { max: 3, min: -3, wrap: false },
  dMid: { max: 5, min: -5, wrap: false },
  difIn: { max: 5, min: -5, wrap: false },
  eb: { max: 5, min: -5, wrap: false },
  soc: { max: 12, min: 1, wrap: true },
  trq: { max: 8, min: 1, wrap: true },
};

export type WheelButton =
  /** N, lime */
  | "neutral"
  /** PC, white: pit confirm */
  | "pitConfirm"
  /** RF, white: acknowledges the active dash message (invented) */
  | "rf"
  /** RADIO, red, held to talk */
  | "radio"
  /** OK, purple: closes the multi-function menu (invented) */
  | "ok"
  /** CHR, lime: latches the recharge mode */
  | "chr"
  /** K1, yellow: ERS overtake, held */
  | "k1"
  /** K2, yellow: latches ERS preset 2 (invented) */
  | "k2"
  /** K0, yellow: clears K1/K2/CHR back to the base ERS mode (invented) */
  | "k0"
  /** P, orange: latches the pit limiter */
  | "pit"
  /** 1/+, purple over yellow */
  | "plus"
  /** 10/−, purple over yellow */
  | "minus"
  /** grip pads */
  | "bbRearward"
  | "bbForward"
  /** rear stalk, top left: opens DRS once the car is in a zone with DRS enabled */
  | "drs"
  /** rear lever with a red R: reverse, from neutral and stopped (invented) */
  | "reverse";

export type Paddle = "upshift" | "downshift";

/** The P/S toggle switch: P pins the race page, S lets + / − page the dash (invented). */
export type DashSwitch = "P" | "S";

export type ErsMode = "base" | "k1" | "k2" | "chr";

/** Stopped (garage): the car stands still. Running (track): a 20-lap race from the grid. */
export type Session = "garage" | "track";

/**
 * The standing start [R S25 Art. 44.10]: the car waits on the grid, five red
 * lights come on a second apart, then they all go out after a hold.
 */
export type StartPhase =
  | { kind: "grid"; elapsedMs: number }
  | {
      kind: "lights";
      lit: 0 | 1 | 2 | 3 | 4 | 5;
      elapsedMs: number;
      holdMs: number;
    }
  /** Lights out; `elapsedMs` counts from that moment. */
  | { kind: "go"; elapsedMs: number };

/** Who shifts on track: the hidden driver (auto) or the human on the paddles (manual); the visitor picks. */
export type GearControl = "auto" | "manual";

/** disabled → available (within 1 s at detection) → enabled (inside the zone) → open (pressed). */
export type DrsState = "disabled" | "available" | "enabled" | "open";

export interface Corner {
  fl: number;
  fr: number;
  rl: number;
  rr: number;
}

export interface LapTiming {
  /** 0 in the garage. */
  lap: number;
  /** ms into the current lap. */
  currentMs: number;
  lastMs: number | null;
  bestMs: number | null;
  /** Live delta to the best lap at this distance, ms (negative = faster); 0 without a best lap. */
  deltaMs: number;
  lapTimesMs: readonly number[];
}

export interface WheelState {
  /** Wall-clock of the last tick, ms: pop-ups expire and lights blink against it. */
  now: number;
  session: Session;

  // the car (still in the garage)
  /** The start procedure; stays on the grid while stopped. */
  start: StartPhase;
  /** Hidden driver's pedals and clutch paddle, 0..1 (1 = clutch pulled). Never driven by the UI. */
  throttle: number;
  brake: number;
  clutch: number;
  /**
   * The ECU's own throttle opening for a downshift, 0..1: it revs the engine
   * up to the lower gear's speed while the gears change. Not the driver's pedal.
   */
  blip: number;
  gearControl: GearControl;
  rpm: number;
  speedKph: number;
  /** Metres into the lap. */
  distanceM: number;
  fuelKg: number;
  /** Fuel vs the engineer's target at this point of the race, kg (+ = ahead). */
  fuelDeltaKg: number;

  // energy (2014–2025 rules)
  /** Energy store, 0..4 MJ usable window. */
  socMJ: number;
  /** MGU-K power, + deploy / − harvest, ±120 kW. */
  mgukKW: number;
  /** ES → MGU-K this lap vs the 4 MJ cap. */
  deployedThisLapMJ: number;
  /** MGU-K → ES this lap vs the 2 MJ cap. */
  harvestedThisLapMJ: number;
  drs: DrsState;

  // thermal
  tyreTempsC: Corner;
  tyrePressuresPsi: Corner;
  brakeTempsC: Corner;

  // race
  timing: LapTiming;
  position: number;
  /** Gap to the car ahead in s; Infinity when leading or in the garage. */
  gapAheadS: number;
  /** Gap to the car behind in s; Infinity when last or in the garage. */
  gapBehindS: number;
  /** Lap time in ms at every trace step of the current lap, for the live delta. */
  lapTrace: readonly number[];
  bestTrace: readonly number[] | null;
  /** The lap of the last handling note (lock-up, understeer), so they stay rare. */
  lastNoteLap: number;

  gear: Gear;
  /** A requested shift in progress; no other request is accepted until it lands. */
  shift: { to: Gear; doneAt: number } | null;
  pitLimiter: boolean;
  /** k1 while K1 is held; k2 / chr latch; base otherwise. */
  ers: ErsMode;
  /** The latched mode (base, k2 or chr) that `ers` returns to when K1 is released. */
  ersLatched: Exclude<ErsMode, "k1">;

  /** % front. */
  brakeBalance: number;
  thumbwheels: Record<Thumbwheel, number>;
  rotaries: Record<Rotary, number>;
  /** Value of every multi-function parameter, 1..12, per rotary. */
  multi: { mfl: Record<MflParam, number>; mfr: Record<MfrParam, number> };
  dashSwitch: DashSwitch;
  page: DisplayPage;
  /** The parameter picked by the last MFL/MFR turn; + / − adjust it while open. */
  multiMenu: {
    rotary: "mfl" | "mfr";
    param: MflParam | MfrParam;
    until: number;
  } | null;

  radio: boolean;
  /** Transient pop-up after a rotary, thumbwheel or button change. */
  popup: { label: string; value: string; until: number } | null;
  /** Dash message (e.g. "PIT CONFIRMED", "SHIFT REJECTED"); RF clears it early. */
  message: {
    text: string;
    tone: "info" | "warn" | "alert";
    until: number;
  } | null;
}

export type WheelAction =
  | { type: "tick"; now: number }
  | { type: "press"; button: WheelButton }
  /** radio and k1 are held */
  | { type: "release"; button: WheelButton }
  | { type: "paddle"; paddle: Paddle }
  | { type: "thumbwheel"; wheel: Thumbwheel; value: number }
  | { type: "rotary"; rotary: Rotary; index: number }
  | { type: "dashSwitch"; value: DashSwitch }
  | { type: "session"; session: Session }
  | { type: "gearControl"; value: GearControl };

export type LedColor =
  | "off"
  | "green"
  | "red"
  | "blue"
  | "yellow"
  | "amber"
  | "purple"
  | "white";

/** The six ringed status lights around the screen (positions from the SF-25 face). */
export type IndicatorLed = "l1" | "l2" | "l3" | "r1" | "r2" | "r3";

export interface Leds {
  /** 15 rev lights, left to right; the first two double as DRS status on track. */
  shift: readonly LedColor[];
  /** Flag repeaters beside the screen, 3 each, top to bottom: blue with a car close behind. */
  left: readonly LedColor[];
  right: readonly LedColor[];
  indicators: Record<IndicatorLed, LedColor>;
}

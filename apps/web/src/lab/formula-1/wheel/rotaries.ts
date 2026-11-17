import { rotaryDetent } from "../model/selectors";
import { MFL_POSITIONS, MFR_POSITIONS, MODE_POSITIONS } from "../model/types";
import type { Rotary, WheelState } from "../model/types";
import { SPOTS } from "./layout";
import type { Spot } from "./layout";

/** Paints map to colours in wheel.css. */
export type Paint =
  | "black"
  | "blue"
  | "deep-blue"
  | "green"
  | "grey"
  | "lime"
  | "olive"
  | "orange"
  | "purple"
  | "red"
  | "sky"
  | "tyre-blue"
  | "white"
  | "yellow"
  | "yellow-green";

export type Ink = "dark" | "light" | Paint;

export interface DialPosition {
  /** Printed on the disc, and what screen readers and agents hear. */
  legend: string;
  paint: Paint;
  ink: Ink;
}

export interface RotarySpec {
  id: Rotary;
  /** The printed label if there is one, then the function. */
  name: string;
  spot: Spot;
  /** Numbered rotaries store 1 to 12 and put 12 at the top; the others store 0 to 11 from the top. */
  numbered: boolean;
  positions: readonly DialPosition[];
  /** The mode rotary's knob is a toothed ring round a pointer disc; the rest are wedges. */
  knob: "gear" | "wedge";
  /** Disc band as shares of the diameter: inner and outer radius, and where legends sit. */
  band: { inner: number; outer: number; legend: number };
  /** Legends follow the ring, or stay upright like the numbers. */
  legendAlong: "ring" | "upright";
  /** White hairlines between positions. */
  dividers: boolean;
  /** The detent index, 0 to 11, the rotary sits on. */
  select: (state: WheelState) => number;
}

export const DETENTS = 12;
export const DETENT_DEGREES = 30;

const MODE_PAINT: Record<(typeof MODE_POSITIONS)[number], [Paint, Ink]> = {
  AD: ["yellow", "dark"],
  BOX: ["yellow", "dark"],
  FOR: ["orange", "dark"],
  FS1: ["orange", "dark"],
  FS2: ["orange", "dark"],
  PSH: ["grey", "dark"],
  RACE: ["grey", "dark"],
  SC: ["white", "dark"],
  SLO: ["purple", "yellow"],
  TS: ["grey", "dark"],
  WU: ["blue", "light"],
  WUS: ["olive", "light"],
};

const MFL_INK: Record<(typeof MFL_POSITIONS)[number], Ink> = {
  A: "sky",
  B: "sky",
  C: "sky",
  D: "sky",
  DO: "white",
  ERS: "yellow",
  GX: "orange",
  MIX: "yellow",
  RB: "purple",
  SPK: "green",
  STR: "red",
  TUR: "white",
};

const mfrPaint = (index: number): [Paint, Ink] => {
  if (index < 4) {
    return ["white", "dark"];
  }
  return index < 8 ? ["lime", "dark"] : ["red", "light"];
};

const numbered = (paint: (value: number) => [Paint, Ink]): DialPosition[] =>
  Array.from({ length: DETENTS }, (_, index) => {
    const [fill, ink] = paint(index + 1);
    return { ink, legend: String(index + 1), paint: fill };
  });

const targetPaint = (value: number): [Paint, Ink] => {
  if (value >= 9) {
    return ["sky", "light"];
  }
  if (value <= 2) {
    return ["white", "red"];
  }
  return value <= 4 ? ["white", "dark"] : ["green", "light"];
};

const ENG_PAINT: readonly [Paint, Ink][] = [
  ["red", "light"],
  ["orange", "dark"],
  ["orange", "dark"],
  ["yellow", "dark"],
  ["yellow", "dark"],
  ["yellow", "dark"],
  ["yellow-green", "dark"],
  ["yellow-green", "dark"],
  ["green", "light"],
  ["deep-blue", "light"],
  ["deep-blue", "light"],
  ["deep-blue", "light"],
];

const WEDGE_BAND = { inner: 0.16, legend: 0.38, outer: 0.5 };

const SPECS: readonly Omit<RotarySpec, "select">[] = [
  {
    band: { inner: 0.33, legend: 0.415, outer: 0.5 },
    dividers: true,
    id: "mode",
    knob: "gear",
    legendAlong: "ring",
    name: "Mode short-cut selector",
    numbered: false,
    positions: MODE_POSITIONS.map((legend) => {
      const [paint, ink] = MODE_PAINT[legend];
      return { ink, legend, paint };
    }),
    spot: SPOTS.mode,
  },
  {
    band: { inner: 0.16, legend: 0.4, outer: 0.5 },
    dividers: true,
    id: "mfl",
    knob: "wedge",
    legendAlong: "ring",
    name: "Left multi-function",
    numbered: false,
    positions: MFL_POSITIONS.map((legend) => ({
      ink: MFL_INK[legend],
      legend,
      paint: "black",
    })),
    spot: SPOTS.mfl,
  },
  {
    band: { inner: 0.16, legend: 0.4, outer: 0.5 },
    dividers: false,
    id: "mfr",
    knob: "wedge",
    legendAlong: "ring",
    name: "Right multi-function",
    numbered: false,
    positions: MFR_POSITIONS.map((legend, index) => {
      const [paint, ink] = mfrPaint(index);
      return { ink, legend, paint };
    }),
    spot: SPOTS.mfr,
  },
  {
    band: WEDGE_BAND,
    dividers: false,
    id: "target",
    knob: "wedge",
    legendAlong: "upright",
    name: "TARGET",
    numbered: true,
    positions: numbered(targetPaint),
    spot: SPOTS.target,
  },
  {
    band: WEDGE_BAND,
    dividers: false,
    id: "tyrePhase",
    knob: "wedge",
    legendAlong: "upright",
    name: "TYRE PHASE",
    numbered: true,
    positions: numbered(() => ["tyre-blue", "light"]),
    spot: SPOTS.tyrePhase,
  },
  {
    band: WEDGE_BAND,
    dividers: false,
    id: "eng",
    knob: "wedge",
    legendAlong: "upright",
    name: "ENG, engine map",
    numbered: true,
    positions: numbered((value) => ENG_PAINT[value - 1]),
    spot: SPOTS.eng,
  },
];

export const ROTARIES: readonly RotarySpec[] = SPECS.map((spec) => ({
  ...spec,
  select: (state: WheelState): number => rotaryDetent(state, spec.id),
}));

/** Detent angle in degrees clockwise from 12 o'clock. */
export const angleOf = (
  spec: Pick<RotarySpec, "numbered">,
  position: number
): number => (position + (spec.numbered ? 1 : 0)) * DETENT_DEGREES;

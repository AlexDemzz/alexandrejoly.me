/**
 * The face is laid out in wheel units: the SF-25 body is 1570 × 1000 (W:H
 * 1.57, from the research notes' normalised coordinates × 1570 and × 1000),
 * inside a frame whose margins hold the DRS stalk that pokes out at the top
 * left. wheel.css turns a unit into a length with `--u`.
 */
export const BODY_WIDTH = 1570;
export const BODY_HEIGHT = 1000;
export const MARGIN_X = 40;
export const MARGIN_TOP = 30;
export const FRAME_WIDTH = BODY_WIDTH + MARGIN_X * 2;
export const FRAME_HEIGHT = BODY_HEIGHT + MARGIN_TOP + 10;

export interface Spot {
  x: number;
  y: number;
  /** Diameter, or width when `height` is set. */
  size: number;
  height?: number;
}

/** A spot from the notes' normalised centre and its size as a share of the width. */
const at = (nx: number, ny: number, size: number, height?: number): Spot => ({
  height: height === undefined ? undefined : Math.round(height * BODY_WIDTH),
  size: Math.round(size * BODY_WIDTH),
  x: Math.round(nx * BODY_WIDTH),
  y: Math.round(ny * BODY_HEIGHT),
});

export const SPOTS = {
  neutral: at(0.109, 0.121, 0.047),
  pitConfirm: at(0.177, 0.165, 0.036),
  rf: at(0.217, 0.059, 0.025),
  radio: at(0.231, 0.222, 0.036),
  ok: at(0.092, 0.26, 0.027),
  chr: at(0.261, 0.388, 0.038),
  k1: at(0.779, 0.057, 0.027),
  pit: at(0.887, 0.128, 0.052),
  plus: at(0.818, 0.159, 0.036),
  minus: at(0.759, 0.204, 0.036),
  k2: at(0.905, 0.26, 0.025),
  k0: at(0.723, 0.388, 0.038),
  bbRearward: at(0.151, 0.582, 0.038),
  bbForward: at(0.844, 0.585, 0.038),
  dashSwitch: at(0.598, 0.829, 0.024, 0.05),
  difIn: at(0.059, 0.316, 0.052, 0.024),
  dMid: at(0.941, 0.316, 0.052, 0.024),
  soc: at(0.201, 0.381, 0.027, 0.105),
  eb: at(0.799, 0.388, 0.027, 0.105),
  bs: at(0.225, 0.577, 0.028, 0.085),
  trq: at(0.778, 0.58, 0.028, 0.085),
  mode: at(0.495, 0.65, 0.142),
  mfl: at(0.36, 0.648, 0.1),
  mfr: at(0.636, 0.645, 0.102),
  target: at(0.313, 0.808, 0.092),
  tyrePhase: at(0.5, 0.834, 0.09),
  eng: at(0.697, 0.813, 0.092),
  screen: at(0.5005, 0.268, 0.347, 0.1975),
  drs: { height: 20, size: 70, x: 58, y: 98 },
  reverse: at(0.148, 0.29, 0.03, 0.05),
  downshift: at(0.148, 0.415, 0.068, 0.03),
  upshift: at(0.852, 0.415, 0.068, 0.03),
} as const satisfies Record<string, Spot>;

export const SHIFT_LED = { first: 0.341, pitch: 0.0224, size: 0.014, y: 0.066 };
export const FLAG_LED = {
  left: 0.294,
  right: 0.706,
  size: 0.013,
  ys: [0.124, 0.16, 0.195],
};

export const INDICATOR_SPOTS = {
  l1: at(0.177, 0.086, 0.019),
  l2: at(0.242, 0.128, 0.019),
  l3: at(0.272, 0.305, 0.019),
  r1: at(0.823, 0.083, 0.019),
  r2: at(0.756, 0.128, 0.019),
  r3: at(0.725, 0.305, 0.019),
} as const satisfies Record<string, Spot>;

/** The lens colour each indicator's ring is moulded in. */
export const INDICATOR_LENS = {
  l1: "green",
  l2: "amber",
  l3: "blue",
  r1: "green",
  r2: "green",
  r3: "green",
} as const;

export const toUnits = (nx: number, ny: number): [number, number] => [
  nx * BODY_WIDTH,
  ny * BODY_HEIGHT,
];

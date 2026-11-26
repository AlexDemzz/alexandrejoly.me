export const FRAME = { height: 1120, width: 1540 } as const;

export const CAMERA = {
  fov: 15.012_6,
  position: [-0, 0.352_244, 1.047_711],
  target: [-0, 0.081_833, 0.002_112],
} as const;

export const KEY_LIGHT = {
  position: [-1.05, 1.15, 1.05],
  target: [0, 0.1, -0],
} as const;

export const MAX_BANDS = 6;
export const KEY_ROW = { h: 101.5, w: 419.6, x: 560.2, y: 819.9 } as const;
export const VOLUME = { h: 123.1, w: 125.2, x: 315.1, y: 673.4 } as const;
export const TUNING = { h: 123.2, w: 125.2, x: 1099.7, y: 673.4 } as const;
export const LABELS = {
  capHeight: 11.8,
  w: 415,
  x: 562.5,
  y: 794,
} as const;

export const KEY = {
  axis: [1, 0, 0],
  gap: 0.001,
  hinge: [0, 0.031_8, 0.065],
  latched: 0.218_166,
  row: 0.1,
  touch: 0.253_073,
  width: 0.019,
} as const;
export const VOLUME_KNOB = {
  axis: [0, 0, 1],
  min: 3.926_991,
  origin: [-0.094, 0.057, 0.070_2],
  sweep: 4.712_389,
} as const;
export const TUNING_KNOB = {
  axis: [0, 0, 1],
  origin: [0.094, 0.057, 0.070_2],
  turns: 3,
} as const;
export const POINTER = { axis: [1, 0, 0], travel: 0.124 } as const;

export const DIAL = {
  box: {
    above: 0.004,
    below: 0.001_6,
    line: 0.000_26,
    margin: 0.002_2,
  },
  half: 0.064,
  middle: [0, 0.061_2, 0.070_32],
  pitch: 0.006_4,
  rhythms: [
    [0.005_8, 4],
    [0.002_9, 5],
    [0.002_32, 5],
    [0.004, 2],
    [0.003_4, 4],
    [0.002_6, 5],
  ],
  rule: 0.000_18,
  span: 0.019_2,
  tick: { half: 0.000_16, short: 0.001_4, tall: 0.002_6 },
} as const;
export const LIT = { color: 0xff_e8_be, strength: 4 } as const;
export const HALO = {
  color: 0xff_e2_b2,
  extra: 0.006,
  gain: 0.4,
  height: 0.009_6,
  out: 0.000_06,
  rise: 0.000_8,
  strength: 1.6,
} as const;

export const FRAME = { height: 1700, width: 1800 } as const;

export const HEADROOM = 900;

export const LEVER = {
  h: 81.2,
  travel: 424.4,
  w: 254.4,
  x: 1069.6,
  y: 788.9,
} as const;

export const BODY = { h: 1090.9, w: 1262.8, x: 268.6, y: 445.2 } as const;

export const DIAL = { r: 99.8, x: 639.1, y: 1292.5 } as const;
export const STOP = { r: 42.7, x: 453.6, y: 1280.9 } as const;

export const SLICE = { h: 567, sink: 428.3, w: 620, x: 595, y: 90 } as const;
export const LIP_Y = 512;

export const SLICE_UNITS_PER_METRE = SLICE.sink / 0.102;

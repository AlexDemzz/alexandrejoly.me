export const FRAME = { height: 2860, width: 2160 } as const;

export const CAMERA = {
  fov: 37.193_1,
  position: [-0.062_583, 0.748_867, 0.860_906],
  target: [-0.062_583, 0.208_867, -0.074_401],
} as const;

export const KEY_LIGHT = {
  position: [-1.05, 1.15, 1.05],
  target: [0, 0.1, -0],
} as const;
export const WALL_LIGHT = [-0.083_438, 0.331_704, -0.405] as const;

export const PICTURE = {
  h: 1093,
  w: 1640,
  x: 192.075,
  y: -1.354_975,
} as const;
export const WALL_BASE = 1463.645_025;

export const FORWARD = { h: 77.6, w: 127.9, x: 1751.5, y: 2444.1 } as const;
export const REVERSE = { h: 77.6, w: 124.1, x: 831.6, y: 2444.1 } as const;
export const TIMER = { h: 33.2, w: 83.4, x: 1489.3, y: 2469.1 } as const;
export const FOCUS = { h: 174, w: 164.6, x: 1124.3, y: 2405 } as const;

export const TRAY = {
  axis: [0, 0.994_522, 0.104_528],
  forward: -1,
  slots: 80,
} as const;
export const SLIDE_TRAVEL = 0.05;
export const LENS = {
  axis: [0, 0.104_528, -0.994_522],
  travel: 0.007,
} as const;
export const KEY = {
  axis: [0, -0.406_737, -0.913_545],
  travel: 0.001_8,
} as const;
export const TIMER_SWITCH = { axis: [1, 0, 0], travel: 0.01 } as const;
export const FOCUS_KNOB = {
  axis: [0, 0.406_737, 0.913_545],
  sharp: 1.570_796,
  sweep: 2.356_194,
} as const;

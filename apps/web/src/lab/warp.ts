import {
  RAMP,
  approach,
  cellsFor,
  clamp01,
  clear,
  fixed,
  glyphFont,
  hash,
  rubberBand,
  springAtRest,
  stepSpring,
} from "./engine";
import type {
  Cells,
  Drag,
  Frame,
  Scene,
  SceneApi,
  SpringState,
} from "./engine";

const COLUMNS = 54;
const TAU = Math.PI * 2;
const GLYPH_SIZE = 0.86;

/** The tube's radius: every length below is in radii. */
const RADIUS = 1;
const RADIUS_SQUARED = RADIUS * RADIUS;
/** The centre line leaves the axis as BEND · depth², so the tunnel turns ahead. */
const BEND = 0.02;
const BEND_SQUARED = BEND * BEND;
/** The deepest a ray can reach before the turn hides the rest. */
const DEEPEST = (1 + Math.SQRT2) * Math.sqrt(RADIUS / BEND);
/** Focal length, as a share of the card's width. */
const FOCAL = 0.52;
/** Behind this the ray would leave backwards: it is held at the near wall. */
const MIN_FORWARD = 0.05;
const NEWTON_STEPS = 7;

/** Radii per ms. */
const SPEED = 4.2e-3;
const SURGE = 0.12;
const SURGE_RATE = 5e-4;
/** Radians per ms. */
const ROLL_RATE = 5e-5;
const TURN_RATE = -1.3e-4;
const START_TURN = 0.6;

const RIB_SPACING = 0.85;
const RIB = 0.2;
const RIB_SHADOW = 0.42;
/** Every few ribs a heavier hoop, which still reads deep down the tunnel. */
const HOOP_EVERY = 3;
const HOOP = 0.09;
const HOOP_SHADOW = 0.14;
const HOOP_TONE = 1.2;
const PANELS = 12;
const SEAM = 0.07;
const RAILS = 3;
const RAIL = 0.05;
const MEAN_TONE = 0.64;
const RAIL_TONE = 0.92;
const SEAM_TONE = 0.26;
const SHADOW_TONE = 0.16;
/** Share of the panels that are lit. */
const LAMPS = 0.93;
/** Panels fade to grey once a cell covers this share of a bay. */
const PANEL_BLUR = 0.6;
const FOG = 4.8;
/** Light the far wall keeps, so the dark end is still a wall. */
const AMBIENT = 0.04;
const DITHER = 0.04;
/** Cells the wall's texture is averaged over: wider than one, against moiré. */
const FILTER = 1.7;

const CORE_START = 0.5 * DEEPEST;
const CORE_SPAN = 0.3 * DEEPEST;
const CORE_HOT = 0.5;
const HALO_START = 0.3 * DEEPEST;
const HALO_SPAN = 0.3 * DEEPEST;
const HALO = 0.42;

const RING_PERIOD = 5200;
const RING_TRAVEL = 2600;
const RING_FAR = DEEPEST;
const RING_WIDTH = 0.3;
/** The ring's half-width in filtered cells, so it stays a closed loop far away. */
const RING_SPREAD = 0.42;
const RING_GLOW = 1.6;

/** How far the vanishing point follows freely, as a share of the width. */
const LOOK = 0.26;
const STRETCH = 0.09;
/** The slope of the engine's `rubberBand` at the edge. */
const BAND_GAIN = 0.55;
const RETURN = { damping: 17, stiffness: 170 };
const RETURN_TAU = 90;
const REST = 0.3;
/** In px per ms. */
const MAX_FLING = 1.2;
/** Radians of roll per px/ms of horizontal look. */
const BANK = 0.14;
const MAX_BANK = 0.3;
const BANK_TAU = 180;

const smooth = (t: number) => t * t * (3 - 2 * t);

const mix = (from: number, to: number, t: number) => from + (to - from) * t;

const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

/** Free up to `limit`, then giving less and less over `stretch`. */
const band = (raw: number, limit: number, stretch: number) =>
  Math.abs(raw) <= limit
    ? raw
    : Math.sign(raw) * (limit + rubberBand(Math.abs(raw) - limit, stretch));

/** The pull that `band` turns into `value`, so a catch past the edge does not jump. */
const unband = (value: number, limit: number, stretch: number) => {
  const over = Math.abs(value) - limit;
  if (over <= 0) {
    return value;
  }
  const share = Math.min(0.98, over / stretch);
  const pull = (stretch / BAND_GAIN) * (1 / (1 - share) - 1);
  return Math.sign(value) * (limit + pull);
};

/** |t·d − BEND·t²|² − R², with a = |d|² and b = d · bend: zero where the ray meets the wall. */
const gap = (t: number, a: number, b: number) =>
  ((BEND_SQUARED * t - 2 * b) * t + a) * t * t - RADIUS_SQUARED;

const gapSlope = (t: number, a: number, b: number) =>
  ((4 * BEND_SQUARED * t - 6 * b) * t + 2 * a) * t;

/**
 * The depth at which a ray from the centre line first meets the bent tube.
 * The quartic is bracketed around its first root, where it only rises, then
 * polished with a few Newton steps that fall back to bisection.
 */
const hitDepth = (a: number, b: number) => {
  let low = 0;
  let high =
    (Math.sqrt(a) + Math.sqrt(a + 4 * BEND * RADIUS)) / (2 * BEND) + 1e-3;
  const discriminant = 9 * b * b - 8 * BEND_SQUARED * a;
  if (b > 0 && discriminant > 0) {
    // Looking into the turn: the ray either meets the inner wall before the
    // crest of the quartic, or grazes past it and lands on the outer wall.
    const root = Math.sqrt(discriminant);
    const crest = (3 * b - root) / (4 * BEND_SQUARED);
    if (gap(crest, a, b) >= 0) {
      high = crest;
    } else {
      low = (3 * b + root) / (4 * BEND_SQUARED);
    }
  }
  let t = Math.min(high, Math.max(low, RADIUS / Math.sqrt(a + 1e-9)));
  for (let step = 0; step < NEWTON_STEPS; step += 1) {
    const value = gap(t, a, b);
    if (value < 0) {
      low = t;
    } else {
      high = t;
    }
    const slope = gapSlope(t, a, b);
    const next = slope > 0 ? t - value / slope : -1;
    t = next > low && next < high ? next : (low + high) / 2;
  }
  return t;
};

/** The integral of a pulse `width` wide repeating every 1, up to `x`. */
const pulse = (x: number, width: number) => {
  const whole = Math.floor(x);
  return whole * width + Math.min(x - whole, width);
};

/** Share of the stretch `span` long around `x` that the pulse covers. */
const cover = (x: number, span: number, width: number) =>
  (pulse(x + span / 2, width) - pulse(x - span / 2, width)) / span;

/** A panel's tone at a turn around the tube (in [0, 1)), in the bay `ring`. */
const panelTone = (turn: number, ring: number) => {
  const rail = turn * RAILS;
  if (Math.abs(rail - Math.floor(rail) - 0.5) < RAIL * RAILS) {
    return RAIL_TONE;
  }
  const around = turn * PANELS + (ring % 2 === 0 ? 0 : 0.5);
  const panel = Math.floor(around);
  const v = around - panel;
  if (v < SEAM || v > 1 - SEAM) {
    return SEAM_TONE;
  }
  const grain = hash(panel % PANELS, ring);
  return grain > LAMPS ? 1 : 0.56 + 0.24 * grain;
};

/**
 * The wall's own tone: ribs with the shadow behind them, staggered panels and
 * rails running the length. `blur` is the depth one cell covers there: ribs
 * are averaged over it, so far rings fade into grey instead of flickering.
 */
const wallTone = (turn: number, along: number, blur: number) => {
  const position = along / RIB_SPACING;
  const span = Math.max(1e-3, blur / RIB_SPACING);
  const rib = cover(position, span, RIB);
  const shadow = cover(position, span, RIB_SHADOW) - rib;
  const detail = clamp01(1.5 - span / PANEL_BLUR);
  const panel = mix(MEAN_TONE, panelTone(turn, Math.floor(position)), detail);
  const bay = rib + shadow * SHADOW_TONE + (1 - rib - shadow) * panel;
  const hoop = cover(position / HOOP_EVERY, span / HOOP_EVERY, HOOP);
  const dark = cover(position / HOOP_EVERY, span / HOOP_EVERY, HOOP_SHADOW);
  return hoop * HOOP_TONE + (dark - hoop) * SHADOW_TONE + (1 - dark) * bay;
};

interface Rays {
  x: Float32Array;
  y: Float32Array;
}

const buildRays = (
  { cell, cols, count, originX, originY }: Cells,
  { height, width }: Pick<Frame, "height" | "width">
): Rays => {
  const rays: Rays = {
    x: new Float32Array(count),
    y: new Float32Array(count),
  };
  const focal = FOCAL * width;
  for (let index = 0; index < count; index += 1) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    rays.x[index] = (originX + (col + 0.5) * cell - width / 2) / focal;
    rays.y[index] = (originY + (row + 0.5) * cell - height / 2) / focal;
  }
  return rays;
};

interface View {
  /** The turn's direction on screen, times BEND. */
  bendX: number;
  bendY: number;
  /** Depth one cell covers at depth 1; it grows with depth². */
  footprint: number;
  /** Where the tunnel's axis shows, in focal lengths from the centre. */
  lookX: number;
  lookY: number;
  /** Depth of the travelling ring, or a negative number when there is none. */
  ring: number;
  ringLight: number;
  /** The tube's roll, in turns. */
  spin: number;
  travelled: number;
}

/** Ray-casts the tube into the grid: a luminance per cell, and which cells burn. */
const render = (
  view: View,
  rays: Rays,
  light: Float32Array,
  hot: Uint8Array
) => {
  const { bendX, bendY, footprint, lookX, lookY, ring, ringLight } = view;
  // A basis whose third axis points at the tunnel's axis as seen on screen.
  const length = Math.hypot(lookX, lookY, 1);
  const axisX = lookX / length;
  const axisY = lookY / length;
  const axisZ = 1 / length;
  const flat = Math.hypot(axisX, axisZ);
  const rightX = axisZ / flat;
  const rightZ = -axisX / flat;
  const upX = axisY * rightZ;
  const upY = axisZ * rightX - axisX * rightZ;
  const upZ = -axisY * rightX;

  for (let index = 0; index < light.length; index += 1) {
    const rayX = rays.x[index];
    const rayY = rays.y[index];
    const forward = Math.max(MIN_FORWARD, axisX * rayX + axisY * rayY + axisZ);
    const dirX = (rightX * rayX + rightZ) / forward;
    const dirY = (upX * rayX + upY * rayY + upZ) / forward;
    const a = dirX * dirX + dirY * dirY;
    const t = hitDepth(a, dirX * bendX + dirY * bendY);
    const hitX = t * (dirX - bendX * t);
    const hitY = t * (dirY - bendY * t);
    const turn = Math.atan2(hitY, hitX) / TAU + 1 - view.spin;
    const distance = t * Math.sqrt(1 + a);
    // The lamp rides with the camera, so the wall is lit where it faces it.
    const facing = clamp01(
      (t * (hitX * dirX + hitY * dirY)) / (RADIUS * distance)
    );
    const blur = t * t * footprint * FILTER;
    const tone = wallTone(turn - Math.floor(turn), t + view.travelled, blur);
    const lamp = (0.5 + 0.5 * Math.sqrt(facing)) * Math.exp(-(t - 1) / FOG);
    const halo = HALO * smooth(clamp01((t - HALO_START) / HALO_SPAN));
    const core = smooth(clamp01((t - CORE_START) / CORE_SPAN));
    const offset = Math.abs(t - ring);
    const width = Math.max(RING_WIDTH, blur * RING_SPREAD);
    const burning = ring > 0 && offset < width;
    const glow =
      ring > 0 ? ringLight * 0.45 * Math.exp(-offset / RING_GLOW) : 0;
    const wall = AMBIENT + tone * lamp + halo + glow * tone;
    light[index] = clamp01(
      Math.max(wall, core, burning ? 0.55 + 0.45 * ringLight : 0)
    );
    hot[index] = core > CORE_HOT || (burning && ringLight > 0.4) ? 1 : 0;
  }
};

/** What only a resize changes: the font and each cell's dither, in [0, 1). */
interface Type {
  font: string;
  grain: Float64Array;
}

const buildType = ({ cell, cols, count }: Cells): Type => {
  const grain = new Float64Array(count);
  for (let index = 0; index < count; index += 1) {
    grain[index] = hash(index % cols, Math.floor(index / cols));
  }
  return { font: glyphFont(cell * GLYPH_SIZE), grain };
};

const paint = (
  frame: Frame,
  { cell, cols, count, originX, originY }: Cells,
  { font, grain }: Type,
  light: Float32Array,
  hot: Uint8Array
) => {
  const { ctx, palette } = frame;
  clear(frame);
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let index = 0; index < count; index += 1) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const level = light[index];
    const noisy = level + (grain[index] - 0.5) * DITHER;
    const glyph =
      RAMP[
        Math.max(1, Math.min(RAMP.length - 1, Math.floor(noisy * RAMP.length)))
      ];
    ctx.globalAlpha = 0.14 + 0.86 * level ** 0.8;
    ctx.fillStyle = hot[index] === 1 ? palette.hot : palette.foreground;
    ctx.fillText(
      glyph,
      originX + (col + 0.5) * cell,
      originY + (row + 0.5) * cell
    );
  }
};

const signed = (radians: number) => {
  const degrees = Math.round((radians * 180) / Math.PI);
  return `${degrees < 0 ? "−" : "+"}${Math.abs(degrees)}°`.padStart(4, " ");
};

/** Brings the look back to the centre: sprung, or eased when motion is reduced. */
const settle = (spring: SpringState, { dt, reducedMotion }: Frame) => {
  if (reducedMotion) {
    spring.velocity = 0;
    spring.value =
      Math.abs(spring.value) < REST
        ? 0
        : approach(spring.value, 0, dt, RETURN_TAU);
  } else {
    stepSpring(spring, 0, dt, RETURN);
  }
};

export const createWarp = ({ report }: SceneApi): Scene => {
  /** Where the vanishing point sits, in px from the card's centre. */
  const lookX: SpringState = { value: 0, velocity: 0 };
  const lookY: SpringState = { value: 0, velocity: 0 };
  const caught = { x: 0, y: 0 };
  let cells: Cells | null = null;
  let rays: Rays | null = null;
  let type: Type | null = null;
  let light = new Float32Array(0);
  let hot = new Uint8Array(0);
  let held = false;
  let travelled = 0;
  let roll = 0;
  let turn = START_TURN;
  let bank = 0;
  let clock = 0;
  let speed = 0;
  let lastX = 0;

  const advance = (frame: Frame) => {
    const { dt, reducedMotion } = frame;
    if (!held) {
      settle(lookX, frame);
      settle(lookY, frame);
    }
    const sway = dt > 0 ? (lookX.value - lastX) / dt : 0;
    lastX = lookX.value;
    if (reducedMotion) {
      bank = 0;
      speed = 0;
      return;
    }
    bank = approach(bank, clamp(sway * BANK, MAX_BANK), dt, BANK_TAU);
    clock += dt;
    speed = SPEED * (1 + SURGE * Math.sin(clock * SURGE_RATE));
    travelled += speed * dt;
    roll += ROLL_RATE * dt;
    turn += TURN_RATE * dt;
  };

  const steer = ({ startX, startY, x, y }: Drag, { width }: Frame) => {
    const limit = LOOK * width;
    const stretch = STRETCH * width;
    lookX.value = band(caught.x + x - startX, limit, stretch);
    lookY.value = band(caught.y + y - startY, limit, stretch);
  };

  return {
    draw: (frame) => {
      const { reducedMotion, width } = frame;
      if (frame.resized || !cells || !rays || !type) {
        cells = cellsFor(frame, COLUMNS);
        rays = buildRays(cells, frame);
        type = buildType(cells);
        light = new Float32Array(cells.count);
        hot = new Uint8Array(cells.count);
      }
      advance(frame);

      const focal = FOCAL * width;
      const phase = (clock % RING_PERIOD) / RING_TRAVEL;
      const flying = !reducedMotion && phase < 1;
      const spin = roll + bank;
      const view: View = {
        bendX: BEND * Math.cos(turn + spin),
        bendY: BEND * Math.sin(turn + spin),
        footprint: cells.cell / (focal * RADIUS),
        lookX: lookX.value / focal,
        lookY: lookY.value / focal,
        ring: flying ? RING_FAR * (1 - phase) : -1,
        ringLight: smooth(clamp01(phase / 0.12)),
        spin: spin / TAU,
        travelled,
      };
      render(view, rays, light, hot);
      paint(frame, cells, type, light, hot);

      const yaw = -Math.atan(view.lookX);
      const pitch = Math.atan(view.lookY);
      report(
        `v ${fixed(speed * 1000, 1)} r/s · yaw ${signed(yaw)} · pitch ${signed(pitch)} · ${fixed(travelled, 0, 4)} r`
      );
      const resting =
        springAtRest(lookX, 0, REST) && springAtRest(lookY, 0, REST);
      return held || !reducedMotion || !resting;
    },
    drag: steer,
    press: (_drag, { width }) => {
      held = true;
      const limit = LOOK * width;
      const stretch = STRETCH * width;
      caught.x = unband(lookX.value, limit, stretch);
      caught.y = unband(lookY.value, limit, stretch);
      lookX.velocity = 0;
      lookY.velocity = 0;
    },
    release: ({ vx, vy }, { reducedMotion }) => {
      held = false;
      lookX.velocity = reducedMotion ? 0 : clamp(vx, MAX_FLING);
      lookY.velocity = reducedMotion ? 0 : clamp(vy, MAX_FLING);
    },
  };
};

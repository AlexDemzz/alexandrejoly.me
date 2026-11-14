import {
  approach,
  cellsFor,
  clamp01,
  clear,
  easeOutCubic,
  fixed,
  glyphFont,
  hash,
} from "./engine";
import type { Cells, Frame, Scene, SceneApi } from "./engine";

const COLUMNS = 50;
/** Glyphs from the cool tip of a flame to its core. */
const FLAME = ".':;!+*=x%#$@";
const SMOKE = ".':;";
const BARK = "==#=";
const EMBERS = ".:*o*";
const GROUND = "_.,_-.";

/** The cellular step runs at its own rate, so the fire burns alike at any refresh rate. */
const STEP = 1000 / 30;
const MAX_STEPS = 4;
/** Steps a tongue of flame lasts before the draught shifts. */
const TONGUE = 7;
/** Steps a fire burns ahead when first lit, to reach its full height. */
const WARMUP = 90;
/**
 * The warm-up is spread over the first frames, a few steps each, so the fire
 * grows in instead of holding the first frame up: steps per regular step's
 * worth of time, then the fewest and the most a frame runs.
 */
const WARM_SPEED = 6;
const WARM_LEAST = 1;
const WARM_MOST = 4;
const SEED = 20_241;
const MODULUS = 2_147_483_647;
const MULTIPLIER = 16_807;

/** How long a hold takes to bring the fuel from nothing to full. */
const STOKE = 600;
const RELEASE = 280;
const SETTLE = 1600;

/** The hearth's row, as a share of the height. */
const BASE = 0.8;
const HALF_IDLE = 0.16;
const HALF_GAIN = 0.08;
const INTENSITY_IDLE = 2;
const INTENSITY_GAIN = 0.7;
const COOL_IDLE = 0.027;
const COOL_GAIN = -0.004;
/** How much faster heat is lost toward the flame's flanks. */
const EDGE = 2.2;
const HOT = 0.44;
const VISIBLE = 0.05;
/** How strongly rising heat is drawn toward the middle, which gives a flame its tip. */
const CONVERGE = 0.5;
/** Columns a tongue of flame spans. */
const TONGUE_SPAN = 3.2;
const SMOKE_SHED = 0.22;
const SMOKE_SWAY = 0.3;
/** The heat that reaches the densest glyph. */
const FULL = 1.5;

const SMOKE_KEEP = 0.95;
const SMOKE_GAIN = 0.34;
const SMOKE_BAND = 0.3;

const MAX_SPARKS = 72;
const BURST = 30;
const SPARK_IDLE = 0.07;
const SPARK_GAIN = 0.5;
const SPARK_GLYPHS = ".'+*";

/** Half a log's length, as a share of the columns. */
const LOG_REACH = 0.18;
const LOG_RISE = 2;
const LEAN_MAX = 0.32;
const LEAN_TAU = 380;
const WIND = 0.08;
const WIND_RATE = 6e-4;

const STILL_IDLE = 17;
const STILL_GAIN = 20;

const EMPTY = 0;
const LOG = 1;
const EMBER = 2;

const mix = (from: number, to: number, share: number) =>
  from + (to - from) * share;

/** Smooth noise in [0, 1): hashed corners, blended across each unit square. */
const ripple = (x: number, y: number) => {
  const col = Math.floor(x);
  const row = Math.floor(y);
  const u = x - col;
  const v = y - row;
  return mix(
    mix(hash(col, row), hash(col + 1, row), u),
    mix(hash(col, row + 1), hash(col + 1, row + 1), u),
    v
  );
};

/** A small seeded sequence in [0, 1), so the fire does not depend on Math.random. */
const createNoise = (seed: number) => {
  let state = seed;
  return () => {
    state = (state * MULTIPLIER) % MODULUS;
    return state / MODULUS;
  };
};

type Noise = () => number;

interface Hearth {
  base: number;
  cells: Cells;
  centre: number;
  heat: Float32Array;
  /** What sits in a cell besides the fire: nothing, a log or the ember bed. */
  mask: Uint8Array;
  smoke: Float32Array;
}

interface Sparks {
  age: Float32Array;
  life: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  x: Float32Array;
  y: Float32Array;
}

interface Burn {
  cool: number;
  fuel: number;
  half: number;
  intensity: number;
  lean: number;
}

const tune = (
  burn: Burn,
  fuel: number,
  lean: number,
  { cols, rows }: Cells
) => {
  // A shorter grid cools faster, so the flame keeps its share of the height.
  burn.cool = ((COOL_IDLE + COOL_GAIN * fuel) * COLUMNS) / rows;
  burn.fuel = fuel;
  burn.half = cols * (HALF_IDLE + HALF_GAIN * fuel);
  burn.intensity = INTENSITY_IDLE + INTENSITY_GAIN * fuel;
  burn.lean = lean;
};

/** Two crossed logs over a bed of embers. */
const layHearth = (cells: Cells): Hearth => {
  const { cols, count, rows } = cells;
  const base = Math.round(rows * BASE);
  const centre = cols / 2;
  const mask = new Uint8Array(count);
  const mark = (col: number, row: number, kind: number) => {
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      mask[row * cols + col] = kind;
    }
  };
  const middle = Math.floor(centre);
  const reach = Math.round(cols * LOG_REACH);
  for (let offset = -reach + 2; offset <= reach - 2; offset += 1) {
    mark(middle + offset, base + 2, EMBER);
  }
  for (let offset = -reach; offset <= reach; offset += 1) {
    const climb = Math.round(((offset + reach) / (reach * 2)) * LOG_RISE);
    for (const side of [-1, 1]) {
      const col = middle + offset * side;
      mark(col, base + 1 - climb, LOG);
    }
  }
  return {
    base,
    cells,
    centre,
    heat: new Float32Array(count),
    mask,
    smoke: new Float32Array(count),
  };
};

/** Carries a fire over to a new grid: each cell takes after the nearest one it had. */
const refit = (from: Hearth, cells: Cells): Hearth => {
  const to = layHearth(cells);
  const { cols, rows } = cells;
  const old = from.cells;
  for (let row = 0; row < rows; row += 1) {
    const oldRow = Math.min(
      old.rows - 1,
      Math.floor(((row + 0.5) / rows) * old.rows)
    );
    for (let col = 0; col < cols; col += 1) {
      const oldCol = Math.min(
        old.cols - 1,
        Math.floor(((col + 0.5) / cols) * old.cols)
      );
      const index = row * cols + col;
      const oldIndex = oldRow * old.cols + oldCol;
      to.heat[index] = from.heat[oldIndex];
      to.smoke[index] = from.smoke[oldIndex];
    }
  }
  return to;
};

/** Fresh heat along the ember bed: a dome, hottest in the middle, flickering per cell. */
const seed = (
  { base, cells, centre, heat }: Hearth,
  burn: Burn,
  tick: number,
  noise: Noise
) => {
  const { cols, rows } = cells;
  const last = Math.min(rows - 1, base + 1);
  const beat = tick / TONGUE;
  for (let col = 2; col < cols - 2; col += 1) {
    const reach = (col + 0.5 - centre) / burn.half;
    const dome = Math.max(0, 1 - reach * reach);
    // The draught shifts slowly, so heat leaves the bed in tongues.
    const draught = clamp01(
      0.65 * ripple(col / TONGUE_SPAN, beat) +
        0.45 * ripple(col / (TONGUE_SPAN * 0.5) + 31, beat * 1.7 + 17)
    );
    const strength =
      dome *
      burn.intensity *
      (0.4 + 0.6 * draught * draught * (3 - 2 * draught));
    for (let row = base; row <= last; row += 1) {
      heat[row * cols + col] = strength * (0.8 + 0.2 * noise());
    }
  }
};

/** Each cell takes the heat below it, nudged sideways, and loses a little on the way up. */
const rise = (
  { base, cells, centre, heat }: Hearth,
  burn: Burn,
  noise: Noise
) => {
  const { cols } = cells;
  const pull = Math.abs(burn.lean);
  const side = Math.sign(burn.lean);
  for (let row = 0; row < base; row += 1) {
    const middle = centre + burn.lean * (base - row);
    for (let col = 2; col < cols - 2; col += 1) {
      const index = row * cols + col;
      const below = index + cols;
      const jitter = Math.round(noise() * 2 - 1);
      const chance = noise();
      const shift = chance < pull ? side : 0;
      const flank = (col + 0.5 - middle) / burn.half;
      const inward =
        noise() < CONVERGE * Math.min(1, Math.abs(flank))
          ? Math.sign(flank)
          : 0;
      const loss =
        burn.cool * (0.3 + 1.4 * noise()) * (1 + flank * flank * EDGE);
      const value =
        heat[below + jitter - shift + inward] * 0.7 +
        (heat[below - 1] + heat[below + 1]) * 0.15 -
        loss;
      heat[index] = Math.max(0, value);
    }
  }
};

/** Smoke is shed where a flame cools out, then climbs, spreads and thins. */
const drift = (
  { base, cells, heat, smoke }: Hearth,
  lean: number,
  tick: number,
  noise: Noise
) => {
  const { cols } = cells;
  for (let row = 0; row < base; row += 1) {
    // A wisp meanders: each height is pushed one way for a while, then the other.
    const sway = Math.sin(row * 0.31 + tick * 0.045) + lean * 4;
    const side = Math.sign(sway);
    const pull = Math.min(1, Math.abs(sway)) * SMOKE_SWAY;
    for (let col = 2; col < cols - 2; col += 1) {
      const index = row * cols + col;
      const below = index + cols;
      const shift = noise() < pull ? side : 0;
      const carried =
        (smoke[below - shift] * 0.8 +
          (smoke[below - 1] + smoke[below + 1]) * 0.1) *
        SMOKE_KEEP;
      const warmth = heat[index];
      const sheds =
        warmth > VISIBLE && warmth < SMOKE_BAND && noise() < SMOKE_SHED;
      smoke[index] = Math.min(1, carried + (sheds ? SMOKE_GAIN : 0));
    }
  }
};

const createSparks = (): Sparks => ({
  age: new Float32Array(MAX_SPARKS),
  life: new Float32Array(MAX_SPARKS),
  vx: new Float32Array(MAX_SPARKS),
  vy: new Float32Array(MAX_SPARKS),
  x: new Float32Array(MAX_SPARKS),
  y: new Float32Array(MAX_SPARKS),
});

/** Lights one spark over the hearth, if a slot is free; `force` is how hard it is thrown. */
const throwSpark = (
  sparks: Sparks,
  { base, centre }: Hearth,
  burn: Burn,
  force: number,
  noise: Noise
) => {
  const slot = sparks.life.indexOf(0);
  if (slot === -1) {
    return;
  }
  const spread = noise() - 0.5;
  sparks.x[slot] = centre + spread * burn.half * 1.2;
  sparks.y[slot] = base - 2 - noise() * (4 + 8 * burn.fuel);
  sparks.vx[slot] = spread * 0.5 * force;
  sparks.vy[slot] = (0.35 + 0.5 * noise()) * (0.7 + 0.5 * force);
  sparks.age[slot] = 0;
  sparks.life[slot] = 22 + Math.floor(noise() * 34 * (0.6 + 0.4 * force));
};

/** Moves the sparks along with a grid that changed size. */
const refitSparks = (sparks: Sparks, from: Cells, to: Cells) => {
  const acrossX = to.cols / from.cols;
  const acrossY = to.rows / from.rows;
  for (let slot = 0; slot < MAX_SPARKS; slot += 1) {
    sparks.x[slot] *= acrossX;
    sparks.y[slot] *= acrossY;
  }
};

const liftSparks = (sparks: Sparks, lean: number) => {
  let alive = 0;
  for (let slot = 0; slot < MAX_SPARKS; slot += 1) {
    if (sparks.life[slot] > 0) {
      sparks.age[slot] += 1;
      if (sparks.age[slot] >= sparks.life[slot] || sparks.y[slot] < 0) {
        sparks.life[slot] = 0;
      } else {
        const wobble = Math.sin(sparks.age[slot] * 0.35 + slot) * 0.16;
        sparks.x[slot] += sparks.vx[slot] + wobble + lean * 0.6;
        sparks.y[slot] -= sparks.vy[slot];
        sparks.vx[slot] *= 0.96;
        sparks.vy[slot] *= 0.988;
        alive += 1;
      }
    }
  }
  return alive;
};

/** One flame held still, for reduced motion: a swaying teardrop with a wisp of smoke above. */
const pose = ({ base, cells, centre, heat, smoke }: Hearth, burn: Burn) => {
  const { cols, rows } = cells;
  const tall = ((STILL_IDLE + STILL_GAIN * burn.fuel) * rows) / COLUMNS;
  const last = Math.min(rows - 1, base + 1);
  heat.fill(0);
  smoke.fill(0);
  for (let row = 0; row <= last; row += 1) {
    const climb = Math.max(0, base - row) / tall;
    const sway = Math.sin(climb * 4.2) * burn.half * 0.3 * Math.min(climb, 1.5);
    const girth =
      burn.half * Math.max(0, 1 - climb) ** 0.85 * (0.8 + 0.9 * climb);
    for (let col = 2; col < cols - 2; col += 1) {
      const index = row * cols + col;
      const offset = Math.abs(col + 0.5 - centre - sway);
      const grain = hash(col, row) - 0.5;
      if (climb < 1) {
        const body = 1 - (offset / girth) ** 1.5;
        heat[index] = Math.max(0, FULL * body * (1.05 - climb) + grain * 0.2);
      } else {
        const wisp = Math.exp(-(offset * offset) / (1.2 + (climb - 1) * 9));
        smoke[index] = clamp01(wisp * (1.5 - climb) * 1.2 + grain * 0.12);
      }
    }
  }
};

const pick = (set: string, level: number) =>
  set[Math.max(0, Math.min(set.length - 1, Math.floor(level * set.length)))];

/** The fire itself: heat as a glyph ramp, its core in the accent, smoke where it has gone out. */
const paintField = (
  { ctx, palette }: Frame,
  { cells, heat, mask, smoke }: Hearth
) => {
  const { cell, cols, originX, originY, rows } = cells;
  for (let row = 0; row < rows; row += 1) {
    const y = originY + (row + 0.5) * cell;
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const warmth = heat[index];
      const haze = smoke[index];
      const x = originX + (col + 0.5) * cell;
      // The logs and embers are drawn with the hearth, over the flames.
      if (mask[index] !== EMPTY) {
        continue;
      }
      if (warmth > VISIBLE) {
        const level = clamp01(warmth / FULL);
        const hot = warmth > HOT;
        // The cool flanks stay dimmer than the core, which carries the light.
        ctx.globalAlpha = hot ? 0.66 + 0.34 * level : 0.16 + level;
        ctx.fillStyle = hot ? palette.hot : palette.foreground;
        ctx.fillText(pick(FLAME, level), x, y);
      } else if (haze > 0.1) {
        ctx.globalAlpha = Math.min(0.34, 0.05 + haze * 0.5);
        ctx.fillStyle = palette.foreground;
        ctx.fillText(pick(SMOKE, haze * 1.3 + hash(col, row) * 0.15), x, y);
      }
    }
  }
};

/** Logs, embers and the ground the fire lights; `tick` makes the embers breathe. */
const paintHearth = (
  { ctx, palette }: Frame,
  { base, cells, centre, mask }: Hearth,
  burn: Burn,
  tick: number
) => {
  const { cell, cols, originX, originY, rows } = cells;
  const beat = Math.floor(tick / 5);
  const last = Math.min(rows - 1, base + 3);
  for (let row = base - LOG_RISE; row <= last; row += 1) {
    const y = originY + (row + 0.5) * cell;
    for (let col = 0; col < cols; col += 1) {
      const kind = mask[row * cols + col];
      const x = originX + (col + 0.5) * cell;
      const grain = hash(col, row);
      const glow = hash(col + beat * 0.37, row - beat * 0.11);
      if (kind === LOG) {
        const lit = glow > 0.86 - 0.2 * burn.fuel;
        ctx.globalAlpha = lit ? 0.95 : 0.5 + 0.35 * grain;
        ctx.fillStyle = lit ? palette.hot : palette.foreground;
        ctx.fillText(lit ? "*" : pick(BARK, grain), x, y);
      } else if (kind === EMBER) {
        ctx.globalAlpha = 0.45 + 0.55 * glow;
        ctx.fillStyle = palette.hot;
        ctx.fillText(pick(EMBERS, glow), x, y);
      } else if (row === base + 3) {
        const reach = Math.abs(col + 0.5 - centre) / (cols * 0.5);
        const light = Math.exp(-reach * 3.2) * (0.55 + 0.45 * burn.fuel);
        ctx.globalAlpha = 0.1 + 0.6 * light * (0.85 + 0.15 * glow);
        ctx.fillStyle = palette.foreground;
        ctx.fillText(pick(GROUND, grain), x, y);
      }
    }
  }
};

const paintSparks = (
  { ctx, palette }: Frame,
  { cells, heat }: Hearth,
  sparks: Sparks
) => {
  const { cell, cols, originX, originY, rows } = cells;
  ctx.fillStyle = palette.hot;
  for (let slot = 0; slot < MAX_SPARKS; slot += 1) {
    const col = Math.floor(sparks.x[slot]);
    const row = Math.floor(sparks.y[slot]);
    const inside = col >= 0 && col < cols && row >= 0 && row < rows;
    // A spark inside the flame is lost in it: it shows once it is clear.
    if (sparks.life[slot] > 0 && inside && heat[row * cols + col] < 0.3) {
      const left = 1 - sparks.age[slot] / sparks.life[slot];
      ctx.globalAlpha = 0.25 + 0.75 * left;
      ctx.fillText(
        pick(SPARK_GLYPHS, left),
        originX + (col + 0.5) * cell,
        originY + (row + 0.5) * cell
      );
    }
  }
};

const stateOf = (held: boolean, fuel: number, settling: boolean) => {
  if (held) {
    return fuel >= 1 ? "blazing" : "stoking";
  }
  return settling ? "settling" : "calm";
};

export const createFire = ({ report }: SceneApi): Scene => {
  const noise = createNoise(SEED);
  const sparks = createSparks();
  const burn: Burn = { cool: 0, fuel: 0, half: 0, intensity: 0, lean: 0 };
  let hearth: Hearth | null = null;
  let font = "";
  let fuel = 0;
  /** The fuel the canvas shows, to tell a frame that would change nothing. */
  let painted = -1;
  let held = false;
  let heldFor = 0;
  let droppedFrom = 0;
  let droppedAt = -SETTLE;
  let burst = false;
  let lean = 0;
  let pending = 0;
  let warming = 0;
  let tick = 0;
  let alive = 0;

  /** The hearth for this frame's grid: laid on first use, carried over a resize. */
  const fit = (frame: Frame): Hearth => {
    if (hearth && !frame.resized) {
      return hearth;
    }
    const cells = cellsFor(frame, COLUMNS);
    font = glyphFont(cells.cell * 0.86, 600);
    if (!hearth) {
      hearth = layHearth(cells);
      warming = WARMUP;
    } else if (
      hearth.cells.cols === cells.cols &&
      hearth.cells.rows === cells.rows
    ) {
      hearth.cells = cells;
    } else {
      refitSparks(sparks, hearth.cells, cells);
      hearth = refit(hearth, cells);
    }
    return hearth;
  };

  const step = (bed: Hearth) => {
    tick += 1;
    seed(bed, burn, tick, noise);
    rise(bed, burn, noise);
    drift(bed, burn.lean, tick, noise);
    if (noise() < SPARK_IDLE + SPARK_GAIN * burn.fuel) {
      throwSpark(sparks, bed, burn, 0.4 + 0.6 * burn.fuel, noise);
    }
    alive = liftSparks(sparks, burn.lean);
  };

  /** Burns the fire for `dt` ms; tells whether anything on the canvas changed. */
  const burnOn = (bed: Hearth, dt: number) => {
    const warm = Math.min(
      warming,
      Math.max(
        WARM_LEAST,
        Math.min(WARM_MOST, Math.round((dt / STEP) * WARM_SPEED))
      )
    );
    warming -= warm;
    let steps = warm;
    pending = Math.min(pending + dt, STEP * MAX_STEPS);
    while (pending >= STEP) {
      pending -= STEP;
      steps += 1;
    }
    for (let done = 0; done < steps; done += 1) {
      step(bed);
    }
    if (held && fuel >= 1 && !burst) {
      burst = true;
      for (let thrown = 0; thrown < BURST; thrown += 1) {
        throwSpark(sparks, bed, burn, 1.6, noise);
      }
      return true;
    }
    return steps > 0;
  };

  /** Holds the fire in its still pose, for reduced motion. */
  const hold = (bed: Hearth) => {
    pose(bed, burn);
    sparks.life.fill(0);
    alive = 0;
    warming = 0;
    return true;
  };

  const stoke = ({ dt, reducedMotion, time }: Frame) => {
    if (held) {
      heldFor += dt;
      // A hold shows time passing, so the fuel climbs at a constant rate.
      fuel = Math.min(1, fuel + dt / STOKE);
    } else if (reducedMotion) {
      fuel = 0;
    } else {
      fuel = droppedFrom * (1 - easeOutCubic((time - droppedAt) / RELEASE));
    }
  };

  const paint = (frame: Frame, bed: Hearth) => {
    const { ctx } = frame;
    clear(frame);
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    paintField(frame, bed);
    paintHearth(frame, bed, burn, tick);
    paintSparks(frame, bed, sparks);
    painted = fuel;
  };

  return {
    draw: (frame) => {
      const { dt, pointer, reducedMotion, time, width } = frame;
      const bed = fit(frame);

      stoke(frame);
      const aim = held
        ? Math.max(-1, Math.min(1, (pointer.x / width - 0.5) * 2)) * LEAN_MAX
        : WIND * Math.sin(time * WIND_RATE);
      lean = reducedMotion ? 0 : approach(lean, aim, dt, LEAN_TAU);
      tune(burn, fuel, lean, bed.cells);

      const burned = reducedMotion ? hold(bed) : burnOn(bed, dt);
      // The fire steps slower than the screen refreshes: between two steps,
      // with the fuel steady, the canvas already shows this frame.
      if (burned || frame.resized || fuel !== painted) {
        paint(frame, bed);
      }

      const settling = !reducedMotion && time - droppedAt < SETTLE;
      report(
        `fuel ${fixed(fuel * 100, 0, 3)}% · held ${fixed(heldFor / 1000, 1, 4)}s · sparks ${fixed(alive, 0, 2)} · ${stateOf(held, fuel, settling)}`
      );
      return held || !reducedMotion;
    },
    press: () => {
      held = true;
      heldFor = 0;
      burst = false;
    },
    release: (_drag, { time }) => {
      held = false;
      droppedFrom = fuel;
      droppedAt = time;
    },
  };
};

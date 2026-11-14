import {
  DIM,
  RAMP,
  approach,
  cellsFor,
  clamp01,
  clear,
  fixed,
  glyphFont,
  hash,
} from "./engine";
import type { Cells, Frame, Scene, SceneApi } from "./engine";

const COLUMNS = 54;
/** Where the horizon sits, as a share of the height. */
const HORIZON = 0.45;
/** Width of the view at one unit of depth. */
const FOV = 1.15;
const PROJECTION = 1.1;
const NEAR = 0.35;
const FAR = 16;
/** Each step of a ray is this much longer than the depth it starts from. */
const GROWTH = 0.042;
const MAX_STEPS = 90;
const FOG = 8;

const RELIEF = 1.5;
/** Summit cells per world unit. */
const SUMMITS = 0.7;
/** The share of cells left without a summit. */
const BARE = 0.15;
/** Above 1 the flanks hollow out toward the top, like a horn. */
const FLANK = 1.2;
const WARP = 0.5;
const WARP_FREQUENCY = 0.8;
const ROLL = 0.12;
const ROLL_FREQUENCY = 0.45;
const CRAG = 0.3;
/** How much of the crags the ground keeps away from any summit. */
const FOOTHILLS = 0.45;
const CRAG_FREQUENCY = 1.1;
const LACUNARITY = 2.07;
const OCTAVE_SHIFT = 17.3;
const TURN_COS = 0.8;
const TURN_SIN = 0.6;
const NEAR_OCTAVES = 3;
const MID_OCTAVES = 2;
const FAR_OCTAVES = 1;
const MID_DISTANCE = 2.5;
const FAR_DISTANCE = 6;

const LIGHT_X = -0.8;
const LIGHT_Y = 0.3;
const LIGHT_Z = -0.52;
const SLOPE_REACH = 0.12;
const SLOPE_SPREAD = 0.03;
/** Faces turned less than this toward the sun stay in shade. */
const SHADE = 0.12;
const AMBIENT = 0.06;
/** How much of its light the lowest ground keeps. */
const VALLEY_LIGHT = 0.45;
const SUN_LIGHT = 1.5;
/** A cell is a ridge when what shows above it is this many times further. */
const RIDGE_GAP = 1.3;
const RIDGE_LIGHT = 0.45;
/** Crests above this take the accent; above the cap, whole faces do. */
const SNOW_LINE = 0.62;
const SNOW_CAP = 0.85;
const SNOW_LIT = 0.2;
const SNOW_INK = 0.9;
const DITHER = 0.03;
const FAINTEST = 0.02;
const STARS = 0.035;

/** The depth at which the ground follows the pointer exactly. */
const GRIP_DEPTH = 2.4;
const FORWARD_GAIN = 1.6;
const GLIDE_TAU = 900;
/** World units per ms. */
const IDLE_SPEED = 2.4e-4;
/** A fling faster than this would only strobe. */
const MAX_SPEED = 5e-3;
const CLEARANCE = 0.3;
/** The altitude held over the valleys, so the peaks stand above the horizon. */
const CRUISE = 0.55;
/** The ground right under the camera keeps this share of its relief. */
const NEAR_RELIEF = 0.3;
const FULL_RELIEF = 3;
/** Nothing stands above a cone opening ahead of the camera, so no slope walls the view. */
const CONE_DIP = 0.35;
const CONE_SLOPE = 0.9;
const LOOKAHEAD = 0.55;
const CLIMB_TAU = 420;
const MIN_CLEARANCE = 0.16;

/** Cells per side of the lattice the caches cover before they wrap. */
const CACHE_SPAN = 128;
const CACHE_SLOTS = CACHE_SPAN * CACHE_SPAN;
const PER_SLOT = 4;
/** A cell no sample reaches, so an empty slot never passes for a filled one. */
const NO_CELL = 2 ** 31 - 1;

/** The slot a lattice cell falls in: the lattice wraps, so far cells share one. */
const slotOf = (cellX: number, cellZ: number) =>
  cellX -
  Math.floor(cellX / CACHE_SPAN) * CACHE_SPAN +
  (cellZ - Math.floor(cellZ / CACHE_SPAN) * CACHE_SPAN) * CACHE_SPAN;

/**
 * The hashes at a lattice cell's four corners, kept from one sample to the
 * next: neighbouring rays read the same few cells thousands of times a frame.
 */
const corners = {
  values: new Float64Array(CACHE_SLOTS * PER_SLOT),
  x: new Int32Array(CACHE_SLOTS).fill(NO_CELL),
  z: new Int32Array(CACHE_SLOTS),
};

/** Per summit cell: its height (0 when bare), its apex and its radius. */
const summits = {
  values: new Float64Array(CACHE_SLOTS * PER_SLOT),
  x: new Int32Array(CACHE_SLOTS).fill(NO_CELL),
  z: new Int32Array(CACHE_SLOTS),
};

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Value noise in [0, 1): lattice hashes blended with a smooth step. */
const noise = (x: number, z: number) => {
  const cellX = Math.floor(x);
  const cellZ = Math.floor(z);
  const blendX = smooth(x - cellX);
  const blendZ = smooth(z - cellZ);
  const slot = slotOf(cellX, cellZ);
  const at = slot * PER_SLOT;
  const { values } = corners;
  if (corners.x[slot] !== cellX || corners.z[slot] !== cellZ) {
    corners.x[slot] = cellX;
    corners.z[slot] = cellZ;
    values[at] = hash(cellX, cellZ);
    values[at + 1] = hash(cellX + 1, cellZ);
    values[at + 2] = hash(cellX, cellZ + 1);
    values[at + 3] = hash(cellX + 1, cellZ + 1);
  }
  const a = values[at];
  const b = values[at + 1];
  const c = values[at + 2];
  const d = values[at + 3];
  return (
    a + (b - a) * blendX + (c - a) * blendZ + (a - b - c + d) * blendX * blendZ
  );
};

/** One cell's summit: a cone around an apex placed inside the cell, 0 where it does not reach. */
const summitAt = (cellX: number, cellZ: number, u: number, v: number) => {
  const slot = slotOf(cellX, cellZ);
  const at = slot * PER_SLOT;
  const { values } = summits;
  if (summits.x[slot] !== cellX || summits.z[slot] !== cellZ) {
    summits.x[slot] = cellX;
    summits.z[slot] = cellZ;
    const seed = hash(cellX + 0.37, cellZ - 0.91);
    values[at] = seed < BARE ? 0 : 0.35 + (0.65 * (seed - BARE)) / (1 - BARE);
    values[at + 1] = cellX + 0.25 + 0.5 * hash(cellX - 7.1, cellZ + 3.3);
    values[at + 2] = cellZ + 0.25 + 0.5 * hash(cellX + 11.7, cellZ + 5.9);
    values[at + 3] = 0.55 + 0.2 * hash(cellX + 2.2, cellZ - 8.4);
  }
  const peak = values[at];
  if (peak === 0) {
    return 0;
  }
  const offsetX = u - values[at + 1];
  const offsetZ = v - values[at + 2];
  // oxlint-disable-next-line unicorn/prefer-modern-math-apis -- Math.hypot is the costliest call of the ray march and allocates; the picture is the same
  const away = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ);
  const flank = 1 - away / values[at + 3];
  if (flank <= 0) {
    return 0;
  }
  return peak * flank ** FLANK;
};

/**
 * What the last `heightAt` found on the way, so the light on that very point
 * is not worked out twice.
 */
const sampled = {
  /** The crags without their finest octave. */
  coarseCrags: 0,
  roll: 0,
  summit: 0,
};

/** Ridged noise that roughens the flanks, stronger the higher the ground. */
const cragsAt = (x: number, z: number, octaves: number) => {
  let amplitude = CRAG;
  let frequency = CRAG_FREQUENCY;
  let sum = 0;
  let u = x;
  let v = z;
  sampled.coarseCrags = 0;
  for (let octave = 0; octave < octaves; octave += 1) {
    sampled.coarseCrags = sum;
    const shift = octave * OCTAVE_SHIFT;
    const crest =
      1 - Math.abs(2 * noise(u * frequency + shift, v * frequency - shift) - 1);
    sum += (crest * crest - 0.3) * amplitude;
    amplitude *= 0.5;
    frequency *= LACUNARITY;
    // Each octave is turned, so the lattice never lines up with the view.
    const turned = u * TURN_COS - v * TURN_SIN;
    v = u * TURN_SIN + v * TURN_COS;
    u = turned;
  }
  return sum;
};

/**
 * The ground: the tallest of the nearby summits, looked up through a warp so
 * no two are round, on rolling ground and roughened by crags.
 */
const heightAt = (x: number, z: number, octaves: number) => {
  const warpX = noise(x * WARP_FREQUENCY, z * WARP_FREQUENCY) - 0.5;
  const warpZ = noise(x * WARP_FREQUENCY + 31, z * WARP_FREQUENCY - 17) - 0.5;
  const u = (x + warpX * WARP) * SUMMITS;
  const v = (z + warpZ * WARP) * SUMMITS;
  // A summit reaches at most three quarters of a cell, so four cells cover it.
  const cellX = Math.floor(u - 0.5);
  const cellZ = Math.floor(v - 0.5);
  const summit = Math.max(
    summitAt(cellX, cellZ, u, v),
    summitAt(cellX + 1, cellZ, u, v),
    summitAt(cellX, cellZ + 1, u, v),
    summitAt(cellX + 1, cellZ + 1, u, v)
  );
  const roll = ROLL * noise(x * ROLL_FREQUENCY + 9, z * ROLL_FREQUENCY);
  sampled.roll = roll;
  sampled.summit = summit;
  return Math.max(
    0,
    summit + roll + cragsAt(x, z, octaves) * (FOOTHILLS + summit)
  );
};

/** Relief swells with distance, so the camera rides low and the range stands ahead. */
const reliefAt = (distance: number) =>
  RELIEF *
  (NEAR_RELIEF + (1 - NEAR_RELIEF) * smooth(clamp01(distance / FULL_RELIEF)));

const octavesAt = (depth: number) => {
  if (depth < MID_DISTANCE) {
    return NEAR_OCTAVES;
  }
  return depth < FAR_DISTANCE ? MID_OCTAVES : FAR_OCTAVES;
};

/** Haze thickens with distance and swallows the far edge of the field. */
const fogAt = (distance: number) =>
  Math.exp(-distance / FOG) * clamp01((FAR - distance) / (FAR * 0.3));

/**
 * Every ray walks the same distances, so what depends on the distance alone is
 * worked out once: the detail, the relief and the haze at each step.
 */
const RAY = (() => {
  const distances: number[] = [];
  for (
    let distance = NEAR;
    distances.length < MAX_STEPS && distance < FAR;
    distance += distance * GROWTH
  ) {
    distances.push(distance);
  }
  return {
    distances: Float64Array.from(distances),
    fog: Float64Array.from(distances, fogAt),
    octaves: Uint8Array.from(distances, octavesAt),
    relief: Float64Array.from(distances, reliefAt),
    // The field keeps its depths in single precision, and the rim reads them back.
    rimFog: Float64Array.from(distances, (distance) =>
      Math.sqrt(fogAt(Math.fround(distance)))
    ),
  };
})();

/**
 * Lambert light on the slope, dimmed toward the valleys, before the fog. Reads
 * the point `heightAt` sampled last, which has to be this one.
 */
const lightAt = (x: number, z: number, height: number, step: number) => {
  // One octave fewer than the silhouette, so faces read as light or shade.
  const octaves = RAY.octaves[step] - 1;
  const reach = SLOPE_REACH + RAY.distances[step] * SLOPE_SPREAD;
  const base = Math.max(
    0,
    sampled.summit +
      sampled.roll +
      sampled.coarseCrags * (FOOTHILLS + sampled.summit)
  );
  const slopeX = ((heightAt(x + reach, z, octaves) - base) / reach) * RELIEF;
  const slopeZ = ((heightAt(x, z + reach, octaves) - base) / reach) * RELIEF;
  const facing =
    (LIGHT_Y - slopeX * LIGHT_X - slopeZ * LIGHT_Z) /
    Math.hypot(slopeX, 1, slopeZ);
  const altitude = VALLEY_LIGHT + (1 - VALLEY_LIGHT) * clamp01(height * 1.5);
  const lit = clamp01((facing - SHADE) * SUN_LIGHT);
  return (AMBIENT + (1 - AMBIENT) * lit) * altitude;
};

interface Camera {
  height: number;
  x: number;
  z: number;
}

interface Field {
  /** Distance to the ground a cell shows, 0 for the sky. */
  depth: Float32Array;
  /** The dither noise of a cell. */
  grain: Float64Array;
  /** How high the ground stands as drawn, in summit heights. */
  high: Float32Array;
  light: Float32Array;
  /** The noise that decides which sky cells hold a star. */
  stars: Float64Array;
  /** The ray step that reached the ground a cell shows. */
  step: Uint8Array;
}

const fieldFor = ({ cols, count, rows }: Cells): Field => {
  const field: Field = {
    depth: new Float32Array(count),
    grain: new Float64Array(count),
    high: new Float32Array(count),
    light: new Float32Array(count),
    stars: new Float64Array(count),
    step: new Uint8Array(count),
  };
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      field.grain[index] = hash(row, col);
      field.stars[index] = hash(col, row);
    }
  }
  return field;
};

/**
 * One column of the view, nearest ground first: each sample further out only
 * shows where it rises above everything already drawn.
 */
const marchColumn = (
  col: number,
  camera: Camera,
  { cols, rows }: Cells,
  field: Field
) => {
  const { depth, high, light } = field;
  const spread = ((col + 0.5) / cols - 0.5) * FOV;
  const horizon = rows * HORIZON;
  const scale = rows * PROJECTION;
  let free = rows;
  for (let step = 0; step < RAY.distances.length && free > 0; step += 1) {
    const distance = RAY.distances[step];
    const x = camera.x + spread * distance;
    const z = camera.z + distance;
    const height = heightAt(x, z, RAY.octaves[step]);
    const ground = Math.min(
      height * RAY.relief[step],
      camera.height - CONE_DIP + distance * CONE_SLOPE
    );
    const top = Math.max(
      0,
      Math.floor(horizon + ((camera.height - ground) / distance) * scale)
    );
    if (top < free) {
      const value = lightAt(x, z, height, step) * RAY.fog[step];
      for (let row = top; row < free; row += 1) {
        const index = row * cols + col;
        depth[index] = distance;
        high[index] = ground / RELIEF;
        light[index] = value;
        field.step[index] = step;
      }
      free = top;
    }
  }
};

const glyphFor = (value: number, noiseAt: number) =>
  RAMP[
    Math.max(
      1,
      Math.min(
        RAMP.length - 1,
        Math.floor((value + (noiseAt - 0.5) * DITHER) * RAMP.length)
      )
    )
  ];

const paintSky = (
  { ctx, palette }: Frame,
  seed: number,
  x: number,
  y: number
) => {
  if (seed < STARS) {
    ctx.globalAlpha = DIM + seed * 6;
    ctx.fillStyle = palette.foreground;
    ctx.fillText(seed < STARS / 3 ? "+" : ".", x, y);
  }
};

const paint = (frame: Frame, cells: Cells, field: Field) => {
  const { ctx, palette } = frame;
  const { cell, cols, originX, originY, rows } = cells;
  const { depth, grain, high, light, stars, step } = field;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const x = originX + (col + 0.5) * cell;
      const y = originY + (row + 0.5) * cell;
      const distance = depth[index];
      if (distance === 0) {
        paintSky(frame, stars[index], x, y);
      } else {
        const above = row > 0 ? depth[index - cols] : 0;
        const isRidge = above === 0 || above > distance * RIDGE_GAP;
        const rimFog = RAY.rimFog[step[index]];
        // The rim fades slower than the faces, so far crests still draw a skyline.
        const rim = isRidge ? RIDGE_LIGHT * rimFog : 0;
        const value = light[index] + rim;
        const isSnow =
          (high[index] > SNOW_CAP && light[index] > SNOW_LIT) ||
          (isRidge && high[index] > SNOW_LINE);
        if (value > FAINTEST) {
          const alpha = clamp01(0.26 + value * 0.74);
          // Snow keeps its colour through the haze: a tint needs more ink to read.
          ctx.globalAlpha = isSnow ? Math.max(alpha, SNOW_INK * rimFog) : alpha;
          ctx.fillStyle = isSnow ? palette.hot : palette.foreground;
          ctx.fillText(glyphFor(value, grain[index]), x, y);
        }
      }
    }
  }
};

const groundAt = (x: number, z: number, distance = 0) =>
  heightAt(x, z, MID_OCTAVES) * reliefAt(distance);

/** The altitude that clears the ground here and just ahead. */
const cruiseAt = (x: number, z: number) =>
  Math.max(
    CRUISE,
    CLEARANCE +
      Math.max(
        groundAt(x, z),
        groundAt(x, z + LOOKAHEAD, LOOKAHEAD),
        groundAt(x, z + LOOKAHEAD * 2, LOOKAHEAD * 2)
      )
  );

export const createTerrain = ({ report }: SceneApi): Scene => {
  const camera: Camera = { height: 0, x: 20, z: 40 };
  /** The camera the canvas shows, to tell a frame that would change nothing. */
  const drawn: Camera = { height: 0, x: 0, z: 0 };
  const speed = { x: 0, z: 0 };
  const caught = { x: 0, z: 0 };
  let cells: Cells | null = null;
  let field: Field | null = null;
  let font = "";
  let held = false;
  let placed = false;

  return {
    draw: (frame) => {
      const { ctx, dt, reducedMotion } = frame;
      if (frame.resized || !cells || !field) {
        cells = cellsFor(frame, COLUMNS);
        field = fieldFor(cells);
        font = glyphFont(cells.cell * 0.84);
      }
      if (reducedMotion) {
        speed.x = 0;
        speed.z = 0;
      } else if (!held) {
        speed.x = approach(speed.x, 0, dt, GLIDE_TAU);
        speed.z = approach(speed.z, IDLE_SPEED, dt, GLIDE_TAU);
        camera.x += speed.x * dt;
        camera.z += speed.z * dt;
      }

      const ground = groundAt(camera.x, camera.z);
      const cruise = cruiseAt(camera.x, camera.z);
      const eased =
        placed && !reducedMotion
          ? approach(camera.height, cruise, dt, CLIMB_TAU)
          : cruise;
      camera.height = Math.max(eased, ground + MIN_CLEARANCE);
      placed = true;

      field.depth.fill(0);
      for (let col = 0; col < cells.cols; col += 1) {
        marchColumn(col, camera, cells, field);
      }
      clear(frame);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      paint(frame, cells, field);

      const pace = Math.hypot(speed.x, speed.z) * 1000;
      report(
        `x ${fixed(camera.x, 1, 6)} · z ${fixed(camera.z, 1, 6)} · v ${fixed(pace, 2, 5)} · agl ${fixed(camera.height - ground, 2)}`
      );
      const moved =
        camera.x !== drawn.x ||
        camera.z !== drawn.z ||
        camera.height !== drawn.height;
      drawn.x = camera.x;
      drawn.z = camera.z;
      drawn.height = camera.height;
      // Held ground only moves on a drag, which wakes the loop, or while the
      // camera still eases to its altitude.
      return held ? moved : !reducedMotion;
    },
    drag: ({ startX, startY, x, y }, { width }) => {
      const pan = (FOV * GRIP_DEPTH) / width;
      camera.x = caught.x - (x - startX) * pan;
      camera.z = caught.z + (y - startY) * pan * FORWARD_GAIN;
    },
    press: () => {
      held = true;
      caught.x = camera.x;
      caught.z = camera.z;
      speed.x = 0;
      speed.z = 0;
    },
    release: ({ vx, vy }, { reducedMotion, width }) => {
      held = false;
      if (!reducedMotion) {
        const pan = (FOV * GRIP_DEPTH) / width;
        const flungX = -vx * pan;
        const flungZ = vy * pan * FORWARD_GAIN;
        const limit = Math.min(1, MAX_SPEED / Math.hypot(flungX, flungZ, 1e-9));
        speed.x = flungX * limit;
        speed.z = flungZ * limit;
      }
    },
  };
};

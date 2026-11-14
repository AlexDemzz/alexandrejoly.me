import {
  approach,
  cellsFor,
  clamp01,
  clear,
  createRandom,
  fixed,
  glyphFont,
  hash,
} from "./engine";
import type { Cells, Frame, Scene, SceneApi } from "./engine";

const COLUMNS = 54;
const SEED = 23;

/** Light to dense, without the flat strokes that would read as rules. */
const CLOUD = " .:;+*%#@";
const BOLT = " |/\\_";
const STRAIGHT = 1;
const LEFTWARD = 2;
const RIGHTWARD = 3;

/** Where the pointer is not steering it, the wind leans this way. */
const IDLE_WIND = 0.32;
const WIND_TAU = 420;
/** Columns a drop slides per row it falls, in a full wind. */
const SLANT = 0.8;
const UPRIGHT = 0.2;
/** Columns the clouds drift per ms, in a full wind. */
const DRIFT = 0.0026;
/** How fast the clouds boil in place, in noise units per ms. */
const CHURN = 0.00007;

const OCTAVES = 4;
/** How much finer each octave is than the one before. */
const LACUNARITY = 2.03;
/** What moves each octave off the others' lattice. */
const OCTAVE_SHIFT_X = 17.3;
const OCTAVE_SHIFT_Y = 5.1;
/** Lattice values around a sample, and how many sit on each side of it. */
const CORNERS = 8;
const SIDE = 4;
/** What the billowed noise averages, and how hard it swells the clouds. */
const PUFF_MEAN = 0.37;
const PUFF = 1.9;
const CLOUD_X = 0.07;
const CLOUD_Y = 0.1;
/** Share of the height the clouds may reach down to. */
const CLOUD_ROWS = 0.68;
const CROWN = 0.14;
const BELLY = 0.28;
const BASE = 0.66;
const CROWN_MASS = 0.12;
const BELLY_MASS = 0.3;
const BASE_MASS = -0.62;
/** Thickness over which a cloud's edge goes from sky to solid. */
const SOFT = 0.13;
const THIN = 0.1;
/** Cells either side of a cell its slope is read over. */
const SPAN = 2;
const RELIEF = 4.6;
const LIGHT_X = 0.45;
const LIGHT_Y = 0.9;
const AMBIENT = 0.15;
const CROWN_LIGHT = 0.15;
const DARKEST = 0.07;
const BRIGHTEST = 0.68;
const DITHER = 0.1;
const HOT_CLOUD = 0.9;
/** Only the cloud right around the bolt's root, or a sheet's heart, takes the accent. */
const HOT_CORE = 0.55;
const ROOT_REACH = 0.13;
/** Rows above the cloud base the glow is centred, inside the cloud. */
const ROOT_DEPTH = 3;

const RAIN_TOP = 0.3;
const DROPS_PER_CELL = 0.13;
const TAIL = 4;
const GLYPH_SIZE = 0.86;

const FAR_BASE = 0.79;
const NEAR_BASE = 0.87;
const NEAR_TONE = 0.66;
const FAR_TONE = 0.4;
const SKYLINE = 0.2;
/** Light past which a rim cell swaps to the densest glyph. */
const RIM_LIT = 0.3;
const TREE_AT = 0.73;
const HOUSE_AT = 0.22;
/** The house, in cells: half its width, its walls, and where the chimney stands. */
const HALF = 5;
const WALL = 4;
const CHIMNEY = 3;

const ATTACK = 28;
/** The flash is down to a few percent 400 ms after the strike. */
const DECAY = 135;
const ECHO_AFTER = 120;
const ECHO = 0.6;
const STILL_DECAY = 400;
const STRIKE_LIFE = 1100;
const STILL_LIFE = 2200;
/** Time the leader takes to run from the cloud to the ground. */
const LEADER = 55;
const FLASH_FLOOR = 0.2;
const FLASH_GAIN = 1.7;
const FLASH_FILL = 0.3;
/** How far the flash carries sideways, as a share of the width. */
const FLASH_REACH = 0.32;
const FORK = 0.17;
/** Share of the height past which a bolt no longer looks for its cloud. */
const BOLT_LOWEST = 0.5;
const BOLT_SIZE = 1.5;
const BOLT_WEIGHT = 800;
const BOLT_GONE = 0.02;
const HOMING = 0.22;

const SHEET_EVERY = 4700;
const SHEET_REACH = 0.3;

const smooth = (t: number) => t * t * (3 - 2 * t);

const mix = (from: number, to: number, t: number) => from + (to - from) * t;

const lattice = (x: number, y: number, z: number) =>
  hash(x + z * 37.7, y - z * 71.3);

/** How finely each octave samples the lattice, and how much it weighs. */
const OCTAVE_SCALES = [1, LACUNARITY, LACUNARITY * LACUNARITY];
OCTAVE_SCALES.push(OCTAVE_SCALES[2] * LACUNARITY);
const OCTAVE_WEIGHTS = [0.5, 0.25, 0.125, 0.0625];

/**
 * The lattice around the cell being sampled, per octave. Along a row only the
 * lattice column changes, and only every few cells, so its values are read
 * once per column instead of once per cell.
 */
interface NoiseRow {
  cellY: Float64Array;
  cellZ: Float64Array;
  /** Per octave, the four lattice values left of the sample, then the four right. */
  corners: Float64Array;
  /** Per octave, the lattice column `corners` holds. */
  held: Float64Array;
  v: Float64Array;
  w: Float64Array;
}

const createNoiseRow = (): NoiseRow => ({
  cellY: new Float64Array(OCTAVES),
  cellZ: new Float64Array(OCTAVES),
  corners: new Float64Array(OCTAVES * CORNERS),
  held: new Float64Array(OCTAVES),
  v: new Float64Array(OCTAVES),
  w: new Float64Array(OCTAVES),
});

const startRow = (noise: NoiseRow, y: number, z: number) => {
  for (let octave = 0; octave < OCTAVES; octave += 1) {
    const scale = OCTAVE_SCALES[octave];
    const atY = y * scale + octave * OCTAVE_SHIFT_Y;
    const atZ = z * scale;
    noise.cellY[octave] = Math.floor(atY);
    noise.cellZ[octave] = Math.floor(atZ);
    noise.v[octave] = smooth(atY - noise.cellY[octave]);
    noise.w[octave] = smooth(atZ - noise.cellZ[octave]);
    noise.held[octave] = Number.NaN;
  }
};

const readSide = (
  corners: Float64Array,
  at: number,
  x: number,
  y: number,
  z: number
) => {
  corners[at] = lattice(x, y, z);
  corners[at + 1] = lattice(x, y + 1, z);
  corners[at + 2] = lattice(x, y, z + 1);
  corners[at + 3] = lattice(x, y + 1, z + 1);
};

const moveTo = (noise: NoiseRow, octave: number, cellX: number) => {
  const { cellY, cellZ, corners, held } = noise;
  const base = octave * CORNERS;
  if (cellX === held[octave] + 1) {
    corners.copyWithin(base, base + SIDE, base + CORNERS);
  } else {
    readSide(corners, base, cellX, cellY[octave], cellZ[octave]);
  }
  readSide(corners, base + SIDE, cellX + 1, cellY[octave], cellZ[octave]);
  held[octave] = cellX;
};

/**
 * Cloud noise in [0, 1) at `x` along the row: one broad octave of smooth value
 * noise for the masses, then finer ones folded about their middle, so they
 * crease where they cross it and swell in between, like the lobes of a cumulus.
 */
const layered = (noise: NoiseRow, x: number) => {
  const { corners, held, v, w } = noise;
  let sum = 0;
  for (let octave = 0; octave < OCTAVES; octave += 1) {
    const at = x * OCTAVE_SCALES[octave] + octave * OCTAVE_SHIFT_X;
    const cellX = Math.floor(at);
    if (cellX !== held[octave]) {
      moveTo(noise, octave, cellX);
    }
    const base = octave * CORNERS;
    const u = smooth(at - cellX);
    const near = mix(
      mix(corners[base], corners[base + SIDE], u),
      mix(corners[base + 1], corners[base + SIDE + 1], u),
      v[octave]
    );
    const far = mix(
      mix(corners[base + 2], corners[base + SIDE + 2], u),
      mix(corners[base + 3], corners[base + SIDE + 3], u),
      v[octave]
    );
    const value = mix(near, far, w[octave]);
    sum +=
      OCTAVE_WEIGHTS[octave] * (octave === 0 ? value : Math.abs(2 * value - 1));
  }
  return sum;
};

/** How much cloud a height holds before any noise: thin crown, full belly, no base. */
const mass = (v: number) =>
  v < CROWN
    ? mix(CROWN_MASS, BELLY_MASS, smooth(v / CROWN))
    : mix(BELLY_MASS, BASE_MASS, smooth(clamp01((v - BELLY) / (BASE - BELLY))));

const pulse = (since: number) =>
  since <= 0 ? 0 : Math.min(1, since / ATTACK) * Math.exp(-since / DECAY);

/** A flash and its echo: fast in, exponential out, then a weaker second beat. */
const flicker = (since: number) =>
  Math.min(1, pulse(since) * 1.25 + ECHO * pulse(since - ECHO_AFTER) * 1.25);

interface Sky {
  cover: Float32Array;
  /** The clouds' own light, before any lightning. */
  shade: Float32Array;
  thick: Float32Array;
}

/** Fills the cloud deck: its coverage per cell, lit from the upper left like a relief. */
const billow = (
  { noise, sky }: World,
  { cols, rows }: Cells,
  drift: number,
  churn: number
) => {
  const deck = Math.min(rows, Math.ceil(rows * CLOUD_ROWS) + SPAN);
  for (let row = 0; row < deck; row += 1) {
    const weight = mass((row + 0.5) / rows);
    startRow(noise, row * CLOUD_Y, churn);
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const thick =
        (layered(noise, (col - drift) * CLOUD_X) - PUFF_MEAN) * PUFF + weight;
      sky.thick[index] = thick;
      sky.cover[index] = clamp01(thick / SOFT);
    }
  }
  for (let row = 0; row < deck - SPAN; row += 1) {
    const height = 1 - clamp01((row + 0.5) / rows / BASE);
    const up = Math.max(0, row - SPAN) * cols;
    const down = (row + SPAN) * cols;
    for (let col = 0; col < cols; col += 1) {
      const left = Math.max(0, col - SPAN);
      const right = Math.min(cols - 1, col + SPAN);
      const slopeX =
        sky.thick[row * cols + right] - sky.thick[row * cols + left];
      const slopeY = sky.thick[down + col] - sky.thick[up + col];
      const facing = (slopeX * LIGHT_X + slopeY * LIGHT_Y) * RELIEF;
      sky.shade[row * cols + col] = Math.max(
        DARKEST,
        Math.min(BRIGHTEST, AMBIENT + CROWN_LIGHT * height + facing)
      );
    }
  }
};

interface Land {
  /** 0 is sky, 1 the far ridge, 2 the near ground and what stands on it. */
  kind: Uint8Array;
  rimLeft: Uint8Array;
  rimRight: Uint8Array;
  /** How open to the sky above a cell is: 1 on the skyline, less just under it. */
  rimTop: Float32Array;
  /** The left cell of the lit window, two cells wide. */
  window: number;
}

const farRidge = (u: number) =>
  FAR_BASE + 0.035 * Math.sin(u * 5.3 + 2.2) + 0.014 * Math.sin(u * 13.1);

const nearRidge = (u: number) =>
  NEAR_BASE + 0.045 * Math.sin(u * 3.4 + 0.5) + 0.012 * Math.sin(u * 9.7 + 1);

const groundRow = ({ cols, rows }: Cells, col: number) =>
  Math.floor(nearRidge((col + 0.5) / cols) * rows);

/** A lone tree: a trunk and a ragged round crown. */
const plantTree = (land: Land, cells: Cells) => {
  const { cols } = cells;
  const size = cols / COLUMNS;
  const trunk = Math.round(cols * TREE_AT);
  const foot = groundRow(cells, trunk);
  const height = Math.round(7 * size);
  for (let row = foot - height; row < foot; row += 1) {
    land.kind[row * cols + trunk] = 2;
    land.kind[row * cols + trunk + 1] = 2;
  }
  const radiusX = 5.6 * size;
  const radiusY = 4.4 * size;
  const centerY = foot - height - radiusY * 0.75;
  const reach = Math.ceil(radiusX) + 1;
  for (let dy = -reach; dy <= reach; dy += 1) {
    for (let dx = -reach; dx <= reach; dx += 1) {
      const col = trunk + dx;
      const row = Math.round(centerY) + dy;
      const ragged = 1 + (hash(col * 3.1, row * 1.7) - 0.5) * 0.5;
      const inside = (dx / radiusX) ** 2 + (dy / radiusY) ** 2 < ragged;
      if (inside && col >= 0 && col < cols && row >= 0) {
        land.kind[row * cols + col] = 2;
      }
    }
  }
};

/** A small house: walls, a pitched roof with a chimney, and one lit window. */
const buildHouse = (land: Land, cells: Cells) => {
  const { cols } = cells;
  const middle = Math.round(cols * HOUSE_AT);
  const foot = groundRow(cells, middle) + 1;
  const eaves = foot - WALL;
  for (let row = eaves; row <= foot; row += 1) {
    for (let col = middle - HALF; col <= middle + HALF; col += 1) {
      land.kind[row * cols + col] = 2;
    }
  }
  for (let step = 0; step <= HALF + 1; step += 1) {
    const reach = HALF + 1 - step;
    for (let col = middle - reach; col <= middle + reach; col += 1) {
      land.kind[(eaves - 1 - step) * cols + col] = 2;
    }
  }
  for (let row = eaves - HALF - 1; row < eaves - 3; row += 1) {
    land.kind[row * cols + middle + CHIMNEY] = 2;
  }
  land.window = (eaves + 1) * cols + middle - 2;
};

const buildLand = (cells: Cells): Land => {
  const { cols, count, rows } = cells;
  const land: Land = {
    kind: new Uint8Array(count),
    rimLeft: new Uint8Array(count),
    rimRight: new Uint8Array(count),
    rimTop: new Float32Array(count),
    window: -1,
  };
  for (let index = 0; index < count; index += 1) {
    const u = ((index % cols) + 0.5) / cols;
    const v = Math.floor(index / cols) / rows;
    if (v >= nearRidge(u)) {
      land.kind[index] = 2;
    } else if (v >= farRidge(u)) {
      land.kind[index] = 1;
    }
  }
  plantTree(land, cells);
  buildHouse(land, cells);
  for (let index = cols * 2; index < count; index += 1) {
    const col = index % cols;
    const kind = land.kind[index];
    if (kind > 0) {
      if (land.kind[index - cols] < kind) {
        land.rimTop[index] = 1;
      } else if (land.kind[index - 2 * cols] < kind) {
        land.rimTop[index] = 0.35;
      }
      land.rimLeft[index] = col > 0 && land.kind[index - 1] < kind ? 1 : 0;
      land.rimRight[index] =
        col < cols - 1 && land.kind[index + 1] < kind ? 1 : 0;
    }
  }
  return land;
};

interface Rain {
  count: number;
  /** Rows fallen per ms. */
  speed: Float32Array;
  tone: Float32Array;
  x: Float32Array;
  y: Float32Array;
}

const buildRain = ({ cols, count, rows }: Cells): Rain => {
  const drops = Math.round(count * DROPS_PER_CELL);
  const random = createRandom(SEED);
  const rain: Rain = {
    count: drops,
    speed: new Float32Array(drops),
    tone: new Float32Array(drops),
    x: new Float32Array(drops),
    y: new Float32Array(drops),
  };
  const top = rows * RAIN_TOP;
  for (let drop = 0; drop < drops; drop += 1) {
    const near = random();
    rain.x[drop] = random() * cols;
    rain.y[drop] = top + random() * (rows - top);
    rain.speed[drop] = (rows * (0.3 + 0.4 * near)) / 1000;
    rain.tone[drop] = 0.4 + 0.6 * near;
  }
  return rain;
};

const fall = (rain: Rain, { cols, rows }: Cells, slant: number, dt: number) => {
  const span = rows * (1 - RAIN_TOP);
  for (let drop = 0; drop < rain.count; drop += 1) {
    const step = rain.speed[drop] * dt;
    const y = rain.y[drop] + step;
    const x = rain.x[drop] + step * slant;
    rain.y[drop] = y >= rows ? y - span : y;
    rain.x[drop] = ((x % cols) + cols) % cols;
  }
};

/** Writes each drop and its fading tail into the grid, along the wind. */
const streak = (
  rain: Rain,
  { cols, rows }: Cells,
  slant: number,
  wet: Float32Array
) => {
  wet.fill(0);
  for (let drop = 0; drop < rain.count; drop += 1) {
    const row = Math.floor(rain.y[drop]);
    for (let link = 0; link < TAIL; link += 1) {
      const at = row - link;
      const shifted = Math.floor(rain.x[drop] - slant * link);
      const col = ((shifted % cols) + cols) % cols;
      const strength = rain.tone[drop] * (1 - link / TAIL);
      const index = at * cols + col;
      if (at >= 0 && at < rows && strength > wet[index]) {
        wet[index] = strength;
      }
    }
  }
};

interface Bolt {
  /** Index into `BOLT`; 0 where the bolt does not pass. */
  glyph: Uint8Array;
  top: number;
  weight: Float32Array;
}

interface Leader {
  col: number;
  forks: boolean;
  home: number;
  lean: number;
  reach: number;
  row: number;
  weight: number;
}

const turnOf = (roll: number) => {
  if (roll > 0.42) {
    return 1;
  }
  return roll < -0.42 ? -1 : 0;
};

const strokeOf = (turn: number) => {
  if (turn === 0) {
    return STRAIGHT;
  }
  return turn > 0 ? RIGHTWARD : LEFTWARD;
};

/** Walks a leader down the grid, cell by cell, forking as it goes, until it lands. */
const etch = (
  bolt: Bolt,
  cells: Cells,
  land: Land,
  leader: Leader,
  random: () => number
) => {
  const { cols, rows } = cells;
  let { col, row } = leader;
  for (let step = 0; step < leader.reach && row < rows; step += 1) {
    const index = row * cols + col;
    if (land.kind[index] === 2) {
      return;
    }
    const pull = leader.lean + Math.sign(leader.home - col) * HOMING;
    const turn = turnOf(random() * 2 - 1 + pull);
    if (leader.weight > bolt.weight[index]) {
      bolt.glyph[index] = strokeOf(turn);
      bolt.weight[index] = leader.weight;
    }
    if (leader.forks && step > 2 && random() < FORK) {
      const side = random() < 0.5 ? -1 : 1;
      const from = Math.max(1, Math.min(cols - 2, col + side));
      etch(
        bolt,
        cells,
        land,
        {
          col: from,
          forks: false,
          home: from,
          lean: side * 0.7,
          reach: 3 + Math.floor(random() * 8),
          row: row + 1,
          weight: 0.45 + 0.2 * random(),
        },
        random
      );
    }
    col = Math.max(1, Math.min(cols - 2, col + turn));
    row += 1;
  }
};

/** The row the bolt leaves from: the underside of the deck above `col`. */
const cloudBase = (sky: Sky, { cols, rows }: Cells, col: number) => {
  const lowest = Math.floor(rows * BOLT_LOWEST);
  let row = Math.floor(rows * BELLY);
  while (row < lowest && sky.cover[(row + 1) * cols + col] > 0.5) {
    row += 1;
  }
  return Math.max(1, row - 1);
};

interface Lights {
  /** Column the strike came down, and how far its flash carries. */
  col: number;
  reach: number;
  /** Radius of the glow around the bolt's root, and the root's row. */
  root: number;
  row: number;
  /** Rows of the bolt drawn so far. */
  shown: number;
  sheet: number;
  sheetCol: number;
  sheetReach: number;
  sheetRow: number;
  strike: number;
}

/** Idle lightning inside the clouds, on a fixed timetable. */
const scheduleSheet = (lights: Lights, { cols, rows }: Cells, time: number) => {
  const beat = Math.floor(time / SHEET_EVERY);
  const start = (beat + 0.3 + 0.5 * hash(beat, 5)) * SHEET_EVERY;
  lights.sheet = flicker(time - start) * (0.7 + 0.3 * hash(beat, 9));
  lights.sheetCol = cols * (0.12 + 0.76 * hash(beat, 2));
  lights.sheetRow = rows * (0.12 + 0.22 * hash(beat, 3));
  lights.sheetReach = cols * SHEET_REACH;
};

const strikeAt = (lights: Lights, col: number) =>
  lights.strike *
  (FLASH_FLOOR +
    (1 - FLASH_FLOOR) * Math.exp(-(((col - lights.col) / lights.reach) ** 2)));

/** The strike's light on each column, read by every cell of that column. */
const lightColumns = (flash: Float64Array, lights: Lights) => {
  if (lights.strike === 0) {
    flash.fill(0);
    return;
  }
  for (let col = 0; col < flash.length; col += 1) {
    flash[col] = strikeAt(lights, col);
  }
};

const sheetAt = (lights: Lights, col: number, row: number) =>
  lights.sheet *
  Math.exp(
    -((col - lights.sheetCol) ** 2 + 2.4 * (row - lights.sheetRow) ** 2) /
      lights.sheetReach ** 2
  );

const rootAt = (lights: Lights, col: number, row: number) =>
  lights.strike *
  Math.exp(
    -((col - lights.col) ** 2 + (row - lights.row) ** 2) / lights.root ** 2
  );

/** One cell being painted; reused so the loop allocates nothing. */
interface Spot {
  col: number;
  index: number;
  row: number;
  x: number;
  y: number;
}

const paintCloud = (
  { ctx, palette }: Frame,
  { flash: strike, grain, sky }: World,
  lights: Lights,
  { col, index, row, x, y }: Spot
) => {
  const cover = sky.cover[index];
  // A light that is out adds nothing: its falloff is not worth computing.
  const sheet = lights.sheet === 0 ? 0 : sheetAt(lights, col, row);
  const flash = strike[col] + sheet;
  const core = (lights.strike === 0 ? 0 : rootAt(lights, col, row)) + sheet;
  // A flash multiplies the relief before it fills it, so the clouds keep their volume.
  const light = clamp01(
    sky.shade[index] * (1 + FLASH_GAIN * flash) + FLASH_FILL * flash * cover
  );
  const body = cover * (0.58 + 0.42 * light) + (grain[index] - 0.5) * DITHER;
  const glyph =
    CLOUD[
      Math.max(1, Math.min(CLOUD.length - 1, Math.floor(body * CLOUD.length)))
    ];
  ctx.globalAlpha = cover * (0.26 + 0.74 * light);
  ctx.fillStyle =
    light > HOT_CLOUD && core > HOT_CORE ? palette.hot : palette.foreground;
  ctx.fillText(glyph, x, y);
};

const ground = (near: boolean, lit: number) => {
  if (!near) {
    return ":";
  }
  return lit > RIM_LIT ? "@" : "#";
};

const paintLand = (
  { ctx, palette }: Frame,
  { flash: strike, land }: World,
  lights: Lights,
  { col, index, x, y }: Spot
) => {
  if (index === land.window || index === land.window + 1) {
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = palette.hot;
    ctx.fillText("#", x, y);
    return;
  }
  const near = land.kind[index] === 2;
  const top = land.rimTop[index];
  // The face turned towards the bolt catches it; the far face stays dark.
  const facing = col < lights.col ? land.rimRight[index] : land.rimLeft[index];
  const rim = Math.min(1, top * 0.8 + facing);
  const flash = strike[col] + 0.25 * lights.sheet;
  const tone = near ? NEAR_TONE + SKYLINE * top : FAR_TONE;
  ctx.globalAlpha = clamp01(
    tone + flash * (near ? 0.06 + 0.9 * rim : 0.12 + 0.3 * top)
  );
  ctx.fillStyle = palette.foreground;
  ctx.fillText(ground(near, flash * rim), x, y);
};

const paintRain = (
  { ctx, palette }: Frame,
  strength: number,
  flash: number,
  glyph: string,
  { x, y }: Spot
) => {
  ctx.globalAlpha = clamp01(strength * (0.85 + 0.9 * flash));
  ctx.fillStyle = palette.foreground;
  ctx.fillText(glyph, x, y);
};

/** The bolt, set bolder and larger than the grid so its strokes join up. */
const paintBolt = (
  { ctx, palette }: Frame,
  { bolt, boltFont, cells }: World,
  lights: Lights
) => {
  if (lights.strike <= BOLT_GONE) {
    return;
  }
  const { cell, cols, count, originX, originY } = cells;
  ctx.font = boltFont;
  ctx.fillStyle = palette.hot;
  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / cols);
    if (bolt.glyph[index] > 0 && row <= lights.shown) {
      ctx.globalAlpha = clamp01(
        (0.25 + 1.4 * lights.strike) * bolt.weight[index]
      );
      ctx.fillText(
        BOLT[bolt.glyph[index]],
        originX + ((index % cols) + 0.5) * cell,
        originY + (row + 0.5) * cell
      );
    }
  }
};

const rainGlyph = (slant: number) => {
  if (Math.abs(slant) < UPRIGHT) {
    return "|";
  }
  return slant > 0 ? "\\" : "/";
};

const signed = (value: number) =>
  `${value < 0 ? "−" : "+"}${fixed(Math.abs(value), 2)}`;

interface World {
  bolt: Bolt;
  boltFont: string;
  cells: Cells;
  /** The strike's light, per column. */
  flash: Float64Array;
  font: string;
  /** Each cell's dither, in [0, 1). */
  grain: Float64Array;
  land: Land;
  noise: NoiseRow;
  rain: Rain;
  sky: Sky;
  wet: Float32Array;
}

const buildWorld = (frame: Frame): World => {
  const cells = cellsFor(frame, COLUMNS);
  const { cell, cols, count } = cells;
  const grain = new Float64Array(count);
  for (let index = 0; index < count; index += 1) {
    grain[index] = hash(index % cols, Math.floor(index / cols));
  }
  return {
    bolt: {
      glyph: new Uint8Array(count),
      top: 0,
      weight: new Float32Array(count),
    },
    boltFont: glyphFont(cell * BOLT_SIZE, BOLT_WEIGHT),
    cells,
    flash: new Float64Array(cols),
    font: glyphFont(cell * GLYPH_SIZE),
    grain,
    land: buildLand(cells),
    noise: createNoiseRow(),
    rain: buildRain(cells),
    sky: {
      cover: new Float32Array(count),
      shade: new Float32Array(count),
      thick: new Float32Array(count),
    },
    wet: new Float32Array(count),
  };
};

const paintCell = (
  frame: Frame,
  world: World,
  lights: Lights,
  drop: string,
  spot: Spot
) => {
  const { flash, land, sky, wet } = world;
  const { col, index } = spot;
  if (land.kind[index] > 0) {
    paintLand(frame, world, lights, spot);
  } else if (sky.cover[index] > THIN) {
    paintCloud(frame, world, lights, spot);
  } else if (wet[index] > 0) {
    paintRain(frame, wet[index], flash[col], drop, spot);
  }
};

const paint = (frame: Frame, world: World, lights: Lights, slant: number) => {
  const { ctx } = frame;
  const { bolt, cells } = world;
  const { cell, cols, count, originX, originY } = cells;
  const drop = rainGlyph(slant);
  const spot: Spot = { col: 0, index: 0, row: 0, x: 0, y: 0 };
  const striking = lights.strike > BOLT_GONE;
  lightColumns(world.flash, lights);
  clear(frame);
  ctx.font = world.font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let index = 0; index < count; index += 1) {
    // The bolt owns its cells; it is drawn once the rest is down.
    if (!(striking && bolt.glyph[index] > 0)) {
      spot.index = index;
      spot.col = index % cols;
      spot.row = Math.floor(index / cols);
      spot.x = originX + (spot.col + 0.5) * cell;
      spot.y = originY + (spot.row + 0.5) * cell;
      paintCell(frame, world, lights, drop, spot);
    }
  }
  paintBolt(frame, world, lights);
};

export const createStorm = ({ report }: SceneApi): Scene => {
  const random = createRandom(SEED + 1);
  const lights: Lights = {
    col: 0,
    reach: 1,
    root: 1,
    row: 0,
    sheet: 0,
    sheetCol: 0,
    sheetReach: 1,
    sheetRow: 0,
    shown: 0,
    strike: 0,
  };
  let world: World | null = null;
  let wind = IDLE_WIND;
  let drift = 0;
  let strikes = 0;
  let struckAt = Number.NEGATIVE_INFINITY;

  const flash = ({ reducedMotion, time }: Frame, { cells, bolt }: World) => {
    const since = time - struckAt;
    const life = reducedMotion ? STILL_LIFE : STRIKE_LIFE;
    const level = reducedMotion
      ? Math.exp(-since / STILL_DECAY)
      : flicker(since);
    lights.strike = since < life ? level : 0;
    lights.reach = cells.cols * FLASH_REACH;
    lights.root = cells.cols * ROOT_REACH;
    lights.row = bolt.top - ROOT_DEPTH;
    lights.shown = reducedMotion
      ? cells.rows
      : bolt.top + (since / LEADER) * cells.rows;
    return since < life;
  };

  return {
    draw: (frame) => {
      const { dt, pointer, reducedMotion, time, width } = frame;
      if (frame.resized || !world) {
        world = buildWorld(frame);
        struckAt = Number.NEGATIVE_INFINITY;
      }
      const { cells, rain, wet } = world;
      if (reducedMotion) {
        wind = IDLE_WIND;
        lights.sheet = 0;
      } else {
        const steer = pointer.inside ? (pointer.x / width) * 2 - 1 : IDLE_WIND;
        wind = approach(wind, Math.max(-1, Math.min(1, steer)), dt, WIND_TAU);
        drift += wind * DRIFT * dt;
        fall(rain, cells, wind * SLANT, dt);
        scheduleSheet(lights, cells, time);
      }
      const striking = flash(frame, world);

      billow(world, cells, drift, reducedMotion ? 0 : time * CHURN);
      streak(rain, cells, wind * SLANT, wet);
      paint(frame, world, lights, wind * SLANT);

      const since = (time - struckAt) / 1000;
      const last = strikes === 0 ? "   —" : fixed(Math.min(99.9, since), 1, 4);
      report(
        `strikes ${fixed(strikes, 0, 2)} · wind ${signed(wind)} · last ${last} s`
      );
      return striking || !reducedMotion;
    },
    press: ({ x }, { time, width }) => {
      if (!world) {
        return;
      }
      const { bolt, cells, land, sky } = world;
      const col = Math.max(
        1,
        Math.min(cells.cols - 2, Math.floor((x / width) * cells.cols))
      );
      bolt.glyph.fill(0);
      bolt.weight.fill(0);
      bolt.top = cloudBase(sky, cells, col);
      etch(
        bolt,
        cells,
        land,
        {
          col,
          forks: true,
          home: col,
          lean: 0,
          reach: cells.rows,
          row: bolt.top,
          weight: 1,
        },
        random
      );
      lights.col = col;
      strikes += 1;
      struckAt = time;
    },
  };
};

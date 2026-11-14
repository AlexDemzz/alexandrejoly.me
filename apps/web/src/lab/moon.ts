import {
  DIM,
  RAMP,
  cellsFor,
  clamp01,
  clear,
  createRandom,
  easeOutCubic,
  fixed,
  glyphFont,
  hash,
  springAtRest,
  stepSpring,
} from "./engine";
import type { Cells, Frame, Scene, SceneApi, SpringState } from "./engine";

const PHASES = [
  "new moon",
  "waxing crescent",
  "first quarter",
  "waxing gibbous",
  "full moon",
  "waning gibbous",
  "last quarter",
  "waning crescent",
] as const;

const COLUMNS = 54;
/** The moon's radius, as a share of the grid's shorter side. */
const RADIUS = 0.43;
/** Samples per cell and per axis, so a small crater does not alias away. */
const SUBSAMPLES = 3;
const TAU = Math.PI * 2;
const REST_PHASE = 3;
const INTRO = 1400;
/** How far ahead, in ms, a release looks to pick the phase it lands on. */
const PROJECTION = 180;
/** The hardest flick throws the moon this many phases, in phases per ms. */
const MAX_SPEED = 3.4 / PROJECTION;
const SNAP = { damping: 19, stiffness: 150 };
const SNAP_PRECISION = 0.002;
/** Phases crossed by a drag as wide as the card. */
const PHASES_PER_WIDTH = 4;

const SEED = 11;
const CRATERS = 30;
const CRATER_ATTEMPTS = 600;
/** Closest two craters may sit, in sums of their radii. */
const CRATER_GAP = 1.25;
const CRATER_SPREAD = 0.94;
const CRATER_MIN = 0.075;
const CRATER_RANGE = 0.21;
/** A crater's rim and ejecta end at this many radii from its centre. */
const CRATER_REACH = 1.5;
const FLOOR_TONE = -0.4;
const RIM_TONE = 0.12;
const MARIA_SCALE = 1.9;
const MARIA_DEPTH = 0.32;
const GRAIN = 0.03;
/** The lowest albedo, so a crater inside a mare is not a hole. */
const DARKEST = 0.46;

/** How far past the geometric terminator a raised rim still catches the sun. */
const TWILIGHT = 0.1;
/** Share of Lommel–Seeliger scattering mixed into the Lambert light. */
const SCATTER = 0.65;
const GAMMA = 0.8;
/** Light scattered into the shadows of the day side, so they are not holes. */
const SKYLIGHT = 0.22;
const EARTHSHINE = 0.15;
const DITHER = 0.04;
const HOT_LIGHT = 0.8;
const HOT_SHADE = 0.93;
/** Only cells this close to the limb (by their depth) may take the accent. */
const HOT_LIMB = 0.42;
const STARS = 0.03;
const BRIGHT_STARS = 0.007;
/** Radians per ms: the slowest twinkle, and how much faster the quickest runs. */
const TWINKLE_MIN = 0.0012;
const TWINKLE_SPAN = 0.0028;
const TWINKLE_OFFSET = 40;
/** How far a star dims at the bottom of its twinkle. */
const TWINKLE_DEPTH = 0.7;
const FLARE = 0.82;
const BRIGHT_GLYPH = (wave: number) => (wave > FLARE ? "*" : "+");
const STAR_GLYPHS = ".+*";
const GLYPH_SIZE = 0.86;
/** Device pixels kept around a star's ink, and between its patch and its cell's edge. */
const PATCH_PAD = 1;
/** A patch is a left, a top, a width and a height. */
const PATCH = 4;

interface Crater {
  depth: number;
  radius: number;
  /** Cosine of the angle past which the crater changes nothing. */
  reach: number;
  x: number;
  y: number;
  z: number;
}

const separation = (a: Crater, b: Crater) =>
  Math.acos(clamp01(a.x * b.x + a.y * b.y + a.z * b.z)) / (a.radius + b.radius);

/** Scatters craters over the near side, biggest first, none touching another. */
const createCraters = () => {
  const random = createRandom(SEED);
  const craters: Crater[] = [];
  for (let attempt = 0; attempt < CRATER_ATTEMPTS; attempt += 1) {
    const distance = CRATER_SPREAD * Math.sqrt(random());
    const angle = random() * TAU;
    const share = 1 - craters.length / CRATERS;
    const radius = CRATER_MIN + CRATER_RANGE * share ** 3;
    const crater: Crater = {
      depth: 0.5 + 0.3 * random(),
      radius,
      reach: Math.cos(radius * CRATER_REACH),
      x: distance * Math.cos(angle),
      y: distance * Math.sin(angle),
      z: Math.sqrt(1 - distance * distance),
    };
    const free = craters.every(
      (other) => separation(crater, other) > CRATER_GAP
    );
    if (free && craters.length < CRATERS) {
      craters.push(crater);
    }
  }
  return craters;
};

const CRATER_FIELD = createCraters();

const smooth = (t: number) => t * t * (3 - 2 * t);

const mix = (from: number, to: number, t: number) => from + (to - from) * t;

const lattice = (x: number, y: number, z: number) =>
  hash(x + z * 37.7, y - z * 71.3);

/** Smooth value noise in [0, 1) over a 3D lattice. */
const noise = (x: number, y: number, z: number) => {
  const cellX = Math.floor(x);
  const cellY = Math.floor(y);
  const cellZ = Math.floor(z);
  const u = smooth(x - cellX);
  const v = smooth(y - cellY);
  const w = smooth(z - cellZ);
  const plane = (depth: number) =>
    mix(
      mix(lattice(cellX, cellY, depth), lattice(cellX + 1, cellY, depth), u),
      mix(
        lattice(cellX, cellY + 1, depth),
        lattice(cellX + 1, cellY + 1, depth),
        u
      ),
      v
    );
  return mix(plane(cellZ), plane(cellZ + 1), w);
};

/** How dark the ground is at a point of the sphere: 1 inside a mare. */
const maria = (x: number, y: number, z: number) => {
  const value =
    0.65 *
      noise(x * MARIA_SCALE + 3.1, y * MARIA_SCALE + 7.4, z * MARIA_SCALE) +
    0.35 *
      noise(
        x * MARIA_SCALE * 2.3 + 11.2,
        y * MARIA_SCALE * 2.3 + 1.7,
        z * MARIA_SCALE * 2.3
      );
  return smooth(clamp01((value - 0.47) / 0.14));
};

/** The slope of a crater at `t` radii from its centre: up the wall, down the rim. */
const wall = (t: number) =>
  t < 1
    ? Math.sin(Math.PI * clamp01((t - 0.25) / 0.75))
    : -0.55 * Math.sin(Math.PI * clamp01((t - 1) / (CRATER_REACH - 1)));

const craterTone = (t: number) => (t < 0.8 ? FLOOR_TONE : RIM_TONE);

interface Sample {
  albedo: number;
  x: number;
  z: number;
}

/** The surface at a point of the unit sphere: its normal bent by the craters, and its tone. */
const sampleSurface = (x: number, y: number, z: number, out: Sample) => {
  let normalX = x;
  let normalY = y;
  let normalZ = z;
  let tone = 0;
  for (const crater of CRATER_FIELD) {
    const dot = x * crater.x + y * crater.y + z * crater.z;
    if (dot > crater.reach) {
      const t = Math.acos(Math.min(1, dot)) / crater.radius;
      // The tangent at this point that runs away from the crater's centre.
      const awayX = dot * x - crater.x;
      const awayY = dot * y - crater.y;
      const awayZ = dot * z - crater.z;
      const squared = awayX * awayX + awayY * awayY + awayZ * awayZ;
      const length = Math.sqrt(squared);
      if (length > 1e-6 && t < CRATER_REACH) {
        const tilt = (crater.depth * wall(t)) / length;
        normalX -= awayX * tilt;
        normalY -= awayY * tilt;
        normalZ -= awayZ * tilt;
        tone += craterTone(t);
      }
    }
  }
  const squared = normalX * normalX + normalY * normalY + normalZ * normalZ;
  const length = Math.sqrt(squared);
  out.x = normalX / length;
  out.z = normalZ / length;
  out.albedo = Math.max(DARKEST, 0.96 - MARIA_DEPTH * maria(x, y, z) + tone);
};

interface Surface {
  albedo: Float32Array;
  /** The smooth sphere's normal, which decides day from night. */
  baseX: Float32Array;
  baseZ: Float32Array;
  /** Share of the cell the disc covers; 0 is sky. */
  coverage: Float32Array;
  /** The cell's dither, in [0, 1). */
  grain: Float64Array;
  /** The cratered normal. The sun stays in the xz plane, so y is never read. */
  normalX: Float32Array;
  normalZ: Float32Array;
}

const buildSurface = ({ cols, count, rows }: Cells): Surface => {
  const surface: Surface = {
    albedo: new Float32Array(count),
    baseX: new Float32Array(count),
    baseZ: new Float32Array(count),
    coverage: new Float32Array(count),
    grain: new Float64Array(count),
    normalX: new Float32Array(count),
    normalZ: new Float32Array(count),
  };
  const radius = Math.min(cols, rows) * RADIUS;
  const sample: Sample = { albedo: 0, x: 0, z: 0 };
  for (let index = 0; index < count; index += 1) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    let inside = 0;
    for (let step = 0; step < SUBSAMPLES * SUBSAMPLES; step += 1) {
      const offsetX = ((step % SUBSAMPLES) + 0.5) / SUBSAMPLES;
      const offsetY = (Math.floor(step / SUBSAMPLES) + 0.5) / SUBSAMPLES;
      const x = (col + offsetX - cols / 2) / radius;
      const y = (rows / 2 - row - offsetY) / radius;
      const flat = x * x + y * y;
      if (flat < 1) {
        const z = Math.sqrt(1 - flat);
        sampleSurface(x, y, z, sample);
        inside += 1;
        surface.albedo[index] += sample.albedo;
        surface.baseX[index] += x;
        surface.baseZ[index] += z;
        surface.normalX[index] += sample.x;
        surface.normalZ[index] += sample.z;
      }
    }
    if (inside > 0) {
      surface.coverage[index] = inside / (SUBSAMPLES * SUBSAMPLES);
      surface.grain[index] = hash(index, 3);
      surface.albedo[index] =
        surface.albedo[index] / inside + (hash(col, row) - 0.5) * GRAIN;
      surface.baseX[index] /= inside;
      surface.baseZ[index] /= inside;
      surface.normalX[index] /= inside;
      surface.normalZ[index] /= inside;
    }
  }
  return surface;
};

interface Star {
  /** The star's tone before it twinkles. */
  base: number;
  bright: boolean;
  /** Radians per ms. */
  pace: number;
  seed: number;
  x: number;
  y: number;
}

interface Sky {
  /** The canvas transform, put back once the patches are erased in device pixels. */
  matrix: DOMMatrix;
  /** Whether every patch stays inside its own cell, so erasing it touches no other glyph. */
  patchable: boolean;
  /** The rectangle around each star's ink, in device pixels. */
  patches: Int32Array;
  stars: Star[];
}

interface Ink {
  ascent: number;
  descent: number;
  left: number;
  right: number;
}

const setType = (ctx: CanvasRenderingContext2D, font: string) => {
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
};

/** How far the star glyphs' ink reaches from where they are drawn. */
const starInk = (ctx: CanvasRenderingContext2D): Ink => {
  const ink: Ink = { ascent: 0, descent: 0, left: 0, right: 0 };
  for (const glyph of STAR_GLYPHS) {
    const metrics = ctx.measureText(glyph);
    ink.ascent = Math.max(ink.ascent, metrics.actualBoundingBoxAscent);
    ink.descent = Math.max(ink.descent, metrics.actualBoundingBoxDescent);
    ink.left = Math.max(ink.left, metrics.actualBoundingBoxLeft);
    ink.right = Math.max(ink.right, metrics.actualBoundingBoxRight);
  }
  return ink;
};

interface Span {
  /** Whether the span, padded, stays clear of the cell's edges. */
  contained: boolean;
  from: number;
  size: number;
}

/** The device pixels the ink covers along one axis, around a cell `half` wide each side. */
const patchSpan = (
  centre: number,
  before: number,
  after: number,
  half: number,
  scale: number
): Span => {
  const from = Math.floor((centre - before) * scale) - PATCH_PAD;
  const to = Math.ceil((centre + after) * scale) + PATCH_PAD;
  const lowest = Math.ceil((centre - half) * scale) + PATCH_PAD;
  const highest = Math.floor((centre + half) * scale) - PATCH_PAD;
  return { contained: from >= lowest && to <= highest, from, size: to - from };
};

/** Lists the stars once: where they sit, how they twinkle and the pixels each one owns. */
const buildSky = (
  { ctx, height, width }: Frame,
  { cell, cols, count, originX, originY }: Cells,
  surface: Surface
): Sky => {
  const matrix = ctx.getTransform();
  const ink = starInk(ctx);
  const stars: Star[] = [];
  const patches: number[] = [];
  // Patches assume a transform that only scales, onto a whole number of pixels:
  // a clear that ends mid-pixel leaves an edge only a full repaint reproduces.
  let patchable =
    matrix.b === 0 &&
    matrix.c === 0 &&
    matrix.e === 0 &&
    matrix.f === 0 &&
    Number.isInteger(width * matrix.a) &&
    Number.isInteger(height * matrix.d);
  for (let index = 0; index < count; index += 1) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const chance = hash(col * 1.7 + 5, row * 2.3 + 9);
    if (surface.coverage[index] === 0 && chance < STARS) {
      const bright = chance < BRIGHT_STARS;
      const seed = hash(row, col);
      const x = originX + (col + 0.5) * cell;
      const y = originY + (row + 0.5) * cell;
      const across = patchSpan(x, ink.left, ink.right, cell / 2, matrix.a);
      const down = patchSpan(y, ink.ascent, ink.descent, cell / 2, matrix.d);
      patchable &&= across.contained && down.contained;
      patches.push(across.from, down.from, across.size, down.size);
      stars.push({
        base: bright ? 0.7 : DIM + 0.35 * seed,
        bright,
        pace: TWINKLE_MIN + seed * TWINKLE_SPAN,
        seed,
        x,
        y,
      });
    }
  }
  return { matrix, patchable, patches: Int32Array.from(patches), stars };
};

/** Wipes the stars alone, each over whole device pixels, and leaves the moon as painted. */
const eraseStars = ({ ctx, palette }: Frame, { matrix, patches }: Sky) => {
  ctx.resetTransform();
  ctx.globalAlpha = 1;
  ctx.fillStyle = palette.background;
  for (let at = 0; at < patches.length; at += PATCH) {
    ctx.fillRect(
      patches[at],
      patches[at + 1],
      patches[at + 2],
      patches[at + 3]
    );
  }
  ctx.setTransform(matrix);
};

const paintStars = (
  { ctx, palette, reducedMotion, time }: Frame,
  stars: Star[]
) => {
  ctx.fillStyle = palette.foreground;
  for (const { base, bright, pace, seed, x, y } of stars) {
    // Each star twinkles at its own pace and phase; a still sky under reduced motion.
    const wave = reducedMotion
      ? 0.5
      : 0.5 + 0.5 * Math.sin(time * pace + seed * TWINKLE_OFFSET);
    ctx.globalAlpha = base * (1 - TWINKLE_DEPTH + TWINKLE_DEPTH * wave);
    // A bright star flares to a fuller glyph at the top of its twinkle.
    ctx.fillText(bright ? BRIGHT_GLYPH(wave) : ".", x, y);
  }
};

interface Sun {
  /** Light the dark side gets back from the earth. */
  earth: number;
  x: number;
  z: number;
}

/** Lambert light on one cell of the moon, drawn as a glyph of that density. */
const paintMoon = (
  { ctx, palette }: Frame,
  surface: Surface,
  index: number,
  sun: Sun,
  x: number,
  y: number
) => {
  const base = surface.baseX[index] * sun.x + surface.baseZ[index] * sun.z;
  const facing =
    surface.normalX[index] * sun.x + surface.normalZ[index] * sun.z;
  const day = clamp01((base + TWILIGHT) / (TWILIGHT * 2));
  const lambert = Math.max(0, facing) * day;
  const albedo = surface.albedo[index];
  // Lunar dust scatters back towards the sun, so the lit limb stays bright.
  const scatter = Math.min(
    1,
    (2 * lambert) / (lambert + surface.baseZ[index] + 0.05)
  );
  const shade = mix(lambert, scatter, SCATTER) ** GAMMA;
  const lit = clamp01(albedo * mix(shade, day, SKYLIGHT));
  const night = sun.earth * albedo;
  const level = Math.max(lit, night);
  const noisy = level + (surface.grain[index] - 0.5) * DITHER;
  const glyph =
    RAMP[
      Math.max(0, Math.min(RAMP.length - 1, Math.floor(noisy * RAMP.length)))
    ];
  if (glyph === " ") {
    return;
  }
  const edge = 0.45 + 0.55 * surface.coverage[index];
  const hot =
    lit > HOT_LIGHT && shade > HOT_SHADE && surface.baseZ[index] < HOT_LIMB;
  ctx.globalAlpha =
    (lit > night ? 0.14 + 0.86 * lit * Math.sqrt(lit) : DIM * 1.5) * edge;
  ctx.fillStyle = hot ? palette.hot : palette.foreground;
  ctx.fillText(glyph, x, y);
};

const paintDisc = (
  frame: Frame,
  { cell, cols, count, originX, originY }: Cells,
  surface: Surface,
  sun: Sun
) => {
  for (let index = 0; index < count; index += 1) {
    if (surface.coverage[index] > 0) {
      const x = originX + ((index % cols) + 0.5) * cell;
      const y = originY + (Math.floor(index / cols) + 0.5) * cell;
      paintMoon(frame, surface, index, sun, x, y);
    }
  }
};

type Mode = "held" | "intro" | "rest" | "snap";

export const createMoon = ({ report }: SceneApi): Scene => {
  /** The phase, in eighths of a lunation; it wraps, so it is never clamped. */
  const phase: SpringState = { value: 0, velocity: 0 };
  let cells: Cells | null = null;
  let surface: Surface | null = null;
  let sky: Sky | null = null;
  let font = "";
  /** The phase the moon on the canvas was painted at. */
  let painted = Number.NaN;
  let mode: Mode = "intro";
  let target = REST_PHASE;
  let caught = 0;

  const advance = ({ dt, reducedMotion, time }: Frame) => {
    if (mode === "intro") {
      const progress = reducedMotion ? 1 : time / INTRO;
      phase.value = REST_PHASE * easeOutCubic(progress);
      if (progress >= 1) {
        mode = "rest";
      }
    }
    if (mode === "snap") {
      if (!reducedMotion) {
        stepSpring(phase, target, dt, SNAP);
      }
      if (reducedMotion || springAtRest(phase, target, SNAP_PRECISION)) {
        phase.value = target;
        phase.velocity = 0;
        mode = "rest";
      }
    }
  };

  return {
    draw: (frame) => {
      const { ctx } = frame;
      if (frame.resized || !cells || !surface || !sky) {
        cells = cellsFor(frame, COLUMNS);
        font = glyphFont(cells.cell * GLYPH_SIZE);
        surface = buildSurface(cells);
        setType(ctx, font);
        sky = buildSky(frame, cells, surface);
        painted = Number.NaN;
      }
      advance(frame);

      const angle = (phase.value / PHASES.length) * TAU;
      const illumination = (1 - Math.cos(angle)) / 2;
      setType(ctx, font);
      if (sky.patchable && phase.value === painted) {
        // The moon has not turned: only the stars are repainted.
        eraseStars(frame, sky);
      } else {
        clear(frame);
        paintDisc(frame, cells, surface, {
          earth: EARTHSHINE * (1 - 0.35 * illumination),
          x: Math.sin(angle),
          z: -Math.cos(angle),
        });
        painted = phase.value;
      }
      paintStars(frame, sky.stars);

      const turns = PHASES.length;
      const nearest = ((Math.round(phase.value) % turns) + turns) % turns;
      const degrees = ((((angle * 360) / TAU) % 360) + 360) % 360;
      report(
        `lit ${fixed(illumination * 100, 0, 3)}% · sun ${fixed(degrees, 0, 3)}° · ${PHASES[nearest]}`
      );
      // The stars keep twinkling once the moon has settled.
      return mode !== "rest" || !frame.reducedMotion;
    },
    drag: ({ startX, x }, { width }) => {
      phase.value = caught + ((x - startX) * PHASES_PER_WIDTH) / width;
    },
    press: () => {
      mode = "held";
      caught = phase.value;
      phase.velocity = 0;
    },
    release: ({ vx }, { width }) => {
      const speed = (vx * PHASES_PER_WIDTH) / width;
      phase.velocity = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, speed));
      target = Math.round(phase.value + phase.velocity * PROJECTION);
      mode = "snap";
    },
  };
};

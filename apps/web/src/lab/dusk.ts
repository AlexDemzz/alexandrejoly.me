import {
  RAMP,
  approach,
  cellsFor,
  clamp01,
  clear,
  easeOutCubic,
  fixed,
  glyphFont,
  hash,
} from "./engine";
import type { Cells, Scene, SceneApi } from "./engine";

const GRASS = ".,;!|il";
/** Noise added before a glyph is picked, so flat light dithers instead of banding. */
const DITHER = 0.14;
const COLUMNS = 50;
const SUNRISE = 1400;
/** The sun's radius, as a share of the field's width. */
const SUN = 0.06;
const GLIDE_TAU = 45;
const START = 0.24;
const STARS = 0.035;

/** The hill's ridge, as a share of the height, at a share of the width: a dome. */
const ridge = (u: number) =>
  0.97 - 0.5 * clamp01(1 - ((u - 0.5) / 0.5) ** 2) ** 0.7;

const slope = (u: number) => (ridge(u + 0.001) - ridge(u - 0.001)) / 0.002;

/** The sun rides an arc across the sky, highest in the middle. */
const sunY = (u: number) => 0.92 - 0.72 * Math.sin(Math.PI * clamp01(u));

const phase = (day: number) => {
  if (day > 0.6) {
    return "day";
  }
  if (day > 0.25) {
    return "golden hour";
  }
  if (day > 0.02) {
    return "dusk";
  }
  return "night";
};

/** What a frame's light comes to, the same for every cell. */
interface Sky {
  /** The share of full light the slope takes at this hour. */
  dayGain: number;
  dayReach: number;
  glowGain: number;
  glowReach: number;
  radius: number;
  /** How bright a star shows, 0 by day. */
  starLight: number;
}

/** What only a resize changes: the hill under each column and each cell's grain. */
interface Land {
  /** The dither noise of a cell. */
  grain: Float64Array;
  /** The ridge's height in px, per column. */
  grounds: Float64Array;
  /** The length of the slope's normal, per column. */
  lengths: Float64Array;
  normals: Float64Array;
  /** How much of the light a hill cell keeps, strongest at the ridge. */
  rims: Float64Array;
  /** The noise that decides which cells hold a star. */
  stars: Float64Array;
}

interface Shade {
  glyph: string;
  hot: boolean;
  light: number;
}

const survey = (
  { cell, cols, count, originX, originY, rows }: Cells,
  width: number,
  height: number
): Land => {
  const land: Land = {
    grain: new Float64Array(count),
    grounds: new Float64Array(cols),
    lengths: new Float64Array(cols),
    normals: new Float64Array(cols),
    rims: new Float64Array(count),
    stars: new Float64Array(count),
  };
  for (let col = 0; col < cols; col += 1) {
    const u = (originX + (col + 0.5) * cell) / width;
    const ground = ridge(u) * height;
    const normalX = slope(u) * (height / width);
    land.grounds[col] = ground;
    land.normals[col] = normalX;
    land.lengths[col] = Math.hypot(normalX, 1);
    for (let row = 0; row < rows; row += 1) {
      const index = row * cols + col;
      const y = originY + (row + 0.5) * cell;
      land.grain[index] = hash(row, col);
      land.stars[index] = hash(col, row);
      land.rims[index] = Math.exp(-(y - ground) / (height * 0.1));
    }
  }
  return land;
};

const pick = (set: string, light: number, noise: number) =>
  set[
    Math.max(
      0,
      Math.min(
        set.length - 1,
        Math.floor((light + (noise - 0.5) * DITHER) * set.length)
      )
    )
  ];

/** Shades a sky cell into `shade`; `floor` is the light the hour alone gives its row. */
const skyAt = (
  index: number,
  distance: number,
  floor: number,
  { glowGain, glowReach, radius, starLight }: Sky,
  { grain, stars }: Land,
  shade: Shade
) => {
  const glow = Math.exp(-distance / glowReach) * glowGain;
  // Stars come out once the sun is nearly down.
  const star = stars[index] < STARS ? starLight : 0;
  if (distance < radius) {
    shade.glyph = "@";
    shade.hot = true;
    shade.light = 1;
  } else if (star > glow && star > floor) {
    shade.glyph = "+";
    shade.hot = false;
    shade.light = star;
  } else {
    // At golden hour the sky glows brightest near the horizon, behind the hill.
    const light = Math.max(floor, glow);
    shade.glyph = pick(RAMP, light, grain[index]);
    shade.hot = glow > 0.62;
    shade.light = light;
  }
};

/**
 * Shades a hill cell into `shade`: Lambert light on the slope, strongest along
 * the ridge facing the sun. `toSunX` and `toSunY` point from the cell to the sun.
 */
const hillAt = (
  index: number,
  normalX: number,
  length: number,
  toSunX: number,
  toSunY: number,
  { dayGain, dayReach }: Sky,
  { grain, rims }: Land,
  shade: Shade
) => {
  const facing = Math.max(0, (normalX * toSunX - toSunY) / length);
  const rim = rims[index];
  // A low sun still catches the ridge: the rim is the golden hour.
  const lit = facing * dayGain * dayReach;
  const light = 0.03 + lit * (0.05 + 0.95 * rim);
  shade.glyph = pick(GRASS, light, grain[index]);
  shade.hot = lit * rim > 0.45;
  shade.light = light;
};

export const createDusk = ({ report }: SceneApi): Scene => {
  const shade: Shade = { glyph: "", hot: false, light: 0 };
  let cells: Cells | null = null;
  let land: Land | null = null;
  let font = "";
  let sunX = START;
  let target = START;
  let gliding = false;
  let offset = 0;

  return {
    draw: (frame) => {
      const { ctx, dt, height, palette, reducedMotion, time, width } = frame;
      if (frame.resized || !cells || !land) {
        cells = cellsFor(frame, COLUMNS);
        land = survey(cells, width, height);
        font = glyphFont(cells.cell * 0.8);
      }
      if (gliding) {
        sunX = reducedMotion ? target : approach(sunX, target, dt, GLIDE_TAU);
        if (Math.abs(sunX - target) * width < 1) {
          gliding = false;
          sunX = target;
        }
      }

      // The first view rises the sun from behind the hill.
      const rise = reducedMotion ? 1 : easeOutCubic(time / SUNRISE);
      const sunAtX = sunX * width;
      const sunAtY = (sunY(sunX) + (1 - rise) * 0.5) * height;
      const horizon = ridge(sunX) * height;
      const elevation = clamp01((horizon - sunAtY) / (horizon * 0.8));
      const day = clamp01(elevation * 1.6);

      const { cell, cols, originX, originY, rows } = cells;
      clear(frame);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const sky: Sky = {
        dayGain: 0.6 + 0.4 * day,
        dayReach: clamp01(day * 4),
        glowGain: 0.5 + 0.5 * day,
        glowReach: width * 0.22,
        radius: SUN * width,
        starLight: clamp01(1 - day / 0.3) * 0.7,
      };
      const { grounds, lengths, normals } = land;
      for (let row = 0; row < rows; row += 1) {
        const y = originY + (row + 0.5) * cell;
        const floor = 0.08 + day * (0.2 + 0.3 * (y / height));
        for (let col = 0; col < cols; col += 1) {
          const index = row * cols + col;
          const x = originX + (col + 0.5) * cell;
          const distance = Math.hypot(x - sunAtX, y - sunAtY);
          if (y < grounds[col]) {
            skyAt(index, distance, floor, sky, land, shade);
          } else {
            const reach = Math.max(1, distance);
            hillAt(
              index,
              normals[col],
              lengths[col],
              (sunAtX - x) / reach,
              (sunAtY - y) / reach,
              sky,
              land,
              shade
            );
          }
          if (shade.glyph !== " ") {
            ctx.globalAlpha = clamp01(0.1 + shade.light * 0.9);
            ctx.fillStyle = shade.hot ? palette.hot : palette.foreground;
            ctx.fillText(shade.glyph, x, y);
          }
        }
      }

      const degrees = elevation * 90;
      report(
        `sun ${fixed(degrees, 0, 2)}° · light ${fixed(day, 2)} · ${phase(day)}`
      );
      // A held sun only moves on a drag, and every drag wakes the loop.
      return gliding || rise < 1;
    },
    drag: ({ x }, { width }) => {
      target = clamp01((x + offset) / width);
      if (!gliding) {
        sunX = target;
      }
    },
    press: ({ x, y }, { height, width }) => {
      const onSun =
        Math.hypot(x - sunX * width, y - sunY(sunX) * height) < SUN * width * 2;
      // Grabbing the sun keeps it under the finger; anywhere else, it comes over.
      offset = onSun ? sunX * width - x : 0;
      target = clamp01((x + offset) / width);
      gliding = !onSun;
    },
  };
};

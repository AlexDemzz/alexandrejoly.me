import { DIM, approach, cellsFor, clear, fixed, glyphFont } from "./engine";
import type { Cells, Scene, SceneApi } from "./engine";

const SHADES = ".,-~:;=!*#$@";
const COLUMNS = 52;
const TUBE = 1;
const RING = 2;
const DISTANCE = 5;
const THETA_STEP = 0.07;
const PHI_STEP = 0.02;
const TAU = Math.PI * 2;
/** Radians per pixel of drag. */
const TURN = 0.012;
/** How long a fling takes to fade back to the idle spin. */
const FRICTION_TAU = 900;
const IDLE_A = 3e-4;
const IDLE_B = 1.6e-4;
const HIGHLIGHT = 0.9;

const degrees = (radians: number) =>
  fixed(((((radians * 180) / Math.PI) % 360) + 360) % 360, 0, 3);

/** The cosines and sines of every angle a full turn is sampled at. */
const turnTable = (step: number) => {
  const cos: number[] = [];
  const sin: number[] = [];
  for (let angle = 0; angle < TAU; angle += step) {
    cos.push(Math.cos(angle));
    sin.push(Math.sin(angle));
  }
  return { cos: Float64Array.from(cos), sin: Float64Array.from(sin) };
};

const THETA = turnTable(THETA_STEP);
const PHI = turnTable(PHI_STEP);

interface Angles {
  a: number;
  b: number;
}

/** Projects a lit torus into the grid: its luminance per cell, nearest surface first. */
const render = (
  { a, b }: Angles,
  { cols, rows }: Cells,
  light: Float32Array,
  depth: Float32Array
) => {
  light.fill(-1);
  depth.fill(0);
  const cosA = Math.cos(a);
  const sinA = Math.sin(a);
  const cosB = Math.cos(b);
  const sinB = Math.sin(b);
  const size = Math.min(cols, rows);
  const scale = (size * DISTANCE * 2.6) / (8 * (TUBE + RING));
  for (let ring = 0; ring < THETA.cos.length; ring += 1) {
    const cosTheta = THETA.cos[ring];
    const sinTheta = THETA.sin[ring];
    const circleX = RING + TUBE * cosTheta;
    const circleY = TUBE * sinTheta;
    for (let around = 0; around < PHI.cos.length; around += 1) {
      const cosPhi = PHI.cos[around];
      const sinPhi = PHI.sin[around];
      const x =
        circleX * (cosB * cosPhi + sinA * sinB * sinPhi) -
        circleY * cosA * sinB;
      const y =
        circleX * (sinB * cosPhi - sinA * cosB * sinPhi) +
        circleY * cosA * cosB;
      const inverseZ =
        1 / (DISTANCE + cosA * circleX * sinPhi + circleY * sinA);
      const col = Math.floor(cols / 2 + scale * inverseZ * x);
      const row = Math.floor(rows / 2 - scale * inverseZ * y);
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        const index = row * cols + col;
        if (inverseZ > depth[index]) {
          depth[index] = inverseZ;
          light[index] =
            cosPhi * cosTheta * sinB -
            cosA * cosTheta * sinPhi -
            sinA * sinTheta +
            cosB * (cosA * sinTheta - cosTheta * sinA * sinPhi);
        }
      }
    }
  }
};

export const createTorus = ({ report }: SceneApi): Scene => {
  const angles: Angles = { a: 0.9, b: 0.4 };
  const spin = { a: 0, b: 0 };
  const caught: Angles = { a: 0, b: 0 };
  let cells: Cells | null = null;
  let light = new Float32Array(0);
  let depth = new Float32Array(0);
  let font = "";
  let held = false;

  return {
    draw: (frame) => {
      const { ctx, dt, palette, reducedMotion } = frame;
      if (frame.resized || !cells) {
        cells = cellsFor(frame, COLUMNS);
        light = new Float32Array(cells.count);
        depth = new Float32Array(cells.count);
        font = glyphFont(cells.cell * 0.82);
      }
      if (!held) {
        const idleA = reducedMotion ? 0 : IDLE_A;
        const idleB = reducedMotion ? 0 : IDLE_B;
        if (reducedMotion) {
          spin.a = 0;
          spin.b = 0;
        } else {
          spin.a = approach(spin.a, idleA, dt, FRICTION_TAU);
          spin.b = approach(spin.b, idleB, dt, FRICTION_TAU);
        }
        angles.a += spin.a * dt;
        angles.b += spin.b * dt;
      }

      render(angles, cells, light, depth);
      const { cell, cols, originX, originY, rows } = cells;
      clear(frame);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const index = row * cols + col;
          const value = light[index];
          const centerX = originX + (col + 0.5) * cell;
          const centerY = originY + (row + 0.5) * cell;
          if (depth[index] === 0) {
            if ((col + row) % 2 === 0) {
              ctx.globalAlpha = DIM * 0.6;
              ctx.fillStyle = palette.foreground;
              ctx.fillText(".", centerX, centerY);
            }
          } else {
            const level = Math.max(0, value) / Math.SQRT2;
            const glyph =
              SHADES[
                Math.min(SHADES.length - 1, Math.floor(level * SHADES.length))
              ];
            ctx.globalAlpha = 0.28 + 0.72 * level;
            ctx.fillStyle =
              level > HIGHLIGHT ? palette.hot : palette.foreground;
            ctx.fillText(glyph, centerX, centerY);
          }
        }
      }

      const omega = Math.hypot(spin.a, spin.b) * 1000;
      report(
        `A ${degrees(angles.a)}° · B ${degrees(angles.b)}° · ω ${fixed(omega, 2, 5)} rad/s`
      );
      // A held torus only turns on a drag, and every drag wakes the loop.
      return !(held || reducedMotion);
    },
    drag: ({ startX, startY, x, y }) => {
      angles.a = caught.a + (y - startY) * TURN;
      angles.b = caught.b + (x - startX) * TURN;
    },
    press: () => {
      held = true;
      caught.a = angles.a;
      caught.b = angles.b;
      spin.a = 0;
      spin.b = 0;
    },
    release: ({ vx, vy }, { reducedMotion }) => {
      held = false;
      if (!reducedMotion) {
        spin.a = vy * TURN;
        spin.b = vx * TURN;
      }
    },
  };
};

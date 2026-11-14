import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

/** How faint a glyph sits when nothing lights it. */
export const DIM = 0.13;

/** Glyphs from light to dense, for anything drawn as a luminance. */
export const RAMP = " .:-=+*#%@";

export const SYMBOLS = "0123456789ABCDEF<>[]{}()/\\|=+-*#%&@$~^:?!";

export interface Palette {
  background: string;
  foreground: string;
  hot: string;
  hotInk: string;
}

export interface Pointer {
  down: boolean;
  /** Over the canvas, or holding it. */
  inside: boolean;
  x: number;
  y: number;
}

/** A press in progress, or the one that just ended. */
export interface Drag {
  startX: number;
  startY: number;
  /** In px per ms, over the last few samples. */
  vx: number;
  vy: number;
  x: number;
  y: number;
}

export interface Frame {
  ctx: CanvasRenderingContext2D;
  /** Milliseconds since the last frame, capped so a hidden tab cannot jump. */
  dt: number;
  height: number;
  palette: Palette;
  pointer: Pointer;
  reducedMotion: boolean;
  /** True on the first frame and after a size or theme change. */
  resized: boolean;
  /** Milliseconds since the scene first ran. */
  time: number;
  width: number;
}

export interface Scene {
  /** Paints one frame; returns whether another frame is needed. */
  draw: (frame: Frame) => boolean;
  /** Releases what the scene set up outside the canvas. */
  dispose?: () => void;
  /** The pointer moved while pressed. */
  drag?: (drag: Drag, frame: Frame) => void;
  press?: (drag: Drag, frame: Frame) => void;
  /** The press ended, carrying the velocity it left with. */
  release?: (drag: Drag, frame: Frame) => void;
}

export interface SceneApi {
  /** Writes the scene's live readout under the canvas. */
  report: (text: string) => void;
  /** Restarts the loop after `draw` returned false. */
  wake: () => void;
}

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const easeOutCubic = (t: number) => 1 - (1 - clamp01(t)) ** 3;

/** Frame-rate independent smoothing: `tau` is the time to cover 63% of the gap. */
export const approach = (
  current: number,
  target: number,
  dt: number,
  tau: number
) => current + (target - current) * (1 - Math.exp(-dt / tau));

/** A stable pseudo-random number in [0, 1) for a cell. */
export const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43_758.5453;
  return value - Math.floor(value);
};

/** A repeatable sequence of numbers in [0, 1), so a layout survives a redraw. */
export const createRandom = (seed: number) => {
  let step = 0;
  return () => {
    step += 1;
    return hash(seed, step);
  };
};

/** Resistance past an edge: the further the pull, the less it gives. */
export const rubberBand = (distance: number, limit: number) =>
  Math.sign(distance) *
  limit *
  (1 - 1 / ((Math.abs(distance) * 0.55) / limit + 1));

export interface SpringConfig {
  damping: number;
  stiffness: number;
}

export interface SpringState {
  /** In units per ms. */
  velocity: number;
  value: number;
}

const SPRING_STEP = 4;

/** Advances a unit-mass spring by `dt` ms, in small steps so a slow frame stays stable. */
export const stepSpring = (
  spring: SpringState,
  target: number,
  dt: number,
  { damping, stiffness }: SpringConfig
) => {
  let left = dt;
  while (left > 0) {
    const step = Math.min(SPRING_STEP, left) / 1000;
    const velocity = spring.velocity * 1000;
    const force = -stiffness * (spring.value - target) - damping * velocity;
    const next = velocity + force * step;
    spring.velocity = next / 1000;
    spring.value += next * step;
    left -= SPRING_STEP;
  }
};

export const springAtRest = (
  { value, velocity }: SpringState,
  target: number,
  precision = 0.01
) =>
  Math.abs(value - target) < precision && Math.abs(velocity) < precision / 100;

/** Round to `digits` and pad, so a readout keeps its width as it changes. */
export const fixed = (value: number, digits = 0, width = 0) =>
  value.toFixed(digits).padStart(width, " ");

const MAX_DT = 50;
const MAX_DPR = 2;
const VELOCITY_WINDOW = 80;
const REPORT_EVERY = 90;
/** The longest gap between paints that still reads as 60 frames a second, with slack for jitter. */
const SMOOTH_GAP = 17.7;
/** Below this, a gap between display frames is a timing glitch, not a refresh rate. */
const MIN_REFRESH = 4;

const readPalette = (canvas: HTMLCanvasElement): Palette => {
  const style = getComputedStyle(canvas);
  const token = (name: string) => style.getPropertyValue(name).trim();
  return {
    background: token("--background"),
    foreground: token("--foreground"),
    hot: token("--lab-hot"),
    hotInk: token("--lab-hot-ink"),
  };
};

interface Sample {
  t: number;
  x: number;
  y: number;
}

/**
 * Runs a scene on a canvas: sizes it to its box at the device pixel ratio,
 * reads the theme's colours, turns pointer input into presses, drags and
 * releases with a velocity, and only runs the loop while the canvas is on
 * screen and the scene has something to animate.
 */
export const useGlyphCanvas = (
  setup: (api: SceneApi) => Scene
): {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  readoutRef: RefObject<HTMLParagraphElement | null>;
} => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!(canvas && ctx)) {
      return;
    }

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    const pointer: Pointer = { down: false, inside: false, x: 0, y: 0 };
    const drag: Drag = { startX: 0, startY: 0, vx: 0, vy: 0, x: 0, y: 0 };
    let samples: Sample[] = [];
    let palette = readPalette(canvas);
    let width = 0;
    let height = 0;
    let resized = true;
    let visible = false;
    let raf = 0;
    let time = 0;
    let last = 0;
    let called = 0;
    let refresh = Number.POSITIVE_INFINITY;
    let report = "";
    let reported = "";
    let reportedAt = 0;

    const frameAt = (now: number): Frame => ({
      ctx,
      // A wake stamps `last` after the display frame started, so clamp at zero.
      dt: last === 0 ? 0 : Math.max(0, Math.min(MAX_DT, now - last)),
      height,
      palette,
      pointer,
      reducedMotion: motion.matches,
      resized,
      time,
      width,
    });

    const flushReport = (now: number, force = false) => {
      const readout = readoutRef.current;
      if (
        readout &&
        report !== reported &&
        (force || now - reportedAt > REPORT_EVERY)
      ) {
        readout.textContent = report;
        reported = report;
        reportedAt = now;
      }
    };

    // Assigned right below: `wake` and the scene need each other.
    let scene: Scene | null = null;

    // On a display faster than 60Hz, a scene nobody touches paints every other
    // frame, as long as that keeps it at 60 or above.
    const skips = (now: number) => {
      if (called > 0 && now - called >= MIN_REFRESH) {
        refresh = Math.min(refresh, now - called);
      }
      called = now;
      const idle = !(pointer.down || pointer.inside || resized);
      return idle && last > 0 && now - last + refresh <= SMOOTH_GAP;
    };

    const tick = (now: number) => {
      if (skips(now)) {
        raf = requestAnimationFrame(tick);
        return;
      }
      raf = 0;
      const frame = frameAt(now);
      time += frame.dt;
      frame.time = time;
      const again = width > 0 && scene?.draw(frame) === true;
      last = now;
      resized = false;
      flushReport(now, !again);
      if (again && visible) {
        raf = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (raf === 0 && visible) {
        // The loop slept: skip the gap so the next frame does not jump.
        last = performance.now();
        called = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    scene = setup({
      report: (text) => {
        report = text;
      },
      wake,
    });

    const resize = ([entry]: ResizeObserverEntry[]) => {
      const [box] = entry.contentBoxSize;
      const dpr = Math.min(MAX_DPR, devicePixelRatio);
      const pixelWidth = Math.round(box.inlineSize * dpr);
      const pixelHeight = Math.round(box.blockSize * dpr);
      if (canvas.width === pixelWidth && canvas.height === pixelHeight) {
        return;
      }
      width = box.inlineSize;
      height = box.blockSize;
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      resized = true;
      if (visible) {
        // Sizing a canvas clears it: repaint before this frame is shown.
        cancelAnimationFrame(raf);
        called = 0;
        tick(performance.now());
        // That paint was not a display frame: keep it out of the refresh estimate.
        called = 0;
      }
    };

    const retheme = () => {
      palette = readPalette(canvas);
      resized = true;
      wake();
    };

    const locate = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      drag.x = pointer.x;
      drag.y = pointer.y;
    };

    const track = (event: PointerEvent) => {
      const now = event.timeStamp;
      samples.push({ t: now, x: pointer.x, y: pointer.y });
      samples = samples.filter(({ t }) => now - t <= VELOCITY_WINDOW);
      const [first] = samples;
      const span = now - first.t;
      drag.vx = span > 0 ? (pointer.x - first.x) / span : 0;
      drag.vy = span > 0 ? (pointer.y - first.y) / span : 0;
    };

    const now = () => frameAt(performance.now());

    const enter = (event: PointerEvent) => {
      locate(event);
      pointer.inside = true;
      wake();
    };

    const move = (event: PointerEvent) => {
      locate(event);
      pointer.inside = true;
      if (pointer.down) {
        track(event);
        scene?.drag?.(drag, now());
      }
      wake();
    };

    const down = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }
      canvas.setPointerCapture(event.pointerId);
      locate(event);
      pointer.down = true;
      pointer.inside = true;
      drag.startX = pointer.x;
      drag.startY = pointer.y;
      drag.vx = 0;
      drag.vy = 0;
      samples = [{ t: event.timeStamp, x: pointer.x, y: pointer.y }];
      scene?.press?.(drag, now());
      wake();
    };

    const up = (event: PointerEvent) => {
      if (!pointer.down) {
        return;
      }
      locate(event);
      // A pointer that stopped before lifting leaves with no velocity.
      if (event.timeStamp - (samples.at(-1)?.t ?? 0) > VELOCITY_WINDOW) {
        drag.vx = 0;
        drag.vy = 0;
      }
      pointer.down = false;
      pointer.inside =
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= width &&
        pointer.y <= height;
      scene?.release?.(drag, now());
      wake();
    };

    const leave = () => {
      if (!pointer.down) {
        pointer.inside = false;
        wake();
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const sight = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        wake();
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    sight.observe(canvas);

    const controller = new AbortController();
    const { signal } = controller;
    canvas.addEventListener("pointerenter", enter, { signal });
    canvas.addEventListener("pointermove", move, { signal });
    canvas.addEventListener("pointerdown", down, { signal });
    canvas.addEventListener("pointerup", up, { signal });
    canvas.addEventListener("pointercancel", up, { signal });
    canvas.addEventListener("pointerleave", leave, { signal });
    // A long press would open the context menu on touch screens.
    canvas.addEventListener("contextmenu", (event) => event.preventDefault(), {
      signal,
    });
    motion.addEventListener("change", wake, { signal });
    scheme.addEventListener("change", retheme, { signal });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      sight.disconnect();
      controller.abort();
      scene?.dispose?.();
    };
  }, [setup]);

  return { canvasRef, readoutRef };
};

export interface Cells {
  cell: number;
  cols: number;
  count: number;
  /** Left edge of the first column, so the grid sits centred. */
  originX: number;
  originY: number;
  rows: number;
}

/** A grid of square cells covering the canvas, about `columns` across. */
export const cellsFor = (
  { height, width }: Pick<Frame, "height" | "width">,
  columns: number,
  minCell = 8
): Cells => {
  const cell = Math.max(minCell, Math.floor(width / columns));
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  return {
    cell,
    cols,
    count: cols * rows,
    originX: (width - cols * cell) / 2,
    originY: (height - rows * cell) / 2,
    rows,
  };
};

export const clear = ({ ctx, height, palette, width }: Frame) => {
  ctx.globalAlpha = 1;
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);
};

export const glyphFont = (size: number, weight = 500) =>
  `${weight} ${Math.round(size)}px ${MONO}`;

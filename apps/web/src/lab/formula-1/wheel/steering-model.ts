import { approach, springAtRest, stepSpring } from "../../engine";
import type { SpringState } from "../../engine";

/** About 360° lock to lock, the figure usually given for an F1 car; no official source states it. */
export const LOCK_DEGREES = 180;
export const STEERING_STEP = 5;

/** The lab's "let go to recentre" spring, and its eased stand-in when motion is reduced. */
const RETURN = { damping: 17, stiffness: 170 };
const RETURN_TAU = 90;
const REST_DEGREES = 0.05;
const MAX_FRAME_MS = 50;
/** Release velocity is read over the last stretch of the drag, in ms. */
const VELOCITY_WINDOW = 80;
const FULL_TURN = 360;
const HALF_TURN = 180;

export interface SteeringClock {
  now: () => number;
  frame: (callback: (time: number) => void) => number;
  cancel: (frame: number) => void;
  reducedMotion: () => boolean;
}

export interface Steering {
  angle: () => number;
  dragging: () => boolean;
  /** A hand closes on a grip, the pointer at this angle round the hub. */
  grab: (pointerDegrees: number) => void;
  move: (pointerDegrees: number) => void;
  /** The hand lets go: the wheel recentres, keeping the speed it had. */
  release: () => void;
  /** Keyboard or agent steering: the wheel goes there and stays. */
  steerTo: (degrees: number) => void;
  recentre: () => void;
  stop: () => void;
}

const clampLock = (degrees: number): number =>
  Math.max(-LOCK_DEGREES, Math.min(LOCK_DEGREES, degrees));

/** The short way from one pointer angle to the next, across atan2's ±180° seam. */
const turnBetween = (from: number, to: number): number =>
  ((((to - from + HALF_TURN) % FULL_TURN) + FULL_TURN) % FULL_TURN) - HALF_TURN;

/**
 * The wheel's angle in degrees, clockwise (right) positive. While a hand
 * holds a grip the wheel follows the pointer's angle round the hub 1:1, from
 * where it was; the rack stops it dead at lock. Let go, and a spring brings
 * it back to the centre; a new grab catches it wherever it is.
 */
export const createSteering = (
  write: (degrees: number) => void,
  clock: SteeringClock,
  onSettle: () => void
): Steering => {
  let angle = 0;
  let pointer: number | null = null;
  let samples: { time: number; angle: number }[] = [];
  let frame: number | null = null;
  let spring: SpringState = { value: 0, velocity: 0 };
  let last = 0;

  const set = (degrees: number): void => {
    angle = clampLock(degrees);
    write(angle);
  };

  const stop = (): void => {
    if (frame !== null) {
      clock.cancel(frame);
      frame = null;
    }
  };

  const settle = (): void => {
    stop();
    set(0);
    onSettle();
  };

  const step = (time: number): void => {
    const dt = Math.min(MAX_FRAME_MS, Math.max(0, time - last));
    last = time;
    if (clock.reducedMotion()) {
      spring = {
        value: approach(spring.value, 0, dt, RETURN_TAU),
        velocity: 0,
      };
    } else {
      stepSpring(spring, 0, dt, RETURN);
    }
    if (Math.abs(spring.value) >= LOCK_DEGREES) {
      spring = { value: clampLock(spring.value), velocity: 0 };
    }
    set(spring.value);
    if (springAtRest(spring, 0, REST_DEGREES)) {
      settle();
      return;
    }
    frame = clock.frame(step);
  };

  const recentreFrom = (velocity: number): void => {
    stop();
    if (angle === 0) {
      settle();
      return;
    }
    spring = { value: angle, velocity: clock.reducedMotion() ? 0 : velocity };
    last = clock.now();
    frame = clock.frame(step);
  };

  const releaseVelocity = (): number => {
    const now = clock.now();
    const recent = samples.filter(
      (sample) => now - sample.time <= VELOCITY_WINDOW
    );
    const [first] = recent;
    const final = recent.at(-1);
    if (!first || !final || final.time === first.time) {
      return 0;
    }
    return (final.angle - first.angle) / (final.time - first.time);
  };

  return {
    angle: () => angle,
    dragging: () => pointer !== null,
    grab: (pointerDegrees) => {
      stop();
      pointer = pointerDegrees;
      samples = [{ angle, time: clock.now() }];
    },
    move: (pointerDegrees) => {
      if (pointer === null) {
        return;
      }
      set(angle + turnBetween(pointer, pointerDegrees));
      pointer = pointerDegrees;
      samples.push({ angle, time: clock.now() });
    },
    recentre: () => recentreFrom(0),
    release: () => {
      if (pointer === null) {
        return;
      }
      pointer = null;
      recentreFrom(releaseVelocity());
    },
    steerTo: (degrees) => {
      stop();
      set(degrees);
    },
    stop,
  };
};

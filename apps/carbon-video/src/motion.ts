import { Easing, interpolate } from "remotion";

// The settle curve of alexandrejoly.me's design system (--ease-settle).
const SETTLE = Easing.bezier(0.23, 1, 0.32, 1);
const IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 → 1 between two frames, on the settle curve. */
export const settle = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    easing: SETTLE,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** 0 → 1 between two frames, eased at both ends: travel, scrolls. */
export const travel = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    easing: IN_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const mix = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

/** Visible between `from` and `to`, with short fades at both ends. */
export const visible = (frame: number, from: number, to: number, fade = 8) =>
  interpolate(frame, [from, from + fade, to - fade, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

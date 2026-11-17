// The standing start [R S25 Art. 44.10 b]: "the five second light will appear
// followed by the four, three, two and one second lights. At any time after the
// one-second light appears, the race will be started by extinguishing all red
// lights." The 2026 text in the research notes says the same.

import type { StartPhase, WheelState } from "./types";

/**
 * The formation lap is skipped [INV simplification]: Start puts the car
 * straight on its grid slot, which it holds this long before the first light.
 */
export const GRID_WAIT_MS = 3000;
export const LIGHT_INTERVAL_MS = 1000;
export const RED_LIGHTS = 5;
/** The rules leave the hold to the starter ("at any time"); 0.2–3 s is the usual range [INV]. */
export const HOLD_MIN_MS = 200;
export const HOLD_MAX_MS = 3000;

// Reactions at lights out [INV]: the hidden driver, and the cars around it.
export const DRIVER_REACTION_MS = 200;
const RIVAL_REACTION_MIN_MS = 150;
const RIVAL_REACTION_MAX_MS = 300;
/** Grid slots are 8 m apart (rows 16 m, staggered 1 x 1) [R S25 Art. 42.5]; about 0.1 s once at speed [INV]. */
export const GRID_GAP_S = 0.1;
const MS_PER_S = 1000;

type Lit = Extract<StartPhase, { kind: "lights" }>["lit"];
const LIT: readonly Lit[] = [0, 1, 2, 3, 4, 5];

/** A repeatable number in 0..1 from the clock, so the reducer stays pure. */
const noise = (seed: number): number => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43_758.5453;
  return value - Math.floor(value);
};

/** The starter's hold after the fifth light. */
export const holdFor = (now: number): number =>
  HOLD_MIN_MS + noise(now) * (HOLD_MAX_MS - HOLD_MIN_MS);

const rivalReactionMs = (seed: number): number =>
  RIVAL_REACTION_MIN_MS +
  noise(seed) * (RIVAL_REACTION_MAX_MS - RIVAL_REACTION_MIN_MS);

/** Gaps after the getaway: a grid slot, give or take who reacted first. */
const launchGaps = (
  state: WheelState,
  now: number
): Pick<WheelState, "gapAheadS" | "gapBehindS"> => {
  const ahead = rivalReactionMs(now + 1);
  const behind = rivalReactionMs(now + 2);
  return {
    gapAheadS: GRID_GAP_S + (DRIVER_REACTION_MS - ahead) / MS_PER_S,
    gapBehindS: GRID_GAP_S + (behind - DRIVER_REACTION_MS) / MS_PER_S,
    ...(state.position === 1 ? { gapAheadS: Number.POSITIVE_INFINITY } : {}),
  };
};

const lightsOut = (state: WheelState, now: number): WheelState => ({
  ...state,
  ...launchGaps(state, now),
  lapTrace: [0],
  start: { elapsedMs: 0, kind: "go" },
  timing: { ...state.timing, currentMs: 0 },
});

export const advanceStart = (
  state: WheelState,
  dtMs: number,
  now: number
): WheelState => {
  const { start } = state;
  if (start.kind === "go") {
    return {
      ...state,
      start: { elapsedMs: start.elapsedMs + dtMs, kind: "go" },
    };
  }
  const elapsedMs = start.elapsedMs + dtMs;
  if (start.kind === "grid") {
    return elapsedMs < GRID_WAIT_MS
      ? { ...state, start: { elapsedMs, kind: "grid" } }
      : {
          ...state,
          start: {
            elapsedMs: elapsedMs - GRID_WAIT_MS,
            holdMs: holdFor(now),
            kind: "lights",
            lit: 1,
          },
        };
  }
  const allLitAt = (RED_LIGHTS - 1) * LIGHT_INTERVAL_MS;
  if (elapsedMs >= allLitAt + start.holdMs) {
    return lightsOut(state, now);
  }
  const lit =
    LIT[Math.min(RED_LIGHTS, 1 + Math.floor(elapsedMs / LIGHT_INTERVAL_MS))];
  return { ...state, start: { ...start, elapsedMs, lit } };
};

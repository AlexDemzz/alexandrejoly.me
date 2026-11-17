// The hidden driver brakes into T6, seven downshifts in a row, then pulls out
// of it through the gears: what the worklet plays over that stretch, measured.

import { describe, expect, it } from "vitest";

import { isForwardGear } from "../../model/ranges";
import { createWheelStore } from "../../model/store";
import type { WheelState } from "../../model/types";
import { createEngineFrame, createEngineMemory, readEngine } from "./frame";
import { PowerUnit } from "./model";
import { readFrame } from "./voice";

const RATE = 48_000;
/** The worklet renders 128 samples at a time, on the inputs of the latest frame. */
const QUANTUM = 128;
const FRAME_MS = 1000 / 60;
const MS = RATE / 1000;
/** From the straight before T6's braking point to the straight after its exit. */
const FROM_M = 3440;
const TO_M = 3960;
const WINDOW_MS = 10;
const WINDOW = WINDOW_MS * MS;

interface Stretch {
  samples: Float32Array;
  /** Where each downshift's blip opens and each upshift's cut starts, in samples. */
  blips: number[];
  cuts: number[];
  /** The revs of every frame, and the sample it was heard from. */
  revs: { at: number; rpm: number }[];
}

const isDownshifting = ({ gear, shift }: WheelState): boolean =>
  shift !== null &&
  isForwardGear(gear) &&
  isForwardGear(shift.to) &&
  shift.to < gear;

const render = (): Stretch => {
  const store = createWheelStore();
  const memory = createEngineMemory();
  const frame = createEngineFrame();
  const unit = new PowerUnit(RATE);
  const chunks: Float32Array[] = [];
  const stretch: Stretch = {
    blips: [],
    cuts: [],
    revs: [],
    samples: new Float32Array(0),
  };
  store.dispatch({ session: "track", type: "session" });
  let played = 0;
  let heard = 0;
  let wasDownshifting = false;
  let wasCut = false;
  let inside = false;
  for (let tick = 1; ; tick += 1) {
    store.dispatch({ now: tick * FRAME_MS, type: "tick" });
    const state = store.getState();
    if (inside && state.distanceM >= TO_M) {
      break;
    }
    inside = state.distanceM >= FROM_M && state.distanceM < TO_M;
    readEngine(state, memory, frame);
    readFrame(frame, unit.inputs);
    if (inside) {
      const downshifting = isDownshifting(state);
      if (downshifting && !wasDownshifting) {
        stretch.blips.push(heard);
      }
      if (frame.cut && !wasCut) {
        stretch.cuts.push(heard);
      }
      wasDownshifting = downshifting;
      wasCut = frame.cut;
      stretch.revs.push({ at: heard, rpm: frame.rpm });
    }
    for (; played < (tick + 1) * FRAME_MS * MS; played += QUANTUM) {
      const chunk = new Float32Array(QUANTUM);
      unit.render(chunk);
      if (inside) {
        chunks.push(chunk);
        heard += QUANTUM;
      }
    }
  }
  stretch.samples = new Float32Array(heard);
  for (const [index, chunk] of chunks.entries()) {
    stretch.samples.set(chunk, index * QUANTUM);
  }
  return stretch;
};

let rendered: Stretch | null = null;
const stretch = (): Stretch => {
  rendered ??= render();
  return rendered;
};

/** RMS over `WINDOW_MS`, in dB, from `from` ms to `to` ms after `origin`. */
const levels = (origin: number, from: number, to: number): number[] => {
  const { samples } = stretch();
  const found: number[] = [];
  for (let ms = from; ms + WINDOW_MS <= to; ms += WINDOW_MS) {
    const start = origin + ms * MS;
    let sum = 0;
    for (let index = start; index < start + WINDOW; index += 1) {
      sum += samples[index] ** 2;
    }
    found.push(10 * Math.log10(sum / WINDOW));
  }
  return found;
};

const mean = (values: number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

/** Each blip with the time to the next one, ms; the last one gets the usual gap. */
const cycles = (): { at: number; lasts: number }[] => {
  const { blips } = stretch();
  return blips.map((at, index) => ({
    at,
    lasts:
      index + 1 < blips.length
        ? Math.floor((blips[index + 1] - at) / MS / WINDOW_MS) * WINDOW_MS
        : 400,
  }));
};

const PITCH_WINDOW = 30 * MS;
const LOWEST_HZ = 180;
const HIGHEST_HZ = 340;

/** The pitch around a sample: the lag at which the signal best repeats itself. */
const pitchAt = (center: number): number => {
  const { samples } = stretch();
  const start = center - PITCH_WINDOW / 2;
  const match = (lag: number): number => {
    let both = 0;
    let here = 0;
    let there = 0;
    for (let index = start; index < start + PITCH_WINDOW; index += 1) {
      both += samples[index] * samples[index + lag];
      here += samples[index] ** 2;
      there += samples[index + lag] ** 2;
    }
    return both / Math.sqrt(here * there);
  };
  let best = 0;
  let bestLag = 0;
  for (
    let lag = Math.floor(RATE / HIGHEST_HZ);
    lag <= Math.ceil(RATE / LOWEST_HZ);
    lag += 1
  ) {
    const score = match(lag);
    if (score > best) {
      best = score;
      bestLag = lag;
    }
  }
  return RATE / bestLag;
};

/** The model glides to the revs of a frame, and the pitch is read over a window. */
const HEARD_WITHIN_MS = 50;
/** About a semitone at these revs: a note that is lost lands much further off. */
const SEMITONE_HZ = 15;

/** Each bank fires at rpm / 40 Hz: the pitches the revs around a sample ask for. */
const firingHzAround = (sample: number): { low: number; high: number } => {
  const asked = stretch()
    .revs.filter(
      ({ at }) => at > sample - HEARD_WITHIN_MS * MS && at <= sample + WINDOW
    )
    .map(({ rpm }) => rpm / 40);
  return { high: Math.max(...asked), low: Math.min(...asked) };
};

describe("braking into a slow corner", () => {
  it("blips every downshift the driver makes", () => {
    expect(stretch().blips).toHaveLength(7);
  });

  it("never drops near silence between two blips: the overrun drones under them", () => {
    for (const { at, lasts } of cycles()) {
      const heard = levels(at, 0, lasts);
      expect(Math.max(...heard) - Math.min(...heard)).toBeLessThan(12);
    }
  });

  it("swells with the rev flare instead of bursting in after it", () => {
    for (const { at } of cycles()) {
      const flaring = mean(levels(at, 40, 80));
      const open = mean(levels(at, 100, 170));
      expect(flaring).toBeGreaterThan(open - 3);
    }
  });

  it("dies away after the gear lands instead of stopping with it", () => {
    for (const { at, lasts } of cycles()) {
      const heard = levels(at, 0, lasts);
      const peak = Math.max(...heard);
      const loud = heard.filter((level) => level > peak - 6).length * WINDOW_MS;
      expect(loud).toBeGreaterThanOrEqual(250);
    }
  });

  it("sweeps its pitch up with the revs and back down, never losing the note", () => {
    for (const { at, lasts } of cycles()) {
      const pitches: number[] = [];
      for (let ms = -20; ms <= lasts - 20; ms += WINDOW_MS) {
        const sample = at + ms * MS;
        const pitch = pitchAt(sample);
        const { high, low } = firingHzAround(sample);
        expect(pitch).toBeGreaterThan(low - SEMITONE_HZ);
        expect(pitch).toBeLessThan(high + SEMITONE_HZ);
        pitches.push(pitch);
      }
      const [before] = pitches;
      const top = Math.max(...pitches);
      expect(top - before).toBeGreaterThan(15);
      expect(top - (pitches.at(-1) ?? top)).toBeGreaterThan(15);
    }
  });
});

describe("pulling out of the corner", () => {
  it("still drops out for the ignition cut of every upshift", () => {
    const { cuts } = stretch();
    expect(cuts.length).toBeGreaterThanOrEqual(3);
    for (const at of cuts) {
      const firing = mean(levels(at, -80, -10));
      expect(Math.min(...levels(at, 0, 100))).toBeLessThan(firing - 8);
      expect(mean(levels(at, 120, 200))).toBeGreaterThan(firing - 3);
    }
  });
});

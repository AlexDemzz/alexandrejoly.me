import { describe, expect, it } from "vitest";

import { CEILING, LIMITER_CODES, PowerUnit } from "./model";
import type { PowerUnitInputs } from "./model";

const RATE = 48_000;

const settled = (
  inputs: Partial<PowerUnitInputs>,
  seconds = 0.5
): { unit: PowerUnit; samples: Float32Array } => {
  const unit = new PowerUnit(RATE);
  Object.assign(unit.inputs, { running: 1, ...inputs });
  unit.render(new Float32Array(RATE));
  const samples = new Float32Array(Math.floor(seconds * RATE));
  unit.render(samples);
  return { samples, unit };
};

const rms = (samples: Float32Array): number => {
  let sum = 0;
  for (const sample of samples) {
    sum += sample * sample;
  }
  return Math.sqrt(sum / samples.length);
};

/** How much of the signal sits at one frequency (Goertzel). */
const levelAt = (samples: Float32Array, hz: number): number => {
  const coefficient = 2 * Math.cos((2 * Math.PI * hz) / RATE);
  let previous = 0;
  let before = 0;
  for (const sample of samples) {
    const next = sample + coefficient * previous - before;
    before = previous;
    previous = next;
  }
  return Math.sqrt(
    previous * previous + before * before - coefficient * previous * before
  );
};

const render = (unit: PowerUnit, seconds: number): Float32Array => {
  const samples = new Float32Array(Math.floor(seconds * RATE));
  unit.render(samples);
  return samples;
};

const brightness = (samples: Float32Array): number =>
  levelAt(samples, 2700) / levelAt(samples, 225);

/** How many times a second on the limiter the engine drops out. */
const dips = (limiter: number): number => {
  const { samples } = settled({ limiter, load: 1, rpm: 12_000 }, 1);
  const window = RATE / 100;
  const overall = rms(samples);
  let count = 0;
  let wasLoud = true;
  for (let start = 0; start + window <= samples.length; start += window) {
    const level = rms(samples.subarray(start, start + window));
    if (wasLoud && level < 0.45 * overall) {
      count += 1;
      wasLoud = false;
    } else if (level > 0.9 * overall) {
      wasLoud = true;
    }
  }
  return count;
};

/** The strongest tone where the spooled turbo whistles. */
const whistle = (samples: Float32Array): number => {
  let most = 0;
  for (let hz = 4800; hz <= 5700; hz += 20) {
    most = Math.max(most, levelAt(samples, hz));
  }
  return most / samples.length;
};

describe("power unit model", () => {
  it("is silent until the engine runs", () => {
    const unit = new PowerUnit(RATE);
    const samples = render(unit, 0.1);
    expect(unit.silent).toBe(true);
    expect(rms(samples)).toBe(0);
  });

  it("puts its partials on each bank's firing frequency, rpm / 40 Hz, whatever the revs", () => {
    for (const rpm of [8000, 12_000]) {
      const { samples } = settled({ load: 1, rpm });
      const order = rpm / 40;
      let on = 0;
      let between = 0;
      for (let harmonic = 1; harmonic <= 8; harmonic += 1) {
        on += levelAt(samples, harmonic * order);
        between += levelAt(samples, (harmonic + 0.37) * order);
      }
      expect(on).toBeGreaterThan(6 * between);
    }
  });

  it("fires harder and brighter with load", () => {
    const lifted = settled({ load: 0.1, rpm: 9000 }).samples;
    const floored = settled({ load: 1, rpm: 9000 }).samples;
    expect(rms(floored)).toBeGreaterThan(1.5 * rms(lifted));
    expect(brightness(floored)).toBeGreaterThan(brightness(lifted));
  });

  it("stops the combustion for an ignition cut within a few milliseconds, and brings it back as fast", () => {
    const { unit } = settled({ load: 1, rpm: 12_000 });
    const firing = rms(render(unit, 0.03));
    unit.inputs.cut = 1;
    render(unit, 0.02);
    const cut = rms(render(unit, 0.03));
    unit.inputs.cut = 0;
    render(unit, 0.02);
    const back = rms(render(unit, 0.03));
    expect(cut).toBeLessThan(0.35 * firing);
    expect(back).toBeGreaterThan(0.7 * firing);
  });

  it("stutters on the limiters, slower in the pit lane", () => {
    const rev = dips(LIMITER_CODES.rev);
    const pit = dips(LIMITER_CODES.pit);
    expect(dips(LIMITER_CODES.off)).toBe(0);
    expect(rev).toBeGreaterThanOrEqual(13);
    expect(rev).toBeLessThanOrEqual(17);
    expect(pit).toBeGreaterThanOrEqual(9);
    expect(pit).toBeLessThan(rev);
  });

  it("keeps the turbo whistling after the driver lifts, and lets it wind down", () => {
    const { unit } = settled({ load: 1, rpm: 11_500 }, 1);
    Object.assign(unit.inputs, { load: 0, rpm: 6000 });
    const justLifted = whistle(render(unit, 0.1));
    render(unit, 2);
    const later = whistle(render(unit, 0.1));
    expect(justLifted).toBeGreaterThan(4 * later);
  });

  it("stays under its ceiling, without an offset, in every state", () => {
    const states: Partial<PowerUnitInputs>[] = [
      { load: 0.15, rpm: 4000 },
      { load: 1, rpm: 12_500, speedKph: 340 },
      { load: 0, overrun: 1, rpm: 12_000, speedKph: 300 },
      { limiter: LIMITER_CODES.pit, load: 1, rpm: 9500, speedKph: 80 },
    ];
    for (const state of states) {
      const { samples } = settled(state, 1);
      let peak = 0;
      let sum = 0;
      for (const sample of samples) {
        peak = Math.max(peak, Math.abs(sample));
        sum += sample;
      }
      expect(peak).toBeLessThanOrEqual(CEILING);
      expect(peak).toBeGreaterThan(0.02);
      expect(Math.abs(sum / samples.length)).toBeLessThan(0.005);
    }
  });

  it("fades out when the engine stops, then renders nothing", () => {
    const { unit } = settled({ load: 1, rpm: 10_000 });
    unit.inputs.running = 0;
    render(unit, 0.6);
    expect(unit.silent).toBe(true);
    expect(rms(render(unit, 0.05))).toBe(0);
  });
});

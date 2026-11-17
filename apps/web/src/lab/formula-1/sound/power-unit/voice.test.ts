import { afterEach, describe, expect, it, vi } from "vitest";

import { createEngineFrame } from "./frame";
import type { EngineFrame } from "./frame";
import { LIMITER_CODES, PROCESSOR_NAME } from "./model";
import type { EngineVoice } from "./voice";
import {
  BUFFER_LEAD,
  EDGE_FADE,
  RELEASE_MS,
  createBufferedVoice,
  createWorkletVoice,
  loadEngineVoice,
} from "./voice";

const frame = (overrides: Partial<EngineFrame>): EngineFrame => ({
  ...createEngineFrame(),
  running: true,
  ...overrides,
});

class FakeWorkletNode {
  static made: FakeWorkletNode[] = [];
  readonly name: string;
  readonly parameters = new Map<string, { value: number }>();
  connected: unknown = null;

  constructor(_context: unknown, name: string) {
    this.name = name;
    for (const input of [
      "running",
      "rpm",
      "load",
      "overrun",
      "cut",
      "limiter",
      "speedKph",
    ]) {
      this.parameters.set(input, { value: 0 });
    }
    FakeWorkletNode.made.push(this);
  }

  connect(target: unknown): void {
    this.connected = target;
  }

  disconnect(): void {
    this.connected = null;
  }

  value(input: string): number | undefined {
    return this.parameters.get(input)?.value;
  }
}

const out = {} as AudioNode;

afterEach(() => {
  FakeWorkletNode.made = [];
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("worklet voice", () => {
  it("hands every frame to the model on the audio thread", () => {
    vi.stubGlobal("AudioWorkletNode", FakeWorkletNode);
    const voice = createWorkletVoice({} as BaseAudioContext, out);
    const [node] = FakeWorkletNode.made;
    expect(node.name).toBe(PROCESSOR_NAME);
    expect(node.connected).toBe(out);
    voice.set(
      frame({
        cut: true,
        limiter: "pit",
        load: 0.8,
        overrun: 0.3,
        rpm: 9000,
        speedKph: 80,
      }),
      0
    );
    expect(node.value("running")).toBe(1);
    expect(node.value("rpm")).toBe(9000);
    expect(node.value("load")).toBe(0.8);
    expect(node.value("overrun")).toBe(0.3);
    expect(node.value("cut")).toBe(1);
    expect(node.value("limiter")).toBe(LIMITER_CODES.pit);
    expect(node.value("speedKph")).toBe(80);
  });

  it("stops the model's engine so it fades, then lets go of the node", () => {
    vi.useFakeTimers();
    vi.stubGlobal("AudioWorkletNode", FakeWorkletNode);
    const voice = createWorkletVoice({} as BaseAudioContext, out);
    const [node] = FakeWorkletNode.made;
    voice.set(frame({ load: 1, rpm: 10_000 }), 0);
    voice.stop(0);
    expect(node.value("running")).toBe(0);
    expect(node.connected).toBe(out);
    vi.advanceTimersByTime(RELEASE_MS);
    expect(node.connected).toBeNull();
  });
});

const RATE = 48_000;
const FRAME = 1 / 60;

interface GainEvent {
  ramp: boolean;
  time: number;
  value: number;
}

/** A gain's automation, enough of it to read the value it holds at a time. */
const fakeGain = () => {
  let events: GainEvent[] = [];
  return {
    at: (time: number): number => {
      let value = 1;
      let since = 0;
      for (const event of events.toSorted((a, b) => a.time - b.time)) {
        if (event.time > time) {
          return event.ramp
            ? value +
                ((event.value - value) * (time - since)) / (event.time - since)
            : value;
        }
        ({ time: since, value } = event);
      }
      return value;
    },
    cancelScheduledValues: (from: number) => {
      events = events.filter((event) => event.time < from);
    },
    linearRampToValueAtTime: (value: number, time: number) => {
      events.push({ ramp: true, time, value });
    },
    setTargetAtTime: () => {},
    setValueAtTime: (value: number, time: number) => {
      events.push({ ramp: false, time, value });
    },
  };
};

interface Started {
  samples: Float32Array;
  /** When the buffer plays, and when the main thread scheduled it. */
  when: number;
  scheduledAt: number;
}

/** A context whose clock the test moves, with a voice fed one frame at a time. */
const buffered = () => {
  const starts: Started[] = [];
  const buffers: Float32Array[] = [];
  const gain = fakeGain();
  let clock = 0;
  const context = {
    createBuffer: (_channels: number, length: number) => {
      const samples = new Float32Array(length);
      buffers.push(samples);
      return { getChannelData: () => samples };
    },
    createBufferSource: () => {
      const source = {
        buffer: null as { getChannelData: () => Float32Array } | null,
        connect: () => {},
        start: (when: number) => {
          const samples = source.buffer?.getChannelData() ?? new Float32Array();
          starts.push({ samples, scheduledAt: clock, when });
        },
      };
      return source;
    },
    createGain: () => ({ connect: () => {}, disconnect: () => {}, gain }),
    sampleRate: RATE,
  };
  const voice: EngineVoice = createBufferedVoice(
    context as unknown as BaseAudioContext,
    out
  );
  /** Frames every 1/60 s from `from`, for `seconds`; returns the time of the last one. */
  const run = (from: number, seconds: number): number => {
    for (let index = 0; index * FRAME < seconds; index += 1) {
      clock = from + index * FRAME;
      voice.set(frame({ load: 1, rpm: 10_000 }), clock);
    }
    return clock;
  };
  const rendered = (): number =>
    (starts.at(-1)?.when ?? 0) + buffers[0].length / RATE;
  return { buffers, gain, rendered, run, starts };
};

/** How far each buffer starts from the end of the one before, in samples. */
const seams = (starts: Started[]): number[] =>
  starts
    .slice(1)
    .map(
      (start, index) =>
        (start.when - starts[index].when) * RATE - start.samples.length
    );

describe("buffered voice", () => {
  it("renders the engine ahead of the playhead, every buffer starting on the sample the last one ended on", () => {
    const { rendered, run, starts } = buffered();
    const last = run(1, 2);
    expect(starts.length).toBeGreaterThan(80);
    for (const start of starts) {
      expect(start.when).toBeGreaterThan(start.scheduledAt);
      expect(start.samples.some((sample) => sample !== 0)).toBe(true);
    }
    for (const seam of seams(starts)) {
      expect(Math.abs(seam)).toBeLessThan(1e-3);
    }
    expect(rendered() - last).toBeGreaterThanOrEqual(BUFFER_LEAD.min);
    expect(rendered() - last).toBeLessThan(BUFFER_LEAD.min + 2 * FRAME);
  });

  it("writes over the buffers it has played, and never over one still to be heard", () => {
    const { buffers, run, starts } = buffered();
    run(1, 2);
    expect(buffers.length).toBeLessThan(starts.length / 4);
    const playedUntil = new Map<Float32Array, number>();
    for (const { samples, scheduledAt, when } of starts) {
      expect(playedUntil.get(samples) ?? 0).toBeLessThanOrEqual(scheduledAt);
      playedUntil.set(samples, when + samples.length / RATE);
    }
  });

  it("ends what it has rendered on a fade-out, taken back as long as frames keep coming", () => {
    const { gain, rendered, run } = buffered();
    const last = run(1, 2);
    expect(gain.at(rendered())).toBeCloseTo(0, 6);
    expect(gain.at(rendered() - EDGE_FADE)).toBeCloseTo(1, 6);
    for (let at = 1.1; at < last; at += FRAME) {
      expect(gain.at(at)).toBeCloseTo(1, 6);
    }
  });

  it("fades out when the main thread stalls past what it rendered, and back in from the playhead", () => {
    const { gain, rendered, run, starts } = buffered();
    run(1, 1);
    const dry = rendered();
    const scheduled = starts.length;
    const back = dry + 0.3;
    run(back, 0.5);
    const resumed = starts[scheduled];
    expect(gain.at(dry - EDGE_FADE)).toBeCloseTo(1, 6);
    expect(gain.at(dry)).toBeCloseTo(0, 6);
    expect(gain.at(back)).toBeCloseTo(0, 6);
    expect(resumed.when).toBeGreaterThan(back);
    expect(gain.at(resumed.when)).toBeCloseTo(0, 6);
    expect(gain.at(resumed.when + EDGE_FADE)).toBeCloseTo(1, 6);
    for (const seam of seams(starts.slice(scheduled))) {
      expect(Math.abs(seam)).toBeLessThan(1e-3);
    }
  });

  it("keeps further ahead after a stall, so the next one as long is not heard", () => {
    const stall = 0.15;
    const { gain, rendered, run, starts } = buffered();
    const first = run(1, 1) + stall;
    const second = run(first, 1) + stall;
    const recovered = starts.findIndex((start) => start.scheduledAt >= first);
    expect(seams(starts)[recovered - 1]).toBeGreaterThan(1);
    expect(rendered() - (second - stall)).toBeGreaterThan(stall);
    const last = run(second, 1);
    for (const seam of seams(starts.slice(recovered))) {
      expect(Math.abs(seam)).toBeLessThan(1e-3);
    }
    for (let at = first + 0.1; at < last; at += FRAME / 2) {
      expect(gain.at(at)).toBeCloseTo(1, 6);
    }
    for (const start of starts) {
      expect(start.when - start.scheduledAt).toBeLessThanOrEqual(
        BUFFER_LEAD.max
      );
    }
  });
});

describe("engine voice loading", () => {
  it("plays through the worklet once its module has loaded, loading it once per context", async () => {
    vi.stubGlobal("AudioWorkletNode", FakeWorkletNode);
    const addModule = vi.fn(() => Promise.resolve());
    const context = { audioWorklet: { addModule } } as unknown as AudioContext;
    expect(await loadEngineVoice(context)).toBe(createWorkletVoice);
    expect(await loadEngineVoice(context)).toBe(createWorkletVoice);
    expect(addModule).toHaveBeenCalledTimes(1);
  });

  it("falls back to rendering on the main thread without worklets, or when the module fails", async () => {
    expect(await loadEngineVoice({} as AudioContext)).toBe(createBufferedVoice);
    vi.stubGlobal("AudioWorkletNode", FakeWorkletNode);
    const failing = {
      audioWorklet: { addModule: () => Promise.reject(new Error("blocked")) },
    } as unknown as AudioContext;
    expect(await loadEngineVoice(failing)).toBe(createBufferedVoice);
  });
});

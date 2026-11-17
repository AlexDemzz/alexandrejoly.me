import { afterEach, describe, expect, it, vi } from "vitest";

import { createEngineFrame } from "./frame";
import type { EngineFrame } from "./frame";
import { LIMITER_CODES, PROCESSOR_NAME } from "./model";
import {
  BUFFER_LEAD,
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

const bufferContext = () => {
  const starts: number[] = [];
  const buffers: Float32Array[] = [];
  const context = {
    createBuffer: (_channels: number, length: number) => {
      const samples = new Float32Array(length);
      buffers.push(samples);
      return { getChannelData: () => samples };
    },
    createBufferSource: () => ({
      buffer: null,
      connect: () => {},
      start: (at: number) => starts.push(at),
    }),
    createGain: () => ({
      connect: () => {},
      disconnect: () => {},
      gain: { setTargetAtTime: () => {} },
    }),
    sampleRate: 48_000,
  };
  return { buffers, context: context as unknown as BaseAudioContext, starts };
};

describe("buffered voice", () => {
  it("renders the engine ahead of the playhead, buffer after buffer without a gap", () => {
    const { buffers, context, starts } = bufferContext();
    const voice = createBufferedVoice(context, out);
    voice.set(frame({ load: 1, rpm: 10_000 }), 1);
    expect(starts[0]).toBeGreaterThan(1);
    expect(starts.at(-1)).toBeGreaterThanOrEqual(1 + BUFFER_LEAD - 0.03);
    const scheduled = starts.length;
    for (let index = 1; index < scheduled; index += 1) {
      expect(starts[index] - starts[index - 1]).toBeCloseTo(
        buffers[0].length / 48_000
      );
    }
    voice.set(frame({ load: 1, rpm: 10_000 }), 1.001);
    expect(starts).toHaveLength(scheduled);
    voice.set(frame({ load: 1, rpm: 10_000 }), 1.05);
    expect(starts.length).toBeGreaterThan(scheduled);
    expect(buffers.at(-1)?.some((sample) => sample !== 0)).toBe(true);
  });

  it("starts again from the playhead after the frames stopped for a while", () => {
    const { context, starts } = bufferContext();
    const voice = createBufferedVoice(context, out);
    voice.set(frame({ rpm: 8000 }), 1);
    const before = starts.length;
    voice.set(frame({ rpm: 8000 }), 5);
    expect(starts[before]).toBeGreaterThan(5);
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

// The power unit's voice: the physical model of ./model.ts, rendered on the
// audio thread by an AudioWorklet. Where worklets are missing (an insecure
// origin, an old browser) the same model renders on the main thread, a few
// buffers ahead of the playhead: further ahead the longer that thread stalls.

// oxlint-disable-next-line import/default -- Vite's ?worker&url bundles the worklet and exports its URL
import workletUrl from "./engine.worklet.ts?worker&url";
import type { EngineFrame } from "./frame";
import { INPUT_NAMES, LIMITER_CODES, PROCESSOR_NAME, PowerUnit } from "./model";
import type { PowerUnitInputs } from "./model";

export interface EngineVoice {
  /** Follows the frame, from audio time `at`. */
  set: (frame: EngineFrame, at: number) => void;
  /** Fades out and lets go of the graph. */
  stop: (at: number) => void;
}

export type EngineVoiceFactory = (
  context: BaseAudioContext,
  out: AudioNode
) => EngineVoice;

/** The model fades a stopped engine itself; the graph is let go after that. */
export const RELEASE_MS = 200;
const BUFFER_SAMPLES = 1024;
/**
 * How far ahead of the playhead the main thread keeps the fallback rendered,
 * seconds: the least while frames come steadily, the most after it stalled.
 * A gear change is heard this much late.
 */
export const BUFFER_LEAD = { max: 0.25, min: 0.12 } as const;
/** The lead covers the longest recent wait between two frames, and this much more. */
const STALL_MARGIN = 0.07;
const STALL_MEMORY = 20;
const BUFFER_RESTART = 0.02;
/** What is rendered ends on a fade-out, taken back when more follows: running dry never clicks. */
export const EDGE_FADE = 0.008;
const BUFFER_FADE = 0.03;

export const readFrame = (
  frame: EngineFrame,
  inputs: PowerUnitInputs
): void => {
  inputs.running = frame.running ? 1 : 0;
  inputs.rpm = frame.rpm;
  inputs.load = frame.load;
  inputs.overrun = frame.overrun;
  inputs.cut = frame.cut ? 1 : 0;
  inputs.limiter = LIMITER_CODES[frame.limiter];
  inputs.speedKph = frame.speedKph;
};

const emptyInputs = (): PowerUnitInputs => ({
  cut: 0,
  limiter: LIMITER_CODES.off,
  load: 0,
  overrun: 0,
  rpm: 0,
  running: 0,
  speedKph: 0,
});

export const createWorkletVoice: EngineVoiceFactory = (context, out) => {
  const node = new AudioWorkletNode(context, PROCESSOR_NAME, {
    numberOfInputs: 0,
    outputChannelCount: [1],
  });
  const inputs = emptyInputs();
  const params = INPUT_NAMES.map((name) => {
    const param = node.parameters.get(name);
    if (param === undefined) {
      throw new Error(`Power unit worklet has no ${name} input`);
    }
    return param;
  });
  const running = params[INPUT_NAMES.indexOf("running")];
  node.connect(out);

  return {
    set: (frame) => {
      readFrame(frame, inputs);
      for (const [index, name] of INPUT_NAMES.entries()) {
        const param = params[index];
        if (param.value !== inputs[name]) {
          param.value = inputs[name];
        }
      }
    },
    stop: () => {
      running.value = 0;
      setTimeout(() => {
        node.disconnect();
      }, RELEASE_MS);
    },
  };
};

export const createBufferedVoice: EngineVoiceFactory = (context, out) => {
  const { sampleRate } = context;
  const unit = new PowerUnit(sampleRate);
  const level = context.createGain();
  level.connect(out);
  const { gain } = level;
  // Played buffers are written again: the ring outlasts the longest lead, so
  // the one that comes round has always finished. A source plays only once.
  const ring = Array.from(
    {
      length: Math.ceil((BUFFER_LEAD.max * sampleRate) / BUFFER_SAMPLES) + 2,
    },
    () => context.createBuffer(1, BUFFER_SAMPLES, sampleRate)
  );
  let next = 0;
  /** Where the rendered audio ends, in whole samples of the context's clock. */
  let endSample = 0;
  let lastAt: number | null = null;
  let stall = 0;

  return {
    set: (frame, at) => {
      readFrame(frame, unit.inputs);
      const waited = lastAt === null ? 0 : at - lastAt;
      lastAt = at;
      stall = Math.max(waited, stall * Math.exp(-waited / STALL_MEMORY));
      const lead = Math.min(
        BUFFER_LEAD.max,
        Math.max(BUFFER_LEAD.min, stall + STALL_MARGIN)
      );
      const end = endSample / sampleRate;
      if (end >= at + lead) {
        return;
      }
      if (at + BUFFER_RESTART < end - EDGE_FADE) {
        gain.cancelScheduledValues(end - EDGE_FADE);
      } else {
        // Ran dry, or about to: the fade-out plays, and the engine fades back in after it.
        endSample = Math.ceil(Math.max(end, at + BUFFER_RESTART) * sampleRate);
        const start = endSample / sampleRate;
        gain.setValueAtTime(0, start);
        gain.linearRampToValueAtTime(1, start + EDGE_FADE);
      }
      while (endSample / sampleRate < at + lead) {
        const buffer = ring[next];
        next = (next + 1) % ring.length;
        unit.render(buffer.getChannelData(0));
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(level);
        source.start(endSample / sampleRate);
        endSample += BUFFER_SAMPLES;
      }
      const tail = endSample / sampleRate;
      gain.setValueAtTime(1, tail - EDGE_FADE);
      gain.linearRampToValueAtTime(0, tail);
    },
    stop: (at) => {
      gain.cancelScheduledValues(at);
      gain.setTargetAtTime(0, at, BUFFER_FADE);
      setTimeout(() => {
        level.disconnect();
      }, RELEASE_MS);
    },
  };
};

const modules = new WeakMap<BaseAudioContext, Promise<EngineVoiceFactory>>();

const addModule = async (
  context: BaseAudioContext
): Promise<EngineVoiceFactory> => {
  if (!("audioWorklet" in context) || typeof AudioWorkletNode === "undefined") {
    return createBufferedVoice;
  }
  try {
    await context.audioWorklet.addModule(workletUrl);
    return createWorkletVoice;
  } catch {
    return createBufferedVoice;
  }
};

/** Loads the worklet into the context once, and says which voice the context can play. */
export const loadEngineVoice = (
  context: BaseAudioContext
): Promise<EngineVoiceFactory> => {
  let loading = modules.get(context);
  if (loading === undefined) {
    loading = addModule(context);
    modules.set(context, loading);
  }
  return loading;
};

// The power unit's voice: the physical model of ./model.ts, rendered on the
// audio thread by an AudioWorklet. Where worklets are missing (an insecure
// origin, an old browser) the same model renders on the main thread, a few
// buffers ahead of the playhead.

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
/** How far ahead of the playhead the main thread keeps the fallback rendered. */
export const BUFFER_LEAD = 0.1;
const BUFFER_RESTART = 0.02;
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
  const unit = new PowerUnit(context.sampleRate);
  const level = context.createGain();
  level.connect(out);
  const seconds = BUFFER_SAMPLES / context.sampleRate;
  let until = 0;

  return {
    set: (frame, at) => {
      readFrame(frame, unit.inputs);
      if (until < at + BUFFER_RESTART) {
        until = at + BUFFER_RESTART;
      }
      while (until < at + BUFFER_LEAD) {
        const buffer = context.createBuffer(
          1,
          BUFFER_SAMPLES,
          context.sampleRate
        );
        unit.render(buffer.getChannelData(0));
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(level);
        source.start(until);
        until += seconds;
      }
    },
    stop: (at) => {
      level.gain.setTargetAtTime(0, at, BUFFER_FADE);
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

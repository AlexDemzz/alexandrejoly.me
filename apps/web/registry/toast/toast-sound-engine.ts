import type { ToastEvent } from "./toast-events";
import { toastSoundSamples } from "./toast-sound-samples";

const MARKER_SEARCH = 0.2;

const TAKES = {
  catch: [
    [5.10148, 0.19277],
    [5.37425, 0.33083],
    [5.78508, 0.38133],
  ],
  dial: [
    [6.24642, 0.16954],
    [6.49596, 0.19154],
    [6.7675, 0.19004],
    [7.03754, 0.15856],
    [7.2761, 0.16683],
  ],
  hum: [[11.84137, 0.84167]],
  pop: [
    [0.18, 0.40367],
    [0.66367, 0.63113],
    [1.37479, 0.86506],
  ],
  release: [
    [2.31985, 0.35571],
    [2.75556, 0.25792],
    [3.09348, 0.43327],
  ],
  sliceIn: [
    [9.17948, 0.629],
    [9.88848, 0.25283],
  ],
  sliceOut: [
    [10.22131, 0.43604],
    [10.73735, 0.32779],
  ],
  spring: [[12.76304, 2.8]],
  stopDown: [
    [7.52294, 0.21688],
    [7.81981, 0.21608],
    [8.1159, 0.20131],
  ],
  stopUp: [
    [8.39721, 0.22925],
    [8.70646, 0.12262],
    [8.90908, 0.1904],
  ],
  tick: [
    [11.14515, 0.16108],
    [11.38623, 0.14625],
    [11.61248, 0.1489],
  ],
  top: [
    [3.60675, 0.36331],
    [4.05006, 0.48608],
    [4.61615, 0.40533],
  ],
} as const satisfies Record<string, readonly (readonly [number, number])[]>;

type ToastSampleKind = keyof typeof TAKES;

type ToastSamples = Record<ToastSampleKind, readonly AudioBuffer[]>;

const findMarker = (samples: Float32Array, rate: number): number => {
  const end = Math.min(samples.length, Math.round(MARKER_SEARCH * rate));
  let loudest = 0;
  let at = 0;
  for (let index = 0; index < end; index += 1) {
    const size = Math.abs(samples[index]);
    if (size > loudest) {
      loudest = size;
      at = index;
    }
  }
  return at;
};

const cutSprite = (
  context: BaseAudioContext,
  sprite: AudioBuffer
): ToastSamples => {
  const rate = sprite.sampleRate;
  const whole = sprite.getChannelData(0);
  const marker = findMarker(whole, rate);
  const cut = ([start, seconds]: readonly [number, number]): AudioBuffer => {
    const from = marker + Math.round(start * rate);
    const length = Math.round(seconds * rate);
    const buffer = context.createBuffer(1, length, rate);
    buffer.copyToChannel(whole.subarray(from, from + length), 0);
    return buffer;
  };
  const samples: Partial<Record<ToastSampleKind, AudioBuffer[]>> = {};
  for (const [kind, takes] of Object.entries(TAKES)) {
    samples[kind as ToastSampleKind] = takes.map(cut);
  }
  return samples as ToastSamples;
};

export const loadToastSamples = async (
  context: BaseAudioContext,
  signal: AbortSignal
): Promise<ToastSamples> => {
  const response = await fetch(toastSoundSamples, { signal });
  const sprite = await context.decodeAudioData(await response.arrayBuffer());
  return cutSprite(context, sprite);
};

export type { ToastSamples };

export interface ToastGraph {
  hear: (event: ToastEvent, at: number) => number;
  pump: (until: number) => void;
  toasting: () => boolean;
  dispose: () => void;
}

const MASTER = 0.8;
const CLIP_KNEE = 0.7;
const CLIP_STEPS = 2048;

const MAX_VOICES = 32;
const PITCH_SPREAD = 0.03;
const LEVEL_SPREAD = 0.12;

const TOP_FULL = 545;
const POP_FLIGHT = 1;
const TOP_DULL = 1200;
const TOP_BRIGHT = 16_000;

const DRAG_FULL = 250;
const DRAG_LEVEL = 0.5;
const DRAG_HOLD = 0.07;
const DRAG_FLOOR = 140;
const DRAG_DULL = 900;
const DRAG_OPEN = 1800;
const SPRING_SLACK = 0.62;
const SPRING_TAUT = 0.72;
const GRAIN = 0.022;
const GRAIN_DETUNE = 0.06;
const GRAIN_JITTER = 0.18;
const GRAIN_SPREAD = 0.35;
const GRAIN_STEPS = 64;
const GRAIN_ATTACK = 0.08;
const BUZZ_SLOW = 22;
const BUZZ_FAST = 34;

const HUM_LEVEL = 1;
const BED_FADE = 0.4;
const BED_GRACE = 2;
const TICK_PERIOD = 0.19;
const TOCK_PITCH = 0.93;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

const vary = (amount: number): number => 1 + (Math.random() * 2 - 1) * amount;

const between = (low: number, high: number): number =>
  low + Math.random() * (high - low);

const holdAt = (param: AudioParam, at: number): void => {
  if ("cancelAndHoldAtTime" in param) {
    param.cancelAndHoldAtTime(at);
  } else {
    (param as AudioParam).cancelScheduledValues(at);
    (param as AudioParam).setValueAtTime((param as AudioParam).value, at);
  }
};

const softClipCurve = (): Float32Array<ArrayBuffer> => {
  const curve = new Float32Array(CLIP_STEPS);
  for (let index = 0; index < CLIP_STEPS; index += 1) {
    const input = (index / (CLIP_STEPS - 1)) * 2 - 1;
    const size = Math.abs(input);
    const bent =
      size <= CLIP_KNEE
        ? size
        : CLIP_KNEE +
          (1 - CLIP_KNEE) * Math.tanh((size - CLIP_KNEE) / (1 - CLIP_KNEE));
    curve[index] = Math.sign(input) * bent;
  }
  return curve;
};

const buildOutput = (
  context: BaseAudioContext,
  destination: AudioNode
): { input: GainNode; nodes: AudioNode[] } => {
  const input = new GainNode(context);
  const clip = new WaveShaperNode(context, {
    curve: softClipCurve(),
    oversample: "2x",
  });
  const master = new GainNode(context, { gain: MASTER });
  input.connect(clip).connect(master).connect(destination);
  return { input, nodes: [input, clip, master] };
};

interface Shot {
  level?: number;
  lowpass?: number;
  pitch?: number;
}

const createPlayer = (
  context: BaseAudioContext,
  samples: ToastSamples,
  output: AudioNode
) => {
  const playing = new Set<AudioBufferSourceNode>();
  const last = new Map<ToastSampleKind, number>();

  const pick = (kind: ToastSampleKind): AudioBuffer => {
    const takes = samples[kind];
    let index = Math.floor(Math.random() * takes.length);
    if (takes.length > 1 && index === last.get(kind)) {
      index = (index + 1) % takes.length;
    }
    last.set(kind, index);
    return takes[index];
  };

  const play = (kind: ToastSampleKind, at: number, shot: Shot = {}) => {
    if (playing.size >= MAX_VOICES) {
      return at;
    }
    const buffer = pick(kind);
    const rate = (shot.pitch ?? 1) * vary(PITCH_SPREAD);
    const source = new AudioBufferSourceNode(context, {
      buffer,
      playbackRate: rate,
    });
    const gain = new GainNode(context, {
      gain: (shot.level ?? 1) * vary(LEVEL_SPREAD),
    });
    const filter =
      shot.lowpass === undefined
        ? null
        : new BiquadFilterNode(context, {
            frequency: shot.lowpass,
            type: "lowpass",
          });
    if (filter === null) {
      source.connect(gain);
    } else {
      source.connect(filter).connect(gain);
    }
    gain.connect(output);
    playing.add(source);
    source.addEventListener("ended", () => {
      source.disconnect();
      filter?.disconnect();
      gain.disconnect();
      playing.delete(source);
    });
    source.start(at);
    return at + buffer.duration / rate;
  };

  return {
    dispose: () => {
      for (const source of playing) {
        source.stop();
        source.disconnect();
      }
      playing.clear();
    },
    play,
  };
};

const startLoop = (
  context: BaseAudioContext,
  buffer: AudioBuffer,
  output: AudioNode,
  at: number
) => {
  const source = new AudioBufferSourceNode(context, { buffer, loop: true });
  const gain = new GainNode(context, { gain: 0 });
  source.connect(gain).connect(output);
  source.start(at, Math.random() * buffer.duration);
  source.addEventListener("ended", () => {
    source.disconnect();
    gain.disconnect();
  });
  return { gain: gain.gain, source };
};

const grainWindow = (): Float32Array<ArrayBuffer> => {
  const curve = new Float32Array(GRAIN_STEPS);
  for (let index = 0; index < GRAIN_STEPS; index += 1) {
    const phase = index / (GRAIN_STEPS - 1);
    curve[index] =
      phase < GRAIN_ATTACK
        ? phase / GRAIN_ATTACK
        : (1 - (phase - GRAIN_ATTACK) / (1 - GRAIN_ATTACK)) ** 3;
  }
  return curve;
};

const createLever = (
  context: BaseAudioContext,
  spring: AudioBuffer,
  output: AudioNode
) => {
  const tone = new BiquadFilterNode(context, {
    Q: 0.5,
    frequency: DRAG_DULL,
    type: "lowpass",
  });
  const floor = new BiquadFilterNode(context, {
    frequency: DRAG_FLOOR,
    type: "highpass",
  });
  const level = new GainNode(context, { gain: 0 });
  level.connect(floor).connect(tone).connect(output);
  const envelope = grainWindow();
  const grains = new Set<AudioBufferSourceNode>();
  let nextGrain = 0;
  let rate = SPRING_SLACK;
  let buzz = BUZZ_SLOW;

  const grain = (at: number): void => {
    const pitch = rate * vary(GRAIN_DETUNE);
    const read = GRAIN * pitch;
    const source = new AudioBufferSourceNode(context, {
      buffer: spring,
      playbackRate: pitch,
    });
    const shape = new GainNode(context, { gain: 0 });
    const strength = vary(GRAIN_SPREAD);
    shape.gain.setValueCurveAtTime(
      envelope.map((value) => value * strength),
      at,
      GRAIN
    );
    source.connect(shape).connect(level);
    grains.add(source);
    source.addEventListener("ended", () => {
      source.disconnect();
      shape.disconnect();
      grains.delete(source);
    });
    source.start(at, Math.random() * (spring.duration - read), read);
  };

  return {
    dispose: () => {
      for (const source of grains) {
        source.stop();
        source.disconnect();
      }
      grains.clear();
      level.disconnect();
      floor.disconnect();
      tone.disconnect();
    },
    move: (height: number, speed: number, at: number): number => {
      const pace = clamp(Math.abs(speed) / DRAG_FULL, 0, 1);
      const loaded = clamp((100 - height) / 100, 0, 1);
      rate = SPRING_SLACK + (SPRING_TAUT - SPRING_SLACK) * loaded;
      buzz = BUZZ_SLOW + (BUZZ_FAST - BUZZ_SLOW) * Math.max(pace, loaded);
      const pushing = speed < 0 ? 1 : 0.75;
      const target =
        DRAG_LEVEL * pace ** 0.6 * pushing * (0.85 + 0.3 * loaded) * vary(0.06);
      holdAt(level.gain, at);
      level.gain.setTargetAtTime(target, at, 0.015);
      level.gain.setTargetAtTime(0, at + DRAG_HOLD, 0.025);
      tone.frequency.setTargetAtTime(
        DRAG_DULL + (DRAG_OPEN - DRAG_DULL) * Math.max(pace, loaded),
        at,
        0.03
      );
      nextGrain = Math.max(nextGrain, at);
      while (nextGrain < at + DRAG_HOLD) {
        grain(nextGrain);
        nextGrain += vary(GRAIN_JITTER) / buzz;
      }
      return nextGrain + GRAIN;
    },
  };
};

const createBed = (
  context: BaseAudioContext,
  hum: AudioBuffer,
  output: AudioNode,
  play: ReturnType<typeof createPlayer>["play"]
) => {
  let voice: ReturnType<typeof startLoop> | null = null;
  let running = false;
  let endsAt = 0;
  let nextTick = 0;
  let tock = false;

  const silence = (at: number): void => {
    if (voice === null) {
      return;
    }
    holdAt(voice.gain, at);
    voice.gain.setTargetAtTime(0, at, BED_FADE / 4);
    voice.source.stop(at + BED_FADE * 2);
    voice = null;
  };

  const end = (at: number): void => {
    running = false;
    silence(at);
  };

  return {
    dispose: () => {
      running = false;
      voice?.source.stop();
      voice = null;
    },
    end,
    pump: (until: number): void => {
      if (!running) {
        return;
      }
      const stopAt = Math.min(until, endsAt);
      while (nextTick < stopAt) {
        play("tick", nextTick, { pitch: tock ? TOCK_PITCH : 1 });
        tock = !tock;
        nextTick += TICK_PERIOD * vary(0.04);
      }
      if (until >= endsAt) {
        end(endsAt);
      }
    },
    running: () => running,
    start: (at: number, durationMs: number): void => {
      silence(at);
      running = true;
      endsAt = at + durationMs / 1000 + BED_GRACE;
      nextTick = at + 0.12;
      tock = false;
      voice = startLoop(context, hum, output, at);
      voice.gain.setValueAtTime(0, at);
      voice.gain.linearRampToValueAtTime(HUM_LEVEL, at + BED_FADE);
    },
  };
};

export const createToastGraph = (
  context: BaseAudioContext,
  samples: ToastSamples,
  destination: AudioNode = context.destination
): ToastGraph => {
  const { input, nodes } = buildOutput(context, destination);
  const player = createPlayer(context, samples, input);
  const { play } = player;
  const lever = createLever(context, samples.spring[0], input);
  const bed = createBed(context, samples.hum[0], input, play);
  let poppedAt = Number.NEGATIVE_INFINITY;

  const hear = (event: ToastEvent, at: number): number => {
    switch (event.type) {
      case "lever-move": {
        return lever.move(event.height, event.speed, at);
      }
      case "lever-catch": {
        return play("catch", at);
      }
      case "lever-top": {
        if (at - poppedAt < POP_FLIGHT) {
          poppedAt = Number.NEGATIVE_INFINITY;
          return play("pop", at);
        }
        const pace = clamp(Math.abs(event.speed) / TOP_FULL, 0.05, 1);
        return play("top", at, {
          level: pace ** 1.3,
          lowpass: TOP_DULL * (TOP_BRIGHT / TOP_DULL) ** pace,
          pitch: 0.94 + 0.06 * pace,
        });
      }
      case "toasting-start": {
        bed.start(at, event.durationMs);
        return at + BED_FADE;
      }
      case "toasting-end": {
        bed.end(at);
        return at + BED_FADE;
      }
      case "pop": {
        poppedAt = at;
        return play("release", at);
      }
      case "dial-step": {
        return play("dial", at);
      }
      case "stop-down": {
        return play("stopDown", at);
      }
      case "stop-up": {
        return play("stopUp", at);
      }
      case "slice-out": {
        return play("sliceOut", at + between(0, 0.01));
      }
      case "slice-in": {
        return play("sliceIn", at);
      }
      default: {
        return at;
      }
    }
  };

  return {
    dispose: () => {
      bed.dispose();
      lever.dispose();
      player.dispose();
      for (const node of nodes) {
        node.disconnect();
      }
    },
    hear,
    pump: bed.pump,
    toasting: bed.running,
  };
};

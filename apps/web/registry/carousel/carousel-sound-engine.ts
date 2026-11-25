import type { CarouselEvent } from "./carousel-events";
import { carouselSoundSamples } from "./carousel-sound-samples";

const MARKER_SEARCH = 0.2;

const TAKES = {
  drop: [
    [1.841_21, 0.070_6],
    [1.991_81, 0.100_85],
    [2.172_67, 0.133_87],
  ],
  fan: [[5.970_15, 0.9]],
  focus: [[6.950_15, 1.22]],
  keyDown: [
    [3.450_1, 0.219_54],
    [3.749_65, 0.138_73],
    [3.968_38, 0.311_21],
  ],
  keyUp: [
    [4.359_58, 0.297_12],
    [4.736_71, 0.125_94],
    [4.942_65, 0.266_5],
  ],
  lift: [
    [0.882_1, 0.214_6],
    [1.176_71, 0.229_96],
    [1.486_67, 0.274_54],
  ],
  step: [
    [2.386_54, 0.111_9],
    [2.578_44, 0.119_6],
    [2.778_04, 0.131_56],
    [2.989_6, 0.096_63],
    [3.166_23, 0.203_88],
  ],
  stop: [
    [0.18, 0.184_56],
    [0.444_56, 0.128_4],
    [0.652_96, 0.149_15],
  ],
  switch: [
    [5.289_15, 0.104_69],
    [5.473_83, 0.118_81],
    [5.672_65, 0.217_5],
  ],
} as const satisfies Record<string, readonly (readonly [number, number])[]>;

type CarouselSampleKind = keyof typeof TAKES;

type CarouselSamples = Record<CarouselSampleKind, readonly AudioBuffer[]>;

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
): CarouselSamples => {
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
  const samples: Partial<Record<CarouselSampleKind, AudioBuffer[]>> = {};
  for (const [kind, takes] of Object.entries(TAKES)) {
    samples[kind as CarouselSampleKind] = takes.map(cut);
  }
  return samples as CarouselSamples;
};

export const loadCarouselSamples = async (
  context: BaseAudioContext,
  signal: AbortSignal
): Promise<CarouselSamples> => {
  const response = await fetch(carouselSoundSamples, { signal });
  const sprite = await context.decodeAudioData(await response.arrayBuffer());
  return cutSprite(context, sprite);
};

export type { CarouselSamples };

export interface CarouselGraph {
  dispose: () => void;
  hear: (event: CarouselEvent, at: number) => number;
  running: () => boolean;
  setFan: (on: boolean, at: number) => void;
}

const MASTER = 0.8;
const CLIP_KNEE = 0.7;
const CLIP_STEPS = 2048;

const MAX_VOICES = 32;
const PITCH_SPREAD = 0.03;
const LEVEL_SPREAD = 0.12;

const STEP_FULL = 110;
const STEP_GAP = 0.012;
const STEP_LEVEL = 0.8;
const SWITCH_OFF_PITCH = 0.94;

const TURN_FULL = 2.5;
const TURN_LEVEL = 0.5;
const TURN_HOLD = 0.07;
const TURN_FLOOR = 250;
const TURN_DULL = 1400;
const TURN_OPEN = 4200;
const TURN_SLOW = 0.85;
const TURN_FAST = 1.1;
const GRAIN = 0.022;
const GRAIN_DETUNE = 0.06;
const GRAIN_JITTER = 0.18;
const GRAIN_SPREAD = 0.35;
const GRAIN_STEPS = 64;
const GRAIN_ATTACK = 0.08;
const BUZZ_SLOW = 18;
const BUZZ_FAST = 44;

const FAN_LEVEL = 1;
const FAN_FADE = 0.6;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

const vary = (amount: number): number => 1 + (Math.random() * 2 - 1) * amount;

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
  pitch?: number;
}

const createPlayer = (
  context: BaseAudioContext,
  samples: CarouselSamples,
  output: AudioNode
) => {
  const playing = new Set<AudioBufferSourceNode>();
  const last = new Map<CarouselSampleKind, number>();

  const pick = (kind: CarouselSampleKind): AudioBuffer => {
    const takes = samples[kind];
    let index = Math.floor(Math.random() * takes.length);
    if (takes.length > 1 && index === last.get(kind)) {
      index = (index + 1) % takes.length;
    }
    last.set(kind, index);
    return takes[index];
  };

  const play = (kind: CarouselSampleKind, at: number, shot: Shot = {}) => {
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
    source.connect(gain).connect(output);
    playing.add(source);
    source.addEventListener("ended", () => {
      source.disconnect();
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

const createKnob = (
  context: BaseAudioContext,
  rack: AudioBuffer,
  output: AudioNode
) => {
  const tone = new BiquadFilterNode(context, {
    Q: 0.5,
    frequency: TURN_DULL,
    type: "lowpass",
  });
  const floor = new BiquadFilterNode(context, {
    frequency: TURN_FLOOR,
    type: "highpass",
  });
  const level = new GainNode(context, { gain: 0 });
  level.connect(floor).connect(tone).connect(output);
  const envelope = grainWindow();
  const grains = new Set<AudioBufferSourceNode>();
  let nextGrain = 0;

  const grain = (at: number, rate: number): void => {
    const pitch = rate * vary(GRAIN_DETUNE);
    const read = GRAIN * pitch;
    const source = new AudioBufferSourceNode(context, {
      buffer: rack,
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
    source.start(at, Math.random() * (rack.duration - read), read);
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
    turn: (speed: number, at: number): number => {
      const pace = clamp(Math.abs(speed) / TURN_FULL, 0, 1);
      if (pace === 0) {
        return at;
      }
      const rate = TURN_SLOW + (TURN_FAST - TURN_SLOW) * pace;
      const buzz = BUZZ_SLOW + (BUZZ_FAST - BUZZ_SLOW) * pace;
      holdAt(level.gain, at);
      level.gain.setTargetAtTime(
        TURN_LEVEL * pace ** 0.6 * vary(0.06),
        at,
        0.015
      );
      level.gain.setTargetAtTime(0, at + TURN_HOLD, 0.025);
      tone.frequency.setTargetAtTime(
        TURN_DULL + (TURN_OPEN - TURN_DULL) * pace,
        at,
        0.03
      );
      nextGrain = Math.max(nextGrain, at);
      while (nextGrain < at + TURN_HOLD) {
        grain(nextGrain, rate);
        nextGrain += vary(GRAIN_JITTER) / buzz;
      }
      return nextGrain + GRAIN;
    },
  };
};

const createFan = (
  context: BaseAudioContext,
  buffer: AudioBuffer,
  output: AudioNode
) => {
  let voice: { gain: AudioParam; source: AudioBufferSourceNode } | null = null;
  return {
    dispose: () => {
      voice?.source.stop();
      voice = null;
    },
    running: () => voice !== null,
    set: (on: boolean, at: number): void => {
      if (on === (voice !== null)) {
        return;
      }
      if (voice) {
        holdAt(voice.gain, at);
        voice.gain.setTargetAtTime(0, at, FAN_FADE / 4);
        voice.source.stop(at + FAN_FADE * 2);
        voice = null;
        return;
      }
      const source = new AudioBufferSourceNode(context, { buffer, loop: true });
      const gain = new GainNode(context, { gain: 0 });
      source.connect(gain).connect(output);
      source.start(at, Math.random() * buffer.duration);
      source.addEventListener("ended", () => {
        source.disconnect();
        gain.disconnect();
      });
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(FAN_LEVEL, at + FAN_FADE);
      voice = { gain: gain.gain, source };
    },
  };
};

export const createCarouselGraph = (
  context: BaseAudioContext,
  samples: CarouselSamples,
  destination: AudioNode = context.destination
): CarouselGraph => {
  const { input, nodes } = buildOutput(context, destination);
  const player = createPlayer(context, samples, input);
  const { play } = player;
  const knob = createKnob(context, samples.focus[0], input);
  const fan = createFan(context, samples.fan[0], input);
  let steppedAt = Number.NEGATIVE_INFINITY;

  const hear = (event: CarouselEvent, at: number): number => {
    switch (event.type) {
      case "key-down": {
        return play("keyDown", at);
      }
      case "key-up": {
        return play("keyUp", at);
      }
      case "slide-lift": {
        return play("lift", at);
      }
      case "tray-click": {
        if (at - steppedAt < STEP_GAP) {
          return at;
        }
        steppedAt = at;
        const pace = clamp(Math.abs(event.speed) / STEP_FULL, 0.2, 1);
        return play("step", at, {
          level: STEP_LEVEL * pace ** 0.5,
          pitch: 0.94 + 0.12 * pace,
        });
      }
      case "tray-stop": {
        return play("stop", at);
      }
      case "slide-drop": {
        return play("drop", at);
      }
      case "timer": {
        return play("switch", at, {
          pitch: event.on ? 1 : SWITCH_OFF_PITCH,
        });
      }
      case "focus-turn": {
        return knob.turn(event.speed, at);
      }
      default: {
        return at;
      }
    }
  };

  return {
    dispose: () => {
      fan.dispose();
      knob.dispose();
      player.dispose();
      for (const node of nodes) {
        node.disconnect();
      }
    },
    hear,
    running: fan.running,
    setFan: fan.set,
  };
};

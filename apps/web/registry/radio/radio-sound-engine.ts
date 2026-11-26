import type { RadioEvent } from "./radio-events";
import { radioSoundSamples } from "./radio-sound-samples";

const MARKER_SEARCH = 0.2;

const TAKES = {
  dial: [[2.611_96, 0.35]],
  knob: [[1.931_96, 0.6]],
  latch: [
    [0.18, 0.215_23],
    [0.475_23, 0.248_42],
    [0.803_65, 0.194_9],
  ],
  power: [[3.041_96, 0.355_46]],
  stop: [
    [1.078_54, 0.204_15],
    [1.362_69, 0.231_83],
    [1.674_52, 0.177_44],
  ],
} as const satisfies Record<string, readonly (readonly [number, number])[]>;

type RadioSampleKind = keyof typeof TAKES;

type RadioSamples = Record<RadioSampleKind, readonly AudioBuffer[]>;

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
): RadioSamples => {
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
  const samples: Partial<Record<RadioSampleKind, AudioBuffer[]>> = {};
  for (const [kind, takes] of Object.entries(TAKES)) {
    samples[kind as RadioSampleKind] = takes.map(cut);
  }
  return samples as RadioSamples;
};

export const loadRadioSamples = async (
  context: BaseAudioContext,
  signal: AbortSignal
): Promise<RadioSamples> => {
  const response = await fetch(radioSoundSamples, { signal });
  const sprite = await context.decodeAudioData(await response.arrayBuffer());
  return cutSprite(context, sprite);
};

export type { RadioSamples };

export interface RadioSound {
  band: number | null;
  signal: number;
  volume: number;
}

export interface RadioGraph {
  dispose: () => void;
  hear: (event: RadioEvent, at: number) => number;
  setRadio: (state: RadioSound | null, at: number, warm?: boolean) => void;
}

const MASTER = 0.8;
const CLIP_KNEE = 0.7;
const CLIP_STEPS = 2048;

const MAX_VOICES = 32;
const PITCH_SPREAD = 0.03;
const LEVEL_SPREAD = 0.12;

const LATCH_LEVEL = 1;
const BOTTOM_LEVEL = 0.4;
const BOTTOM_PITCH = 0.86;
const BOTTOM_FULL = 22;
const STOP_LEVEL = 0.7;
const STOP_FULL = 14;
const KEY_GAP = 0.02;

const TURN_FULL = 2.5;
const TURN_HOLD = 0.07;
const TURN_FLOOR = 250;
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
const KNOBS = {
  tuning: { dull: 1400, level: 0.32, open: 4200 },
  volume: { dull: 900, level: 0.16, open: 2600 },
} as const;

const AIR_LEVEL = 0.8;
const AIR_GRAIN = 0.05;
const AIR_OVERLAP = 0.4;
const AIR_UNEVEN = 0.55;
const AIR_SPACING = 0.35;
const AIR_COVERED = 0.92;
const AIR_AHEAD = 0.25;
const AIR_TICK_MS = 60;
const AIR_STEPS = 128;
const SPEAKER_LOW = 170;
const SPEAKER_HIGH = 4300;
const VOLUME_TAPER = 1.2;
const WARM_DELAY = 0.18;
const WARM_UP = 1.3;
const COOL_DOWN = 0.07;
const WARM_IN = 0.3;
const SWITCH_DIP = 0.25;
const SWITCH_HOLD = 0.05;
const SWITCH_BACK = 0.08;
const POWER_LEVEL = 0.6;
const BANDS = [
  { rate: 0.8, tone: 1900 },
  { rate: 0.66, tone: 1500 },
  { rate: 0.9, tone: 2300 },
  { rate: 0.72, tone: 2700 },
  { rate: 0.84, tone: 1700 },
  { rate: 0.6, tone: 2100 },
] as const;

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
  samples: RadioSamples,
  output: AudioNode
) => {
  const playing = new Set<AudioBufferSourceNode>();
  const last = new Map<RadioSampleKind, number>();

  const pick = (kind: RadioSampleKind): AudioBuffer => {
    const takes = samples[kind];
    let index = Math.floor(Math.random() * takes.length);
    if (takes.length > 1 && index === last.get(kind)) {
      index = (index + 1) % takes.length;
    }
    last.set(kind, index);
    return takes[index];
  };

  const play = (
    kind: RadioSampleKind,
    at: number,
    shot: Shot = {},
    into: AudioNode = output
  ) => {
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
    source.connect(gain).connect(into);
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
  cord: AudioBuffer,
  voice: (typeof KNOBS)[keyof typeof KNOBS],
  output: AudioNode
) => {
  const tone = new BiquadFilterNode(context, {
    Q: 0.5,
    frequency: voice.dull,
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
      buffer: cord,
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
    source.start(at, Math.random() * (cord.duration - read), read);
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
        voice.level * pace ** 0.6 * vary(0.06),
        at,
        0.015
      );
      level.gain.setTargetAtTime(0, at + TURN_HOLD, 0.025);
      tone.frequency.setTargetAtTime(
        voice.dull + (voice.open - voice.dull) * pace,
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

const airWindow = (): Float32Array<ArrayBuffer> => {
  const curve = new Float32Array(AIR_STEPS);
  for (let index = 0; index < AIR_STEPS; index += 1) {
    curve[index] = Math.sin((Math.PI * index) / (AIR_STEPS - 1));
  }
  return curve;
};

const createSpeaker = (
  context: BaseAudioContext,
  samples: RadioSamples,
  play: ReturnType<typeof createPlayer>["play"],
  output: AudioNode
) => {
  const [dial] = samples.dial;
  const warmth = new GainNode(context, { gain: 0 });
  const tone = new BiquadFilterNode(context, {
    Q: 0.6,
    frequency: BANDS[0].tone,
    type: "lowpass",
  });
  const volume = new GainNode(context, { gain: 0 });
  const low = new BiquadFilterNode(context, {
    frequency: SPEAKER_LOW,
    type: "highpass",
  });
  const high = new BiquadFilterNode(context, {
    Q: 0.7,
    frequency: SPEAKER_HIGH,
    type: "lowpass",
  });
  warmth.connect(tone).connect(volume).connect(low).connect(high);
  high.connect(output);
  const envelope = airWindow();
  const grains = new Set<AudioBufferSourceNode>();
  let state: RadioSound | null = null;
  let nextGrain = 0;
  let timer = 0;

  const grain = (at: number, band: number): void => {
    const voice = BANDS[band % BANDS.length];
    const rate = voice.rate * vary(0.015);
    const read = AIR_GRAIN * rate;
    const from = Math.random() * Math.max(0, dial.duration - read);
    const source = new AudioBufferSourceNode(context, {
      buffer: dial,
      playbackRate: rate,
    });
    const shape = new GainNode(context, { gain: 0 });
    const strength = vary(AIR_UNEVEN);
    shape.gain.setValueCurveAtTime(
      envelope.map((value) => value * strength),
      at,
      AIR_GRAIN
    );
    source.connect(shape).connect(warmth);
    grains.add(source);
    source.addEventListener("ended", () => {
      source.disconnect();
      shape.disconnect();
      grains.delete(source);
    });
    source.start(at, from, read);
  };

  const fill = () => {
    if (state?.band === null || state === null) {
      return;
    }
    const now = context.currentTime;
    nextGrain = Math.max(nextGrain, now);
    while (nextGrain < now + AIR_AHEAD) {
      grain(nextGrain, state.band);
      nextGrain += AIR_GRAIN * (1 - AIR_OVERLAP) * vary(AIR_SPACING);
    }
  };

  const run = (on: boolean) => {
    if (on && timer === 0) {
      timer = window.setInterval(fill, AIR_TICK_MS);
      fill();
    } else if (!on && timer !== 0) {
      window.clearInterval(timer);
      timer = 0;
    }
  };

  const loudness = ({ signal, volume: turned }: RadioSound) =>
    AIR_LEVEL *
    clamp(turned, 0, 1) ** VOLUME_TAPER *
    (1 - AIR_COVERED * clamp(signal, 0, 1));

  return {
    dispose: () => {
      run(false);
      for (const source of grains) {
        source.stop();
        source.disconnect();
      }
      grains.clear();
      for (const node of [warmth, tone, volume, low, high]) {
        node.disconnect();
      }
    },
    set: (next: RadioSound | null, at: number, warm = false): void => {
      const was = state?.band ?? null;
      const band = next?.band ?? null;
      state = next;
      if (next) {
        volume.gain.setTargetAtTime(loudness(next), at, 0.02);
      }
      if (band === was) {
        return;
      }
      holdAt(warmth.gain, at);
      if (band === null) {
        warmth.gain.setTargetAtTime(0, at, COOL_DOWN / 3);
        window.setTimeout(() => {
          if ((state?.band ?? null) === null) {
            run(false);
          }
        }, COOL_DOWN * 4000);
        return;
      }
      tone.frequency.setTargetAtTime(BANDS[band % BANDS.length].tone, at, 0.03);
      run(true);
      if (was === null && warm) {
        warmth.gain.setTargetAtTime(1, at, WARM_IN / 3);
        return;
      }
      if (was === null) {
        play("power", at, { level: POWER_LEVEL }, volume);
        warmth.gain.setValueAtTime(0, at + WARM_DELAY);
        warmth.gain.linearRampToValueAtTime(1, at + WARM_DELAY + WARM_UP);
        return;
      }
      warmth.gain.setTargetAtTime(SWITCH_DIP, at, 0.008);
      warmth.gain.setTargetAtTime(1, at + SWITCH_HOLD, SWITCH_BACK / 3);
    },
  };
};

export const createRadioGraph = (
  context: BaseAudioContext,
  samples: RadioSamples,
  destination: AudioNode = context.destination
): RadioGraph => {
  const { input, nodes } = buildOutput(context, destination);
  const player = createPlayer(context, samples, input);
  const { play } = player;
  const knobs = {
    tuning: createKnob(context, samples.knob[0], KNOBS.tuning, input),
    volume: createKnob(context, samples.knob[0], KNOBS.volume, input),
  };
  const speaker = createSpeaker(context, samples, play, input);
  let heardKey = Number.NEGATIVE_INFINITY;

  const hear = (event: RadioEvent, at: number): number => {
    switch (event.type) {
      case "latch": {
        heardKey = at;
        return play("latch", at, { level: LATCH_LEVEL });
      }
      case "key-bottom": {
        if (at - heardKey < KEY_GAP) {
          return at;
        }
        const pace = clamp(event.speed / BOTTOM_FULL, 0.3, 1);
        return play("latch", at, {
          level: BOTTOM_LEVEL * pace ** 0.5,
          pitch: BOTTOM_PITCH,
        });
      }
      case "key-stop": {
        const pace = clamp(event.speed / STOP_FULL, 0.15, 1);
        return play("stop", at, { level: STOP_LEVEL * pace ** 0.7 });
      }
      case "volume-turn": {
        return knobs.volume.turn(event.speed, at);
      }
      case "tuning-turn": {
        return knobs.tuning.turn(event.speed, at);
      }
      default: {
        return at;
      }
    }
  };

  return {
    dispose: () => {
      speaker.dispose();
      knobs.tuning.dispose();
      knobs.volume.dispose();
      player.dispose();
      for (const node of nodes) {
        node.disconnect();
      }
    },
    hear,
    setRadio: speaker.set,
  };
};

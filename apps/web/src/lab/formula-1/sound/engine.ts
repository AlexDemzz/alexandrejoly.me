import type { PageAudio } from "./page-audio";
import { roomBuffer } from "./synth";
import { VOICES } from "./voices";
import type { Voice } from "./voices";

export interface Cue {
  /** −1 (left) to 1 (right). */
  pan: number;
  /** Seconds after now. */
  delay?: number;
}

export interface SoundPlayer {
  play: (voice: Voice, cue: Cue) => void;
  /** Starts or resumes audio while Sound is on; call from a user gesture. */
  wake: () => void;
}

const TAKES = 6;
const LOWPASS = 12_000;
const ROOM_SEND = 0.03;
const MASTER = 0.6;
const JITTER = 0.02;
const DUCK_WINDOW = 0.07;
const DUCK_LEVEL = 0.55;

const COMPRESSOR = {
  attack: 0.002,
  knee: 12,
  ratio: 3,
  release: 0.12,
  threshold: -20,
} as const;

const spread = (amount: number): number => 1 + (Math.random() * 2 - 1) * amount;

/** The output chain every voice runs into: room send, gentle lowpass and compressor. */
export const buildChain = (context: BaseAudioContext): GainNode => {
  const input = context.createGain();
  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = LOWPASS;
  lowpass.Q.value = 0.5;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = COMPRESSOR.threshold;
  compressor.ratio.value = COMPRESSOR.ratio;
  compressor.knee.value = COMPRESSOR.knee;
  compressor.attack.value = COMPRESSOR.attack;
  compressor.release.value = COMPRESSOR.release;
  const send = context.createGain();
  send.gain.value = ROOM_SEND;
  const room = context.createConvolver();
  room.buffer = roomBuffer(context);
  const master = context.createGain();
  master.gain.value = MASTER;

  input.connect(lowpass).connect(compressor).connect(master);
  input.connect(send).connect(room).connect(lowpass);
  master.connect(context.destination);
  return input;
};

const takes = new WeakMap<BaseAudioContext, Map<Voice, AudioBuffer[]>>();
let lastTake = -1;

const takesFor = (context: BaseAudioContext, voice: Voice): AudioBuffer[] => {
  let byVoice = takes.get(context);
  if (!byVoice) {
    byVoice = new Map();
    takes.set(context, byVoice);
  }
  let set = byVoice.get(voice);
  if (!set) {
    set = Array.from({ length: TAKES }, () => VOICES[voice].render(context));
    byVoice.set(voice, set);
  }
  return set;
};

/** Plays one take of a voice at `at`, never the same take twice in a row, like a real part. */
export const scheduleVoice = (
  context: BaseAudioContext,
  input: AudioNode,
  voice: Voice,
  at: number,
  cue: Cue & { level?: number }
): void => {
  const set = takesFor(context, voice);
  let take = Math.floor(Math.random() * set.length);
  if (take === lastTake) {
    take = (take + 1) % set.length;
  }
  lastTake = take;

  const source = context.createBufferSource();
  const gain = context.createGain();
  const panner = context.createStereoPanner();
  source.buffer = set[take];
  source.playbackRate.value = spread(JITTER);
  gain.gain.value = VOICES[voice].level * (cue.level ?? 1) * spread(JITTER * 2);
  panner.pan.value = cue.pan;
  source.connect(gain).connect(panner).connect(input);
  source.start(at);
};

export const createAudioPlayer = (
  audio: PageAudio,
  isOn: () => boolean
): SoundPlayer => {
  const inputs = new WeakMap<BaseAudioContext, GainNode>();
  const lastPlayed = new Map<Voice, number>();

  const output = (): { context: AudioContext; input: GainNode } | null => {
    if (!isOn()) {
      return null;
    }
    const context = audio.wake();
    if (context === null) {
      return null;
    }
    let input = inputs.get(context);
    if (!input) {
      input = buildChain(context);
      inputs.set(context, input);
    }
    return { context, input };
  };

  return {
    play: (voice, cue) => {
      const target = output();
      if (target === null) {
        return;
      }
      const at = target.context.currentTime + (cue.delay ?? 0);
      const previous = lastPlayed.get(voice) ?? -1;
      if (at - previous < VOICES[voice].minGap) {
        return;
      }
      lastPlayed.set(voice, at);
      const fast = at - previous < DUCK_WINDOW;
      scheduleVoice(target.context, target.input, voice, at, {
        ...cue,
        level: fast ? DUCK_LEVEL : 1,
      });
    },
    wake: () => {
      output();
    },
  };
};

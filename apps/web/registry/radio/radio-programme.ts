export interface RadioProgramme {
  dispose: () => void;
  set: (source: string | null, level: number, cold?: boolean) => void;
}

interface Voice {
  audio: HTMLAudioElement;
  gain: GainNode | null;
  nodes: AudioNode[];
}

const FOLLOW_MS = 30;
const FOLLOW = 0.3;
const GAIN_GLIDE = 0.02;
const WARM_DELAY_MS = 180;
const WARM_UP_MS = 1300;
const SWITCH_MS = 90;
const SWITCH_DIP = 0.2;
const SILENT = 0.002;
const SPEAKER_LOW = 170;
const SPEAKER_HIGH = 4300;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

const ownOrigin = (source: string): boolean => {
  try {
    const url = new URL(source, window.location.href);
    return (
      url.origin === window.location.origin ||
      url.protocol === "data:" ||
      url.protocol === "blob:"
    );
  } catch {
    return false;
  }
};

const onAir = (audio: HTMLAudioElement) => {
  const { duration } = audio;
  if (Number.isFinite(duration) && duration > 0) {
    audio.currentTime = (performance.now() / 1000) % duration;
  }
};

const play = async (audio: HTMLAudioElement) => {
  try {
    await audio.play();
  } catch {
    audio.pause();
  }
};

const open = (source: string, context: AudioContext | null): Voice => {
  const audio = new Audio();
  audio.loop = true;
  audio.preload = "auto";
  const voice: Voice = { audio, gain: null, nodes: [] };
  if (context && ownOrigin(source)) {
    const input = context.createMediaElementSource(audio);
    const gain = new GainNode(context, { gain: 0 });
    const low = new BiquadFilterNode(context, {
      frequency: SPEAKER_LOW,
      type: "highpass",
    });
    const high = new BiquadFilterNode(context, {
      Q: 0.7,
      frequency: SPEAKER_HIGH,
      type: "lowpass",
    });
    input.connect(gain).connect(low).connect(high).connect(context.destination);
    voice.gain = gain;
    voice.nodes = [input, gain, low, high];
  } else {
    audio.volume = 0;
  }
  audio.addEventListener("loadedmetadata", () => onAir(audio), { once: true });
  audio.src = source;
  return voice;
};

const close = ({ audio, nodes }: Voice) => {
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  for (const node of nodes) {
    node.disconnect();
  }
};

export const createRadioProgramme = (
  context: () => AudioContext | null
): RadioProgramme => {
  let voice: Voice | null = null;
  let source: string | null = null;
  let level = 0;
  let heard = 0;
  let warmFrom = Number.NEGATIVE_INFINITY;
  let switchedAt = Number.NEGATIVE_INFINITY;
  let timer = 0;

  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
  };

  const sound = (value: number) => {
    if (!voice) {
      return;
    }
    if (voice.gain) {
      voice.gain.gain.setTargetAtTime(
        value,
        voice.gain.context.currentTime,
        GAIN_GLIDE
      );
    } else {
      voice.audio.volume = clamp(value);
    }
  };

  const follow = () => {
    if (!voice) {
      stop();
      return;
    }
    const now = performance.now();
    const warmth = clamp((now - warmFrom - WARM_DELAY_MS) / WARM_UP_MS);
    const dip = now - switchedAt < SWITCH_MS ? SWITCH_DIP : 1;
    heard += (level * warmth * dip - heard) * FOLLOW;
    sound(heard);
    if (level === 0 && heard < SILENT) {
      heard = 0;
      sound(0);
      voice.audio.pause();
      stop();
    }
  };

  return {
    dispose: () => {
      stop();
      if (voice) {
        close(voice);
        voice = null;
      }
    },
    set: (next, loudness, cold = false) => {
      if (cold) {
        warmFrom = performance.now();
      }
      level = next === null ? 0 : clamp(loudness);
      if (next !== null && next !== source) {
        if (voice) {
          close(voice);
        }
        source = next;
        voice = open(next, context());
        heard = 0;
        switchedAt = performance.now();
      }
      if (!voice || level === 0) {
        return;
      }
      if (voice.audio.paused) {
        onAir(voice.audio);
        void play(voice.audio);
      }
      if (timer === 0) {
        timer = window.setInterval(follow, FOLLOW_MS);
      }
    },
  };
};

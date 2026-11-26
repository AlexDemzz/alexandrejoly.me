export interface RadioProgramme {
  dispose: () => void;
  set: (source: string | null, level: number, cold?: boolean) => void;
}

const LEVEL = 1;
const FOLLOW_MS = 30;
const FOLLOW = 0.3;
const WARM_DELAY_MS = 180;
const WARM_UP_MS = 1300;
const SWITCH_MS = 90;
const SWITCH_DIP = 0.2;
const SILENT = 0.002;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

export const createRadioProgramme = (): RadioProgramme => {
  let audio: HTMLAudioElement | null = null;
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

  const onAir = (element: HTMLAudioElement) => {
    const { duration } = element;
    if (Number.isFinite(duration) && duration > 0) {
      element.currentTime = (performance.now() / 1000) % duration;
    }
  };

  const follow = () => {
    if (!audio) {
      stop();
      return;
    }
    const now = performance.now();
    const warmth = clamp((now - warmFrom - WARM_DELAY_MS) / WARM_UP_MS);
    const dip = now - switchedAt < SWITCH_MS ? SWITCH_DIP : 1;
    const target = LEVEL * level * warmth * dip;
    heard += (target - heard) * FOLLOW;
    audio.volume = clamp(heard);
    if (level === 0 && heard < SILENT) {
      heard = 0;
      audio.volume = 0;
      audio.pause();
      stop();
    }
  };

  const play = async (element: HTMLAudioElement) => {
    try {
      await element.play();
    } catch {}
  };

  const tune = (next: string) => {
    audio ??= new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audio.addEventListener("loadedmetadata", () => audio && onAir(audio), {
      once: true,
    });
    audio.src = next;
    heard = 0;
    switchedAt = performance.now();
  };

  return {
    dispose: () => {
      stop();
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        audio = null;
      }
    },
    set: (next, loudness, cold = false) => {
      if (cold) {
        warmFrom = performance.now();
      }
      level = next === null ? 0 : clamp(loudness);
      if (next !== null && next !== source) {
        source = next;
        tune(next);
      }
      if (!audio || level === 0) {
        return;
      }
      if (audio.paused) {
        onAir(audio);
        void play(audio);
      }
      if (timer === 0) {
        timer = window.setInterval(follow, FOLLOW_MS);
      }
    },
  };
};

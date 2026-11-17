import type { SoundSetting } from "./sound-setting";

/** The page's one AudioContext, shared by the wheel's clicks and the engine. */
export interface PageAudio {
  /** Creates the context on first use and resumes it; call from a user gesture. Null without Web Audio. */
  wake: () => AudioContext | null;
  /** The context if one was made, without making or resuming it. */
  current: () => AudioContext | null;
  suspend: () => void;
}

const makeContext = (): AudioContext | null =>
  typeof window !== "undefined" && "AudioContext" in window
    ? new AudioContext({ latencyHint: "interactive" })
    : null;

export const createPageAudio = (
  make: () => AudioContext | null = makeContext
): PageAudio => {
  let context: AudioContext | null = null;
  return {
    current: () => context,
    suspend: () => {
      if (context?.state === "running") {
        void context.suspend();
      }
    },
    wake: () => {
      context ??= make();
      if (context !== null && context.state !== "running") {
        void context.resume();
      }
      return context;
    },
  };
};

/**
 * Plays only while the visitor wants sound and the tab is visible: turning
 * Sound on is the gesture that starts the context, and a hidden tab or
 * turning it off suspends everything.
 */
export const followSetting = (
  audio: PageAudio,
  setting: SoundSetting,
  page: Document
): (() => void) => {
  const update = (): void => {
    if (setting.isOn() && !page.hidden) {
      audio.wake();
    } else {
      audio.suspend();
    }
  };
  const onVisibility = (): void => {
    // A hidden-then-visible tab resumes only a context the visitor already started.
    if (page.hidden || audio.current() !== null) {
      update();
    }
  };
  const unsubscribe = setting.subscribe(update);
  page.addEventListener("visibilitychange", onVisibility);
  return () => {
    unsubscribe();
    page.removeEventListener("visibilitychange", onVisibility);
  };
};

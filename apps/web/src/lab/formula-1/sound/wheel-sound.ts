import type { WheelStore } from "../model/store";
import { cuesFor, isSoundControl, panFor, voiceFor } from "./cues";
import type { ControlCue, SoundControl } from "./cues";
import type { SoundPlayer } from "./engine";

/** How long a finger on a part covers the action it dispatches: a click lands well inside it. */
const TOUCH_WINDOW_MS = 1000;
const ACTIVATION_KEYS = new Set([" ", "Enter"]);
const CONTROL = "[data-control]";

export interface WheelSound {
  /** The store, with every dispatched action heard; ticks make no sound. */
  wrap: (store: WheelStore) => WheelStore;
  /** Hears fingers and keys on the face's parts, for the press and the let-go. */
  listen: (root: Document | HTMLElement) => () => void;
}

const now = (): number => performance.now();

const controlOf = (event: Event): SoundControl | null => {
  const element =
    event.target instanceof Element
      ? event.target.closest<HTMLElement>(CONTROL)
      : null;
  const name = element?.dataset.control ?? null;
  return name !== null && isSoundControl(name) ? name : null;
};

export const createWheelSound = (player: SoundPlayer): WheelSound => {
  const touchedAt = new Map<SoundControl, number>();
  const touched = (control: SoundControl): boolean =>
    now() - (touchedAt.get(control) ?? Number.NEGATIVE_INFINITY) <
    TOUCH_WINDOW_MS;

  const play = (cue: ControlCue): void => {
    player.play(cue.voice, {
      delay: cue.delay,
      pan: cue.inEar ? 0 : panFor(cue.control),
    });
  };

  const wrap = (store: WheelStore): WheelStore => ({
    ...store,
    dispatch: (action) => {
      if (action.type === "tick") {
        store.dispatch(action);
        return;
      }
      const before = store.getState();
      store.dispatch(action);
      for (const cue of cuesFor(action, before, store.getState(), touched)) {
        play(cue);
      }
    },
  });

  const touch = (control: SoundControl, phase: "press" | "release"): void => {
    touchedAt.set(control, now());
    const voice = voiceFor(control, phase);
    if (voice !== null) {
      play({ control, voice });
    }
  };

  const onPointerDown = (event: Event): void => {
    player.wake();
    const control = controlOf(event);
    const primary = event instanceof MouseEvent ? event.button === 0 : true;
    if (control !== null && primary) {
      touch(control, "press");
    }
  };
  const onPointerUp = (event: Event): void => {
    const control = controlOf(event);
    if (control !== null) {
      touch(control, "release");
    }
  };
  const onKeyDown = (event: Event): void => {
    player.wake();
    const control = controlOf(event);
    if (
      control !== null &&
      event instanceof KeyboardEvent &&
      !event.repeat &&
      ACTIVATION_KEYS.has(event.key)
    ) {
      touch(control, "press");
    }
  };
  const onKeyUp = (event: Event): void => {
    const control = controlOf(event);
    if (
      control !== null &&
      event instanceof KeyboardEvent &&
      ACTIVATION_KEYS.has(event.key)
    ) {
      touch(control, "release");
    }
  };

  const listen = (root: Document | HTMLElement): (() => void) => {
    root.addEventListener("pointerdown", onPointerDown, true);
    root.addEventListener("pointerup", onPointerUp, true);
    root.addEventListener("keydown", onKeyDown, true);
    root.addEventListener("keyup", onKeyUp, true);
    return () => {
      root.removeEventListener("pointerdown", onPointerDown, true);
      root.removeEventListener("pointerup", onPointerUp, true);
      root.removeEventListener("keydown", onKeyDown, true);
      root.removeEventListener("keyup", onKeyUp, true);
    };
  };

  return { listen, wrap };
};

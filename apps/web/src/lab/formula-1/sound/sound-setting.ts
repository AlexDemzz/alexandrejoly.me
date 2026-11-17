/** The visitor's Sound choice: off until they turn it on, then remembered. */
export interface SoundSetting {
  isOn: () => boolean;
  set: (on: boolean) => void;
  subscribe: (listener: () => void) => () => void;
}

export const SOUND_STORAGE_KEY = "formula-1-sound";

const pageStorage = (): Storage | null =>
  typeof window === "undefined" ? null : window.localStorage;

/** Storage can be missing or throw (private windows, blocked site data): the setting then lives for the visit. */
export const createSoundSetting = (
  storage: () => Storage | null = pageStorage
): SoundSetting => {
  let on: boolean | null = null;
  const listeners = new Set<() => void>();

  const read = (): boolean => {
    try {
      return storage()?.getItem(SOUND_STORAGE_KEY) === "on";
    } catch {
      return false;
    }
  };

  const write = (value: boolean): void => {
    try {
      storage()?.setItem(SOUND_STORAGE_KEY, value ? "on" : "off");
    } catch {
      // Not remembered, but still applied for this visit.
    }
  };

  return {
    isOn: () => {
      on ??= read();
      return on;
    },
    set: (next) => {
      if (next === on) {
        return;
      }
      on = next;
      write(next);
      for (const listener of listeners) {
        listener();
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

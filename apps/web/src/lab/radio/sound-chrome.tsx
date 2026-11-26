import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { RadioAudioProvider } from "@registry/radio/radio-sound";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { PreviewToggle } from "@/components/docs/component-preview";

/** The visitor's Sound choice for every radio preview: on until they turn it off, then remembered. */
const SOUND_KEY = "radio-sound";

const listeners = new Set<() => void>();
let soundOn: boolean | null = null;

const storedSound = () => {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
};

const storeSound = (on: boolean) => {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
    return true;
  } catch {
    // Not remembered, but still applied for this visit.
    return false;
  }
};

const readSound = () => {
  soundOn ??= storedSound();
  return soundOn;
};

const serverOn = () => true;

const subscribeSound = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const setSound = (on: boolean) => {
  soundOn = on;
  storeSound(on);
  for (const listener of listeners) {
    listener();
  }
};

const useSound = () =>
  useSyncExternalStore(subscribeSound, readSound, serverOn);

/**
 * Mutes every radio on the page while the visitor's Sound choice is off,
 * through the registry's own `RadioAudioProvider`: the demos mount a plain
 * `RadioAudio`, so their code never carries the docs' toggle.
 */
export const RadioSoundScope = ({ children }: { children: ReactNode }) => (
  <RadioAudioProvider muted={!useSound()}>{children}</RadioAudioProvider>
);

/** The preview's Sound toggle, drawn by ComponentPreview over a radio demo. Every toggle shares the one choice. */
export const RadioSoundChrome = () => {
  const on = useSound();
  return (
    <PreviewToggle label="Sound" onPressedChange={setSound} pressed={on}>
      {on ? <SpeakerHighIcon aria-hidden /> : <SpeakerSlashIcon aria-hidden />}
    </PreviewToggle>
  );
};

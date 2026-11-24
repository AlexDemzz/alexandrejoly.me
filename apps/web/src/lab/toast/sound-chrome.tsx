import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { ToasterAudioProvider } from "@registry/toaster/toaster-sound";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { PreviewToggle } from "@/components/docs/component-preview";

/** The visitor's Sound choice for every toaster preview: on until they turn it off, then remembered. */
const SOUND_KEY = "toaster-sound";

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
 * Mutes every toaster on the page while the visitor's Sound choice is off,
 * through the registry's own `ToasterAudioProvider`: the demos mount a plain
 * `ToasterAudio`, so their code never carries the docs' toggle.
 */
export const ToasterSoundScope = ({ children }: { children: ReactNode }) => (
  <ToasterAudioProvider muted={!useSound()}>{children}</ToasterAudioProvider>
);

/** The preview's Sound toggle, drawn by ComponentPreview over a toaster demo. Every toggle shares the one choice. */
export const ToasterSoundChrome = () => {
  const on = useSound();
  return (
    <PreviewToggle label="Sound" onPressedChange={setSound} pressed={on}>
      {on ? <SpeakerHighIcon aria-hidden /> : <SpeakerSlashIcon aria-hidden />}
    </PreviewToggle>
  );
};

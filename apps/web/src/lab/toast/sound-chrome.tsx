import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { toasterSoundSetting } from "@registry/toaster/toaster-sound";
import { useEffect, useSyncExternalStore } from "react";

import { PreviewToggle } from "@/components/docs/component-preview";

/** The visitor's Sound choice for every toaster preview: on until they turn it off, then remembered. */
const SOUND_KEY = "toaster-sound";

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

const serverOn = () => true;

/**
 * The preview's Sound toggle, drawn by ComponentPreview over a toaster demo
 * so the demo's code stays the toaster alone. Every toggle drives the
 * registry's page-wide `toasterSoundSetting`, so they stay in sync, and the
 * `ToasterAudio` in each demo follows it.
 */
export const ToasterSoundChrome = () => {
  const on = useSyncExternalStore(
    toasterSoundSetting.subscribe,
    toasterSoundSetting.isEnabled,
    serverOn
  );

  useEffect(() => {
    toasterSoundSetting.setEnabled(storedSound());
  }, []);

  return (
    <PreviewToggle
      label="Sound"
      onPressedChange={(pressed) => {
        storeSound(pressed);
        toasterSoundSetting.setEnabled(pressed);
      }}
      pressed={on}
    >
      {on ? <SpeakerHighIcon aria-hidden /> : <SpeakerSlashIcon aria-hidden />}
    </PreviewToggle>
  );
};

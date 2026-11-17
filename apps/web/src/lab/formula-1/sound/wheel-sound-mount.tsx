import { useEffect } from "react";

import type { WheelStore } from "../model/store";
import { createAudioPlayer } from "./engine";
import { createPageAudio, followSetting } from "./page-audio";
import { createEngineSound } from "./power-unit/engine-sound";
import { createSoundSetting } from "./sound-setting";
import { createWheelSound } from "./wheel-sound";

const audio = createPageAudio();

/** The page's Sound toggle: the wheel's clicks and the engine both wait for it. */
export const soundSetting = createSoundSetting();

/** The page's one sound: wrap the wheel's store with it, and mount `<WheelSound />` once. */
export const wheelSound = createWheelSound(
  createAudioPlayer(audio, soundSetting.isOn)
);

const engineSound = createEngineSound({ audio, setting: soundSetting });

interface WheelSoundProps {
  store: WheelStore;
}

export const WheelSound = ({ store }: WheelSoundProps) => {
  useEffect(() => wheelSound.listen(document), []);
  useEffect(() => followSetting(audio, soundSetting, document), []);
  useEffect(() => engineSound.attach(store), [store]);
  return null;
};

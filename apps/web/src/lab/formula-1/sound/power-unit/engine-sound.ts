import type { WheelStore } from "../../model/store";
import type { PageAudio } from "../page-audio";
import type { SoundSetting } from "../sound-setting";
import { createEngineFrame, createEngineMemory, readEngine } from "./frame";
import { loadEngineVoice } from "./voice";
import type { EngineVoice, EngineVoiceFactory } from "./voice";

export interface EngineSound {
  /** Follows the store's frames outside React; returns the detach. */
  attach: (store: WheelStore) => () => void;
}

interface EngineSoundOptions {
  audio: PageAudio;
  setting: SoundSetting;
  /** Readies the context for the engine and gives the voice it can play. */
  load?: (context: BaseAudioContext) => Promise<EngineVoiceFactory>;
}

/**
 * The engine plays while Sound is on, the visitor's gesture has started the
 * page's audio and the car is on track; the garage's car is switched off.
 */
export const createEngineSound = ({
  audio,
  setting,
  load = loadEngineVoice,
}: EngineSoundOptions): EngineSound => {
  const memory = createEngineMemory();
  const frame = createEngineFrame();
  let makeVoice: EngineVoiceFactory | null = null;
  let loading = false;
  let voice: EngineVoice | null = null;

  const silence = (context: BaseAudioContext): void => {
    voice?.stop(context.currentTime);
    voice = null;
  };

  const ready = async (context: BaseAudioContext): Promise<void> => {
    loading = true;
    try {
      makeVoice = await load(context);
    } catch {
      // Tried again on a later frame.
      loading = false;
    }
  };

  const follow = (store: WheelStore): void => {
    const context = audio.current();
    if (context === null) {
      return;
    }
    if (!setting.isOn()) {
      silence(context);
      return;
    }
    if (makeVoice === null && !loading) {
      void ready(context);
    }
    readEngine(store.getState(), memory, frame);
    if (!frame.running) {
      silence(context);
      return;
    }
    if (makeVoice === null || context.state !== "running") {
      return;
    }
    voice ??= makeVoice(context, context.destination);
    voice.set(frame, context.currentTime);
  };

  return {
    attach: (store) => {
      const onChange = (): void => {
        follow(store);
      };
      const stopStore = store.subscribe(onChange);
      const stopSetting = setting.subscribe(onChange);
      return () => {
        stopStore();
        stopSetting();
        const context = audio.current();
        if (context !== null) {
          silence(context);
        }
      };
    },
  };
};

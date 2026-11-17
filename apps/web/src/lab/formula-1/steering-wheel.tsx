import { useMemo } from "react";

import { WheelDisplay } from "./display/wheel-display";
import { WheelProvider, createWheelStore } from "./model/store";
import { SessionControl } from "./session/session-control";
import { SoundToggle } from "./sound/sound-toggle";
import {
  WheelSound,
  soundSetting,
  wheelSound,
} from "./sound/wheel-sound-mount";
import { WheelFace } from "./wheel/wheel-face";

export const SteeringWheel = () => {
  const store = useMemo(() => wheelSound.wrap(createWheelStore()), []);
  return (
    <WheelProvider store={store}>
      <WheelSound store={store} />
      <div className="flex justify-center" data-slot="steering-wheel">
        <div className="w-full max-w-3xl min-w-0">
          <WheelFace display={<WheelDisplay />} />
        </div>
      </div>
      <div className="relative mt-6 flex flex-wrap justify-center gap-3">
        <SessionControl />
        <SoundToggle setting={soundSetting} />
      </div>
    </WheelProvider>
  );
};

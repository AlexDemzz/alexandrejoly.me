import { useMemo } from "react";

import { WheelDisplay } from "./display/wheel-display";
import { TrackMinimap } from "./minimap/track-minimap";
import { WheelProvider, createWheelStore } from "./model/store";
import { GearControl } from "./session/gear-control";
import { RaceToggle } from "./session/race-toggle";
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
      <div
        className="@container relative flex flex-wrap justify-center"
        data-slot="steering-wheel"
      >
        <div className="w-full max-w-3xl min-w-0">
          <WheelFace display={<WheelDisplay />} />
        </div>
        <TrackMinimap />
      </div>
      <div className="relative mt-6 flex justify-center gap-2 sm:gap-3">
        <RaceToggle />
        <GearControl />
        <SoundToggle setting={soundSetting} />
      </div>
    </WheelProvider>
  );
};

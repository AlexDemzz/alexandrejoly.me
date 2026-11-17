import { PlayIcon, StopIcon } from "@phosphor-icons/react";
import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle";

import { CONTROL_ITEM, CONTROL_TRACK } from "../control-pill";
import { useWheel, useWheelDispatch } from "../model/store";
import type { WheelState } from "../model/types";

const selectRacing = (state: WheelState): boolean => state.session === "track";

export const RaceToggle = () => {
  const racing = useWheel(selectRacing);
  const dispatch = useWheelDispatch();
  return (
    <div className={CONTROL_TRACK} data-race-toggle>
      <Toggle
        className={CONTROL_ITEM}
        onPressedChange={(pressed) => {
          dispatch({ session: pressed ? "track" : "garage", type: "session" });
        }}
        pressed={racing}
      >
        <ToggleIcon className="flex-none">
          {racing ? (
            <StopIcon className="text-(--lab-hot)" weight="fill" />
          ) : (
            <PlayIcon />
          )}
        </ToggleIcon>
        Race
      </Toggle>
    </div>
  );
};

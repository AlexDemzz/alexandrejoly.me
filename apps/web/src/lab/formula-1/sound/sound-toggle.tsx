import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { cn } from "@portfolio/ui/lib/utils";
import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle";
import { useSyncExternalStore } from "react";

import { CONTROL_ITEM } from "../control-pill";
import type { SoundSetting } from "./sound-setting";

const serverOff = (): boolean => false;

interface SoundToggleProps {
  setting: SoundSetting;
}

/** Turns the engine and the wheel's clicks on and off; off until the visitor presses it. */
export const SoundToggle = ({ setting }: SoundToggleProps) => {
  const on = useSyncExternalStore(setting.subscribe, setting.isOn, serverOff);
  return (
    <div className="bg-muted inline-flex rounded-full p-0.75" data-sound-toggle>
      <Toggle
        className={cn(
          CONTROL_ITEM,
          "data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-hairline dark:data-pressed:bg-accent"
        )}
        onPressedChange={(pressed) => {
          setting.set(pressed);
        }}
        pressed={on}
      >
        <ToggleIcon className="flex-none">
          {on ? <SpeakerHighIcon /> : <SpeakerSlashIcon />}
        </ToggleIcon>
        Sound
      </Toggle>
    </div>
  );
};

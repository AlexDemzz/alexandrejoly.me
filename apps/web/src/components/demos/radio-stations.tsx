import {
  Radio,
  RadioGroup,
  RadioGroupItem,
  RadioOff,
  RadioStage,
  RadioTuning,
  RadioVolume,
} from "@registry/radio/radio";
import { RadioAudio } from "@registry/radio/radio-sound";

export const RadioStations = () => (
  <Radio className="w-full max-w-sm" defaultTuning={25}>
    <RadioStage>
      <RadioOff />
      <RadioGroup aria-label="Station">
        <RadioGroupItem
          position={25}
          src="/lab/literal-ui/radio/jazz.m4a"
          value="jazz"
        >
          Jazz
        </RadioGroupItem>
        <RadioGroupItem
          position={75}
          src="/lab/literal-ui/radio/musette.m4a"
          value="musette"
        >
          Musette
        </RadioGroupItem>
      </RadioGroup>
      <RadioVolume />
      <RadioTuning />
    </RadioStage>
    <RadioAudio />
  </Radio>
);

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

const stations = [
  { label: "LW", src: "/lab/literal-ui/radio/strings.m4a", value: "lw" },
  { label: "SW", src: "/lab/literal-ui/radio/jazz.m4a", value: "sw" },
  { label: "MW", src: "/lab/literal-ui/radio/dance.m4a", value: "mw" },
  { label: "FM", src: "/lab/literal-ui/radio/musette.m4a", value: "fm" },
];

export const RadioDemo = () => (
  <Radio className="w-full max-w-3xl">
    <RadioStage>
      <RadioOff />
      <RadioGroup aria-label="Band">
        {stations.map((station) => (
          <RadioGroupItem
            key={station.value}
            src={station.src}
            value={station.value}
          >
            {station.label}
          </RadioGroupItem>
        ))}
      </RadioGroup>
      <RadioVolume />
      <RadioTuning />
    </RadioStage>
    <RadioAudio />
  </Radio>
);

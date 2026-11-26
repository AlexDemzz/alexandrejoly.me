import { Button } from "@portfolio/ui/components/button";
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
import { useState } from "react";

const stations = [
  { label: "Jazz", src: "/lab/literal-ui/radio/jazz.m4a", value: "jazz" },
  { label: "Dance", src: "/lab/literal-ui/radio/dance.m4a", value: "dance" },
  {
    label: "Concert",
    src: "/lab/literal-ui/radio/strings.m4a",
    value: "concert",
  },
];

const VOLUME_STEP = 15;

export const RadioControlled = () => {
  const [station, setStation] = useState<string | null>("jazz");
  const [volume, setVolume] = useState(35);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Radio
        onValueChange={setStation}
        onVolumeChange={setVolume}
        value={station}
        volume={volume}
      >
        <RadioStage>
          <RadioOff />
          <RadioGroup aria-label="Station">
            {stations.map((each) => (
              <RadioGroupItem
                key={each.value}
                src={each.src}
                value={each.value}
              >
                {each.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
          <RadioVolume />
          <RadioTuning />
        </RadioStage>
        <RadioAudio />
      </Radio>
      <div className="flex flex-wrap gap-2">
        {stations.map((each) => (
          <Button
            aria-pressed={station === each.value}
            key={each.value}
            onClick={() => setStation(each.value)}
            variant={station === each.value ? "secondary" : "outline"}
          >
            {each.label}
          </Button>
        ))}
        <Button
          aria-pressed={station === null}
          onClick={() => setStation(null)}
          variant={station === null ? "secondary" : "outline"}
        >
          Off
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setVolume(Math.max(0, volume - VOLUME_STEP))}
          variant="outline"
        >
          Quieter
        </Button>
        <Button
          onClick={() => setVolume(Math.min(100, volume + VOLUME_STEP))}
          variant="outline"
        >
          Louder
        </Button>
      </div>
    </div>
  );
};

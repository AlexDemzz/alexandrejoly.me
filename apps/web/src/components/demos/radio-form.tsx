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

const speeds = [
  { label: "Standard", value: "standard" },
  { label: "Express", value: "express" },
  { label: "Overnight", value: "overnight" },
];

export const RadioForm = () => {
  const [sent, setSent] = useState<string | null>(null);

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        const speed = new FormData(event.currentTarget).get("shipping");
        setSent(typeof speed === "string" ? speed : null);
      }}
    >
      <Radio defaultValue="standard">
        <RadioStage>
          <RadioOff />
          <RadioGroup aria-label="Shipping speed" name="shipping" required>
            {speeds.map((speed) => (
              <RadioGroupItem key={speed.value} value={speed.value}>
                {speed.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
          <RadioVolume />
          <RadioTuning />
        </RadioStage>
        <RadioAudio />
      </Radio>
      <div className="flex items-center gap-3">
        <Button type="submit">Continue</Button>
        <output className="text-muted-foreground text-sm">
          {sent ? `Sent shipping=${sent}` : "Nothing sent yet"}
        </output>
      </div>
    </form>
  );
};

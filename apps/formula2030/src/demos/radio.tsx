import { Field, FieldLabel } from "@ui-sdk/react/field";

import {
  Radio,
  RadioGroup,
  RadioIndicator,
} from "@/registry/formula/ui/formula/radio";

const LEVELS = [
  { label: "Low", value: "low" },
  { label: "Standard", value: "standard" },
  { label: "High", value: "high" },
];

const Demo = () => (
  <RadioGroup aria-label="Regenerative braking" defaultValue="standard">
    {LEVELS.map((level) => (
      <Field key={level.value}>
        <Radio value={level.value}>
          <RadioIndicator />
        </Radio>
        <FieldLabel>{level.label}</FieldLabel>
      </Field>
    ))}
    <Field>
      <Radio disabled value="one-pedal">
        <RadioIndicator />
      </Radio>
      <FieldLabel>One-pedal, unavailable below 5 °C</FieldLabel>
    </Field>
  </RadioGroup>
);

export default Demo;

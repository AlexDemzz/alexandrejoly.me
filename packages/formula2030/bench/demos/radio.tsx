import { Field, FieldLabel } from "@ui-sdk/react/field";

import {
  Radio,
  RadioGroup,
  RadioIndicator,
} from "@/registry/formula/ui/formula/radio";

const Demo = () => (
  <>
    <RadioGroup aria-label="Regenerative braking" defaultValue="standard">
      <Field>
        <Radio value="low">
          <RadioIndicator />
        </Radio>
        <FieldLabel>Low</FieldLabel>
      </Field>
      <Field>
        <Radio value="standard">
          <RadioIndicator />
        </Radio>
        <FieldLabel>Standard</FieldLabel>
      </Field>
      <Field>
        <Radio value="high">
          <RadioIndicator />
        </Radio>
        <FieldLabel>High</FieldLabel>
      </Field>
      <Field>
        <Radio disabled value="one-pedal">
          <RadioIndicator />
        </Radio>
        <FieldLabel>One-pedal, unavailable below 5 °C</FieldLabel>
      </Field>
    </RadioGroup>
    <RadioGroup aria-label="Charge limit" defaultValue="80" disabled>
      <Field>
        <Radio value="80">
          <RadioIndicator />
        </Radio>
        <FieldLabel>80%, daily driving</FieldLabel>
      </Field>
      <Field>
        <Radio value="100">
          <RadioIndicator />
        </Radio>
        <FieldLabel>100%, long trips</FieldLabel>
      </Field>
    </RadioGroup>
  </>
);

export default Demo;

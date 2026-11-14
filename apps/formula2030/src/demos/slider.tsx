import { Field, FieldLabel } from "@ui-sdk/react/field";

import {
  Glass,
  GlassCaption,
  GlassBrackets,
} from "@/registry/formula/ui/formula/glass";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderScale,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@/registry/formula/ui/formula/slider";

const MARKS = [-40, -20, 0, 20, 40];

const Demo = () => (
  <Glass>
    <GlassBrackets />
    <Field>
      <Slider
        defaultValue={-20}
        format={{ style: "unit", unit: "millimeter" }}
        major={4}
        max={40}
        min={-40}
        step={5}
        ticks={16}
      >
        <FieldLabel>
          <GlassCaption>Ride height</GlassCaption>
        </FieldLabel>
        <SliderValue />
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
        <SliderScale>
          {MARKS.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </SliderScale>
      </Slider>
    </Field>
  </Glass>
);

export default Demo;

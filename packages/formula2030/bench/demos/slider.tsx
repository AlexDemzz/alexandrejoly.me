import { Field, FieldLabel } from "@ui-sdk/react/field";

import { Glass, GlassCaption } from "@/registry/formula/ui/formula/glass";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderScale,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@/registry/formula/ui/formula/slider";

const MARKS = [16, 18, 20, 22, 24, 26, 28];

const Demo = () => (
  <Glass brackets>
    <Field>
      <Slider
        defaultValue={22}
        format={{ maximumFractionDigits: 1, style: "unit", unit: "celsius" }}
        major={4}
        max={28}
        min={16}
        step={0.5}
        ticks={24}
      >
        <FieldLabel>
          <GlassCaption>Cabin temperature</GlassCaption>
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

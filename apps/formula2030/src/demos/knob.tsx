import { Field, FieldLabel } from "@ui-sdk/react/field";

import {
  Knob,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@/registry/formula/ui/formula/knob";
import { Tile, TileGroup } from "@/registry/formula/ui/formula/tile";

const Dial = () => (
  <SliderControl>
    <SliderTrack>
      <SliderIndicator />
      <SliderThumb />
    </SliderTrack>
  </SliderControl>
);

const Demo = () => (
  <TileGroup>
    <Tile>
      <Field>
        <Knob defaultValue={12} max={30}>
          <Dial />
          <SliderValue />
          <FieldLabel>Volume</FieldLabel>
        </Knob>
      </Field>
    </Tile>
    <Tile>
      <Field>
        <Knob
          defaultValue={0.7}
          format={{ style: "percent" }}
          max={1}
          step={0.05}
          ticks={20}
          tone="gold"
        >
          <Dial />
          <SliderValue />
          <FieldLabel>Boost</FieldLabel>
        </Knob>
      </Field>
    </Tile>
    <Tile>
      <Field>
        <Knob defaultValue={2} max={6} ticks={6}>
          <Dial />
          <SliderValue />
          <FieldLabel>Fan speed</FieldLabel>
        </Knob>
      </Field>
    </Tile>
    <Tile>
      <Field>
        <Knob defaultValue={4} disabled max={10} ticks={10}>
          <Dial />
          <SliderValue />
          <FieldLabel>Trailer brake</FieldLabel>
        </Knob>
      </Field>
    </Tile>
  </TileGroup>
);

export default Demo;

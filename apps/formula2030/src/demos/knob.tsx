import { Field, FieldLabel } from "@ui-sdk/react/field";

import {
  Knob,
  KnobControl,
  KnobIndicator,
  KnobThumb,
  KnobTrack,
  KnobValue,
} from "@/registry/formula/ui/formula/knob";
import { Tile, TileGroup } from "@/registry/formula/ui/formula/tile";

const Dial = () => (
  <KnobControl>
    <KnobTrack>
      <KnobIndicator />
      <KnobThumb />
    </KnobTrack>
  </KnobControl>
);

const Demo = () => (
  <TileGroup>
    <Tile>
      <Field>
        <Knob defaultValue={12} max={30}>
          <Dial />
          <KnobValue />
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
          <KnobValue />
          <FieldLabel>Boost</FieldLabel>
        </Knob>
      </Field>
    </Tile>
    <Tile>
      <Field>
        <Knob defaultValue={2} max={6} ticks={6}>
          <Dial />
          <KnobValue />
          <FieldLabel>Fan speed</FieldLabel>
        </Knob>
      </Field>
    </Tile>
    <Tile>
      <Field>
        <Knob defaultValue={4} disabled max={10} ticks={10}>
          <Dial />
          <KnobValue />
          <FieldLabel>Trailer brake</FieldLabel>
        </Knob>
      </Field>
    </Tile>
  </TileGroup>
);

export default Demo;

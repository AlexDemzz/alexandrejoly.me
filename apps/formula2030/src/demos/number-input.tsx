import { Field, FieldLabel } from "@ui-sdk/react/field";
import type { ComponentProps } from "react";

import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
  NumberInputScrubArea,
  NumberInputScrubAreaCursor,
} from "@/registry/formula/ui/formula/number-input";
import { Tile, TileGroup } from "@/registry/formula/ui/formula/tile";

interface Dial extends ComponentProps<typeof NumberInput> {
  label: string;
  less: string;
  more: string;
}

const DIALS: Dial[] = [
  {
    defaultValue: 22,
    format: { maximumFractionDigits: 1, style: "unit", unit: "celsius" },
    label: "Cabin temperature",
    less: "Cooler",
    max: 28,
    min: 16,
    more: "Warmer",
    step: 0.5,
    tone: "thermal",
  },
  {
    defaultValue: -20,
    format: { style: "unit", unit: "millimeter" },
    label: "Ride height",
    less: "Lower",
    max: 40,
    min: -40,
    more: "Raise",
    step: 5,
  },
];

const Demo = () => (
  <TileGroup>
    {DIALS.map(({ label, less, more, ...dial }) => (
      <Field key={label}>
        <Tile>
          <NumberInput {...dial}>
            <NumberInputGroup>
              <NumberInputDecrement aria-label={less} />
              <NumberInputControl />
              <NumberInputIncrement aria-label={more} />
            </NumberInputGroup>
            <NumberInputScrubArea pixelsPerStep={6}>
              <FieldLabel>{label}</FieldLabel>
              <NumberInputScrubAreaCursor />
            </NumberInputScrubArea>
          </NumberInput>
        </Tile>
      </Field>
    ))}
  </TileGroup>
);

export default Demo;

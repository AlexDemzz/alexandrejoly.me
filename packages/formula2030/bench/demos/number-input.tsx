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
  invalid?: boolean;
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
  {
    defaultValue: 35,
    disabled: true,
    format: { style: "unit", unit: "millimeter" },
    label: "Nose lift",
    less: "Lower",
    more: "Raise",
    step: 5,
  },
  {
    defaultValue: 0.8,
    format: { style: "percent" },
    label: "Charge limit",
    less: "Less",
    max: 1,
    min: 0.5,
    more: "More",
    readOnly: true,
    step: 0.05,
  },
  {
    defaultValue: 950,
    format: { style: "unit", unit: "kilogram" },
    invalid: true,
    label: "Tow load",
    less: "Lighter",
    more: "Heavier",
    step: 50,
  },
  {
    defaultValue: 28,
    format: { maximumFractionDigits: 1, style: "unit", unit: "celsius" },
    label: "Rear cabin",
    less: "Cooler",
    max: 28,
    min: 16,
    more: "Warmer",
    step: 0.5,
    tone: "thermal",
  },
];

const ROWS = [DIALS.slice(0, 2), DIALS.slice(2, 4), DIALS.slice(4)];

const Demo = () => (
  <>
    {ROWS.map((row) => (
      <TileGroup key={row[0]?.label}>
        {row.map(({ invalid, label, less, more, ...dial }) => (
          <Field invalid={invalid} key={label}>
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
    ))}
  </>
);

export default Demo;

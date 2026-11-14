import { Label } from "@ui-sdk/react/label";

import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@/registry/formula/ui/formula/checkbox";
import { Tile, TileGroup } from "@/registry/formula/ui/formula/tile";

const OPENINGS = [
  { label: "Front windows", value: "front" },
  { label: "Rear windows", value: "rear" },
  { label: "Sunroof", value: "sunroof" },
];

const Demo = () => (
  <>
    <CheckboxGroup
      allValues={OPENINGS.map((item) => item.value)}
      aria-label="Vent on unlock"
      defaultValue={["front"]}
    >
      <TileGroup>
        <Tile render={<Label />}>
          <Checkbox parent>
            <CheckboxIndicator />
          </Checkbox>
          Vent all
        </Tile>
        {OPENINGS.map((item) => (
          <Tile render={<Label />} key={item.value}>
            <Checkbox value={item.value}>
              <CheckboxIndicator />
            </Checkbox>
            {item.label}
          </Tile>
        ))}
      </TileGroup>
    </CheckboxGroup>
    <TileGroup>
      <Tile render={<Label />}>
        <Checkbox defaultChecked readOnly>
          <CheckboxIndicator />
        </Checkbox>
        Alarm
      </Tile>
      <Tile render={<Label />}>
        <Checkbox defaultChecked disabled>
          <CheckboxIndicator />
        </Checkbox>
        Child lock
      </Tile>
      <Tile render={<Label />}>
        <Checkbox defaultChecked="indeterminate" disabled>
          <CheckboxIndicator />
        </Checkbox>
        Charge port
      </Tile>
      <Tile render={<Label />}>
        <Checkbox disabled>
          <CheckboxIndicator />
        </Checkbox>
        Glovebox
      </Tile>
    </TileGroup>
  </>
);

export default Demo;

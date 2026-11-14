import {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
} from "@/registry/formula/ui/formula/checkbox";
import { TileGroup, TileLabel } from "@/registry/formula/ui/formula/tile";

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
        <TileLabel>
          <Checkbox parent>
            <CheckboxIndicator />
          </Checkbox>
          Vent all
        </TileLabel>
        {OPENINGS.map((item) => (
          <TileLabel key={item.value}>
            <Checkbox value={item.value}>
              <CheckboxIndicator />
            </Checkbox>
            {item.label}
          </TileLabel>
        ))}
      </TileGroup>
    </CheckboxGroup>
    <TileGroup>
      <TileLabel>
        <Checkbox defaultChecked readOnly>
          <CheckboxIndicator />
        </Checkbox>
        Alarm
      </TileLabel>
      <TileLabel>
        <Checkbox defaultChecked disabled>
          <CheckboxIndicator />
        </Checkbox>
        Child lock
      </TileLabel>
      <TileLabel>
        <Checkbox defaultChecked="indeterminate" disabled>
          <CheckboxIndicator />
        </Checkbox>
        Charge port
      </TileLabel>
      <TileLabel>
        <Checkbox disabled>
          <CheckboxIndicator />
        </Checkbox>
        Glovebox
      </TileLabel>
    </TileGroup>
  </>
);

export default Demo;

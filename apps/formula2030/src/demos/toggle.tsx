import {
  ArmchairIcon,
  ArrowsClockwiseIcon,
  FootprintsIcon,
  SteeringWheelIcon,
  UserIcon,
  WarningIcon,
  WavesIcon,
} from "@phosphor-icons/react";

import { Tile, TileGroup } from "@/registry/formula/ui/formula/tile";
import {
  Toggle,
  ToggleGroup,
  ToggleIcon,
} from "@/registry/formula/ui/formula/toggle";

const WIPERS = [
  { label: "Off", value: "off" },
  { label: "Auto", value: "auto" },
  { label: "Fast", value: "fast" },
];

const Demo = () => (
  <>
    <TileGroup>
      <Tile>
        <Toggle aria-label="Rear defrost" defaultPressed>
          <ToggleIcon>
            <WavesIcon aria-hidden size={20} />
          </ToggleIcon>
        </Toggle>
        Rear defrost
      </Tile>
      <Tile>
        <Toggle aria-label="Recirculate">
          <ToggleIcon>
            <ArrowsClockwiseIcon aria-hidden size={20} />
          </ToggleIcon>
        </Toggle>
        Recirculate
      </Tile>
      <Tile>
        <Toggle aria-label="Seat heat" defaultPressed>
          <ToggleIcon>
            <ArmchairIcon aria-hidden size={20} />
          </ToggleIcon>
        </Toggle>
        Seat heat
      </Tile>
      <Tile>
        <Toggle aria-label="Hazard lights" disabled>
          <ToggleIcon>
            <WarningIcon aria-hidden size={20} />
          </ToggleIcon>
        </Toggle>
        Hazards
      </Tile>
    </TileGroup>
    <TileGroup>
      <Tile>
        <ToggleGroup
          aria-label="Air distribution"
          defaultValue={["face", "screen"]}
          multiple
        >
          <Toggle aria-label="Face" value="face">
            <ToggleIcon>
              <UserIcon aria-hidden size={20} />
            </ToggleIcon>
          </Toggle>
          <Toggle aria-label="Feet" value="feet">
            <ToggleIcon>
              <FootprintsIcon aria-hidden size={20} />
            </ToggleIcon>
          </Toggle>
          <Toggle aria-label="Windscreen" value="screen">
            <ToggleIcon>
              <SteeringWheelIcon aria-hidden size={20} />
            </ToggleIcon>
          </Toggle>
        </ToggleGroup>
        Air distribution
      </Tile>
      <Tile>
        <ToggleGroup
          aria-label="Wipers"
          defaultValue={["auto"]}
          deselectable={false}
        >
          {WIPERS.map((wiper) => (
            <Toggle key={wiper.value} value={wiper.value}>
              {wiper.label}
            </Toggle>
          ))}
        </ToggleGroup>
        Wipers
      </Tile>
    </TileGroup>
  </>
);

export default Demo;

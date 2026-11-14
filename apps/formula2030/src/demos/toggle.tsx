import {
  DefrostGlyph,
  FaceGlyph,
  FeetGlyph,
  HazardGlyph,
  RecirculateGlyph,
  ScreenGlyph,
  SeatGlyph,
} from "@/components/glyphs";
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
            <DefrostGlyph />
          </ToggleIcon>
        </Toggle>
        Rear defrost
      </Tile>
      <Tile>
        <Toggle aria-label="Recirculate">
          <ToggleIcon>
            <RecirculateGlyph />
          </ToggleIcon>
        </Toggle>
        Recirculate
      </Tile>
      <Tile>
        <Toggle aria-label="Seat heat" defaultPressed>
          <ToggleIcon>
            <SeatGlyph />
          </ToggleIcon>
        </Toggle>
        Seat heat
      </Tile>
      <Tile>
        <Toggle aria-label="Hazard lights" disabled>
          <ToggleIcon>
            <HazardGlyph />
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
              <FaceGlyph />
            </ToggleIcon>
          </Toggle>
          <Toggle aria-label="Feet" value="feet">
            <ToggleIcon>
              <FeetGlyph />
            </ToggleIcon>
          </Toggle>
          <Toggle aria-label="Windscreen" value="screen">
            <ToggleIcon>
              <ScreenGlyph />
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

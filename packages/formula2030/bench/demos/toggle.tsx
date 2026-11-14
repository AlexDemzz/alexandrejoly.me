import type { ReactNode } from "react";

import { Tile, TileGroup } from "@/registry/formula/ui/formula/tile";
import {
  Toggle,
  ToggleGroup,
  ToggleIcon,
} from "@/registry/formula/ui/formula/toggle";

const WIPERS = [
  { label: "Off", value: "off" },
  { label: "Intermittent", value: "intermittent" },
  { label: "Continuous", value: "continuous" },
];

const Glyph = ({ children }: { children: ReactNode }) => (
  <svg
    fill="none"
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 20 20"
    width="20"
  >
    {children}
  </svg>
);

const DefrostGlyph = () => (
  <Glyph>
    <rect height="10" rx="2" width="14" x="3" y="5" />
    <path d="M7 8c1 1-1 2.5 0 4M10 8c1 1-1 2.5 0 4M13 8c1 1-1 2.5 0 4" />
  </Glyph>
);

const RecirculateGlyph = () => (
  <Glyph>
    <path d="M15.5 10a5.5 5.5 0 0 1-9.6 3.7" />
    <path d="M4.5 10a5.5 5.5 0 0 1 9.6-3.7" />
    <path d="M14.25 3.5v3h-3M5.75 16.5v-3h3" />
  </Glyph>
);

const SeatGlyph = () => (
  <Glyph>
    <path d="M6 3.5 7.5 12H14" />
    <path d="M6.5 15.5H15" />
    <path d="M11 4c1 1-1 2 0 3.5M14 4c1 1-1 2 0 3.5" />
  </Glyph>
);

const HazardGlyph = () => (
  <Glyph>
    <path d="M10 3.5 17 16H3z" />
    <path d="M10 8.25 12.75 13.5h-5.5z" />
  </Glyph>
);

const FaceGlyph = () => (
  <Glyph>
    <circle cx="6.5" cy="5.5" r="2" />
    <path d="M5 9.5v4.25h4.5l2 3" />
    <path d="M10.5 6.5h5M13.5 4.5l2 2-2 2" />
  </Glyph>
);

const FeetGlyph = () => (
  <Glyph>
    <circle cx="6.5" cy="5.5" r="2" />
    <path d="M5 9.5v4.25h4.5l2 3" />
    <path d="M10.5 12h5M13.5 10l2 2-2 2" />
  </Glyph>
);

const ScreenGlyph = () => (
  <Glyph>
    <path d="M3.5 7.5C7.5 5 12.5 5 16.5 7.5L15 14H5z" />
    <path d="M10 8.5v3M8.5 10l1.5-1.5 1.5 1.5" />
  </Glyph>
);

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
        <Toggle aria-label="Seat heat" defaultPressed disabled>
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
    <Tile>
      <ToggleGroup
        aria-label="Air distribution"
        defaultValue={["face", "screen"]}
        multiple
      >
        <Toggle value="face">
          <ToggleIcon>
            <FaceGlyph />
          </ToggleIcon>
          Face
        </Toggle>
        <Toggle value="feet">
          <ToggleIcon>
            <FeetGlyph />
          </ToggleIcon>
          Feet
        </Toggle>
        <Toggle value="screen">
          <ToggleIcon>
            <ScreenGlyph />
          </ToggleIcon>
          Screen
        </Toggle>
      </ToggleGroup>
      Air distribution
    </Tile>
    <TileGroup>
      <Tile>
        <ToggleGroup
          aria-label="Wipers"
          defaultValue={["intermittent"]}
          deselectable={false}
          orientation="vertical"
        >
          {WIPERS.map((wiper) => (
            <Toggle key={wiper.value} value={wiper.value}>
              {wiper.label}
            </Toggle>
          ))}
        </ToggleGroup>
        Wipers
      </Tile>
      <Tile>
        <ToggleGroup
          aria-label="Rear wipers"
          defaultValue={["off"]}
          disabled
          orientation="vertical"
        >
          {WIPERS.map((wiper) => (
            <Toggle key={wiper.value} value={wiper.value}>
              {wiper.label}
            </Toggle>
          ))}
        </ToggleGroup>
        Rear wipers
      </Tile>
    </TileGroup>
  </>
);

export default Demo;

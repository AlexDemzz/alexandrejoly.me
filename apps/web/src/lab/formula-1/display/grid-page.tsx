import { RED_LIGHTS } from "../model/start";
import { useWheel } from "../model/store";
import type { WheelState } from "../model/types";
import { PAGE_NAMES } from "./format";
import { Cell, CellLabel, CellValue } from "./parts";
import { BrakeBalance, EnergyBar, Gear, Mode, Soc } from "./race-page";

// The race page from Start to lights out, in the main page's blocks: the grid
// slot, the gear, and the five start lights mirrored as the starter lights
// them. The clutch is the driver's alone and never shows [R S25 C9.2.7].

type Phase = "grid" | "lights";

const LIGHTS = Array.from({ length: RED_LIGHTS }, (_, index) => index + 1);

const selectPhase = (state: WheelState): Phase =>
  state.start.kind === "lights" ? "lights" : "grid";

const selectLit = (state: WheelState): number =>
  state.start.kind === "lights" ? state.start.lit : 0;

const GridSlot = () => {
  const position = useWheel((state) => state.position);
  const dash = useWheel((state) => state.dashSwitch);
  return (
    <Cell area="slot">
      <span data-slot="dash-cell-head">
        <CellLabel>GRID</CellLabel>
        <span data-slot="dash-marker">{`${dash} · ${PAGE_NAMES.race}`}</span>
      </span>
      <CellValue size={10}>
        <span className="sr-only">Grid slot </span>
        {`P${position}`}
      </CellValue>
    </Cell>
  );
};

const PHASE_NAMES: Record<Phase, string> = {
  grid: "ON THE GRID",
  lights: "LIGHTS ON",
};

const StartPhase = () => {
  const phase = useWheel(selectPhase);
  return (
    <Cell area="phase" fill="grey">
      <CellValue size={6}>{PHASE_NAMES[phase]}</CellValue>
    </Cell>
  );
};

const StartLights = () => {
  const lit = useWheel(selectLit);
  return (
    <Cell area="lights">
      <span className="sr-only">{`${lit} of ${RED_LIGHTS} start lights on`}</span>
      <span aria-hidden data-slot="dash-lights">
        {LIGHTS.map((light) => (
          <span
            data-lit={light <= lit ? "" : undefined}
            data-slot="dash-light"
            key={light}
          />
        ))}
      </span>
    </Cell>
  );
};

export const GridPage = () => (
  <div data-page="grid" data-slot="dash-grid">
    <GridSlot />
    <StartPhase />
    <Mode area="mode" />
    <Soc />
    <Gear />
    <BrakeBalance />
    <StartLights />
    <EnergyBar />
  </div>
);

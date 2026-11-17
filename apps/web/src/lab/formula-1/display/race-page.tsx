import { Meter, MeterLabel, MeterTrack } from "@ui-sdk/react/meter";

import { RACE_LAPS, SOC_MAX_MJ } from "../model/car";
import { selectMode, selectOnTrack } from "../model/selectors";
import { useWheel } from "../model/store";
import type { Corner, WheelState } from "../model/types";
import {
  ERS_NAMES,
  PAGE_NAMES,
  formatDeltaS,
  formatLapTime,
  formatSigned,
} from "./format";
import { TYRE_REFERENCE_C, TYRE_WINDOW_C, windowFill } from "./limits";
import { Cell, CellLabel, CellValue, Reading } from "./parts";
import type { Fill, Ink } from "./parts";

// The main page after Leclerc's 2025 software (Motorsport.com drawing): flat
// blocks on a 0 / .19 / .34 / .64 / .66 / .82 / 1 by 0 / .17 / .42 / .66 / .90 / 1 grid.
// In the garage the car stands still with the engine off, so everything a
// lap would fill in shows a dash.

const PERCENT = 100;
const BAR_SEGMENTS = 16;
const RED_SEGMENTS = 3;
const SEGMENTS = Array.from({ length: BAR_SEGMENTS }, (_, index) => index);
const RPM_STEP = 5;
const DELTA_STEP_MS = 10;
const GRAMS_PER_KG = 1000;
const GAP_DECIMALS = 1;
const TENTHS = 10;

const selectSocPercent = (state: WheelState): number =>
  Math.round((state.socMJ / SOC_MAX_MJ) * PERCENT);

const GearboxMarker = () => {
  const onTrack = useWheel(selectOnTrack);
  const control = useWheel((state) => state.gearControl);
  if (!onTrack) {
    return null;
  }
  return (
    <span data-control={control} data-slot="dash-gearbox">
      <span className="sr-only">Gearbox </span>
      {control === "manual" ? "MAN" : "AUTO"}
    </span>
  );
};

export const Gear = () => {
  const gear = useWheel((state) => state.gear);
  return (
    <Cell area="gear">
      <GearboxMarker />
      <span data-slot="dash-gear">
        <span className="sr-only">Gear </span>
        {gear}
      </span>
    </Cell>
  );
};

const LastLap = () => {
  const last = useWheel((state) =>
    state.session === "track" ? state.timing.lastMs : null
  );
  return (
    <Cell area="time">
      <Reading
        name="Last lap"
        size={10}
        value={last === null ? null : formatLapTime(last)}
      />
    </Cell>
  );
};

const Rpm = () => {
  const rpm = useWheel((state) =>
    state.session === "track"
      ? Math.round(state.rpm / RPM_STEP) * RPM_STEP
      : null
  );
  return (
    <Cell area="rpm" fill="grey">
      <Reading
        ink="red"
        name="Engine speed"
        size={10}
        value={rpm === null ? null : String(rpm)}
      />
    </Cell>
  );
};

/** Against the best lap: green ahead, red behind; nothing until there is a best lap. */
const Delta = () => {
  const delta = useWheel((state) =>
    state.session === "track" && state.timing.bestMs !== null
      ? Math.round(state.timing.deltaMs / DELTA_STEP_MS) * DELTA_STEP_MS
      : null
  );
  let fill: Fill = "steel";
  let ink: Ink = "black";
  if (delta !== null && delta < 0) {
    fill = "green";
  } else if (delta !== null && delta > 0) {
    fill = "red";
    ink = "white";
  }
  return (
    <Cell area="delta" fill={fill}>
      <Reading
        ink={ink}
        name="Delta"
        size={10}
        value={delta === null ? null : formatDeltaS(delta)}
      />
    </Cell>
  );
};

const selectGap = (gap: number): number | null =>
  Number.isFinite(gap) ? Math.round(gap * TENTHS) / TENTHS : null;

const Behind = () => {
  const position = useWheel((state) => state.position);
  const gap = useWheel((state) => selectGap(state.gapBehindS));
  return (
    <Cell area="behind" fill="red">
      <span data-slot="dash-cell-head">
        <span>{gap === null ? "" : `P${position + 1}`}</span>
        <CellLabel>BEHIND</CellLabel>
      </span>
      <Reading
        name="Car behind"
        size={9}
        value={gap === null ? null : formatSigned(-gap, GAP_DECIMALS)}
      />
    </Cell>
  );
};

const selectAhead = (state: WheelState): string | null => {
  if (state.session !== "track") {
    return null;
  }
  if (state.position === 1) {
    return "LEAD";
  }
  const gap = selectGap(state.gapAheadS);
  return gap === null ? null : formatSigned(gap, GAP_DECIMALS);
};

const Ahead = () => {
  const position = useWheel((state) => state.position);
  const ahead = useWheel(selectAhead);
  const behindSomeone = ahead !== null && ahead !== "LEAD";
  return (
    <Cell area="ahead" fill="steel">
      <span data-slot="dash-cell-head">
        <span>{behindSomeone ? `P${position - 1}` : ""}</span>
        <CellLabel>AHEAD</CellLabel>
      </span>
      <Reading ink="black" name="Car ahead" size={9} value={ahead} />
    </Cell>
  );
};

const TYRE_NAMES: Record<keyof Corner, string> = {
  fl: "Front left tyre",
  fr: "Front right tyre",
  rl: "Rear left tyre",
  rr: "Rear right tyre",
};

/** Degrees over the reference, filled by the working window. */
const TyreCell = ({ corner }: { corner: keyof Corner }) => {
  const temp = useWheel((state) =>
    state.session === "track" ? Math.round(state.tyreTempsC[corner]) : null
  );
  if (temp === null) {
    return (
      <Cell area={corner} fill="grey">
        <Reading name={TYRE_NAMES[corner]} size={11} value={null} />
      </Cell>
    );
  }
  const over = temp - TYRE_REFERENCE_C;
  return (
    <Cell area={corner} fill={windowFill(temp, TYRE_WINDOW_C)}>
      <Reading
        ink="black"
        name={TYRE_NAMES[corner]}
        size={11}
        value={over < 0 ? formatSigned(over) : String(over)}
      />
    </Cell>
  );
};

const DashMarker = () => {
  const dash = useWheel((state) => state.dashSwitch);
  return (
    <span data-slot="dash-marker">
      <span className="sr-only">Dash switch </span>
      {`${dash} · ${PAGE_NAMES.race}`}
    </span>
  );
};

const Lap = () => {
  const lap = useWheel((state) =>
    state.session === "track" ? state.timing.lap : null
  );
  return (
    <Cell area="lap">
      <span data-slot="dash-cell-head">
        <CellLabel>LAP</CellLabel>
        <DashMarker />
      </span>
      {lap === null ? (
        <Reading name="Lap" size={13} value={null} />
      ) : (
        <CellValue size={13}>
          <span className="sr-only">Lap </span>
          {lap}
          <span data-slot="dash-of">{`/${RACE_LAPS}`}</span>
        </CellValue>
      )}
    </Cell>
  );
};

export const BrakeBalance = () => {
  const balance = useWheel((state) => state.brakeBalance);
  const shaping = useWheel((state) => state.thumbwheels.bs);
  return (
    <Cell area="bbal">
      <span data-slot="dash-cell-head">
        <CellLabel>BBAL</CellLabel>
        <CellValue size={9}>{balance.toFixed(1)}</CellValue>
      </span>
      <CellValue ink="blue" size={7}>{`BS ${formatSigned(shaping)}`}</CellValue>
    </Cell>
  );
};

export const Soc = () => {
  const soc = useWheel(selectSocPercent);
  return (
    <Cell area="soc">
      <CellLabel>SOC</CellLabel>
      <CellValue ink="green" size={13}>
        {soc}
      </CellValue>
    </Cell>
  );
};

export const Mode = ({ area = "model" }: { area?: string }) => {
  const mode = useWheel(selectMode);
  return (
    <Cell area={area} fill="steel">
      <span className="sr-only">Mode </span>
      <CellValue ink="black" size={7}>
        {mode}
      </CellValue>
    </Cell>
  );
};

const Fuel = () => {
  const grams = useWheel((state) =>
    state.session === "track"
      ? Math.round(state.fuelDeltaKg * GRAMS_PER_KG)
      : null
  );
  return (
    <Cell area="fuel" fill="grey">
      <CellLabel>FUEL</CellLabel>
      <Reading
        ink="red"
        name="Fuel against target, grams"
        size={12}
        value={grams === null ? null : formatSigned(grams)}
      />
    </Cell>
  );
};

export const ERS_FILLS: Record<WheelState["ers"], Fill> = {
  base: "steel",
  chr: "green",
  k1: "yellow",
  k2: "steel",
};

const Ers = () => {
  const ers = useWheel((state) => state.ers);
  return (
    <Cell area="moder" fill={ERS_FILLS[ers]}>
      <span className="sr-only">ERS </span>
      <CellValue ink="black" size={7}>
        {ERS_NAMES[ers]}
      </CellValue>
    </Cell>
  );
};

export const DRS_LOOKS: Record<
  WheelState["drs"],
  { fill: Fill; text: string }
> = {
  available: { fill: "black", text: "AVAILABLE" },
  disabled: { fill: "black", text: "OFF" },
  enabled: { fill: "ok", text: "ENABLED" },
  open: { fill: "open", text: "OPEN" },
};

/** Off, then available (within 1 s at detection), enabled in the zone, open once pressed. */
export const Drs = ({ area = "drs" }: { area?: string }) => {
  const drs = useWheel((state) => state.drs);
  const { fill, text } = DRS_LOOKS[drs];
  return (
    <Cell area={area} fill={fill}>
      <span data-drs={drs} data-slot="dash-drs">
        <span>DRS</span>
        <span data-slot="dash-label">{text}</span>
      </span>
    </Cell>
  );
};

/** The battery bar: three red segments, then green, dark once drawn down. */
export const EnergyBar = () => {
  const soc = useWheel(selectSocPercent);
  const lit = Math.round((soc / PERCENT) * BAR_SEGMENTS);
  return (
    <Meter data-area="bar" max={PERCENT} value={soc}>
      <MeterLabel className="sr-only">Battery</MeterLabel>
      <MeterTrack>
        {SEGMENTS.map((segment) => (
          <span
            data-lit={segment < lit ? "" : undefined}
            data-red={segment < RED_SEGMENTS ? "" : undefined}
            data-slot="dash-segment"
            key={segment}
          />
        ))}
      </MeterTrack>
    </Meter>
  );
};

export const RacePage = () => (
  <div data-page="race" data-slot="dash-grid">
    <LastLap />
    <Rpm />
    <Delta />
    <Behind />
    <TyreCell corner="fl" />
    <Gear />
    <TyreCell corner="fr" />
    <Ahead />
    <Lap />
    <TyreCell corner="rl" />
    <TyreCell corner="rr" />
    <BrakeBalance />
    <Soc />
    <Mode />
    <Fuel />
    <Ers />
    <Drs />
    <EnergyBar />
  </div>
);

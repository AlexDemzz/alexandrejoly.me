import type { ReactNode } from "react";

import {
  DEPLOY_CAP_MJ,
  ERS_MAX_KW,
  HARVEST_CAP_MJ,
  MAX_HARVEST_KW,
  SOC_MAX_MJ,
} from "../model/car";
import { selectMode, selectOnTrack } from "../model/selectors";
import { useWheel } from "../model/store";
import type { Corner, Thumbwheel, WheelState } from "../model/types";
import {
  ERS_NAMES,
  NOTHING,
  PAGE_NAMES,
  formatDeltaS,
  formatLapTime,
  formatSigned,
} from "./format";
import { BRAKE_WINDOW_C, TYRE_WINDOW_C, windowFill } from "./limits";
import { Cell, CellLabel, CellValue, Gauge, Reading } from "./parts";
import { Drs, ERS_FILLS } from "./race-page";
import { pagePlace } from "./screen";
import type { Screen } from "./screen";

// The secondary pages the + / − buttons page through with the switch on S.
// Their contents are invented, in the main page's block style.

const PageHead = ({ page }: { page: Screen }) => {
  const dash = useWheel((state) => state.dashSwitch);
  const place = pagePlace(page);
  return (
    <div data-slot="dash-head">
      <span data-slot="dash-page-name">{PAGE_NAMES[page]}</span>
      <span data-slot="dash-marker">
        <span className="sr-only">Dash switch </span>
        {place === null ? dash : `${dash} · ${place}`}
      </span>
    </div>
  );
};

const SecondaryPage = ({
  children,
  page,
}: {
  children: ReactNode;
  page: Screen;
}) => (
  <div data-page={page} data-slot="dash-secondary">
    <PageHead page={page} />
    <div data-page={page} data-slot="dash-grid">
      {children}
    </div>
  </div>
);

const ErsCell = () => {
  const ers = useWheel((state) => state.ers);
  return (
    <Cell area="ers" fill={ERS_FILLS[ers]}>
      <CellLabel>ERS MODE</CellLabel>
      <CellValue ink="black" size={10}>
        {ERS_NAMES[ers]}
      </CellValue>
    </Cell>
  );
};

interface ErsButton {
  area: "k1" | "k2" | "chr";
  label: string;
  /** What the button does, under its state. */
  hint: string;
  on: (state: WheelState) => boolean;
  fill: "yellow" | "green";
}

const ERS_BUTTONS: readonly ErsButton[] = [
  {
    area: "k1",
    fill: "yellow",
    hint: "HELD",
    label: "K1",
    on: (state) => state.ers === "k1",
  },
  {
    area: "k2",
    fill: "yellow",
    hint: "LATCHED",
    label: "K2",
    on: (state) => state.ersLatched === "k2",
  },
  {
    area: "chr",
    fill: "green",
    hint: "LATCHED",
    label: "CHR",
    on: (state) => state.ersLatched === "chr",
  },
];

const ErsButtonCell = ({ button }: { button: ErsButton }) => {
  const on = useWheel(button.on);
  return (
    <Cell area={button.area} fill={on ? button.fill : "grey"}>
      <span data-slot="dash-cell-head">
        <CellLabel>{button.label}</CellLabel>
        <CellLabel>{button.hint}</CellLabel>
      </span>
      <CellValue ink={on ? "black" : "white"} size={6}>
        {on ? "ON" : "OFF"}
      </CellValue>
    </Cell>
  );
};

const CENTI = 100;
const PERCENT = 100;
const KW_STEP = 2;
const formatMJ = (value: number): string => `${value.toFixed(2)} MJ`;
const formatKW = (value: number): string => `${Math.round(value)} kW`;

const SocCell = () => {
  const soc = useWheel((state) => Math.round(state.socMJ * CENTI) / CENTI);
  return (
    <Cell area="soc">
      <span data-slot="dash-cell-head">
        <CellLabel>SOC</CellLabel>
        <CellValue ink="green" size={12}>
          {Math.round((soc / SOC_MAX_MJ) * PERCENT)}
        </CellValue>
      </span>
      <Gauge format={formatMJ} label="STORE" max={SOC_MAX_MJ} value={soc} />
    </Cell>
  );
};

/** One bar across: harvest fills left from the centre, deploy fills right. */
const MgukCell = () => {
  const kw = useWheel((state) => Math.round(state.mgukKW / KW_STEP) * KW_STEP);
  const harvesting = kw < 0;
  return (
    <Cell area="flow" fill="grey">
      <span aria-hidden data-slot="dash-cell-head">
        <CellLabel>{harvesting ? "MGU-K HARVEST" : "MGU-K DEPLOY"}</CellLabel>
        <CellValue ink={harvesting ? "blue" : "green"} size={7}>
          {formatKW(Math.abs(kw))}
        </CellValue>
      </span>
      <span data-slot="dash-flow">
        <Gauge
          fill="cold"
          format={formatKW}
          label="MGU-K harvest"
          max={MAX_HARVEST_KW}
          mirrored
          value={Math.max(0, -kw)}
        />
        <Gauge
          format={formatKW}
          label="MGU-K deploy"
          max={ERS_MAX_KW}
          value={Math.max(0, kw)}
        />
      </span>
    </Cell>
  );
};

/** This lap's ES → K and K → ES totals against their caps, red once spent. */
const LapEnergy = () => {
  const deployed = useWheel(
    (state) => Math.round(state.deployedThisLapMJ * CENTI) / CENTI
  );
  const harvested = useWheel(
    (state) => Math.round(state.harvestedThisLapMJ * CENTI) / CENTI
  );
  return (
    <>
      <Cell area="deployed">
        <Gauge
          fill={deployed >= DEPLOY_CAP_MJ ? "red" : "green"}
          format={formatMJ}
          label={`DEPLOYED / ${DEPLOY_CAP_MJ}`}
          max={DEPLOY_CAP_MJ}
          value={deployed}
        />
      </Cell>
      <Cell area="harvested">
        <Gauge
          fill={harvested >= HARVEST_CAP_MJ ? "red" : "cold"}
          format={formatMJ}
          label={`HARVESTED / ${HARVEST_CAP_MJ}`}
          max={HARVEST_CAP_MJ}
          value={harvested}
        />
      </Cell>
    </>
  );
};

export const EnergyPage = () => (
  <SecondaryPage page="energy">
    <SocCell />
    <ErsCell />
    <Drs />
    <MgukCell />
    <LapEnergy />
    {ERS_BUTTONS.map((button) => (
      <ErsButtonCell button={button} key={button.area} />
    ))}
  </SecondaryPage>
);

const CORNERS: readonly { key: keyof Corner; label: string }[] = [
  { key: "fl", label: "FL" },
  { key: "fr", label: "FR" },
  { key: "rl", label: "RL" },
  { key: "rr", label: "RR" },
];

const TENTH = 10;

/** Sensor readings only once the car runs; standing still they show a dash. */
const CornerTemps = ({
  corner,
  label,
}: {
  corner: keyof Corner;
  label: string;
}) => {
  const onTrack = useWheel(selectOnTrack);
  const tyre = useWheel((state) => Math.round(state.tyreTempsC[corner]));
  const psi = useWheel(
    (state) => Math.round(state.tyrePressuresPsi[corner] * TENTH) / TENTH
  );
  const brake = useWheel((state) => Math.round(state.brakeTempsC[corner]));
  return (
    <div data-area={corner} data-slot="dash-corner">
      <Cell fill={onTrack ? windowFill(tyre, TYRE_WINDOW_C) : "grey"}>
        <span data-slot="dash-cell-head">
          <CellLabel>{label}</CellLabel>
          <CellLabel>TYRE °C</CellLabel>
        </span>
        <Reading
          ink={onTrack ? "black" : "white"}
          name={`${label} tyre`}
          size={12}
          value={onTrack ? String(tyre) : null}
        />
      </Cell>
      <Cell fill="grey">
        <CellLabel>PSI</CellLabel>
        <Reading
          name={`${label} pressure`}
          size={7}
          value={onTrack ? psi.toFixed(1) : null}
        />
      </Cell>
      <Cell fill={onTrack ? windowFill(brake, BRAKE_WINDOW_C) : "grey"}>
        <CellLabel>BRAKE °C</CellLabel>
        <Reading
          ink={onTrack ? "black" : "white"}
          name={`${label} brake`}
          size={7}
          value={onTrack ? String(brake) : null}
        />
      </Cell>
    </div>
  );
};

export const TempsPage = () => (
  <SecondaryPage page="temps">
    {CORNERS.map(({ key, label }) => (
      <CornerTemps corner={key} key={key} label={label} />
    ))}
  </SecondaryPage>
);

const LAP_ROWS = 6;
const TENTH_MS = 100;

const RunningLap = () => {
  const lap = useWheel((state) => state.timing.lap);
  const tenths = useWheel((state) =>
    Math.floor(state.timing.currentMs / TENTH_MS)
  );
  return (
    <li data-current="" data-slot="dash-lap-row">
      <span>{`LAP ${lap}`}</span>
      <span>{formatLapTime(tenths * TENTH_MS).slice(0, -2)}</span>
      <span>NOW</span>
    </li>
  );
};

const NoLaps = () => (
  <li data-slot="dash-lap-row">
    <span>{NOTHING}</span>
    <span>NO LAP TIMES</span>
    <span />
  </li>
);

export const LapsPage = () => {
  const onTrack = useWheel(selectOnTrack);
  const times = useWheel((state) => state.timing.lapTimesMs);
  const best = useWheel((state) => state.timing.bestMs);
  const firstLap = useWheel(
    (state) => state.timing.lap - state.timing.lapTimesMs.length
  );
  const shown = times
    .map((ms, index) => ({ lap: firstLap + index, ms }))
    .slice(-(LAP_ROWS - 1))
    .toReversed();
  return (
    <SecondaryPage page="laps">
      <ol aria-label="Lap times" data-slot="dash-laps">
        {onTrack ? <RunningLap /> : null}
        {shown.map(({ lap, ms }) => (
          <li
            data-best={ms === best ? "" : undefined}
            data-slot="dash-lap-row"
            key={lap}
          >
            <span>{`LAP ${lap}`}</span>
            <span>{formatLapTime(ms)}</span>
            <span>{best === null ? "" : formatDeltaS(ms - best, 3)}</span>
          </li>
        ))}
        {shown.length === 0 ? <NoLaps /> : null}
      </ol>
    </SecondaryPage>
  );
};

interface Setting {
  key: string;
  label: string;
  select: (state: WheelState) => string;
  /** Mode and ERS keep the main page's steel fill. */
  steel?: boolean;
}

const signedWheel =
  (wheel: Thumbwheel) =>
  (state: WheelState): string =>
    formatSigned(state.thumbwheels[wheel]);

const SETTINGS: readonly Setting[] = [
  { key: "difIn", label: "DIF IN", select: signedWheel("difIn") },
  { key: "dMid", label: "D MID", select: signedWheel("dMid") },
  { key: "eb", label: "EB", select: signedWheel("eb") },
  { key: "bs", label: "BS", select: signedWheel("bs") },
  {
    key: "trq",
    label: "TRQ",
    select: (state) => String(state.thumbwheels.trq),
  },
  {
    key: "soc",
    label: "SOC",
    select: (state) => String(state.thumbwheels.soc),
  },
  { key: "eng", label: "ENG", select: (state) => String(state.rotaries.eng) },
  {
    key: "target",
    label: "TARGET",
    select: (state) => String(state.rotaries.target),
  },
  {
    key: "tyrePhase",
    label: "TYRE PHASE",
    select: (state) => String(state.rotaries.tyrePhase),
  },
  { key: "mode", label: "MODE", select: selectMode, steel: true },
  {
    key: "bbal",
    label: "BBAL",
    select: (state) => state.brakeBalance.toFixed(1),
  },
  {
    key: "ers",
    label: "ERS",
    select: (state) => ERS_NAMES[state.ers],
    steel: true,
  },
];

const SettingCell = ({ setting }: { setting: Setting }) => {
  const value = useWheel(setting.select);
  const steel = setting.steel === true;
  return (
    <Cell fill={steel ? "steel" : "black"}>
      <CellLabel>{setting.label}</CellLabel>
      <CellValue ink={steel ? "black" : "white"} size={10}>
        {value}
      </CellValue>
    </Cell>
  );
};

export const SetupPage = () => (
  <SecondaryPage page="setup">
    {SETTINGS.map((setting) => (
      <SettingCell key={setting.key} setting={setting} />
    ))}
  </SecondaryPage>
);

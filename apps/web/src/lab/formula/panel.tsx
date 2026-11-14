import "@fontsource-variable/geist";
import { useState } from "react";

import { Button } from "@/registry/formula/ui/formula/button";
import {
  Knob,
  SliderControl,
  SliderThumb,
  SliderTrack,
} from "@/registry/formula/ui/formula/knob";
import {
  NumberInput,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputGroup,
  NumberInputIncrement,
} from "@/registry/formula/ui/formula/number-input";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@/registry/formula/ui/formula/segmented-control";
import {
  Slider,
  SliderControl as RulerControl,
  SliderIndicator as RulerIndicator,
  SliderThumb as RulerThumb,
  SliderTrack as RulerTrack,
} from "@/registry/formula/ui/formula/slider";
import { FormulaSound } from "@/registry/formula/ui/formula/sound";
import { Switch, SwitchThumb } from "@/registry/formula/ui/formula/switch";
import { Tile, TileGroup, TileLabel } from "@/registry/formula/ui/formula/tile";
import { Toggle, ToggleIcon } from "@/registry/formula/ui/formula/toggle";

import { GForceDisplay } from "./display";
import {
  ArrowDownGlyph,
  ArrowUpGlyph,
  CarGlyph,
  DefrostGlyph,
  EngravedArrowGlyph,
  EngravedLineGlyph,
  RobotGlyph,
  SeatHeatGlyph,
  SparkleGlyph,
  SpeakerGlyph,
  WiperGlyph,
} from "./glyphs";

interface DriveMode {
  label: string;
  power: string;
  rideHeight: number;
  steering: string;
  suspension: string;
  traction: string;
  value: "autonomous" | "normal" | "performance";
}

const DRIVE_MODES: readonly [DriveMode, ...DriveMode[]] = [
  {
    label: "Performance",
    power: "Performance",
    rideHeight: -20,
    steering: "Firm",
    suspension: "Stiff",
    traction: "Sport handling",
    value: "performance",
  },
  {
    label: "Normal",
    power: "Balanced",
    rideHeight: 0,
    steering: "Standard",
    suspension: "Comfort",
    traction: "Standard",
    value: "normal",
  },
  {
    label: "Autonomous",
    power: "Efficient",
    rideHeight: 10,
    steering: "Automatic",
    suspension: "Comfort",
    traction: "Full",
    value: "autonomous",
  },
];

const RIDE_HEIGHT = { max: 40, min: -40, step: 5 } as const;
const VOLUME_MAX = 30;
const LEVELS = 3;
const SEAT_LEVELS = ["off", "low", "medium", "high"] as const;
const WIPER_LEVELS = ["off", "intermittent", "low", "high"] as const;
const CELSIUS = {
  maximumFractionDigits: 1,
  style: "unit",
  unit: "celsius",
} as const;
const PERCENT = { style: "percent" } as const;

// A true minus sign, and a plus on a raised car, as the dashboard prints them.
const formatRideHeight = (millimetres: number) => {
  if (millimetres === 0) {
    return "0 mm";
  }
  return `${millimetres < 0 ? "−" : "+"}${Math.abs(millimetres)} mm`;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const firstValue = (value: number | readonly number[]) =>
  typeof value === "number" ? value : (value[0] ?? 0);

/** Short level marks under a climate glyph, lit up to the current level. */
const LevelMarks = ({ level }: { level: number }) => (
  <span aria-hidden data-formula-marks>
    {Array.from({ length: LEVELS }, (_, index) => (
      <span data-lit={index < level ? "" : undefined} key={index} />
    ))}
  </span>
);

// No tick ring (`SliderIndicator`): the reference's dials are plain.
const Dial = ({ label }: { label: string }) => (
  <SliderControl>
    <SliderTrack>
      <SliderThumb aria-label={label} />
    </SliderTrack>
  </SliderControl>
);

interface Readout {
  label: string;
  value: string;
}

const readoutsFor = (mode: DriveMode, rideHeight: number): Readout[] => [
  { label: "Ride height", value: formatRideHeight(rideHeight) },
  { label: "Suspension", value: mode.suspension },
  { label: "Steering", value: mode.steering },
  { label: "Traction control", value: mode.traction },
  { label: "Power delivery", value: mode.power },
];

/** The control panel, top to bottom: readout, strata, then machined parts. */
export const FormulaPanel = () => {
  const [modeIndex, setModeIndex] = useState(0);
  const mode = DRIVE_MODES[modeIndex] ?? DRIVE_MODES[0];
  const [rideHeight, setRideHeight] = useState(mode.rideHeight);
  const [seatHeat, setSeatHeat] = useState(2);
  const [wipers, setWipers] = useState(2);
  const [fan, setFan] = useState(3);
  const [boost, setBoost] = useState(0.6);
  const [volume, setVolume] = useState(18);
  const [muted, setMuted] = useState(false);

  const chooseMode = (index: number) => {
    const next = DRIVE_MODES[index];
    if (next) {
      setModeIndex(index);
      setRideHeight(next.rideHeight);
    }
  };

  const shownVolume = muted ? 0 : volume;
  const changeVolume = (next: number) => {
    setVolume(next);
    setMuted(next === 0);
  };

  return (
    <section aria-label="Formula 2030 control panel" data-formula-panel>
      {/* The panel's own volume and mute drive the interaction sounds. */}
      <FormulaSound muted={muted} volume={volume / VOLUME_MAX} />
      <GForceDisplay drive={mode.value} />

      <div data-formula-spine>
        <div data-formula-strata>
          <span aria-hidden data-formula-band />
          <span aria-hidden data-formula-band />
          <SegmentedControl
            aria-label="Drive mode"
            onValueChange={(value) =>
              chooseMode(DRIVE_MODES.findIndex((item) => item.value === value))
            }
            orientation="vertical"
            value={mode.value}
          >
            <SegmentedControlIndicator />
            {DRIVE_MODES.map((item) => (
              <SegmentedControlItem key={item.value} value={item.value}>
                {item.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          <dl data-formula-readouts>
            {readoutsFor(mode, rideHeight).map((readout) => (
              <div key={readout.label}>
                <dt>{readout.label}</dt>
                <dd>{readout.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div data-formula-climate>
          <NumberInput
            defaultValue={22}
            format={CELSIUS}
            max={28}
            min={16}
            step={0.5}
            tone="thermal"
          >
            <NumberInputGroup>
              <NumberInputDecrement aria-label="Cooler" />
              <NumberInputControl aria-label="Cabin temperature" />
              <NumberInputIncrement aria-label="Warmer" />
            </NumberInputGroup>
          </NumberInput>
          <Button
            aria-label={`Seat heating: ${SEAT_LEVELS[seatHeat]}`}
            data-formula-flat
            data-formula-heat
            onClick={() => setSeatHeat((level) => (level + 1) % (LEVELS + 1))}
            variant="engraved"
          >
            <SeatHeatGlyph />
            <LevelMarks level={seatHeat} />
          </Button>
          <Toggle aria-label="Windscreen defrost" data-formula-flat>
            <ToggleIcon>
              <DefrostGlyph />
            </ToggleIcon>
            <span aria-hidden data-formula-marks data-formula-latch>
              <span />
            </span>
          </Toggle>
          <Button
            aria-label={`Wipers: ${WIPER_LEVELS[wipers]}`}
            data-formula-flat
            onClick={() => setWipers((level) => (level + 1) % (LEVELS + 1))}
            variant="engraved"
          >
            <WiperGlyph />
            <LevelMarks level={wipers} />
          </Button>
        </div>

        <span aria-hidden data-formula-pin />
      </div>

      <TileGroup data-formula-keys>
        <TileLabel>
          <Switch aria-label="Lane assist" defaultChecked>
            <SwitchThumb />
          </Switch>
        </TileLabel>
        <Tile>
          <Knob max={6} onValueChange={setFan} ticks={6} value={fan}>
            <Dial label="Fan speed" />
          </Knob>
        </Tile>
        <Button
          aria-label="Turn the fan off"
          onClick={() => setFan(0)}
          variant="engraved"
        >
          <EngravedLineGlyph />
        </Button>
        <Tile>
          <Knob
            format={PERCENT}
            max={1}
            onValueChange={setBoost}
            step={0.05}
            ticks={20}
            tone="gold"
            value={boost}
          >
            <Dial label="Boost" />
          </Knob>
        </Tile>
        <Tile>
          <Knob
            max={VOLUME_MAX}
            onValueChange={changeVolume}
            ticks={15}
            value={shownVolume}
          >
            <Dial label="Volume" />
          </Knob>
        </Tile>
        <TileLabel>
          <Switch aria-label="One-pedal drive">
            <SwitchThumb />
          </Switch>
        </TileLabel>
        <Button
          aria-label="Next drive mode"
          onClick={() => chooseMode((modeIndex + 1) % DRIVE_MODES.length)}
          variant="engraved"
        >
          <EngravedArrowGlyph />
        </Button>
        <Button
          aria-label="Turn boost off"
          onClick={() => setBoost(0)}
          variant="engraved"
        >
          <EngravedLineGlyph />
        </Button>
      </TileGroup>

      <div data-formula-dock>
        <div data-formula-cell>
          <Slider
            major={VOLUME_MAX}
            max={VOLUME_MAX}
            onValueChange={(value) => changeVolume(firstValue(value))}
            ticks={VOLUME_MAX}
            value={shownVolume}
          >
            <RulerControl>
              <RulerTrack>
                <RulerIndicator />
                <RulerThumb aria-label="Volume" />
              </RulerTrack>
            </RulerControl>
          </Slider>
          <Toggle
            aria-label="Mute"
            data-formula-flat
            onPressedChange={(pressed) =>
              pressed ? setMuted(true) : changeVolume(volume || 1)
            }
            pressed={muted}
          >
            <ToggleIcon>
              <SpeakerGlyph muted={muted} />
            </ToggleIcon>
          </Toggle>
        </div>
        <fieldset aria-label="Ride height" data-formula-cell>
          <div data-formula-steps>
            <Button
              aria-label="Raise the car"
              data-formula-flat
              onClick={() =>
                setRideHeight((height) =>
                  clamp(
                    height + RIDE_HEIGHT.step,
                    RIDE_HEIGHT.min,
                    RIDE_HEIGHT.max
                  )
                )
              }
              variant="engraved"
            >
              <ArrowUpGlyph />
            </Button>
            <Button
              aria-label="Lower the car"
              data-formula-flat
              onClick={() =>
                setRideHeight((height) =>
                  clamp(
                    height - RIDE_HEIGHT.step,
                    RIDE_HEIGHT.min,
                    RIDE_HEIGHT.max
                  )
                )
              }
              variant="engraved"
            >
              <ArrowDownGlyph />
            </Button>
          </div>
          <CarGlyph />
        </fieldset>
        <Toggle aria-label="Robot" data-formula-cell data-formula-flat>
          <span aria-hidden data-formula-marks data-formula-latch>
            <span />
          </span>
          <ToggleIcon>
            <RobotGlyph />
          </ToggleIcon>
        </Toggle>
        <Toggle aria-label="AI assistant" data-formula-cell data-formula-flat>
          <span aria-hidden data-formula-marks data-formula-latch>
            <span />
          </span>
          <span data-formula-ai>
            <ToggleIcon>
              <SparkleGlyph />
            </ToggleIcon>
            <span aria-hidden data-formula-ai-caption>
              AI
            </span>
          </span>
        </Toggle>
      </div>
    </section>
  );
};

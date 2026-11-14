import { Field, FieldLabel } from "@ui-sdk/react/field";
import { useState } from "react";

import { Glass, GlassCaption } from "@/registry/formula/ui/formula/glass";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@/registry/formula/ui/formula/segmented-control";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderScale,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@/registry/formula/ui/formula/slider";
import { Switch, SwitchThumb } from "@/registry/formula/ui/formula/switch";
import { TileGroup, TileLabel } from "@/registry/formula/ui/formula/tile";

const MODES = {
  autonomous: {
    label: "Autonomous",
    settings: { power: "Efficient", steering: "Light", suspension: "Comfort" },
  },
  normal: {
    label: "Normal",
    settings: {
      power: "Balanced",
      steering: "Standard",
      suspension: "Adaptive",
    },
  },
  performance: {
    label: "Performance",
    settings: { power: "Performance", steering: "Firm", suspension: "Stiff" },
  },
} as const;

type Mode = keyof typeof MODES;

const MODE_ORDER: Mode[] = ["performance", "normal", "autonomous"];
const TEMPERATURE_MARKS = [16, 18, 20, 22, 24, 26, 28];

const isMode = (value: string | null): value is Mode =>
  value !== null && value in MODES;

/**
 * The three registers on one panel, dark to light: the glass reads, the bands
 * choose, the tiles actuate. Each part is a row of the hero's grid, so the
 * rule beside it lines up with it.
 */
export const HeroPanel = () => {
  const [mode, setMode] = useState<Mode>("performance");
  const [launch, setLaunch] = useState(false);
  const { settings } = MODES[mode];
  const readings = [
    { label: "Suspension", value: settings.suspension },
    { label: "Steering", value: settings.steering },
    { label: "Power delivery", value: settings.power },
  ];

  return (
    <div className="panel">
      <Glass brackets className="panel-glass">
        <Field>
          <Slider
            defaultValue={22}
            format={{
              maximumFractionDigits: 1,
              style: "unit",
              unit: "celsius",
            }}
            major={4}
            max={28}
            min={16}
            step={0.5}
            ticks={24}
          >
            <div className="panel-glass-head">
              <FieldLabel>
                <GlassCaption>Cabin temperature</GlassCaption>
              </FieldLabel>
              <GlassCaption aria-hidden="true">
                {MODES[mode].label}
              </GlassCaption>
            </div>
            <SliderValue />
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb />
              </SliderTrack>
            </SliderControl>
            <SliderScale className="panel-temperature-scale">
              {TEMPERATURE_MARKS.map((mark) => (
                <span key={mark}>{mark}</span>
              ))}
            </SliderScale>
          </Slider>
        </Field>
      </Glass>
      <div className="panel-strata">
        <SegmentedControl
          aria-label="Drive mode"
          onValueChange={(next) => {
            if (isMode(next)) {
              setMode(next);
              if (next !== "performance") {
                setLaunch(false);
              }
            }
          }}
          orientation="vertical"
          value={mode}
        >
          <SegmentedControlIndicator />
          {MODE_ORDER.map((key) => (
            <SegmentedControlItem key={key} value={key}>
              {MODES[key].label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <dl
          aria-label={`${MODES[mode].label} settings`}
          className="panel-readings"
        >
          {readings.map((reading) => (
            <div key={reading.label}>
              <dt>{reading.label}</dt>
              <dd>{reading.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <TileGroup className="panel-tiles">
        <TileLabel lamp>
          <Switch defaultChecked>
            <SwitchThumb />
          </Switch>
          One-pedal drive
        </TileLabel>
        <TileLabel lamp>
          <Switch
            checked={launch}
            disabled={mode !== "performance"}
            onCheckedChange={(checked) => setLaunch(checked)}
            tone="gold"
          >
            <SwitchThumb />
          </Switch>
          Launch control
        </TileLabel>
        <TileLabel lamp>
          <Switch defaultChecked>
            <SwitchThumb />
          </Switch>
          Lane assist
        </TileLabel>
        <TileLabel lamp>
          <Switch>
            <SwitchThumb />
          </Switch>
          Creep
        </TileLabel>
      </TileGroup>
    </div>
  );
};

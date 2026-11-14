import {
  Glass,
  GlassCaption,
  GlassBrackets,
} from "@/registry/formula/ui/formula/glass";
import {
  Meter,
  MeterCross,
  MeterIndicator,
  MeterLabel,
  MeterMarker,
  MeterScale,
  MeterTrack,
  MeterValue,
} from "@/registry/formula/ui/formula/meter";

const G_FORMAT = { maximumFractionDigits: 2, minimumFractionDigits: 2 };
const G_MARKS = [
  { at: -1.5, text: "1.5" },
  { at: -1, text: "1.0" },
  { at: -0.5, text: "0.5" },
  { at: 0, text: "" },
  { at: 0.5, text: "0.5" },
  { at: 1, text: "1.0" },
  { at: 1.5, text: "1.5" },
];
const CHARGE_MARKS = [0, 25, 50, 75, 100];
const BRAKE_MARKS = [0, 200, 400, 600, 800];
const CELSIUS = {
  maximumFractionDigits: 0,
  style: "unit",
  unit: "celsius",
} as const;

const Demo = () => (
  <>
    <Glass>
      <GlassBrackets />
      <GlassCaption>G-force (g)</GlassCaption>
      <MeterCross>
        <Meter
          aria-label="Lateral g-force"
          format={G_FORMAT}
          major={10}
          max={1.5}
          min={-1.5}
          ticks={60}
          value={0}
        >
          <MeterValue />
          <MeterScale>
            {G_MARKS.map((mark) => (
              <span key={mark.at}>{mark.text}</span>
            ))}
          </MeterScale>
          <MeterTrack>
            <MeterMarker />
          </MeterTrack>
        </Meter>
        <Meter
          aria-label="Longitudinal g-force"
          format={G_FORMAT}
          major={10}
          max={1.5}
          min={-1.5}
          orientation="vertical"
          ticks={60}
          value={0}
        >
          <MeterValue />
          <MeterTrack>
            <MeterMarker />
          </MeterTrack>
        </Meter>
      </MeterCross>
    </Glass>
    <Glass>
      <GlassBrackets />
      <Meter major={5} ticks={40} value={68}>
        <MeterLabel>State of charge</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
          <MeterMarker />
        </MeterTrack>
        <MeterScale>
          {CHARGE_MARKS.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </MeterScale>
      </Meter>
    </Glass>
    <Glass>
      <GlassBrackets />
      <Meter
        format={CELSIUS}
        major={4}
        max={800}
        orientation="vertical"
        ticks={32}
        value={412}
      >
        <MeterLabel>Front brake temperature</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
          <MeterMarker />
        </MeterTrack>
        <MeterScale>
          {BRAKE_MARKS.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </MeterScale>
      </Meter>
    </Glass>
  </>
);

export default Demo;

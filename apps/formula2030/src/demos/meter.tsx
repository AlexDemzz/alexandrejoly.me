import { Glass, GlassCaption } from "@/registry/formula/ui/formula/glass";
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

const Demo = () => (
  <div className="demo-seams">
    <Glass brackets>
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
    <Glass brackets>
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
  </div>
);

export default Demo;

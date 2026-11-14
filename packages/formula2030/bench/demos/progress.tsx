import { Glass, GlassBrackets } from "@/registry/formula/ui/formula/glass";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressScale,
  ProgressTrack,
  ProgressValue,
} from "@/registry/formula/ui/formula/progress";

const CHARGE_MARKS = [0, 25, 50, 75, 100];
const GIGABYTES = {
  maximumFractionDigits: 1,
  style: "unit",
  unit: "gigabyte",
} as const;

const Demo = () => (
  <>
    <Glass>
      <GlassBrackets />
      <Progress major={5} ticks={40} value={62}>
        <ProgressLabel>Charging</ProgressLabel>
        <ProgressValue />
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
        <ProgressScale>
          {CHARGE_MARKS.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </ProgressScale>
      </Progress>
    </Glass>
    <Glass>
      <GlassBrackets />
      <Progress format={GIGABYTES} max={3.4} value={1.2}>
        <ProgressLabel>Software update</ProgressLabel>
        <ProgressValue />
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </Glass>
    <Glass>
      <GlassBrackets />
      <Progress value={null}>
        <ProgressLabel>Pairing phone key</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </Glass>
    <Glass>
      <GlassBrackets />
      <Progress value={100}>
        <ProgressLabel>Map download</ProgressLabel>
        <ProgressValue />
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </Glass>
  </>
);

export default Demo;

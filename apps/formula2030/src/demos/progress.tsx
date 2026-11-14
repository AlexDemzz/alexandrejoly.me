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

const Demo = () => (
  <Glass>
    <GlassBrackets />
    <div className="demo-stack">
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
      <Progress value={null}>
        <ProgressLabel>Pairing phone key</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
      <Progress value={100}>
        <ProgressLabel>Map download</ProgressLabel>
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
    </div>
  </Glass>
);

export default Demo;

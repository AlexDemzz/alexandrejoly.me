import {
  Radio,
  RadioGroup,
  RadioGroupItem,
  RadioStage,
} from "@registry/radio/radio";
import { FRAME } from "@registry/radio/radio-frame";
import type { CSSProperties } from "react";

import type { LiveProps } from "./pieces";
import { RADIO_WINDOW } from "./radio-window";

const WINDOW_STYLE = {
  "--stage-w": `${(FRAME.width / RADIO_WINDOW.w) * 100}%`,
  "--stage-x": `${(-RADIO_WINDOW.x / RADIO_WINDOW.w) * 100}%`,
  "--stage-y": `${(-RADIO_WINDOW.y / RADIO_WINDOW.h) * 100}%`,
  "--window-ratio": `${RADIO_WINDOW.w} / ${RADIO_WINDOW.h}`,
} as CSSProperties;

// The poster's radio has four band keys, with no label over them: the live
// one has as many, so the switch from poster to scene changes nothing.
const BANDS = ["a", "b", "c", "d"];
const HOVERED = "c";

/** The radio in its slot: hovering latches a key down and lights its line, through `value`. */
const RadioLive = ({ active }: LiveProps) => (
  <div
    className="relative aspect-(--window-ratio) h-full overflow-clip"
    style={WINDOW_STYLE}
  >
    <Radio
      className="absolute top-(--stage-y) left-(--stage-x) w-(--stage-w)"
      value={active ? HOVERED : null}
    >
      <RadioStage>
        <RadioGroup aria-label="Band">
          {BANDS.map((band) => (
            <RadioGroupItem key={band} value={band} />
          ))}
        </RadioGroup>
      </RadioStage>
    </Radio>
  </div>
);

export default RadioLive;

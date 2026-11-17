import type { CSSProperties } from "react";

import { useLeds } from "../model/store";
import type { IndicatorLed, LedColor } from "../model/types";
import {
  BODY_HEIGHT,
  BODY_WIDTH,
  FLAG_LED,
  INDICATOR_LENS,
  INDICATOR_SPOTS,
  SHIFT_LED,
} from "./layout";
import type { Spot } from "./layout";

import "./wheel-buttons.css";

interface Lamp {
  id: string;
  spot: Spot;
}

const SHIFT_COUNT = 15;

const SHIFT_LAMPS: readonly Lamp[] = Array.from(
  { length: SHIFT_COUNT },
  (_, index) => ({
    id: `shift-${index + 1}`,
    spot: {
      size: SHIFT_LED.size * BODY_WIDTH,
      x: (SHIFT_LED.first + index * SHIFT_LED.pitch) * BODY_WIDTH,
      y: SHIFT_LED.y * BODY_HEIGHT,
    },
  })
);

const flagLamps = (side: "left" | "right"): readonly Lamp[] =>
  FLAG_LED.ys.map((ny, index) => ({
    id: `${side}-${index + 1}`,
    spot: {
      size: FLAG_LED.size * BODY_WIDTH,
      x: FLAG_LED[side] * BODY_WIDTH,
      y: ny * BODY_HEIGHT,
    },
  }));

const LEFT_LAMPS = flagLamps("left");
const RIGHT_LAMPS = flagLamps("right");
const INDICATORS = Object.keys(INDICATOR_SPOTS) as IndicatorLed[];

const Led = ({
  color,
  kind,
  lens,
  spot,
}: {
  color: LedColor;
  kind: "flag" | "indicator" | "shift";
  lens?: string;
  spot: Spot;
}) => (
  <span
    data-color={color}
    data-kind={kind}
    data-lens={lens}
    data-slot="wheel-led"
    style={
      {
        "--size": spot.size,
        "--x": spot.x,
        "--y": spot.y,
      } as CSSProperties
    }
  />
);

const Row = ({
  colors,
  kind,
  lamps,
}: {
  colors: readonly LedColor[];
  kind: "flag" | "shift";
  lamps: readonly Lamp[];
}) =>
  lamps.map((lamp, index) => (
    <Led
      color={colors[index] ?? "off"}
      key={lamp.id}
      kind={kind}
      spot={lamp.spot}
    />
  ));

/** Output only: the screen says in words what the lights show. */
export const WheelLeds = () => {
  const leds = useLeds();
  return (
    <div aria-hidden="true" data-slot="wheel-leds">
      <Row colors={leds.shift} kind="shift" lamps={SHIFT_LAMPS} />
      <Row colors={leds.left} kind="flag" lamps={LEFT_LAMPS} />
      <Row colors={leds.right} kind="flag" lamps={RIGHT_LAMPS} />
      {INDICATORS.map((id) => (
        <Led
          color={leds.indicators[id]}
          key={id}
          kind="indicator"
          lens={INDICATOR_LENS[id]}
          spot={INDICATOR_SPOTS[id]}
        />
      ))}
    </div>
  );
};

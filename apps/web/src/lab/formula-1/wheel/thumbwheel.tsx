import {
  Slider,
  SliderControl,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import type { CSSProperties } from "react";

import { useWheel, useWheelDispatch } from "../model/store";
import { THUMBWHEEL_RANGES } from "../model/types";
import type { Thumbwheel as ThumbwheelId, WheelState } from "../model/types";
import { At } from "./at";
import { useDetents } from "./detents";
import { useDialDrag } from "./dial-drag";
import type { Spot } from "./layout";

import "./wheel-dials.css";

const SELECT: Record<ThumbwheelId, (state: WheelState) => number> = {
  bs: (state) => state.thumbwheels.bs,
  dMid: (state) => state.thumbwheels.dMid,
  difIn: (state) => state.thumbwheels.difIn,
  eb: (state) => state.thumbwheels.eb,
  soc: (state) => state.thumbwheels.soc,
  trq: (state) => state.thumbwheels.trq,
};

/** The drum faces that can show in the slot: beyond three, a face has turned out of sight. */
/** Matches wheel-dials.css' --drag: a detent per 26 units, never under 12 px. */
const THUMBWHEEL_PITCH = { min: 12, units: 26 } as const;

const VISIBLE = [-3, -2, -1, 0, 1, 2, 3] as const;

/** Signed scales print their sign, like the drums: +3, 0, −3. */
export const printDetent = (value: number, signed: boolean): string => {
  if (!signed || value === 0) {
    return String(value);
  }
  return value > 0 ? `+${value}` : `−${-value}`;
};

interface ThumbwheelProps {
  wheel: ThumbwheelId;
  /** The printed label, then the function. */
  name: string;
  orientation: "horizontal" | "vertical";
  drum: "black" | "yellow";
  /** Boxes the end stops in yellow, like EB's ±5. */
  markEnds?: boolean;
  spot: Spot;
}

/**
 * Numbers run so they follow the finger: a drag up (or right) raises the value
 * and rolls the next number into the window from below (or the left).
 */
export const Thumbwheel = ({
  drum,
  markEnds = false,
  name,
  orientation,
  spot,
  wheel,
}: ThumbwheelProps) => {
  const range = THUMBWHEEL_RANGES[wheel];
  const count = range.max - range.min + 1;
  const signed = range.min < 0;
  const value = useWheel(SELECT[wheel]);
  const dispatch = useWheelDispatch();
  const detents = useDetents(count, range.wrap, value - range.min, range.min);
  const drag = useDialDrag(orientation, THUMBWHEEL_PITCH, () =>
    detents.commit()
  );

  /** The detent a drum position shows, rolling round on an endless drum. */
  const detentAt = (position: number): number =>
    range.min + (((position % count) + count) % count);
  const labelAt = (position: number): string => {
    const outside = position < 0 || position >= count;
    if (outside && !range.wrap) {
      return "";
    }
    return printDetent(detentAt(position), signed);
  };
  const markAt = (position: number): "end" | "zero" | undefined => {
    const detent = detentAt(position);
    if (signed && detent === 0) {
      return "zero";
    }
    if (markEnds && (detent === range.min || detent === range.max)) {
      return "end";
    }
    return undefined;
  };

  return (
    <At spot={spot}>
      <div
        data-drum={drum}
        data-orientation={orientation}
        data-slot="thumbwheel"
      >
        <Slider<number>
          data-wheel-dial=""
          format={(next) =>
            printDetent(range.min + detents.indexOf(next), signed)
          }
          max={detents.max}
          min={detents.min}
          {...drag.handlers}
          controller={drag.controller}
          onValueChange={(next) =>
            dispatch({
              type: "thumbwheel",
              value: range.min + detents.change(next),
              wheel,
            })
          }
          onValueCommit={() => detents.commit()}
          orientation={orientation}
          step={1}
          style={
            {
              "--steps": detents.max - detents.min,
            } as CSSProperties
          }
          value={detents.value}
        >
          <SliderControl>
            <SliderTrack>
              <SliderThumb aria-label={name}>
                <span
                  aria-hidden="true"
                  data-orientation={orientation}
                  data-slot="thumbwheel-drum"
                >
                  {VISIBLE.map((offset) => {
                    const position = detents.roll + offset;
                    const outside = position < 0 || position >= count;
                    return (
                      <span
                        data-current={offset === 0 ? "" : undefined}
                        data-mark={
                          outside && !range.wrap ? undefined : markAt(position)
                        }
                        data-slot="thumbwheel-detent"
                        key={position}
                        style={{ "--detent-offset": offset } as CSSProperties}
                      >
                        <span data-slot="thumbwheel-print">
                          {labelAt(position)}
                        </span>
                      </span>
                    );
                  })}
                </span>
              </SliderThumb>
            </SliderTrack>
          </SliderControl>
        </Slider>
      </div>
    </At>
  );
};

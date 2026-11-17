import {
  Slider,
  SliderControl,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, RefObject } from "react";

import { BODY_ORIGIN, FRAME, MIRROR, PLATE, RIGHT_RUBBER } from "./face-art";
import { LOCK_DEGREES, STEERING_STEP, createSteering } from "./steering-model";
import type { Steering, SteeringClock } from "./steering-model";

/** The hub sits 500 of the face's 1040 units down, as in wheel-steering.css. */
const HUB_Y = 500 / 1040;

const RADIANS_TO_DEGREES = 180 / Math.PI;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** "20° left", "centre", "20° right". */
export const steeringText = (degrees: number): string => {
  if (degrees === 0) {
    return "centre";
  }
  return `${Math.abs(degrees)}° ${degrees < 0 ? "left" : "right"}`;
};

const browserClock: SteeringClock = {
  cancel: (frame) => cancelAnimationFrame(frame),
  frame: (next) => requestAnimationFrame(next),
  now: () => performance.now(),
  reducedMotion: () =>
    typeof matchMedia === "function" && matchMedia(REDUCED_MOTION).matches,
};

export interface SteeringRig {
  stageRef: RefObject<HTMLDivElement | null>;
  faceRef: RefObject<HTMLDivElement | null>;
  /** The slider's value: where keys and agents put the wheel, 0 after a drag. */
  value: number;
  dragging: boolean;
  grab: (event: PointerEvent<SVGPathElement>) => void;
  move: (event: PointerEvent<SVGPathElement>) => void;
  letGo: () => void;
  steerTo: (degrees: number) => void;
  onSliderKey: (event: KeyboardEvent) => void;
}

/**
 * The turning lives outside React: every frame writes `rotate` on the face
 * itself, and `--steer` on its backing, whose shadow turns back to stay below.
 */
export const useSteering = (): SteeringRig => {
  const stageRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const steeringRef = useRef<Steering | null>(null);
  const [value, setValue] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const write = (degrees: number): void => {
      const face = faceRef.current;
      if (face === null) {
        return;
      }
      face.style.rotate = `${degrees}deg`;
      face
        .querySelector<SVGElement>('[data-slot="wheel-backing"]')
        ?.style.setProperty("--steer", `${degrees}deg`);
    };
    const steering = createSteering(write, browserClock, () => setValue(0));
    steeringRef.current = steering;
    return () => {
      steering.stop();
      steeringRef.current = null;
    };
  }, []);

  /** The pointer's angle round the hub, centred across the stage and `HUB_Y` down it. */
  const pointerDegrees = (event: PointerEvent): number => {
    const box = stageRef.current?.getBoundingClientRect();
    const x = box ? box.left + box.width / 2 : 0;
    const y = box ? box.top + box.height * HUB_Y : 0;
    return (
      Math.atan2(event.clientY - y, event.clientX - x) * RADIANS_TO_DEGREES
    );
  };

  return {
    dragging,
    faceRef,
    grab: (event) => {
      if (event.button !== 0 || steeringRef.current === null) {
        return;
      }
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      steeringRef.current.grab(pointerDegrees(event));
      setDragging(true);
    },
    letGo: () => {
      const steering = steeringRef.current;
      if (steering?.dragging()) {
        steering.release();
        setDragging(false);
        setValue(0);
      }
    },
    move: (event) => {
      const steering = steeringRef.current;
      if (steering?.dragging()) {
        steering.move(pointerDegrees(event));
      }
    },
    onSliderKey: (event) => {
      const steering = steeringRef.current;
      if (event.key === "Escape" && steering && steering.angle() !== 0) {
        steering.recentre();
        setValue(0);
      }
    },
    stageRef,
    steerTo: (degrees) => {
      setValue(degrees);
      steeringRef.current?.steerTo(degrees);
    },
    value,
  };
};

/** Keys, screen readers and agents steer through this slider; the grips are its handles for a hand. */
export const SteeringSlider = ({
  onKeyDown,
  onSteer,
  value,
}: {
  onKeyDown: (event: KeyboardEvent) => void;
  onSteer: (degrees: number) => void;
  value: number;
}) => (
  <Slider<number>
    data-steering-slider=""
    format={steeringText}
    max={LOCK_DEGREES}
    min={-LOCK_DEGREES}
    onKeyDown={onKeyDown}
    onValueChange={onSteer}
    step={STEERING_STEP}
    value={value}
  >
    <SliderControl>
      <SliderTrack>
        <SliderThumb aria-label="Steering" />
      </SliderTrack>
    </SliderControl>
  </Slider>
);

/** The rubber of both grips, less the finger openings, as the hand's hold. */
export const GripHandles = ({
  grab,
  letGo,
  move,
}: Pick<SteeringRig, "grab" | "letGo" | "move">) => {
  const plate = `${useId()}-plate`;
  return (
    <svg
      aria-hidden="true"
      data-slot="wheel-grips"
      focusable="false"
      viewBox={FRAME}
    >
      <defs>
        <clipPath id={plate}>
          <path d={PLATE} fillRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${plate})`} transform={BODY_ORIGIN}>
        {(["right", "left"] as const).map((side) => (
          <path
            d={RIGHT_RUBBER}
            data-grip-handle={side}
            key={side}
            onLostPointerCapture={letGo}
            onPointerCancel={letGo}
            onPointerDown={grab}
            onPointerMove={move}
            onPointerUp={letGo}
            transform={side === "left" ? MIRROR : undefined}
          />
        ))}
      </g>
    </svg>
  );
};

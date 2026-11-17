import { createSliderController } from "@ui-sdk/react/slider";
import type { SliderController } from "@ui-sdk/react/slider";
import { useMemo, useRef } from "react";
import type { PointerEvent } from "react";

import { FRAME_WIDTH } from "./layout";

const DEGREES_TO_RADIANS = Math.PI / 180;

/** How far a finger travels per detent: grid units at full size, never under `min` px. */
export interface DetentPitch {
  units: number;
  min: number;
}

interface Grip {
  pointer: number;
  x: number;
  y: number;
  from: number;
  turn: number;
  pitch: number;
  steps: number;
}

/** A drag on the page, seen from the wheel: turned back by the wheel's own rotation. */
export const wheelDelta = (
  dx: number,
  dy: number,
  turnDegrees: number
): { x: number; y: number } => {
  const angle = turnDegrees * DEGREES_TO_RADIANS;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: dx * cos + dy * sin, y: -dx * sin + dy * cos };
};

const faceOf = (element: Element): HTMLElement | null =>
  element.closest<HTMLElement>('[data-slot="wheel-face"]');

const turnOf = (face: HTMLElement | null): number => {
  const degrees = Number((face?.style.rotate ?? "").replace("deg", ""));
  return Number.isFinite(degrees) ? degrees : 0;
};

export interface DialDrag {
  controller: SliderController<number>;
  handlers: {
    onLostPointerCapture: () => void;
    onPointerCancel: () => void;
    onPointerDownCapture: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: () => void;
  };
}

/*
 * The slider keeps the keys, the focus and the ARIA, but not the pointer: its
 * own drag reads the page's axes, which a turned wheel no longer shares. A
 * drag is read in the wheel's frame instead, one detent per pitch, from where
 * the dial was, so it never jumps to the press.
 */
export const useDialDrag = (
  axis: "horizontal" | "vertical",
  pitch: DetentPitch,
  onEnd: () => void
): DialDrag => {
  const controller = useMemo(() => createSliderController<number>(), []);
  const grip = useRef<Grip | null>(null);

  const end = (): void => {
    if (grip.current !== null) {
      grip.current = null;
      onEnd();
    }
  };

  return {
    controller,
    handlers: {
      onLostPointerCapture: end,
      onPointerCancel: end,
      onPointerDownCapture: (event) => {
        if (event.button !== 0) {
          return;
        }
        event.stopPropagation();
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        controller.focus();
        const face = faceOf(event.currentTarget);
        const unit = (face?.offsetWidth ?? 0) / FRAME_WIDTH;
        grip.current = {
          from: controller.getValue(),
          pitch: Math.max(pitch.min, pitch.units * unit),
          pointer: event.pointerId,
          steps: 0,
          turn: turnOf(face),
          x: event.clientX,
          y: event.clientY,
        };
      },
      onPointerMove: (event) => {
        const held = grip.current;
        if (held === null || event.pointerId !== held.pointer) {
          return;
        }
        const delta = wheelDelta(
          event.clientX - held.x,
          event.clientY - held.y,
          held.turn
        );
        const travel = axis === "vertical" ? -delta.y : delta.x;
        const steps = Math.round(travel / held.pitch);
        if (steps !== held.steps) {
          held.steps = steps;
          controller.setValue(held.from + steps, {
            event: event.nativeEvent,
            reason: "drag",
          });
        }
      },
      onPointerUp: end,
    },
  };
};

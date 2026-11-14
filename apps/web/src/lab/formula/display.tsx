import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { Glass, GlassCaption } from "@/registry/formula/ui/formula/glass";
import {
  Meter,
  MeterCross,
  MeterMarker,
  MeterScale,
  MeterTrack,
  MeterValue,
} from "@/registry/formula/ui/formula/meter";

/** The scale runs from −RANGE to +RANGE g on both axes. */
const RANGE = 1.5;
const G_MARKS = [
  { at: -1.5, text: "1.5" },
  { at: -1, text: "1.0" },
  { at: -0.5, text: "0.5" },
  { at: 0, text: "" },
  { at: 0.5, text: "0.5" },
  { at: 1, text: "1.0" },
  { at: 1.5, text: "1.5" },
];

const STIFFNESS = 260;
// Below 1 the release overshoots a little, as a thrown weight would.
const RELEASE_DAMPING = 0.62;
const SUBSTEP = 1 / 240;
const MAX_FRAME = 1 / 30;
const AT_REST = 0.0005;
// A pointer that stopped this long before lifting hands over no velocity.
const STILL_MS = 80;
const DRIFT = { x: [0.035, 0.015], y: [0.025, 0.012] } as const;

interface Axis {
  pos: number;
  vel: number;
}

interface Reading {
  x: number;
  y: number;
}

const clampG = (value: number) => Math.min(RANGE, Math.max(-RANGE, value));

// Rounds first, so a reading a hair under zero prints 0.00 rather than −0.00,
// and prints a true minus sign below zero.
const formatG = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  const digits = Math.abs(rounded).toFixed(2);
  return rounded < 0 ? `−${digits}` : digits;
};

/** A slow wander of a few hundredths of a g: the car idling on its springs. */
const driftAt = (seconds: number): Reading => ({
  x:
    DRIFT.x[0] * Math.sin(seconds * 0.83) +
    DRIFT.x[1] * Math.sin(seconds * 2.1 + 1),
  y:
    DRIFT.y[0] * Math.sin(seconds * 0.61 + 2) +
    DRIFT.y[1] * Math.sin(seconds * 1.7),
});

const springStep = (
  axis: Axis,
  target: number,
  seconds: number,
  dampingRatio: number
) => {
  const damping = 2 * Math.sqrt(STIFFNESS) * dampingRatio;
  for (let left = seconds; left > 0; left -= SUBSTEP) {
    const step = Math.min(SUBSTEP, left);
    const force = -STIFFNESS * (axis.pos - target) - damping * axis.vel;
    axis.vel += force * step;
    axis.pos = clampG(axis.pos + axis.vel * step);
  }
};

const isMoving = (axis: Axis, target: number) =>
  Math.abs(axis.pos - target) > AT_REST || Math.abs(axis.vel) > AT_REST * 10;

const useGForce = () => {
  const [reading, setReading] = useState<Reading>({ x: 0, y: 0 });
  const surfaceRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    const marker = markerRef.current;
    const lateralTrack = surface?.querySelector<HTMLElement>(
      '[data-orientation="horizontal"] [data-slot="meter-track"]'
    );
    const longitudinalTrack = surface?.querySelector<HTMLElement>(
      '[data-orientation="vertical"] [data-slot="meter-track"]'
    );
    if (!(surface && marker && lateralTrack && longitudinalTrack)) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const x: Axis = { pos: 0, vel: 0 };
    const y: Axis = { pos: 0, vel: 0 };
    let pxPerGx = 1;
    let pxPerGy = 1;
    let frame = 0;
    let lastFrame = 0;
    let onScreen = false;
    let drag:
      | {
          id: number;
          lastMove: number;
          origin: Reading;
          start: { x: number; y: number };
        }
      | undefined;

    const measure = () => {
      pxPerGx = lateralTrack.getBoundingClientRect().width / (2 * RANGE);
      pxPerGy = longitudinalTrack.getBoundingClientRect().height / (2 * RANGE);
    };

    // The lateral meter places the square along its ruler; the longitudinal
    // reading lifts it off that ruler, so the one square sits at the reading.
    const placeMarker = () => {
      marker.style.translate = `0 ${(-y.pos * pxPerGy).toFixed(2)}px`;
    };

    const commit = () => {
      flushSync(() => {
        setReading((shown) =>
          shown.x === x.pos && shown.y === y.pos
            ? shown
            : { x: x.pos, y: y.pos }
        );
      });
      placeMarker();
    };

    const drifts = () => !reducedMotion.matches;

    const tick = (now: number) => {
      frame = 0;
      const seconds = Math.min((now - lastFrame) / 1000, MAX_FRAME);
      lastFrame = now;
      let moving = drag !== undefined;
      if (!drag) {
        const target = drifts() ? driftAt(now / 1000) : { x: 0, y: 0 };
        const damping = reducedMotion.matches ? 1 : RELEASE_DAMPING;
        springStep(x, target.x, seconds, damping);
        springStep(y, target.y, seconds, damping);
        moving = drifts() || isMoving(x, target.x) || isMoving(y, target.y);
        if (!moving) {
          x.pos = target.x;
          y.pos = target.y;
          x.vel = 0;
          y.vel = 0;
        }
      }
      commit();
      if (moving && onScreen) {
        frame = requestAnimationFrame(tick);
      }
    };

    const wake = () => {
      if (frame === 0 && onScreen) {
        lastFrame = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || drag) {
        return;
      }
      surface.setPointerCapture(event.pointerId);
      surface.toggleAttribute("data-dragging", true);
      measure();
      // Catching the reading mid-spring holds it where it is.
      x.vel = 0;
      y.vel = 0;
      drag = {
        id: event.pointerId,
        lastMove: event.timeStamp,
        origin: { x: x.pos, y: y.pos },
        start: { x: event.clientX, y: event.clientY },
      };
      wake();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (drag?.id !== event.pointerId) {
        return;
      }
      const seconds = Math.max((event.timeStamp - drag.lastMove) / 1000, 0.001);
      const nextX = clampG(
        drag.origin.x + (event.clientX - drag.start.x) / pxPerGx
      );
      const nextY = clampG(
        drag.origin.y - (event.clientY - drag.start.y) / pxPerGy
      );
      x.vel = (nextX - x.pos) / seconds;
      y.vel = (nextY - y.pos) / seconds;
      x.pos = nextX;
      y.pos = nextY;
      drag.lastMove = event.timeStamp;
      wake();
    };

    const onPointerEnd = (event: PointerEvent) => {
      if (drag?.id !== event.pointerId) {
        return;
      }
      if (event.timeStamp - drag.lastMove > STILL_MS) {
        x.vel = 0;
        y.vel = 0;
      }
      drag = undefined;
      surface.toggleAttribute("data-dragging", false);
      wake();
    };

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? false;
      if (onScreen) {
        wake();
      } else if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    const resize = new ResizeObserver(() => {
      measure();
      placeMarker();
    });

    visibility.observe(surface);
    resize.observe(surface);
    reducedMotion.addEventListener("change", wake);
    surface.addEventListener("pointerdown", onPointerDown);
    surface.addEventListener("pointermove", onPointerMove);
    surface.addEventListener("pointerup", onPointerEnd);
    surface.addEventListener("pointercancel", onPointerEnd);

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      resize.disconnect();
      reducedMotion.removeEventListener("change", wake);
      surface.removeEventListener("pointerdown", onPointerDown);
      surface.removeEventListener("pointermove", onPointerMove);
      surface.removeEventListener("pointerup", onPointerEnd);
      surface.removeEventListener("pointercancel", onPointerEnd);
    };
  }, []);

  return { markerRef, reading, surfaceRef };
};

/** Zone 1: the g-force readout, tilted by a drag and sprung back to rest. */
export const GForceDisplay = () => {
  const { markerRef, reading, surfaceRef } = useGForce();

  return (
    <Glass brackets data-formula-display ref={surfaceRef}>
      <GlassCaption>G-force</GlassCaption>
      <GlassCaption aria-hidden>(g)</GlassCaption>
      <MeterCross>
        <Meter
          aria-label="Lateral g-force"
          format={formatG}
          major={10}
          max={RANGE}
          min={-RANGE}
          ticks={60}
          value={reading.x}
        >
          <MeterValue />
          <MeterScale>
            {G_MARKS.map((mark) => (
              <span key={mark.at}>{mark.text}</span>
            ))}
          </MeterScale>
          <MeterTrack>
            <MeterMarker ref={markerRef} />
          </MeterTrack>
        </Meter>
        <Meter
          aria-label="Longitudinal g-force"
          format={formatG}
          major={10}
          max={RANGE}
          min={-RANGE}
          orientation="vertical"
          ticks={60}
          value={reading.y}
        >
          <MeterValue />
          <MeterTrack />
        </Meter>
      </MeterCross>
    </Glass>
  );
};

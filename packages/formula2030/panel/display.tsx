import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import {
  Glass,
  GlassCaption,
  GlassBrackets,
} from "@/registry/formula/ui/formula/glass";
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
// Labelled on the left half only, as on the reference.
const G_MARKS = [
  { at: -1.5, text: "1.5" },
  { at: -1, text: "1.0" },
  { at: -0.5, text: "0.5" },
  { at: 0, text: "" },
  { at: 0.5, text: "" },
  { at: 1, text: "" },
  { at: 1.5, text: "" },
];

export type Drive = "autonomous" | "normal" | "performance";

/** How hard each mode drives the same lap. */
const INTENSITY: Record<Drive, number> = {
  autonomous: 0.3,
  normal: 0.55,
  performance: 1,
};

/** One lap, as the g it puts on the car: launch, brake, corner, power out. */
const LAP = [
  { until: 2.6, x: 0, y: 0.55 },
  { until: 3.4, x: 0, y: 0.1 },
  { until: 4.6, x: 0, y: -0.95 },
  { until: 6.8, x: 1.05, y: -0.1 },
  { until: 8.8, x: 0.2, y: 0.6 },
  { until: 9.8, x: 0, y: -0.7 },
  { until: 12.2, x: -0.9, y: 0 },
  { until: 14.6, x: -0.1, y: 0.5 },
  { until: 16, x: 0, y: 0 },
] as const;
const LAP_SECONDS = 16;

// A soft, slightly underdamped spring: the car's weight lags the driver.
const STIFFNESS = 38;
const DAMPING_RATIO = 0.82;
const SUBSTEP = 1 / 240;
const MAX_FRAME = 1 / 30;
const ROAD = { x: [0.035, 0.015], y: [0.025, 0.012] } as const;

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

/** The road's own texture: a few hundredths of a g that never settle. */
const roadAt = (seconds: number): Reading => ({
  x:
    ROAD.x[0] * Math.sin(seconds * 0.83) +
    ROAD.x[1] * Math.sin(seconds * 2.1 + 1),
  y:
    ROAD.y[0] * Math.sin(seconds * 0.61 + 2) +
    ROAD.y[1] * Math.sin(seconds * 1.7),
});

const lapAt = (seconds: number): Reading => {
  const at = seconds % LAP_SECONDS;
  return LAP.find((leg) => at < leg.until) ?? { x: 0, y: 0 };
};

const springStep = (axis: Axis, target: number, seconds: number) => {
  const damping = 2 * Math.sqrt(STIFFNESS) * DAMPING_RATIO;
  for (let left = seconds; left > 0; left -= SUBSTEP) {
    const step = Math.min(SUBSTEP, left);
    const force = -STIFFNESS * (axis.pos - target) - damping * axis.vel;
    axis.vel += force * step;
    axis.pos = clampG(axis.pos + axis.vel * step);
  }
};

const useGForce = (drive: Drive) => {
  const [reading, setReading] = useState<Reading>({ x: 0, y: 0 });
  const surfaceRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const intensityRef = useRef(INTENSITY[drive]);

  useEffect(() => {
    intensityRef.current = INTENSITY[drive];
  }, [drive]);

  useEffect(() => {
    const surface = surfaceRef.current;
    const marker = markerRef.current;
    const longitudinalTrack = surface?.querySelector<HTMLElement>(
      '[data-orientation="vertical"] [data-slot="meter-track"]'
    );
    if (!(surface && marker && longitudinalTrack)) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const x: Axis = { pos: 0, vel: 0 };
    const y: Axis = { pos: 0, vel: 0 };
    let pxPerG = 1;
    let frame = 0;
    let lastFrame = 0;
    let onScreen = false;

    const measure = () => {
      pxPerG = longitudinalTrack.getBoundingClientRect().height / (2 * RANGE);
    };

    // The lateral meter places the square along its ruler; the longitudinal
    // reading lifts it off that ruler, so the one square sits at the reading.
    const placeMarker = () => {
      marker.style.translate = `0 ${(-y.pos * pxPerG).toFixed(2)}px`;
    };

    const show = () => {
      flushSync(() => {
        setReading((shown) =>
          shown.x === x.pos && shown.y === y.pos
            ? shown
            : { x: x.pos, y: y.pos }
        );
      });
      placeMarker();
    };

    const rest = () => {
      x.pos = 0;
      x.vel = 0;
      y.pos = 0;
      y.vel = 0;
      show();
    };

    const tick = (now: number) => {
      frame = 0;
      if (reducedMotion.matches || !onScreen) {
        return;
      }
      const seconds = Math.min((now - lastFrame) / 1000, MAX_FRAME);
      lastFrame = now;
      const lap = lapAt(now / 1000);
      const road = roadAt(now / 1000);
      springStep(x, lap.x * intensityRef.current + road.x, seconds);
      springStep(y, lap.y * intensityRef.current + road.y, seconds);
      show();
      frame = requestAnimationFrame(tick);
    };

    // Reduced motion shows the car at rest instead of a moving reading.
    const wake = () => {
      if (reducedMotion.matches) {
        rest();
      } else if (frame === 0 && onScreen) {
        lastFrame = performance.now();
        frame = requestAnimationFrame(tick);
      }
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

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      resize.disconnect();
      reducedMotion.removeEventListener("change", wake);
    };
  }, []);

  return { markerRef, reading, surfaceRef };
};

/** Zone 1: the g-force readout. An indicator of the car's motion, not a control. */
export const GForceDisplay = ({ drive }: { drive: Drive }) => {
  const { markerRef, reading, surfaceRef } = useGForce(drive);

  return (
    <Glass data-formula-display ref={surfaceRef}>
      <GlassBrackets />
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

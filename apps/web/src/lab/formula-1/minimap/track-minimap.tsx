import { selectOnTrack } from "../model/selectors";
import { useWheel } from "../model/store";
import type { WheelState } from "../model/types";
import {
  CORNER_MARKS,
  DRS_PATHS,
  LAP_PATH,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  poseAt,
} from "./track-outline";

import "./track-minimap.css";

const DEG_PER_RAD = 180 / Math.PI;
const START_TICK = 4;
const START = poseAt(0);
const TICK_X = Math.cos(START.heading + Math.PI / 2) * START_TICK;
const TICK_Y = Math.sin(START.heading + Math.PI / 2) * START_TICK;

/** The outline never changes: drawn once, outside the per-frame parts. */
const Outline = () => (
  <>
    <path d={LAP_PATH} data-slot="track-minimap-lap" />
    {DRS_PATHS.map(({ key, path }) => (
      <path d={path} data-slot="track-minimap-drs" key={key} />
    ))}
    <line
      data-slot="track-minimap-start"
      x1={START.x - TICK_X}
      x2={START.x + TICK_X}
      y1={START.y - TICK_Y}
      y2={START.y + TICK_Y}
    />
    {CORNER_MARKS.map(({ label, name }) => (
      <text data-slot="track-minimap-corner" key={name} x={label.x} y={label.y}>
        {name.slice(1)}
      </text>
    ))}
  </>
);

/** Re-renders alone, once per metre driven. */
const Car = () => {
  const metres = useWheel((state) => Math.round(state.distanceM));
  const { heading, x, y } = poseAt(metres);
  return (
    <path
      d="M5 0 L-3.6 3.6 L-2 0 L-3.6 -3.6 Z"
      data-distance={metres}
      data-slot="track-minimap-car"
      transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${(heading * DEG_PER_RAD).toFixed(1)})`}
    />
  );
};

const RING_STEPS = 50;

/** The hidden driver's throttle, as a share of RING_STEPS so the ring moves in small steps. */
const selectThrottle = (state: WheelState): number =>
  Math.round(state.throttle * RING_STEPS) / RING_STEPS;

/** The card's rim fills clockwise from the top with the throttle. */
const ThrottleRing = () => {
  const throttle = useWheel(selectThrottle);
  return (
    <svg data-slot="track-minimap-throttle" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        data-throttle={throttle}
        pathLength={100}
        r="48.5"
        strokeDasharray="100"
        strokeDashoffset={100 - throttle * 100}
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
};

/**
 * Where the car is on the lap, shown on track only. Decorative: the dash's
 * live region already speaks the race, and a second one would talk over it.
 */
export const TrackMinimap = () => {
  const onTrack = useWheel(selectOnTrack);
  return (
    <div
      aria-hidden
      data-slot="track-minimap"
      data-visible={onTrack ? "" : undefined}
    >
      <div data-slot="track-minimap-card">
        <svg
          data-slot="track-minimap-map"
          viewBox={`0 0 ${VIEW_WIDTH.toFixed(2)} ${VIEW_HEIGHT.toFixed(2)}`}
        >
          <Outline />
          <Car />
        </svg>
        <ThrottleRing />
      </div>
    </div>
  );
};

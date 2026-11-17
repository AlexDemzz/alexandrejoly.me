import { CORNERS, DRS_ZONES, LAP_LENGTH_M } from "../model/track";

// The lap has distances but no shape, so the minimap draws one [INV]: each
// corner turns by a set angle (right positive, netting one clockwise lap) over
// its length, the straights run straight, and the few metres by which the line
// misses its start are spread evenly along the lap so it closes without a kink.

export interface OutlinePoint {
  x: number;
  y: number;
}

/** Signed turn per corner, degrees: they net 360 and were searched so the line closes within metres. */
const TURN_DEG: Readonly<Record<string, number>> = {
  T1: 128,
  T2: -28,
  T3: 15,
  T4: 151,
  T5: -20,
  T6: -96,
  T7: 123,
  T8: 87,
};

export const STEP_M = 10;
const SAMPLES = Math.round(LAP_LENGTH_M / STEP_M);
const RADIANS_PER_DEG = Math.PI / 180;
/** The start/finish straight runs right to left along the bottom. */
const START_HEADING = Math.PI;
/** Room around the line inside the view box, in its units. */
const PADDING = 8;
/** The long side of the view box, in its units. */
export const MAP_SPAN = 100;

const curvatureAt = (distanceM: number): number => {
  const turn = CORNERS.find(
    ({ endM, startM }) => distanceM >= startM && distanceM < endM
  );
  if (turn === undefined) {
    return 0;
  }
  return (
    ((TURN_DEG[turn.name] ?? 0) * RADIANS_PER_DEG) / (turn.endM - turn.startM)
  );
};

/** The line as driven, metre by metre, before it is closed. */
export const traceOpen = (): OutlinePoint[] => {
  const points: OutlinePoint[] = [];
  let heading = START_HEADING;
  let x = 0;
  let y = 0;
  for (let index = 0; index <= SAMPLES; index += 1) {
    points.push({ x, y });
    heading += curvatureAt(index * STEP_M) * STEP_M;
    x += Math.cos(heading) * STEP_M;
    y += Math.sin(heading) * STEP_M;
  }
  return points;
};

const close = (points: readonly OutlinePoint[]): OutlinePoint[] => {
  const last = points.at(-1) ?? { x: 0, y: 0 };
  const [first] = points;
  return points.map((point, index) => ({
    x: point.x - ((last.x - first.x) * index) / SAMPLES,
    y: point.y - ((last.y - first.y) * index) / SAMPLES,
  }));
};

const fit = (
  points: readonly OutlinePoint[]
): { points: OutlinePoint[]; width: number; height: number } => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX;
  const spanY = Math.max(...ys) - minY;
  const scale = (MAP_SPAN - 2 * PADDING) / Math.max(spanX, spanY);
  return {
    height: spanY * scale + 2 * PADDING,
    points: points.map((point) => ({
      x: PADDING + (point.x - minX) * scale,
      y: PADDING + (point.y - minY) * scale,
    })),
    width: spanX * scale + 2 * PADDING,
  };
};

const FITTED = fit(close(traceOpen()));

/** One point every `STEP_M` metres; the last repeats the first. */
export const OUTLINE: readonly OutlinePoint[] = FITTED.points;
export const VIEW_WIDTH = FITTED.width;
export const VIEW_HEIGHT = FITTED.height;

const wrap = (distanceM: number): number =>
  ((distanceM % LAP_LENGTH_M) + LAP_LENGTH_M) % LAP_LENGTH_M;

export interface TrackPose extends OutlinePoint {
  /** Direction of travel, radians, 0 pointing right and growing clockwise. */
  heading: number;
}

/** Where on the outline the car is after this many metres of the lap, and which way it points. */
export const poseAt = (distanceM: number): TrackPose => {
  const at = wrap(distanceM);
  const index = Math.min(Math.floor(at / STEP_M), SAMPLES - 1);
  const from = OUTLINE[index];
  const to = OUTLINE[index + 1];
  const share = (at - index * STEP_M) / STEP_M;
  return {
    heading: Math.atan2(to.y - from.y, to.x - from.x),
    x: from.x + (to.x - from.x) * share,
    y: from.y + (to.y - from.y) * share,
  };
};

const toPath = (points: readonly OutlinePoint[]): string =>
  points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(" ");

export const LAP_PATH = `${toPath(OUTLINE.slice(0, -1))} Z`;

/** The outline from one distance to another, forward and over the line if need be. */
export const stretchPath = (startM: number, endM: number): string => {
  const from = wrap(startM);
  const length = wrap(endM - from) || LAP_LENGTH_M;
  const points: OutlinePoint[] = [poseAt(from)];
  for (
    let next = Math.ceil(from / STEP_M) * STEP_M;
    next < from + length;
    next += STEP_M
  ) {
    if (next > from) {
      points.push(poseAt(next));
    }
  }
  points.push(poseAt(from + length));
  return toPath(points);
};

export const DRS_PATHS: readonly { key: number; path: string }[] =
  DRS_ZONES.map((zone) => ({
    key: zone.startM,
    path: stretchPath(zone.startM, zone.endM),
  }));

/** Where a corner's number sits: beside its apex, on the outside of the turn. */
const LABEL_OFFSET = 7;

export const CORNER_MARKS: readonly {
  name: string;
  apex: OutlinePoint;
  label: OutlinePoint;
}[] = CORNERS.map((turn) => {
  const apex = poseAt((turn.startM + turn.endM) / 2);
  const outward = turn.turn === "right" ? -1 : 1;
  const normal = apex.heading + (outward * Math.PI) / 2;
  return {
    apex,
    label: {
      x: apex.x + Math.cos(normal) * LABEL_OFFSET,
      y: apex.y + Math.sin(normal) * LABEL_OFFSET,
    },
    name: turn.name,
  };
});

// A fictional 5.04 km lap, invented for the lab. Distances are metres from the
// control line; speeds are km/h.

export interface TrackCorner {
  kind: "corner";
  name: string;
  startM: number;
  endM: number;
  /** The fastest the reference car takes the corner. */
  apexKph: number;
  turn: "left" | "right";
}

export interface TrackStraight {
  kind: "straight";
  startM: number;
  endM: number;
}

export type TrackSegment = TrackCorner | TrackStraight;

/** A DRS zone and its detection point. `endM < startM` wraps over the control line. */
export interface DrsZone {
  detectionM: number;
  startM: number;
  endM: number;
}

export const LAP_LENGTH_M = 5040;

const corner = (
  name: string,
  startM: number,
  endM: number,
  apexKph: number,
  turn: "left" | "right"
): TrackCorner => ({ apexKph, endM, kind: "corner", name, startM, turn });

const straight = (startM: number, endM: number): TrackStraight => ({
  endM,
  kind: "straight",
  startM,
});

export const TRACK: readonly TrackSegment[] = [
  straight(0, 780),
  corner("T1", 780, 900, 90, "right"),
  straight(900, 1300),
  corner("T2", 1300, 1420, 155, "left"),
  corner("T3", 1420, 1540, 205, "right"),
  straight(1540, 2360),
  corner("T4", 2360, 2480, 115, "right"),
  straight(2480, 2760),
  corner("T5", 2760, 2960, 235, "left"),
  straight(2960, 3640),
  corner("T6", 3640, 3740, 82, "left"),
  straight(3740, 3980),
  corner("T7", 3980, 4120, 175, "right"),
  straight(4120, 4330),
  corner("T8", 4330, 4460, 135, "right"),
  straight(4460, LAP_LENGTH_M),
];

export const CORNERS: readonly TrackCorner[] = TRACK.filter(
  (segment): segment is TrackCorner => segment.kind === "corner"
);

/** Two zones on the long straights, each detected before the corner leading onto it [R S25 Art. 22]. */
export const DRS_ZONES: readonly DrsZone[] = [
  { detectionM: 1250, endM: 2300, startM: 1600 },
  { detectionM: 4250, endM: 720, startM: 4520 },
];

/** Within this gap of the car ahead at a detection point, DRS is available [R S25 Art. 22.1]. */
export const DRS_DETECTION_GAP_S = 1;

const wrapDistance = (distanceM: number): number =>
  ((distanceM % LAP_LENGTH_M) + LAP_LENGTH_M) % LAP_LENGTH_M;

export const segmentAt = (distanceM: number): TrackSegment => {
  const at = wrapDistance(distanceM);
  return (
    TRACK.find((segment) => at >= segment.startM && at < segment.endM) ??
    TRACK[0]
  );
};

export const cornerAt = (distanceM: number): TrackCorner | null => {
  const segment = segmentAt(distanceM);
  return segment.kind === "corner" ? segment : null;
};

const isInZone = (at: number, zone: DrsZone): boolean =>
  zone.endM > zone.startM
    ? at >= zone.startM && at < zone.endM
    : at >= zone.startM || at < zone.endM;

export const drsZoneAt = (distanceM: number): DrsZone | null => {
  const at = wrapDistance(distanceM);
  return DRS_ZONES.find((zone) => isInZone(at, zone)) ?? null;
};

export interface UpcomingCorner {
  corner: TrackCorner;
  /** 0 when the car is already in the corner. */
  distanceM: number;
}

/** The corners within `rangeM` ahead of the car, nearest first, over the line too. */
export const upcomingCorners = (
  distanceM: number,
  rangeM: number
): UpcomingCorner[] => {
  const at = wrapDistance(distanceM);
  const found: UpcomingCorner[] = [];
  for (const turn of CORNERS) {
    const inside = at >= turn.startM && at < turn.endM;
    const gap = inside ? 0 : wrapDistance(turn.startM - at);
    if (gap <= rangeM) {
      found.push({ corner: turn, distanceM: gap });
    }
  }
  return found.toSorted((a, b) => a.distanceM - b.distanceM);
};

// The reference lap the cars around follow: a speed envelope from a simpler car.

const KPH_PER_MS = 3.6;
const GRAVITY = 9.81;
const REFERENCE_STEP_M = 10;
const REFERENCE_MASS_KG = 800;
const REFERENCE_POWER_W = 650_000;
const REFERENCE_DRAG_AREA = 1.2;
const AIR_DENSITY = 1.225;
const REFERENCE_TRACTION_G = 1.4;
const REFERENCE_BRAKE_G = 3.2;
const REFERENCE_MIN_SPEED_MS = 5;
const REFERENCE_TOP_KPH = 345;
const REFERENCE_SETTLE_LAPS = 2;

const referenceAccel = (speed: number): number => {
  const v = Math.max(speed, REFERENCE_MIN_SPEED_MS);
  const drive = Math.min(
    REFERENCE_TRACTION_G * GRAVITY,
    REFERENCE_POWER_W / (REFERENCE_MASS_KG * v)
  );
  const drag =
    (0.5 * AIR_DENSITY * REFERENCE_DRAG_AREA * v * v) / REFERENCE_MASS_KG;
  return drive - drag;
};

const buildReferenceSpeeds = (): number[] => {
  const samples = Math.ceil(LAP_LENGTH_M / REFERENCE_STEP_M);
  const cap = Array.from({ length: samples }, (_, index) => {
    const turn = cornerAt(index * REFERENCE_STEP_M);
    return (turn?.apexKph ?? REFERENCE_TOP_KPH) / KPH_PER_MS;
  });
  const speeds = [...cap];
  let speed = Math.min(...cap);
  for (let lap = 0; lap < REFERENCE_SETTLE_LAPS; lap += 1) {
    for (let index = 0; index < samples; index += 1) {
      const accelerated = Math.sqrt(
        speed * speed +
          2 * Math.max(referenceAccel(speed), 0) * REFERENCE_STEP_M
      );
      speed = Math.min(accelerated, cap[index]);
      speeds[index] = speed;
    }
  }
  let [ahead] = speeds;
  for (let lap = 0; lap < REFERENCE_SETTLE_LAPS; lap += 1) {
    for (let index = samples - 1; index >= 0; index -= 1) {
      const braked = Math.sqrt(
        ahead * ahead + 2 * REFERENCE_BRAKE_G * GRAVITY * REFERENCE_STEP_M
      );
      speeds[index] = Math.min(speeds[index], braked);
      ahead = speeds[index];
    }
  }
  return speeds;
};

const REFERENCE_SPEEDS_MS = buildReferenceSpeeds();

const buildReferenceTimes = (): number[] => {
  const times = [0];
  for (let index = 1; index < REFERENCE_SPEEDS_MS.length; index += 1) {
    const mean =
      (REFERENCE_SPEEDS_MS[index - 1] + REFERENCE_SPEEDS_MS[index]) / 2;
    times.push(times[index - 1] + (REFERENCE_STEP_M / mean) * 1000);
  }
  return times;
};

const REFERENCE_TIMES_MS = buildReferenceTimes();

/** The reference car's speed at this point of the lap, km/h. */
export const referenceSpeedKph = (distanceM: number): number => {
  const index = Math.floor(wrapDistance(distanceM) / REFERENCE_STEP_M);
  return REFERENCE_SPEEDS_MS[index] * KPH_PER_MS;
};

/** The reference car's lap time at this point of the lap, ms. */
export const referenceTimeMs = (distanceM: number): number => {
  const at = wrapDistance(distanceM);
  const index = Math.floor(at / REFERENCE_STEP_M);
  const into = (at - index * REFERENCE_STEP_M) / REFERENCE_SPEEDS_MS[index];
  return REFERENCE_TIMES_MS[index] + into * 1000;
};

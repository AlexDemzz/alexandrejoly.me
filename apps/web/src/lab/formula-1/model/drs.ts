import { DRS_DETECTION_GAP_S, DRS_ZONES, drsZoneAt } from "./track";
import type { WheelState } from "./types";

/** DRS may be used "after he has completed one (1) lap after the start" [R S25 Art. 22.1c]. */
export const DRS_FIRST_LAP = 2;

const crossed = (beforeM: number, afterM: number, lineM: number): boolean =>
  beforeM < lineM && afterM >= lineM;

/**
 * disabled → available (within 1 s at a detection point) → enabled (inside
 * the zone) → open (driver pressed). The first brake application closes it
 * for the rest of the zone; the zone's end disables it [R S25 Art. 22.1].
 */
export const updateDrs = (state: WheelState, beforeM: number): WheelState => {
  if (state.timing.lap < DRS_FIRST_LAP || state.start.kind !== "go") {
    return state.drs === "disabled" ? state : { ...state, drs: "disabled" };
  }
  const detected = DRS_ZONES.some((zone) =>
    crossed(beforeM, state.distanceM, zone.detectionM)
  );
  if (detected) {
    return {
      ...state,
      drs: state.gapAheadS < DRS_DETECTION_GAP_S ? "available" : "disabled",
    };
  }
  const inZone = drsZoneAt(state.distanceM) !== null;
  if (state.drs === "available" && inZone) {
    return { ...state, drs: "enabled" };
  }
  const leftZone = !inZone && (state.drs === "enabled" || state.drs === "open");
  const braked = state.drs === "open" && state.brake > 0;
  return leftZone || braked ? { ...state, drs: "disabled" } : state;
};

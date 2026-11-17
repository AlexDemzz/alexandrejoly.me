import { DISPLAY_PAGES } from "../model/types";
import type { DisplayPage, WheelState } from "../model/types";

/** TEMPS and LAPS join the + / − cycle through DISPLAY_PAGES in model/types.ts. */
export type Screen = DisplayPage | "temps" | "laps";

/** P pins the race page; S shows the page + / − last picked. */
export const selectScreen = (state: WheelState): Screen =>
  state.dashSwitch === "P" ? "race" : state.page;

const CYCLE: readonly string[] = DISPLAY_PAGES;

/** "2/5": where the page sits in the + / − cycle, or nothing outside it. */
export const pagePlace = (screen: Screen): string | null => {
  const index = CYCLE.indexOf(screen);
  return index === -1 ? null : `${index + 1}/${CYCLE.length}`;
};

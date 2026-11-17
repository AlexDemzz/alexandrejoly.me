import { DISPLAY_PAGES } from "../model/types";
import type { DisplayPage, WheelState } from "../model/types";

/** A page of the + / − cycle, or the race page's grid state before lights out. */
export type Screen = DisplayPage | "grid";

/** P pins the race page; S shows the page + / − last picked. */
export const selectScreen = (state: WheelState): Screen => {
  const page = state.dashSwitch === "P" ? "race" : state.page;
  const onGrid = state.session === "track" && state.start.kind !== "go";
  return page === "race" && onGrid ? "grid" : page;
};

const CYCLE: readonly string[] = DISPLAY_PAGES;

/** "2/5": where the page sits in the + / − cycle, or nothing outside it. */
export const pagePlace = (screen: Screen): string | null => {
  const index = CYCLE.indexOf(screen);
  return index === -1 ? null : `${index + 1}/${CYCLE.length}`;
};

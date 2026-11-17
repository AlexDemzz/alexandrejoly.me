import {
  clearMessage,
  expireFeedback,
  withMessage,
  withPopup,
} from "./feedback";
import { completeShift, requestShift, shiftTarget } from "./gearbox";
import type { ShiftRequest } from "./gearbox";
import { toGarage, toTrack } from "./initial-state";
import {
  BRAKE_BALANCE_MAX,
  BRAKE_BALANCE_MIN,
  BRAKE_BALANCE_STEP,
  MULTI_MAX,
  MULTI_MIN,
  clamp,
} from "./ranges";
import { advance } from "./simulation";
import {
  DISPLAY_PAGES,
  MFL_POSITIONS,
  MFR_POSITIONS,
  MODE_POSITIONS,
  THUMBWHEEL_RANGES,
} from "./types";
import type {
  DashSwitch,
  ErsMode,
  GearControl,
  Session,
  Rotary,
  Thumbwheel,
  WheelAction,
  WheelButton,
  WheelState,
} from "./types";

/** How long a multi-function menu stays open after the last turn or + / − [INV]. */
export const MULTI_MENU_MS = 4000;
const ROTARY_DETENTS = 12;

const THUMBWHEEL_LABELS: Record<Thumbwheel, string> = {
  bs: "BS",
  dMid: "D MID",
  difIn: "DIF IN",
  eb: "EB",
  soc: "SOC",
  trq: "TRQ",
};

const ROTARY_LABELS: Record<Rotary, string> = {
  eng: "ENG",
  mfl: "MFL",
  mfr: "MFR",
  mode: "MODE",
  target: "TARGET",
  tyrePhase: "TYRE PHASE",
};

const wrap = (value: number, size: number): number =>
  ((Math.round(value) % size) + size) % size;

/** "+2", "0", "−3": how the signed drums are printed. */
export const signed = (value: number): string => {
  if (value > 0) {
    return `+${value}`;
  }
  return value < 0 ? `−${Math.abs(value)}` : "0";
};

const stepBrakeBalance = (state: WheelState, by: number): WheelState => {
  const brakeBalance = clamp(
    state.brakeBalance + by,
    BRAKE_BALANCE_MIN,
    BRAKE_BALANCE_MAX
  );
  return withPopup(
    { ...state, brakeBalance },
    "BBAL",
    `${brakeBalance.toFixed(1)}%`
  );
};

const latchErs = (
  state: WheelState,
  mode: Exclude<ErsMode, "k1">
): WheelState => {
  const latched = state.ersLatched === mode ? "base" : mode;
  return withPopup(
    {
      ...state,
      ers: state.ers === "k1" ? "k1" : latched,
      ersLatched: latched,
    },
    "ERS",
    latched.toUpperCase()
  );
};

const resetErs = (state: WheelState): WheelState =>
  withPopup({ ...state, ers: "base", ersLatched: "base" }, "ERS", "BASE");

/** + / −: adjust the open multi-function parameter, else page the dash on S. */
const stepPlusMinus = (state: WheelState, by: 1 | -1): WheelState => {
  const menu = state.multiMenu;
  if (menu !== null) {
    const values: Record<string, number> = state.multi[menu.rotary];
    const value = clamp(values[menu.param] + by, MULTI_MIN, MULTI_MAX);
    return withPopup(
      {
        ...state,
        multi: {
          ...state.multi,
          [menu.rotary]: { ...values, [menu.param]: value },
        },
        multiMenu: { ...menu, until: state.now + MULTI_MENU_MS },
      },
      menu.param,
      String(value)
    );
  }
  if (state.dashSwitch === "P") {
    return withPopup(state, "DASH", "P");
  }
  const index = DISPLAY_PAGES.indexOf(state.page);
  const page = DISPLAY_PAGES[wrap(index + by, DISPLAY_PAGES.length)];
  return { ...state, page };
};

const toggleLimiter = (state: WheelState): WheelState => {
  const pitLimiter = !state.pitLimiter;
  return withPopup(
    { ...state, pitLimiter },
    "PIT LIMITER",
    pitLimiter ? "ON" : "OFF"
  );
};

/** The gearbox mode toggle: the hidden driver picks up from whatever gear the car is in. */
const setGearControl = (state: WheelState, value: GearControl): WheelState =>
  withPopup({ ...state, gearControl: value }, "GEARBOX", value.toUpperCase());

/**
 * On track, a paddle or N press hands the gearbox to the human. Before
 * lights out the hidden driver holds 1st for the start, so a hand shift is
 * refused [INV].
 */
const shiftByHand = (state: WheelState, request: ShiftRequest): WheelState => {
  if (state.session !== "track") {
    return requestShift(state, request);
  }
  if (state.start.kind !== "go") {
    return shiftTarget(state.gear, request) === null
      ? state
      : withMessage(state, "SHIFT REJECTED", "warn");
  }
  const handed =
    state.gearControl === "manual" ? state : setGearControl(state, "manual");
  return requestShift(handed, request);
};

/** DRS opens only once enabled in a zone; pressing again closes it [R S25 Art. 22]. */
const pressDrs = (state: WheelState): WheelState => {
  if (state.drs === "enabled") {
    return { ...state, drs: "open" };
  }
  if (state.drs === "open") {
    return { ...state, drs: "enabled" };
  }
  return withPopup(state, "DRS", "NOT ENABLED");
};

const press = (state: WheelState, button: WheelButton): WheelState => {
  switch (button) {
    case "bbForward": {
      return stepBrakeBalance(state, BRAKE_BALANCE_STEP);
    }
    case "bbRearward": {
      return stepBrakeBalance(state, -BRAKE_BALANCE_STEP);
    }
    case "chr": {
      return latchErs(state, "chr");
    }
    case "drs": {
      return pressDrs(state);
    }
    case "k0": {
      return resetErs(state);
    }
    case "k1": {
      return { ...state, ers: "k1" };
    }
    case "k2": {
      return latchErs(state, "k2");
    }
    case "minus": {
      return stepPlusMinus(state, -1);
    }
    case "neutral": {
      return shiftByHand(state, "neutral");
    }
    case "ok": {
      return state.multiMenu === null ? state : { ...state, multiMenu: null };
    }
    case "pit": {
      return toggleLimiter(state);
    }
    case "pitConfirm": {
      return withMessage(state, "PIT CONFIRMED", "info");
    }
    case "plus": {
      return stepPlusMinus(state, 1);
    }
    case "radio": {
      return { ...state, radio: true };
    }
    case "reverse": {
      return requestShift(state, "reverse");
    }
    case "rf": {
      return clearMessage(state);
    }
    default: {
      return state;
    }
  }
};

const release = (state: WheelState, button: WheelButton): WheelState => {
  if (button === "radio" && state.radio) {
    return { ...state, radio: false };
  }
  if (button === "k1" && state.ers === "k1") {
    return { ...state, ers: state.ersLatched };
  }
  return state;
};

const setThumbwheel = (
  state: WheelState,
  wheel: Thumbwheel,
  value: number
): WheelState => {
  const { max, min, wrap: wraps } = THUMBWHEEL_RANGES[wheel];
  const detent = wraps
    ? min + wrap(value - min, max - min + 1)
    : clamp(Math.round(value), min, max);
  const thumbwheels = { ...state.thumbwheels, [wheel]: detent };
  const shown = min < 0 ? signed(detent) : String(detent);
  return withPopup({ ...state, thumbwheels }, THUMBWHEEL_LABELS[wheel], shown);
};

const openMenu = (
  state: WheelState,
  rotary: "mfl" | "mfr",
  index: number
): WheelState => {
  const param = (rotary === "mfl" ? MFL_POSITIONS : MFR_POSITIONS)[index];
  const values: Record<string, number> = state.multi[rotary];
  return withPopup(
    {
      ...state,
      multiMenu: { param, rotary, until: state.now + MULTI_MENU_MS },
      rotaries: { ...state.rotaries, [rotary]: index },
    },
    param,
    String(values[param])
  );
};

/** `index` is the detent, 0..11 clockwise; numbered rotaries store it as 1..12. */
const setRotary = (
  state: WheelState,
  rotary: Rotary,
  index: number
): WheelState => {
  const detent = wrap(index, ROTARY_DETENTS);
  if (rotary === "mfl" || rotary === "mfr") {
    return openMenu(state, rotary, detent);
  }
  if (rotary === "mode") {
    return withPopup(
      { ...state, rotaries: { ...state.rotaries, mode: detent } },
      ROTARY_LABELS.mode,
      MODE_POSITIONS[detent]
    );
  }
  const value = detent + 1;
  return withPopup(
    { ...state, rotaries: { ...state.rotaries, [rotary]: value } },
    ROTARY_LABELS[rotary],
    String(value)
  );
};

const setDashSwitch = (state: WheelState, value: DashSwitch): WheelState => ({
  ...state,
  dashSwitch: value,
  page: value === "P" ? "race" : state.page,
});

/** In the garage time only lands shifts and expires pop-ups; on track it runs the car. */
const tick = (state: WheelState, now: number): WheelState => {
  if (now <= state.now) {
    return state;
  }
  if (state.session === "track") {
    return advance(state, now);
  }
  return completeShift(expireFeedback({ ...state, now }, now), now);
};

const setSession = (state: WheelState, session: Session): WheelState => {
  if (session === state.session) {
    return state;
  }
  return session === "track" ? toTrack(state) : toGarage(state);
};

export const reduce = (state: WheelState, action: WheelAction): WheelState => {
  switch (action.type) {
    case "dashSwitch": {
      return setDashSwitch(state, action.value);
    }
    case "paddle": {
      return shiftByHand(state, action.paddle === "upshift" ? "up" : "down");
    }
    case "press": {
      return press(state, action.button);
    }
    case "release": {
      return release(state, action.button);
    }
    case "gearControl": {
      return state.gearControl === action.value
        ? state
        : setGearControl(state, action.value);
    }
    case "session": {
      return setSession(state, action.session);
    }
    case "rotary": {
      return setRotary(state, action.rotary, action.index);
    }
    case "thumbwheel": {
      return setThumbwheel(state, action.wheel, action.value);
    }
    case "tick": {
      return tick(state, action.now);
    }
    default: {
      return state;
    }
  }
};

import type {
  Paddle,
  Rotary,
  Thumbwheel,
  WheelAction,
  WheelButton,
  WheelState,
} from "../model/types";
import { BODY_WIDTH, SPOTS } from "../wheel/layout";
import type { Voice } from "./voices";

/** Every part of the wheel that makes a sound, named as the model and the face name it. */
export type SoundControl =
  | WheelButton
  | Paddle
  | Rotary
  | Thumbwheel
  | "dashSwitch";

export interface ControlCue {
  voice: Voice;
  control: SoundControl;
  /** Seconds after now. */
  delay?: number;
  /** Heard in the earpieces, not from the part: centred. */
  inEar?: boolean;
}

const PAN_WIDTH = 0.4;
/** A latching button's latch seats just after its press. */
const LATCH_DELAY = 0.018;
/** A press dispatched with no finger or key on the part has no let-go to hear: its button comes back on its own. */
const RELEASE_DELAY = 0.09;
/** The radio keys up just after its button bottoms out. */
const RADIO_DELAY = 0.03;

const CONTROLS: ReadonlySet<string> = new Set<SoundControl>([
  "bbForward",
  "bbRearward",
  "chr",
  "dashSwitch",
  "downshift",
  "drs",
  "k0",
  "k1",
  "k2",
  "minus",
  "neutral",
  "ok",
  "pit",
  "pitConfirm",
  "plus",
  "radio",
  "reverse",
  "rf",
  "upshift",
]);

export const isSoundControl = (name: string): name is SoundControl =>
  CONTROLS.has(name);

/** Pans a part by where it sits across the wheel. */
export const panFor = (control: SoundControl): number => {
  const centre = SPOTS[control].x / BODY_WIDTH;
  return (centre * 2 - 1) * PAN_WIDTH;
};

/** What a part sounds like as a finger pushes it, and as it lets go. */
export const voiceFor = (
  control: SoundControl,
  phase: "press" | "release"
): Voice | null => {
  if (control === "bbForward" || control === "bbRearward") {
    return phase === "press" ? "pad" : null;
  }
  if (control === "drs" || control === "reverse") {
    return phase === "press" ? "lever" : null;
  }
  if (control === "upshift" || control === "downshift") {
    return phase === "press" ? "paddle" : null;
  }
  if (control === "dashSwitch") {
    return null;
  }
  return phase;
};

const HELD: ReadonlySet<WheelButton> = new Set(["k1", "radio"]);

const latched = (state: WheelState, button: WheelButton): boolean | null => {
  if (button === "pit") {
    return state.pitLimiter;
  }
  if (button === "chr" || button === "k2") {
    return state.ers === button || state.ersLatched === button;
  }
  return null;
};

const pressCues = (
  button: WheelButton,
  before: WheelState,
  after: WheelState,
  touched: boolean
): ControlCue[] => {
  const cues: ControlCue[] = [];
  const press = voiceFor(button, "press");
  if (!touched && press !== null) {
    cues.push({ control: button, voice: press });
    const release = voiceFor(button, "release");
    if (release !== null && !HELD.has(button)) {
      cues.push({ control: button, delay: RELEASE_DELAY, voice: release });
    }
  }
  if (button === "radio" && !before.radio && after.radio) {
    cues.push({
      control: button,
      delay: RADIO_DELAY,
      inEar: true,
      voice: "radio-on",
    });
  }
  const was = latched(before, button);
  const is = latched(after, button);
  if (was !== null && is !== null && was !== is) {
    cues.push({
      control: button,
      delay: LATCH_DELAY,
      voice: is ? "latch-on" : "latch-off",
    });
  }
  return cues;
};

const releaseCues = (
  button: WheelButton,
  before: WheelState,
  after: WheelState,
  touched: boolean
): ControlCue[] => {
  const cues: ControlCue[] = [];
  const voice = voiceFor(button, "release");
  if (!touched && voice !== null && before !== after) {
    cues.push({ control: button, voice });
  }
  if (button === "radio" && before.radio && !after.radio) {
    cues.push({
      control: button,
      delay: RADIO_DELAY,
      inEar: true,
      voice: "radio-off",
    });
  }
  return cues;
};

/**
 * The sounds one dispatched action makes, from the state before and after it.
 * `touched` says a finger is already on that part: its press was heard then.
 */
export const cuesFor = (
  action: WheelAction,
  before: WheelState,
  after: WheelState,
  touched: (control: SoundControl) => boolean
): ControlCue[] => {
  switch (action.type) {
    case "press": {
      return pressCues(action.button, before, after, touched(action.button));
    }
    case "release": {
      return releaseCues(action.button, before, after, touched(action.button));
    }
    case "paddle": {
      return touched(action.paddle)
        ? []
        : [{ control: action.paddle, voice: "paddle" }];
    }
    case "rotary": {
      return before.rotaries[action.rotary] === after.rotaries[action.rotary]
        ? []
        : [
            {
              control: action.rotary,
              voice: action.rotary === "mode" ? "detent-heavy" : "detent",
            },
          ];
    }
    case "thumbwheel": {
      return before.thumbwheels[action.wheel] ===
        after.thumbwheels[action.wheel]
        ? []
        : [{ control: action.wheel, voice: "ratchet" }];
    }
    case "dashSwitch": {
      return before.dashSwitch === after.dashSwitch
        ? []
        : [{ control: "dashSwitch", voice: "toggle" }];
    }
    default: {
      return [];
    }
  }
};

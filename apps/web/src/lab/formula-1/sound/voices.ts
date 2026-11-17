import { RADIO_OFF, RADIO_ON, renderRadio } from "./radio";
import { renderClick } from "./synth";
import type { ClickSpec } from "./synth";

/**
 * The physical sounds of the wheel's parts, each a contact transient over the
 * short-lived resonances of a hard part; only the radio's chirps are tonal.
 */
export type Voice =
  /** A sealed short-travel push button going down */
  | "press"
  /** The same button coming back up, softer */
  | "release"
  /** A latching button seating, or letting go */
  | "latch-on"
  | "latch-off"
  /** A rubber brake-balance pad on the grip */
  | "pad"
  /** A rotary detent */
  | "detent"
  /** The large centre MODE rotary's detent */
  | "detent-heavy"
  /** A thumbwheel tick */
  | "ratchet"
  /** The shift rocker hitting its stop */
  | "paddle"
  /** The DRS stalk or the R lever */
  | "lever"
  /** The P/S metal toggle */
  | "toggle"
  /** The team radio's channel opening, and closing, in the earpieces */
  | "radio-on"
  | "radio-off";

export interface VoiceSpec {
  /** Renders one take of the voice, peaking at 1. */
  render: (context: BaseAudioContext) => AudioBuffer;
  level: number;
  /** Repeats closer than this are dropped, in seconds. */
  minGap: number;
}

const CLICK = 0.035;

const click =
  (spec: ClickSpec): VoiceSpec["render"] =>
  (context) =>
    renderClick(context, spec);

const PRESS: ClickSpec = {
  bottomOut: { delay: 1.1, scale: 0.35 },
  contact: 0.32,
  lowpass: 8000,
  modes: [
    { amplitude: 0.08, frequency: 420, tau: 2 },
    { amplitude: 0.5, frequency: 1900, tau: 1.6 },
    { amplitude: 0.65, frequency: 3400, tau: 1 },
    { amplitude: 0.25, frequency: 5200, tau: 0.6 },
  ],
  seconds: CLICK,
};

const RELEASE: ClickSpec = {
  contact: 0.16,
  lowpass: 7000,
  modes: [
    { amplitude: 0.1, frequency: 600, tau: 2 },
    { amplitude: 0.45, frequency: 2200, tau: 1.2 },
    { amplitude: 0.5, frequency: 3900, tau: 0.7 },
  ],
  seconds: 0.025,
};

const LATCH_ON: ClickSpec = {
  contact: 0.2,
  lowpass: 8000,
  modes: [
    { amplitude: 0.55, frequency: 2800, tau: 0.9 },
    { amplitude: 0.35, frequency: 4600, tau: 0.5 },
  ],
  seconds: 0.02,
};

const LATCH_OFF: ClickSpec = {
  ...LATCH_ON,
  modes: LATCH_ON.modes.map((mode) => ({
    ...mode,
    frequency: mode.frequency * 0.88,
  })),
};

const PAD: ClickSpec = {
  contact: 0.08,
  lowpass: 3000,
  modes: [
    { amplitude: 0.5, frequency: 180, tau: 5 },
    { amplitude: 0.45, frequency: 520, tau: 2.5 },
    { amplitude: 0.25, frequency: 1300, tau: 1.2 },
  ],
  seconds: CLICK,
};

const DETENT: ClickSpec = {
  bottomOut: { delay: 2.2, scale: 0.45 },
  contact: 0.3,
  lowpass: 8000,
  modes: [
    { amplitude: 0.22, frequency: 260, tau: 4 },
    { amplitude: 0.5, frequency: 900, tau: 2.6 },
    { amplitude: 0.6, frequency: 2100, tau: 1.6 },
    { amplitude: 0.4, frequency: 3600, tau: 1 },
    { amplitude: 0.12, frequency: 5400, tau: 0.5 },
  ],
  seconds: CLICK,
};

const DETENT_HEAVY: ClickSpec = {
  bottomOut: { delay: 2.8, scale: 0.5 },
  contact: 0.3,
  lowpass: 6500,
  modes: [
    { amplitude: 0.35, frequency: 170, tau: 6 },
    { amplitude: 0.55, frequency: 650, tau: 3.2 },
    { amplitude: 0.55, frequency: 1500, tau: 2 },
    { amplitude: 0.35, frequency: 2700, tau: 1.2 },
    { amplitude: 0.12, frequency: 4300, tau: 0.6 },
  ],
  seconds: 0.045,
};

const RATCHET: ClickSpec = {
  contact: 0.25,
  lowpass: 9000,
  modes: [
    { amplitude: 0.15, frequency: 1100, tau: 1 },
    { amplitude: 0.55, frequency: 2600, tau: 0.8 },
    { amplitude: 0.45, frequency: 4200, tau: 0.5 },
    { amplitude: 0.15, frequency: 6800, tau: 0.3 },
  ],
  seconds: 0.015,
};

const PADDLE: ClickSpec = {
  bottomOut: { delay: 4, scale: 0.6 },
  contact: 0.35,
  lowpass: 6000,
  modes: [
    { amplitude: 0.4, frequency: 140, tau: 5 },
    { amplitude: 0.55, frequency: 420, tau: 4 },
    { amplitude: 0.5, frequency: 980, tau: 2.4 },
    { amplitude: 0.35, frequency: 2300, tau: 1.2 },
    { amplitude: 0.12, frequency: 4100, tau: 0.6 },
  ],
  seconds: 0.05,
};

const LEVER: ClickSpec = {
  bottomOut: { delay: 3, scale: 0.5 },
  contact: 0.3,
  lowpass: 7000,
  modes: [
    { amplitude: 0.35, frequency: 220, tau: 5 },
    { amplitude: 0.5, frequency: 760, tau: 3 },
    { amplitude: 0.45, frequency: 1900, tau: 1.6 },
    { amplitude: 0.2, frequency: 3800, tau: 0.8 },
  ],
  seconds: 0.04,
};

const TOGGLE: ClickSpec = {
  bottomOut: { delay: 1.2, scale: 0.5 },
  contact: 0.4,
  lowpass: 9500,
  modes: [
    { amplitude: 0.35, frequency: 1300, tau: 2 },
    { amplitude: 0.6, frequency: 3100, tau: 1.5 },
    { amplitude: 0.45, frequency: 5600, tau: 1 },
    { amplitude: 0.2, frequency: 8200, tau: 0.5 },
  ],
  seconds: CLICK,
};

export const VOICES: Record<Voice, VoiceSpec> = {
  detent: { level: 0.12, minGap: 0.028, render: click(DETENT) },
  "detent-heavy": { level: 0.15, minGap: 0.03, render: click(DETENT_HEAVY) },
  lever: { level: 0.12, minGap: 0.04, render: click(LEVER) },
  "latch-off": { level: 0.06, minGap: 0.03, render: click(LATCH_OFF) },
  "latch-on": { level: 0.06, minGap: 0.03, render: click(LATCH_ON) },
  pad: { level: 0.12, minGap: 0.04, render: click(PAD) },
  paddle: { level: 0.17, minGap: 0.04, render: click(PADDLE) },
  press: { level: 0.14, minGap: 0.028, render: click(PRESS) },
  "radio-off": {
    level: 0.4,
    minGap: 0.1,
    render: (context) => renderRadio(context, RADIO_OFF),
  },
  "radio-on": {
    level: 0.5,
    minGap: 0.1,
    render: (context) => renderRadio(context, RADIO_ON),
  },
  ratchet: { level: 0.06, minGap: 0.018, render: click(RATCHET) },
  release: { level: 0.05, minGap: 0.028, render: click(RELEASE) },
  toggle: { level: 0.1, minGap: 0.04, render: click(TOGGLE) },
};

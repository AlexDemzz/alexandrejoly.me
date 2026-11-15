"use client";

import * as React from "react";

type FormulaSoundName =
  | "press"
  | "release"
  | "detent"
  | "step"
  | "tick"
  | "blip"
  | "band";

interface Cue {
  at: number;
  pan: number;
  /** Where a knob or ruler sits in its range, 0 to 1. */
  position: number;
  /** The state a toggle lands on, when known. */
  on: boolean | null;
  pitch: number;
  level: number;
}

interface Mode {
  frequency: number;
  /** Time for the mode to fall to 1/e, in milliseconds. */
  tau: number;
  amplitude: number;
}

interface ClickSpec {
  modes: readonly Mode[];
  /** Level of the contact transient that starts the click. */
  contact: number;
  /** A second, weaker contact when the stem bottoms out, in milliseconds. */
  bottomOut?: { delay: number; scale: number };
  lowpass: number;
}

// Keys, toggles and bands are physical clicks: a contact transient exciting
// the damped resonances of a switch housing, rendered once into buffers.
const PRESS: ClickSpec = {
  bottomOut: { delay: 1.6, scale: 0.4 },
  contact: 0.3,
  lowpass: 7500,
  modes: [
    { amplitude: 0.28, frequency: 240, tau: 4.5 },
    { amplitude: 0.45, frequency: 1050, tau: 2.2 },
    { amplitude: 0.7, frequency: 2350, tau: 1.4 },
    { amplitude: 0.3, frequency: 3900, tau: 0.9 },
    { amplitude: 0.1, frequency: 6100, tau: 0.5 },
  ],
};

const RELEASE: ClickSpec = {
  contact: 0.25,
  lowpass: 7500,
  modes: [
    { amplitude: 0.1, frequency: 280, tau: 3 },
    { amplitude: 0.4, frequency: 1200, tau: 1.8 },
    { amplitude: 0.7, frequency: 2700, tau: 1.1 },
    { amplitude: 0.25, frequency: 4500, tau: 0.7 },
  ],
};

const LATCH_ON: ClickSpec = {
  contact: 0.28,
  lowpass: 7500,
  modes: [
    { amplitude: 0.5, frequency: 1400, tau: 1.6 },
    { amplitude: 0.7, frequency: 3050, tau: 1 },
    { amplitude: 0.18, frequency: 5000, tau: 0.6 },
  ],
};

const LATCH_OFF: ClickSpec = {
  ...LATCH_ON,
  modes: LATCH_ON.modes.map((mode) => ({
    ...mode,
    frequency: mode.frequency * 0.86,
  })),
};

const STEP: ClickSpec = {
  contact: 0.22,
  lowpass: 7000,
  modes: [
    { amplitude: 0.45, frequency: 1600, tau: 1.2 },
    { amplitude: 0.6, frequency: 3400, tau: 0.7 },
  ],
};

const SOFT: ClickSpec = {
  contact: 0.12,
  lowpass: 4000,
  modes: [
    { amplitude: 0.45, frequency: 190, tau: 6 },
    { amplitude: 0.55, frequency: 700, tau: 2.6 },
    { amplitude: 0.45, frequency: 1500, tau: 1.6 },
    { amplitude: 0.2, frequency: 2600, tau: 1 },
  ],
};

const CLICKS: Partial<
  Record<FormulaSoundName, { spec: ClickSpec; level: number }>
> = {
  band: { level: 0.09, spec: SOFT },
  press: { level: 0.14, spec: PRESS },
  release: { level: 0.06, spec: RELEASE },
  step: { level: 0.07, spec: STEP },
};
const LATCH_LEVEL = 0.1;
// The press carries the key; the latch is the toggle seating after it.
const LATCH_DELAY = 0.018;

const TAKES = 6;
const CLICK_SECONDS = 0.03;
const CONTACT_SECONDS = 0.0003;
const FADE_IN_SECONDS = 0.00008;
const TAKE_DETUNE = 0.04;
const TAKE_SPREAD = 0.15;
const TAKE_TIMING = 0.0003;

const NOISE_SECONDS = 0.5;
const ROOM_SECONDS = 0.3;
const ROOM_SEND = 0.03;
const LOWPASS = 12_000;
const SILENCE = 0.0001;
const JITTER = 0.02;
const MIN_GAP = 0.028;
const DUCK_WINDOW = 0.07;
const DUCK_LEVEL = 0.55;
const PAN_WIDTH = 0.4;
const GESTURE_WINDOW = 1200;

const PRESSABLE = [
  '[data-formula="machined"]:is([data-slot="button"], [data-slot="toggle"], [data-slot="checkbox"], [data-slot="switch"])',
  '[data-formula="machined"] :is([data-slot="number-input-increment"], [data-slot="number-input-decrement"])',
].join(", ");
const KEY = '[data-formula="machined"][data-slot="button"]';
const WATCHED = [
  "aria-checked",
  "aria-pressed",
  "aria-selected",
  "aria-expanded",
  "aria-valuenow",
  "aria-valuetext",
  "value",
];
const VALUE_ATTRIBUTES = new Set(["aria-valuenow", "aria-valuetext", "value"]);

let context: AudioContext | null = null;
let input: GainNode | null = null;
let master: GainNode | null = null;
let pink: AudioBuffer | null = null;
let white: AudioBuffer | null = null;
let muted = false;
let volume = 0.5;
let installs = 0;
let lastGesture = 0;
let lastTake = -1;
let observer: MutationObserver | null = null;
const lastPlayed = new Map<FormulaSoundName, number>();
const takes = new Map<ClickSpec, AudioBuffer[]>();

function spread(amount: number) {
  return 1 + (Math.random() * 2 - 1) * amount;
}

function noiseBuffer(output: AudioContext, filtered: boolean) {
  const buffer = output.createBuffer(
    1,
    Math.floor(output.sampleRate * NOISE_SECONDS),
    output.sampleRate
  );
  const samples = buffer.getChannelData(0);
  // Paul Kellet's economy filter turns white noise pink: no fizz at the top.
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const noise = Math.random() * 2 - 1;
    if (filtered) {
      b0 = 0.997_65 * b0 + noise * 0.099_046;
      b1 = 0.963 * b1 + noise * 0.296_516_4;
      b2 = 0.57 * b2 + noise * 1.052_691_3;
      samples[index] = (b0 + b1 + b2 + noise * 0.1848) * 0.2;
    } else {
      samples[index] = noise;
    }
  }
  return buffer;
}

function roomBuffer(output: AudioContext) {
  const length = Math.floor(output.sampleRate * ROOM_SECONDS);
  const buffer = output.createBuffer(2, length, output.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const samples = buffer.getChannelData(channel);
    let smooth = 0;
    for (let index = 0; index < length; index += 1) {
      smooth += 0.35 * (Math.random() * 2 - 1 - smooth);
      samples[index] = smooth * (1 - index / length) ** 3;
    }
  }
  return buffer;
}

function excite(
  samples: Float32Array,
  rate: number,
  spec: ClickSpec,
  start: number,
  scale: number
) {
  const offset = Math.floor(start * rate);
  const contactLength = Math.floor(CONTACT_SECONDS * rate);
  const modes = spec.modes.map((mode) => ({
    amplitude: mode.amplitude * spread(TAKE_SPREAD) * scale,
    omega: 2 * Math.PI * mode.frequency * spread(TAKE_DETUNE),
    phase: Math.random() * Math.PI * 2,
    tau: (mode.tau / 1000) * spread(TAKE_SPREAD),
  }));
  let previous = 0;

  for (let index = offset; index < samples.length; index += 1) {
    const time = (index - offset) / rate;
    let value = 0;
    for (const mode of modes) {
      value +=
        mode.amplitude *
        Math.exp(-time / mode.tau) *
        Math.sin(mode.omega * time + mode.phase);
    }
    if (index - offset < contactLength) {
      // Differentiated noise: the contact is all edge and no low end.
      const noise = Math.random() * 2 - 1;
      value +=
        spec.contact *
        scale *
        (noise - previous) *
        0.5 *
        Math.exp(-time / (CONTACT_SECONDS / 3));
      previous = noise;
    }
    samples[index] += value;
  }
}

function renderClick(output: AudioContext, spec: ClickSpec) {
  const rate = output.sampleRate;
  const buffer = output.createBuffer(1, Math.floor(CLICK_SECONDS * rate), rate);
  const samples = buffer.getChannelData(0);

  excite(samples, rate, spec, 0, 1);
  if (spec.bottomOut) {
    const jitter = (Math.random() * 2 - 1) * TAKE_TIMING;
    excite(
      samples,
      rate,
      spec,
      spec.bottomOut.delay / 1000 + jitter,
      spec.bottomOut.scale
    );
  }

  const smoothing = 1 - Math.exp((-2 * Math.PI * spec.lowpass) / rate);
  const fadeIn = FADE_IN_SECONDS * rate;
  const fadeOut = samples.length * 0.3;
  let filtered = 0;
  let peak = 0;
  for (let index = 0; index < samples.length; index += 1) {
    filtered += smoothing * (samples[index] - filtered);
    const edge =
      Math.min(1, index / fadeIn) *
      Math.min(1, (samples.length - index) / fadeOut);
    samples[index] = filtered * edge;
    peak = Math.max(peak, Math.abs(samples[index]));
  }
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] /= peak || 1;
  }
  return buffer;
}

function audio() {
  if (typeof window === "undefined" || !("AudioContext" in window)) {
    return null;
  }

  if (!context) {
    context = new AudioContext({ latencyHint: "interactive" });
    input = context.createGain();
    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = LOWPASS;
    lowpass.Q.value = 0.5;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.ratio.value = 3;
    compressor.knee.value = 12;
    compressor.attack.value = 0.002;
    compressor.release.value = 0.12;
    const send = context.createGain();
    send.gain.value = ROOM_SEND;
    const room = context.createConvolver();
    room.buffer = roomBuffer(context);
    master = context.createGain();
    master.gain.value = volume;

    input.connect(lowpass).connect(compressor).connect(master);
    input.connect(send).connect(room).connect(lowpass);
    master.connect(context.destination);

    pink = noiseBuffer(context, true);
    white = noiseBuffer(context, false);
  }

  if (context.state !== "running") {
    void context.resume();
  }

  return context;
}

function voiceOut(output: AudioContext, cue: Cue) {
  const panner = output.createStereoPanner();
  panner.pan.value = cue.pan;
  if (input) {
    panner.connect(input);
  }
  return panner;
}

function shape(
  gain: GainNode,
  at: number,
  level: number,
  attack: number,
  decay: number
) {
  gain.gain.setValueAtTime(SILENCE, at);
  gain.gain.linearRampToValueAtTime(level, at + attack);
  gain.gain.exponentialRampToValueAtTime(SILENCE, at + attack + decay);
}

function click(
  output: AudioContext,
  cue: Cue,
  spec: ClickSpec,
  level: number,
  delay = 0
) {
  let set = takes.get(spec);
  if (!set) {
    set = Array.from({ length: TAKES }, () => renderClick(output, spec));
    takes.set(spec, set);
  }
  // Never the same take twice in a row, like a real switch.
  let take = Math.floor(Math.random() * set.length);
  if (take === lastTake) {
    take = (take + 1) % set.length;
  }
  lastTake = take;

  const source = output.createBufferSource();
  const gain = output.createGain();
  source.buffer = set[take];
  source.playbackRate.value = cue.pitch;
  gain.gain.value = level * cue.level;
  source.connect(gain).connect(voiceOut(output, cue));
  source.start(cue.at + delay);
}

function noise(
  output: AudioContext,
  cue: Cue,
  buffer: AudioBuffer,
  voice: {
    filter: BiquadFilterType;
    frequency: number;
    q: number;
    level: number;
    decay: number;
  }
) {
  const attack = 0.0008;
  const source = output.createBufferSource();
  const filter = output.createBiquadFilter();
  const gain = output.createGain();

  source.buffer = buffer;
  filter.type = voice.filter;
  filter.frequency.value = voice.frequency * cue.pitch;
  filter.Q.value = voice.q;
  shape(gain, cue.at, voice.level * cue.level, attack, voice.decay);
  source.connect(filter).connect(gain).connect(voiceOut(output, cue));
  source.start(cue.at, Math.random() * (NOISE_SECONDS - voice.decay - 0.05));
  source.stop(cue.at + attack + voice.decay + 0.02);
}

function tone(
  output: AudioContext,
  cue: Cue,
  voice: { frequency: number; level: number; attack: number; decay: number }
) {
  const end = cue.at + voice.attack + voice.decay;
  const oscillator = output.createOscillator();
  const gain = output.createGain();

  oscillator.frequency.value = voice.frequency * cue.pitch;
  shape(gain, cue.at, voice.level * cue.level, voice.attack, voice.decay);
  oscillator.connect(gain).connect(voiceOut(output, cue));
  oscillator.start(cue.at);
  oscillator.stop(end + 0.02);
}

// A knob detent: a tight click over the brief ring of a machined part,
// rising slightly as the knob turns up.
function knobTick(output: AudioContext, cue: Cue) {
  if (!pink) {
    return;
  }
  const level = 1.3;
  noise(output, cue, pink, {
    decay: 0.0035,
    filter: "bandpass",
    frequency: 2800 * (1 + 0.8 * cue.position),
    level: 0.3 * level,
    q: 2.2,
  });
  const ring = 2160 * (1 + 0.25 * cue.position);
  for (const [index, ratio] of [1, 2.32].entries()) {
    tone(output, cue, {
      attack: 0.0015,
      decay: 0.012_25 / (1 + index * 0.9),
      frequency: ring * ratio,
      level: (0.033_75 * level) / (1 + index * 1.4),
    });
  }
}

// A ruler step on black glass: an airy tick with a faint glint of pitch.
function rulerBlip(output: AudioContext, cue: Cue) {
  if (!white) {
    return;
  }
  const level = 1.25;
  noise(output, cue, white, {
    decay: 0.003,
    filter: "highpass",
    frequency: 6500,
    level: 0.14 * level,
    q: 0.7,
  });
  tone(output, cue, {
    attack: 0.001,
    decay: 0.008,
    frequency: 3600 + 1200 * cue.position,
    level: 0.014 * level,
  });
}

function panFor(element: Element | null) {
  if (!element) {
    return 0;
  }
  const box = element.getBoundingClientRect();
  const centre = (box.left + box.width / 2) / window.innerWidth;
  return Math.max(-1, Math.min(1, (centre * 2 - 1) * PAN_WIDTH));
}

function positionFor(element: Element | null) {
  if (!element) {
    return 0.5;
  }
  const range = element instanceof HTMLInputElement ? element : null;
  const read = (attribute: string, fallback: string | undefined) => {
    const parsed = Number.parseFloat(
      element.getAttribute(attribute) ?? fallback ?? ""
    );
    return Number.isFinite(parsed) ? parsed : null;
  };
  const now = read("aria-valuenow", range?.value);
  const min = read("aria-valuemin", range?.min) ?? 0;
  const max = read("aria-valuemax", range?.max) ?? 100;
  if (now === null || max === min) {
    return 0.5;
  }
  return Math.max(0, Math.min(1, (now - min) / (max - min)));
}

function onFor(element: Element | null, attribute: string | null) {
  const state = attribute ? element?.getAttribute(attribute) : null;
  if (state === "true") {
    return true;
  }
  return state === "false" ? false : null;
}

function play(
  name: FormulaSoundName,
  element: Element | null = null,
  attribute: string | null = null
) {
  if (muted) {
    return;
  }

  const output = audio();
  if (!output) {
    return;
  }

  const at = output.currentTime;
  const previous = lastPlayed.get(name) ?? -1;
  if (at - previous < MIN_GAP) {
    return;
  }
  lastPlayed.set(name, at);

  const fast = at - previous < DUCK_WINDOW;
  const cue: Cue = {
    at,
    level: spread(JITTER * 2) * (fast ? DUCK_LEVEL : 1),
    on: onFor(element, attribute),
    pan: panFor(element),
    pitch: spread(JITTER),
    position: positionFor(element),
  };

  if (name === "tick") {
    knobTick(output, cue);
  } else if (name === "blip") {
    rulerBlip(output, cue);
  } else if (name === "detent") {
    const spec = cue.on === false ? LATCH_OFF : LATCH_ON;
    click(output, cue, spec, LATCH_LEVEL, LATCH_DELAY);
  } else {
    const voice = CLICKS[name];
    if (voice) {
      click(output, cue, voice.spec, voice.level);
    }
  }
}

function playFormulaSound(name: FormulaSoundName) {
  play(name);
}

function enabled(element: Element | null): element is Element {
  return (
    element !== null &&
    !element.hasAttribute("data-disabled") &&
    element.getAttribute("aria-disabled") !== "true"
  );
}

function soundFor(
  element: Element,
  attribute: string
): FormulaSoundName | null {
  const register = element
    .closest("[data-formula]")
    ?.getAttribute("data-formula");
  if (!register) {
    return null;
  }

  const role =
    element.getAttribute("role") ??
    (element instanceof HTMLInputElement && element.type === "range"
      ? "slider"
      : null);
  const state = element.getAttribute(attribute);

  if (VALUE_ATTRIBUTES.has(attribute)) {
    if (role !== "slider" && role !== "spinbutton") {
      return null;
    }
    if (register === "readout") {
      return "blip";
    }
    return role === "spinbutton" ? "step" : "tick";
  }

  if (attribute === "aria-checked" && role === "radio" && state !== "true") {
    return null;
  }
  if (attribute === "aria-selected" && state !== "true") {
    return null;
  }

  return register === "machined" ? "detent" : "band";
}

function installFormulaSound() {
  if (typeof document === "undefined") {
    return () => {};
  }

  installs += 1;
  if (installs > 1) {
    return uninstallFormulaSound;
  }

  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("pointerup", onPointerUp, true);
  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("keydown", onKeyDown, true);
  observer = new MutationObserver(onMutations);
  observer.observe(document.body, {
    attributeFilter: WATCHED,
    attributes: true,
    subtree: true,
  });

  return uninstallFormulaSound;
}

function uninstallFormulaSound() {
  installs = Math.max(0, installs - 1);
  if (installs > 0) {
    return;
  }

  document.removeEventListener("pointerdown", onPointerDown, true);
  document.removeEventListener("pointerup", onPointerUp, true);
  document.removeEventListener("pointermove", onPointerMove, true);
  document.removeEventListener("keydown", onKeyDown, true);
  observer?.disconnect();
  observer = null;
}

function target(event: Event, selector: string) {
  return event.target instanceof Element
    ? event.target.closest(selector)
    : null;
}

function onPointerDown(event: PointerEvent) {
  lastGesture = performance.now();
  if (!muted) {
    audio();
  }

  const element = target(event, PRESSABLE);
  if (enabled(element)) {
    play("press", element);
  }
}

function onPointerUp(event: PointerEvent) {
  lastGesture = performance.now();

  const element = target(event, KEY);
  if (enabled(element)) {
    play("release", element);
  }
}

function onPointerMove(event: PointerEvent) {
  if (event.buttons > 0) {
    lastGesture = performance.now();
  }
}

function onKeyDown(event: KeyboardEvent) {
  lastGesture = performance.now();

  const element = target(event, PRESSABLE);
  if (
    !event.repeat &&
    (event.key === " " || event.key === "Enter") &&
    enabled(element)
  ) {
    play("press", element);
  }
}

function onMutations(records: MutationRecord[]) {
  if (muted || performance.now() - lastGesture > GESTURE_WINDOW) {
    return;
  }

  for (const record of records) {
    if (record.target instanceof Element && record.attributeName) {
      const name = soundFor(record.target, record.attributeName);
      if (name) {
        play(name, record.target, record.attributeName);
      }
    }
  }
}

function FormulaSound({
  muted: isMuted = false,
  volume: level = 0.5,
}: {
  muted?: boolean;
  volume?: number;
}) {
  React.useEffect(installFormulaSound, []);

  React.useEffect(() => {
    muted = isMuted;
    volume = level;
    if (master) {
      master.gain.value = level;
    }
  }, [isMuted, level]);

  return null;
}

export { FormulaSound, playFormulaSound };
export type { FormulaSoundName };

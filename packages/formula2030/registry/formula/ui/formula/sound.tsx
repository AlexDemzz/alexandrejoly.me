"use client";

import * as React from "react";

type FormulaSoundName =
  | "press"
  | "release"
  | "detent"
  | "tick"
  | "blip"
  | "band";

interface NoiseVoice {
  type: BiquadFilterType;
  frequency: number;
  q: number;
  level: number;
  decay: number;
}

interface ToneVoice {
  type: OscillatorType;
  from: number;
  to: number;
  level: number;
  decay: number;
}

const VOICES: Record<
  FormulaSoundName,
  { noise?: NoiseVoice; tone?: ToneVoice }
> = {
  press: {
    noise: {
      type: "bandpass",
      frequency: 2400,
      q: 0.9,
      level: 0.28,
      decay: 0.022,
    },
    tone: { type: "sine", from: 190, to: 120, level: 0.34, decay: 0.05 },
  },
  release: {
    noise: {
      type: "highpass",
      frequency: 3600,
      q: 0.8,
      level: 0.12,
      decay: 0.012,
    },
  },
  detent: {
    noise: {
      type: "bandpass",
      frequency: 1700,
      q: 1.4,
      level: 0.34,
      decay: 0.02,
    },
    tone: { type: "sine", from: 150, to: 92, level: 0.42, decay: 0.07 },
  },
  tick: {
    noise: {
      type: "highpass",
      frequency: 3000,
      q: 0.7,
      level: 0.16,
      decay: 0.007,
    },
  },
  blip: {
    tone: { type: "square", from: 2300, to: 2300, level: 0.028, decay: 0.035 },
  },
  band: {
    noise: {
      type: "lowpass",
      frequency: 520,
      q: 0.6,
      level: 0.22,
      decay: 0.05,
    },
    tone: { type: "sine", from: 230, to: 176, level: 0.26, decay: 0.09 },
  },
};

const NOISE_SECONDS = 0.5;
const ATTACK = 0.0008;
const SILENCE = 0.0001;
const JITTER = 0.06;
const MIN_GAP = 0.028;
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
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let muted = false;
let volume = 0.5;
let installs = 0;
let lastGesture = 0;
const lastPlayed = new Map<FormulaSoundName, number>();

function audio() {
  if (typeof window === "undefined" || !("AudioContext" in window)) {
    return null;
  }

  if (!context) {
    context = new AudioContext({ latencyHint: "interactive" });
    master = context.createGain();
    master.gain.value = volume;
    master.connect(context.destination);

    noise = context.createBuffer(
      1,
      Math.floor(context.sampleRate * NOISE_SECONDS),
      context.sampleRate
    );
    const samples = noise.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = Math.random() * 2 - 1;
    }
  }

  if (context.state !== "running") {
    void context.resume();
  }

  return context;
}

function envelope(gain: GainNode, at: number, level: number, decay: number) {
  gain.gain.setValueAtTime(SILENCE, at);
  gain.gain.linearRampToValueAtTime(level, at + ATTACK);
  gain.gain.exponentialRampToValueAtTime(SILENCE, at + ATTACK + decay);
}

function vary(amount: number) {
  return 1 + (Math.random() * 2 - 1) * amount;
}

function playFormulaSound(name: FormulaSoundName) {
  if (muted) {
    return;
  }

  const output = audio();
  if (!(output && master && noise)) {
    return;
  }

  const at = output.currentTime;
  if (at - (lastPlayed.get(name) ?? -1) < MIN_GAP) {
    return;
  }
  lastPlayed.set(name, at);

  const voice = VOICES[name];
  const pitch = vary(JITTER);
  const loudness = vary(JITTER * 2);

  if (voice.noise) {
    const source = output.createBufferSource();
    const filter = output.createBiquadFilter();
    const gain = output.createGain();
    const end = at + ATTACK + voice.noise.decay;

    source.buffer = noise;
    filter.type = voice.noise.type;
    filter.frequency.value = voice.noise.frequency * pitch;
    filter.Q.value = voice.noise.q;
    envelope(gain, at, voice.noise.level * loudness, voice.noise.decay);
    source.connect(filter).connect(gain).connect(master);
    source.start(
      at,
      Math.random() * (NOISE_SECONDS - voice.noise.decay - 0.05)
    );
    source.stop(end + 0.02);
  }

  if (voice.tone) {
    const oscillator = output.createOscillator();
    const gain = output.createGain();
    const end = at + ATTACK + voice.tone.decay;

    oscillator.type = voice.tone.type;
    oscillator.frequency.setValueAtTime(voice.tone.from * pitch, at);
    oscillator.frequency.exponentialRampToValueAtTime(
      voice.tone.to * pitch,
      end
    );
    envelope(gain, at, voice.tone.level * loudness, voice.tone.decay);
    oscillator.connect(gain).connect(master);
    oscillator.start(at);
    oscillator.stop(end + 0.02);
  }
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
    return register === "readout" ? "blip" : "tick";
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

let observer: MutationObserver | null = null;

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

  if (enabled(target(event, PRESSABLE))) {
    playFormulaSound("press");
  }
}

function onPointerUp(event: PointerEvent) {
  lastGesture = performance.now();

  if (enabled(target(event, KEY))) {
    playFormulaSound("release");
  }
}

function onPointerMove(event: PointerEvent) {
  if (event.buttons > 0) {
    lastGesture = performance.now();
  }
}

function onKeyDown(event: KeyboardEvent) {
  lastGesture = performance.now();

  if (
    !event.repeat &&
    (event.key === " " || event.key === "Enter") &&
    enabled(target(event, PRESSABLE))
  ) {
    playFormulaSound("press");
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
        playFormulaSound(name);
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

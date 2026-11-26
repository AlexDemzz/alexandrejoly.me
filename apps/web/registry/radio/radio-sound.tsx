"use client";

import { createContext, use, useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { useRadioEvents } from "./radio";
import type { RadioEvent, RadioEvents, RadioState } from "./radio-events";
import { createRadioProgramme } from "./radio-programme";
import type { RadioProgramme } from "./radio-programme";
import type { RadioGraph, RadioSamples } from "./radio-sound-engine";

const LEAD = 0.005;
const HITS = new Set<RadioEvent["type"]>(["key-bottom", "key-stop", "latch"]);
const LEVELS = new Set<RadioEvent["type"]>([
  "band",
  "stations",
  "tuning",
  "volume",
]);
const RECEIVED = 0.03;
const LOST = 0.1;
const VOLUME_TAPER = 1.2;
const LATE_MS = 400;
const WAKE_EVENTS = [
  "pointerdown",
  "pointerup",
  "keydown",
  "touchend",
] as const;

interface Player {
  band: number | null;
  graph: RadioGraph | null;
  loading: boolean;
  missed: { at: number; event: RadioEvent }[];
  muted: boolean;
  programme: RadioProgramme;
  state: () => RadioState;
  unsubscribe: () => void;
}

const page = {
  abort: new AbortController(),
  context: null as AudioContext | null,
  players: new Set<Player>(),
  samples: null as Promise<RadioSamples> | null,
};

const isOn = (player: Player) => !player.muted && !document.hidden;

const anyOn = () => [...page.players].some(isOn);

const suspend = () => {
  if (page.context?.state === "running") {
    void page.context.suspend();
  }
};

const smooth = (value: number) => {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
};

const received = ({ band, stations, tuning }: RadioState) => {
  const station = band === null ? undefined : stations[band];
  if (!station?.src) {
    return { signal: 0, src: null };
  }
  const away = Math.abs(tuning - station.position);
  return {
    signal: 1 - smooth((away - RECEIVED) / (LOST - RECEIVED)),
    src: station.src,
  };
};

const speak = (player: Player, warm = false) => {
  const { context } = page;
  if (context === null) {
    return;
  }
  const on = isOn(player);
  const state = player.state();
  const { signal, src } = received(state);
  const band = on ? state.band : null;
  player.graph?.setRadio(
    on ? { band, signal, volume: state.volume } : null,
    context.currentTime + LEAD,
    warm
  );
  const cold = band !== null && player.band === null && !warm;
  player.band = band;
  player.programme.set(
    band === null ? null : src,
    signal * state.volume ** VOLUME_TAPER,
    cold
  );
};

const runSpeakers = () => {
  for (const player of page.players) {
    speak(player, true);
  }
};

const prepare = async (player: Player, context: AudioContext) => {
  player.loading = true;
  try {
    const { createRadioGraph, loadRadioSamples } =
      await import("./radio-sound-engine");
    page.samples ??= loadRadioSamples(context, page.abort.signal);
    const samples = await page.samples;
    if (!page.players.has(player) || page.context !== context) {
      return;
    }
    const graph = createRadioGraph(context, samples);
    player.graph = graph;
    speak(player, true);
    const now = performance.now();
    for (const { at, event } of player.missed) {
      if (isOn(player) && now - at < LATE_MS) {
        graph.hear(event, context.currentTime + LEAD);
      }
    }
  } catch (error) {
    page.samples = null;
    if (!page.abort.signal.aborted) {
      reportError(error);
    }
  } finally {
    player.loading = false;
    player.missed = [];
  }
};

const wake = () => {
  if (!anyOn()) {
    return;
  }
  if (page.context === null && typeof AudioContext !== "undefined") {
    page.context = new AudioContext({ latencyHint: "interactive" });
  }
  const { context } = page;
  if (context === null) {
    return;
  }
  if (context.state !== "running") {
    void context.resume();
  }
  for (const player of page.players) {
    if (isOn(player) && player.graph === null && !player.loading) {
      void prepare(player, context);
    }
  }
  runSpeakers();
};

const onVisibility = () => {
  if (document.hidden || !anyOn()) {
    runSpeakers();
    suspend();
  } else if (page.context !== null) {
    wake();
  }
};

const hear = (player: Player, event: RadioEvent) => {
  const { context } = page;
  if (context === null) {
    return;
  }
  const { graph } = player;
  if (LEVELS.has(event.type)) {
    speak(player);
    return;
  }
  if (graph === null) {
    if (player.loading && HITS.has(event.type)) {
      player.missed.push({ at: performance.now(), event });
    }
    return;
  }
  if (!isOn(player)) {
    return;
  }
  if (context.state !== "running") {
    void context.resume();
  }
  graph.hear(event, context.currentTime + LEAD);
};

const attach = () => {
  for (const type of WAKE_EVENTS) {
    document.addEventListener(type, wake, true);
  }
  document.addEventListener("visibilitychange", onVisibility);
};

const detach = () => {
  for (const type of WAKE_EVENTS) {
    document.removeEventListener(type, wake, true);
  }
  document.removeEventListener("visibilitychange", onVisibility);
  page.abort.abort();
  page.abort = new AbortController();
  page.samples = null;
  if (page.context !== null && page.context.state !== "closed") {
    void page.context.close();
  }
  page.context = null;
};

function createPlayer(
  { state, subscribe }: Pick<RadioEvents, "state" | "subscribe">,
  muted: boolean
): Player {
  const player: Player = {
    band: null,
    graph: null,
    loading: false,
    missed: [],
    muted,
    programme: createRadioProgramme(() => page.context),
    state,
    unsubscribe: () => undefined,
  };
  if (page.players.size === 0) {
    attach();
  }
  page.players.add(player);
  player.unsubscribe = subscribe((event) => hear(player, event));
  return player;
}

function disposePlayer(player: Player) {
  player.unsubscribe();
  player.graph?.dispose();
  player.graph = null;
  player.programme.dispose();
  page.players.delete(player);
  if (page.players.size === 0) {
    detach();
  }
}

const RadioAudioContext = createContext(false);

function RadioAudioProvider({
  children,
  muted,
}: {
  children: ReactNode;
  muted: boolean;
}) {
  return <RadioAudioContext value={muted}>{children}</RadioAudioContext>;
}

function RadioAudio({ muted = false }: { muted?: boolean }) {
  const { state, subscribe } = useRadioEvents();
  const silenced = muted || use(RadioAudioContext);
  const player = useRef<Player | null>(null);

  useEffect(() => {
    const made = createPlayer({ state, subscribe }, silenced);
    player.current = made;
    return () => {
      disposePlayer(made);
      player.current = null;
    };
  }, [state, subscribe]);

  useEffect(() => {
    if (!player.current) {
      return;
    }
    player.current.muted = silenced;
    runSpeakers();
    if (!anyOn()) {
      suspend();
    } else if (navigator.userActivation?.isActive) {
      wake();
    }
  }, [silenced]);

  return null;
}

export { RadioAudio, RadioAudioProvider };

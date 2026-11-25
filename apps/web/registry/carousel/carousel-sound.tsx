"use client";

import { createContext, use, useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { useCarouselEvents } from "./carousel";
import type { CarouselEvent, CarouselEvents } from "./carousel-events";
import type { CarouselGraph, CarouselSamples } from "./carousel-sound-engine";

const LEAD = 0.005;
const LATE_MS = 400;
const WAKE_EVENTS = [
  "pointerdown",
  "pointerup",
  "keydown",
  "touchend",
] as const;

interface Player {
  graph: CarouselGraph | null;
  loading: boolean;
  missed: { at: number; event: CarouselEvent }[];
  muted: boolean;
  unsubscribe: () => void;
}

const page = {
  abort: new AbortController(),
  context: null as AudioContext | null,
  players: new Set<Player>(),
  samples: null as Promise<CarouselSamples> | null,
};

const isOn = (player: Player) => !player.muted && !document.hidden;

const anyOn = () => [...page.players].some(isOn);

const suspend = () => {
  if (page.context?.state === "running") {
    void page.context.suspend();
  }
};

const runFans = () => {
  const { context } = page;
  if (context === null) {
    return;
  }
  for (const player of page.players) {
    player.graph?.setFan(isOn(player), context.currentTime + LEAD);
  }
};

const prepare = async (player: Player, context: AudioContext) => {
  player.loading = true;
  try {
    const { createCarouselGraph, loadCarouselSamples } =
      await import("./carousel-sound-engine");
    page.samples ??= loadCarouselSamples(context, page.abort.signal);
    const samples = await page.samples;
    if (!page.players.has(player) || page.context !== context) {
      return;
    }
    const graph = createCarouselGraph(context, samples);
    player.graph = graph;
    graph.setFan(isOn(player), context.currentTime + LEAD);
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
  runFans();
};

const onVisibility = () => {
  if (document.hidden || !anyOn()) {
    runFans();
    suspend();
  } else if (page.context !== null) {
    wake();
  }
};

const hear = (player: Player, event: CarouselEvent) => {
  const { context } = page;
  if (context === null) {
    return;
  }
  const { graph } = player;
  if (graph === null) {
    if (player.loading && event.type !== "focus-turn") {
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
  subscribe: CarouselEvents["subscribe"],
  muted: boolean
): Player {
  const player: Player = {
    graph: null,
    loading: false,
    missed: [],
    muted,
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
  page.players.delete(player);
  if (page.players.size === 0) {
    detach();
  }
}

const CarouselAudioContext = createContext(false);

function CarouselAudioProvider({
  children,
  muted,
}: {
  children: ReactNode;
  muted: boolean;
}) {
  return <CarouselAudioContext value={muted}>{children}</CarouselAudioContext>;
}

function CarouselAudio({ muted = false }: { muted?: boolean }) {
  const { subscribe } = useCarouselEvents();
  const silenced = muted || use(CarouselAudioContext);
  const player = useRef<Player | null>(null);

  useEffect(() => {
    const made = createPlayer(subscribe, silenced);
    player.current = made;
    return () => {
      disposePlayer(made);
      player.current = null;
    };
  }, [subscribe]);

  useEffect(() => {
    if (!player.current) {
      return;
    }
    player.current.muted = silenced;
    runFans();
    if (!anyOn()) {
      suspend();
    } else if (navigator.userActivation?.isActive) {
      wake();
    }
  }, [silenced]);

  return null;
}

export { CarouselAudio, CarouselAudioProvider };

"use client";

import { createContext, use, useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { useToasterEvents } from "./toaster";
import type { ToasterEvent, ToasterEvents } from "./toaster-events";
import type { ToasterGraph, ToasterSamples } from "./toaster-sound-engine";

const PULSE_MS = 250;
const LOOKAHEAD = 0.5;
const IDLE = 3;
const LEAD = 0.005;
const LATE_MS = 400;
const WAKE_EVENTS = [
  "pointerdown",
  "pointerup",
  "keydown",
  "touchend",
] as const;

interface Player {
  graph: ToasterGraph | null;
  loading: boolean;
  missed: { at: number; event: ToasterEvent }[];
  muted: boolean;
  pendingBed: { endsAt: number } | null;
  unsubscribe: () => void;
}

const page = {
  abort: new AbortController(),
  busyUntil: 0,
  context: null as AudioContext | null,
  players: new Set<Player>(),
  pulse: 0,
  samples: null as Promise<ToasterSamples> | null,
};

const isOn = (player: Player) => !player.muted && !document.hidden;

const anyOn = () => [...page.players].some(isOn);

const suspend = () => {
  if (page.context?.state === "running") {
    void page.context.suspend();
  }
};

const prepare = async (player: Player, context: AudioContext) => {
  player.loading = true;
  try {
    const { createToasterGraph, loadToasterSamples } =
      await import("./toaster-sound-engine");
    page.samples ??= loadToasterSamples(context, page.abort.signal);
    const samples = await page.samples;
    if (!page.players.has(player) || page.context !== context) {
      return;
    }
    const graph = createToasterGraph(context, samples);
    player.graph = graph;
    const left = (player.pendingBed?.endsAt ?? 0) - context.currentTime;
    if (left > 0 && isOn(player)) {
      graph.hear(
        { durationMs: left * 1000, type: "toasting-start" },
        context.currentTime + LEAD
      );
    }
    const now = performance.now();
    for (const { at, event } of player.missed) {
      if (isOn(player) && now - at < LATE_MS) {
        page.busyUntil = Math.max(
          page.busyUntil,
          graph.hear(event, context.currentTime + LEAD)
        );
      }
    }
  } catch (error) {
    page.samples = null;
    if (!page.abort.signal.aborted) {
      reportError(error);
    }
  } finally {
    player.loading = false;
    player.pendingBed = null;
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
};

const onVisibility = () => {
  if (document.hidden || !anyOn()) {
    suspend();
  } else if (page.context !== null) {
    wake();
  }
};

const tick = () => {
  const { context } = page;
  if (context?.state !== "running") {
    return;
  }
  let toasting = false;
  for (const { graph } of page.players) {
    if (graph?.toasting()) {
      toasting = true;
      graph.pump(context.currentTime + LOOKAHEAD);
    }
  }
  if (toasting) {
    page.busyUntil = Math.max(page.busyUntil, context.currentTime + LOOKAHEAD);
  } else if (context.currentTime > page.busyUntil + IDLE) {
    suspend();
  }
};

const hear = (player: Player, event: ToasterEvent) => {
  const { context } = page;
  if (context === null) {
    return;
  }
  const { graph } = player;
  if (graph === null) {
    if (event.type === "toasting-start") {
      player.pendingBed = {
        endsAt: context.currentTime + event.durationMs / 1000,
      };
    } else if (event.type === "toasting-end") {
      player.pendingBed = null;
    } else if (player.loading && event.type !== "lever-move") {
      player.missed.push({ at: performance.now(), event });
    }
    return;
  }
  if (!isOn(player)) {
    if (event.type === "toasting-end") {
      graph.hear(event, context.currentTime);
    }
    return;
  }
  if (context.state !== "running") {
    void context.resume();
  }
  page.busyUntil = Math.max(
    page.busyUntil,
    graph.hear(event, context.currentTime + LEAD)
  );
};

const attach = () => {
  for (const type of WAKE_EVENTS) {
    document.addEventListener(type, wake, true);
  }
  document.addEventListener("visibilitychange", onVisibility);
  page.pulse = window.setInterval(tick, PULSE_MS);
};

const detach = () => {
  for (const type of WAKE_EVENTS) {
    document.removeEventListener(type, wake, true);
  }
  document.removeEventListener("visibilitychange", onVisibility);
  clearInterval(page.pulse);
  page.abort.abort();
  page.abort = new AbortController();
  page.samples = null;
  if (page.context !== null && page.context.state !== "closed") {
    void page.context.close();
  }
  page.context = null;
};

function createPlayer(
  subscribe: ToasterEvents["subscribe"],
  muted: boolean
): Player {
  const player: Player = {
    graph: null,
    loading: false,
    missed: [],
    muted,
    pendingBed: null,
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

const ToasterAudioContext = createContext(false);

function ToasterAudioProvider({
  children,
  muted,
}: {
  children: ReactNode;
  muted: boolean;
}) {
  return <ToasterAudioContext value={muted}>{children}</ToasterAudioContext>;
}

function ToasterAudio({ muted = false }: { muted?: boolean }) {
  const { subscribe } = useToasterEvents();
  const silenced = muted || use(ToasterAudioContext);
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
    if (!anyOn()) {
      suspend();
    } else if (navigator.userActivation?.isActive) {
      wake();
    }
  }, [silenced]);

  return null;
}

export { ToasterAudio, ToasterAudioProvider };

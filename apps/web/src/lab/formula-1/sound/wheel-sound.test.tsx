// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initialState } from "../model/initial-state";
import { WheelProvider, createWheelStore } from "../model/store";
import type { WheelStore } from "../model/store";
import type { WheelState } from "../model/types";
import { WheelFace } from "../wheel/wheel-face";
import type { Cue, SoundPlayer } from "./engine";
import type { Voice } from "./voices";
import { createWheelSound } from "./wheel-sound";

declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}

const nothing = (): undefined => undefined;

beforeEach(() => {
  globalThis.__UI_SDK_STRICT__ = true;
  Element.prototype.getAnimations = () => [];
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", nothing);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

interface Played {
  voice: Voice;
  cue: Cue;
}

const rig = (overrides: Partial<WheelState> = {}) => {
  const played: Played[] = [];
  const player: SoundPlayer = {
    play: (voice, cue) => played.push({ cue, voice }),
    wake: nothing,
  };
  const sound = createWheelSound(player);
  const store: WheelStore = sound.wrap(
    createWheelStore({ ...initialState(0), ...overrides })
  );
  const stop = sound.listen(document);
  render(
    <WheelProvider store={store}>
      <WheelFace display={null} />
    </WheelProvider>
  );
  const voices = (): Voice[] => played.map((entry) => entry.voice);
  return { played, stop, store, voices };
};

const button = (name: string): HTMLElement =>
  screen.getByRole("button", { name });
const slider = (name: string): HTMLElement =>
  screen.getByRole("slider", { name });

/** A finger on a button: down, up, then the click the browser sends. */
const tap = (element: HTMLElement): void => {
  fireEvent.pointerDown(element, { button: 0 });
  fireEvent.pointerUp(element, { button: 0 });
  fireEvent.click(element);
};

describe("wheel sound", () => {
  it("clicks a face button down under the finger and up as it lets go, once", () => {
    const { played, stop } = rig({ gear: 1 });
    tap(button("N, neutral"));
    expect(played.map((entry) => entry.voice)).toEqual(["press", "release"]);
    expect(played[0]?.cue.pan).toBeLessThan(0);
    stop();
  });

  it("clicks a button pressed from code down and back up, panned to its side", () => {
    const { played, stop, store } = rig();
    act(() => store.dispatch({ button: "pitConfirm", type: "press" }));
    act(() => store.dispatch({ button: "k0", type: "press" }));
    expect(played.map(({ cue, voice }) => [voice, cue.delay ?? 0])).toEqual([
      ["press", 0],
      ["release", 0.09],
      ["press", 0],
      ["release", 0.09],
    ]);
    expect(played[0]?.cue.pan).toBeLessThan(0);
    expect(played[2]?.cue.pan).toBeGreaterThan(0);
    stop();
  });

  it("adds a latch when P, CHR or K2 changes its own state, and only then", () => {
    const { stop, store, voices } = rig();
    tap(button("P, pit limiter"));
    expect(voices()).toEqual(["press", "release", "latch-on"]);
    act(() => store.dispatch({ button: "chr", type: "press" }));
    act(() => store.dispatch({ button: "k2", type: "press" }));
    act(() => store.dispatch({ button: "k0", type: "press" }));
    expect(voices().slice(3)).toEqual([
      "press",
      "release",
      "latch-on",
      "press",
      "release",
      "latch-on",
      "press",
      "release",
    ]);
    tap(button("P, pit limiter"));
    expect(voices().slice(-3)).toEqual(["press", "release", "latch-off"]);
    stop();
  });

  it("holds the radio's release until the finger or the key lets go, and chirps as the channel opens and closes", () => {
    const { played, stop, store, voices } = rig();
    act(() => store.dispatch({ button: "radio", type: "press" }));
    expect(voices()).toEqual(["press", "radio-on"]);
    act(() => store.dispatch({ button: "radio", type: "release" }));
    act(() => store.dispatch({ button: "radio", type: "release" }));
    expect(voices()).toEqual(["press", "radio-on", "release", "radio-off"]);
    const chirps = played.filter(({ voice }) => voice.startsWith("radio-"));
    expect(chirps.map(({ cue }) => cue.pan)).toEqual([0, 0]);
    stop();
  });

  it("chirps once when a finger holds RADIO, on top of the button's own click", () => {
    const { stop, voices } = rig();
    const radio = button("RADIO, push to talk");
    fireEvent.pointerDown(radio, { button: 0 });
    expect(voices()).toEqual(["press", "radio-on"]);
    fireEvent.pointerUp(radio, { button: 0 });
    expect(voices()).toEqual(["press", "radio-on", "release", "radio-off"]);
    stop();
  });

  it("gives the paddles, the rear levers, the grip pads and the P/S toggle their own voices", () => {
    const { stop, store, voices } = rig();
    act(() => store.dispatch({ paddle: "upshift", type: "paddle" }));
    tap(button("DRS, open rear wing"));
    tap(button("Brake balance forward"));
    fireEvent.click(
      screen.getByRole("switch", { name: "P/S, dash page scroll" })
    );
    expect(voices()).toEqual(["paddle", "lever", "pad", "toggle"]);
    stop();
  });

  it("clacks a rotary per detent, heavier for MODE, and ticks a thumbwheel", () => {
    const { stop, voices } = rig({
      thumbwheels: { ...initialState(0).thumbwheels, bs: 3 },
    });
    fireEvent.keyDown(slider("ENG, engine map"), { key: "ArrowUp" });
    fireEvent.keyDown(slider("Mode short-cut selector"), { key: "ArrowUp" });
    fireEvent.keyDown(slider("SOC, state of charge"), { key: "ArrowUp" });
    fireEvent.keyDown(slider("BS, brake shaping"), { key: "ArrowUp" });
    expect(voices()).toEqual(["detent", "detent-heavy", "ratchet"]);
    stop();
  });
});

import { describe, expect, it, vi } from "vitest";

import { initialState, toTrack } from "../../model/initial-state";
import { createWheelStore } from "../../model/store";
import type { WheelState } from "../../model/types";
import type { PageAudio } from "../page-audio";
import { createSoundSetting } from "../sound-setting";
import { createEngineSound } from "./engine-sound";
import type { EngineFrame } from "./frame";
import type { EngineVoice } from "./voice";

const memoryStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: () => null,
    get length() {
      return values.size;
    },
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
};

const flush = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
};

const rig = (state: WheelState = toTrack(initialState(0))) => {
  const context = {
    currentTime: 0,
    destination: {},
    state: "running",
  } as unknown as AudioContext;
  let made: AudioContext | null = null;
  const audio: PageAudio = {
    current: () => made,
    suspend: vi.fn(),
    wake: () => {
      made = context;
      return context;
    },
  };
  const storage = memoryStorage();
  const setting = createSoundSetting(() => storage);
  const frames: EngineFrame[] = [];
  const stops: number[] = [];
  const voice = vi.fn((): EngineVoice => ({
    set: (frame) => frames.push({ ...frame }),
    stop: (at) => stops.push(at),
  }));
  const load = vi.fn(() => Promise.resolve(voice));
  const engine = createEngineSound({ audio, load, setting });
  const store = createWheelStore(state);
  const detach = engine.attach(store);
  let { now } = state;
  const tick = (ms = 16): void => {
    now += ms;
    store.dispatch({ now, type: "tick" });
  };
  /** Sound turned on by the visitor's click: the gesture starts the page's audio. */
  const turnOn = async (): Promise<void> => {
    audio.wake();
    setting.set(true);
    await flush();
  };
  return { detach, frames, load, setting, stops, store, tick, turnOn, voice };
};

describe("engine sound", () => {
  it("stays silent and loads nothing before the visitor turns Sound on", async () => {
    const { frames, load, tick, voice } = rig();
    for (let frame = 0; frame < 10; frame += 1) {
      tick();
    }
    await flush();
    expect(load).not.toHaveBeenCalled();
    expect(voice).not.toHaveBeenCalled();
    expect(frames).toHaveLength(0);
  });

  it("starts with Sound on, on track, and follows the car's revs and throttle every frame", async () => {
    const { frames, store, tick, turnOn, voice } = rig();
    await turnOn();
    tick();
    tick();
    expect(voice).toHaveBeenCalledTimes(1);
    const last = frames.at(-1);
    const state = store.getState();
    expect(last?.running).toBe(true);
    expect(last?.rpm).toBeCloseTo(state.rpm);
    expect(last?.load).toBeCloseTo(state.throttle);
    expect(last?.speedKph).toBeCloseTo(state.speedKph);
  });

  it("hears a paddle upshift as a cut before the gear lands", async () => {
    const { frames, store, tick, turnOn } = rig();
    await turnOn();
    tick();
    store.dispatch({ paddle: "upshift", type: "paddle" });
    for (let frame = 0; frame < 10; frame += 1) {
      tick(16);
    }
    expect(frames.some((frame) => frame.cut)).toBe(true);
    expect(frames.at(-1)?.cut).toBe(false);
  });

  it("stays silent in the garage, and stops the engine when the car goes back there", async () => {
    const { frames, stops, store, tick, turnOn, voice } = rig(initialState(0));
    await turnOn();
    tick();
    expect(voice).not.toHaveBeenCalled();
    store.dispatch({ session: "track", type: "session" });
    tick();
    expect(voice).toHaveBeenCalledTimes(1);
    store.dispatch({ session: "garage", type: "session" });
    expect(stops).toHaveLength(1);
    const heard = frames.length;
    tick();
    expect(frames).toHaveLength(heard);
  });

  it("stops when Sound is turned off, and starts again when it is turned back on", async () => {
    const { setting, stops, tick, turnOn, voice } = rig();
    await turnOn();
    tick();
    setting.set(false);
    expect(stops).toHaveLength(1);
    tick();
    expect(voice).toHaveBeenCalledTimes(1);
    setting.set(true);
    tick();
    expect(voice).toHaveBeenCalledTimes(2);
  });

  it("lets go of the engine when it is detached", async () => {
    const { detach, stops, tick, turnOn } = rig();
    await turnOn();
    tick();
    detach();
    expect(stops).toHaveLength(1);
  });
});

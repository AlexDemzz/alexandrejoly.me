// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createAudioPlayer } from "./engine";
import { followSetting } from "./page-audio";
import type { PageAudio } from "./page-audio";
import { SOUND_STORAGE_KEY, createSoundSetting } from "./sound-setting";
import { SoundToggle } from "./sound-toggle";

declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}

beforeEach(() => {
  globalThis.__UI_SDK_STRICT__ = true;
  Element.prototype.getAnimations = () => [];
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

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

const brokenStorage = (): Storage => {
  throw new Error("SecurityError: storage is blocked");
};

const soundButton = (): HTMLElement =>
  screen.getByRole("button", { name: "Sound" });

const fakeAudio = () => {
  const context = { state: "suspended" } as AudioContext;
  let made: AudioContext | null = null;
  const audio: PageAudio = {
    current: () => made,
    suspend: vi.fn(),
    wake: vi.fn(() => {
      made = context;
      return context;
    }),
  };
  return audio;
};

describe("sound toggle", () => {
  it("starts off, turns on with a press and remembers it for the next visit", () => {
    const storage = memoryStorage();
    const setting = createSoundSetting(() => storage);
    render(<SoundToggle setting={setting} />);
    expect(soundButton().getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(soundButton());
    expect(soundButton().getAttribute("aria-pressed")).toBe("true");
    expect(setting.isOn()).toBe(true);
    expect(createSoundSetting(() => storage).isOn()).toBe(true);
    fireEvent.click(soundButton());
    expect(createSoundSetting(() => storage).isOn()).toBe(false);
  });

  it("works for the visit when storage is blocked, and starts off", () => {
    const setting = createSoundSetting(brokenStorage);
    render(<SoundToggle setting={setting} />);
    expect(soundButton().getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(soundButton());
    expect(soundButton().getAttribute("aria-pressed")).toBe("true");
  });

  it("shows a remembered choice", () => {
    const storage = memoryStorage();
    storage.setItem(SOUND_STORAGE_KEY, "on");
    render(<SoundToggle setting={createSoundSetting(() => storage)} />);
    expect(soundButton().getAttribute("aria-pressed")).toBe("true");
  });
});

describe("sound gate", () => {
  it("keeps the wheel's clicks from starting any audio while Sound is off", () => {
    const audio = fakeAudio();
    const setting = createSoundSetting(memoryStorage);
    const player = createAudioPlayer(audio, setting.isOn);
    player.wake();
    player.play("press", { pan: 0 });
    expect(audio.wake).not.toHaveBeenCalled();
    expect(audio.current()).toBeNull();
  });

  it("starts the page's audio on the press that turns Sound on, and suspends it when turned off", () => {
    const audio = fakeAudio();
    const setting = createSoundSetting(memoryStorage);
    const stop = followSetting(audio, setting, document);
    setting.set(true);
    expect(audio.wake).toHaveBeenCalledTimes(1);
    setting.set(false);
    expect(audio.suspend).toHaveBeenCalledTimes(1);
    stop();
  });

  it("suspends while the tab is hidden and resumes when it comes back, only if Sound is on", () => {
    const audio = fakeAudio();
    const setting = createSoundSetting(memoryStorage);
    const stop = followSetting(audio, setting, document);
    let hidden = false;
    vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
    const flip = (next: boolean): void => {
      hidden = next;
      document.dispatchEvent(new Event("visibilitychange"));
    };
    flip(true);
    flip(false);
    expect(audio.wake).not.toHaveBeenCalled();
    setting.set(true);
    flip(true);
    expect(audio.suspend).toHaveBeenCalledTimes(2);
    flip(false);
    expect(audio.wake).toHaveBeenCalledTimes(2);
    stop();
  });
});

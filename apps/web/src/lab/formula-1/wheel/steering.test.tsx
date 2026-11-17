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
import { BRAKE_BALANCE_STEP } from "../model/ranges";
import { WheelProvider, createWheelStore } from "../model/store";
import type { WheelState } from "../model/types";
import { WheelFace } from "./wheel-face";

declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}

const nothing = (): undefined => undefined;
const FRAME_MS = 16;

let now = 0;
let frames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;

/** Runs the animation for `ms`, a frame at a time, on a clock the test owns. */
const advance = (ms: number): void => {
  act(() => {
    for (let elapsed = 0; elapsed < ms; elapsed += FRAME_MS) {
      now += FRAME_MS;
      const due = [...frames.values()];
      frames = new Map();
      for (const frame of due) {
        frame(now);
      }
    }
  });
};

beforeEach(() => {
  globalThis.__UI_SDK_STRICT__ = true;
  now = 0;
  frames = new Map();
  Element.prototype.getAnimations = () => [];
  Element.prototype.setPointerCapture = nothing;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => {
    nextFrame += 1;
    frames.set(nextFrame, frame);
    return nextFrame;
  });
  vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
    frames.delete(handle)
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const renderWheel = (overrides: Partial<WheelState> = {}) => {
  const store = createWheelStore({ ...initialState(0), ...overrides });
  const view = render(
    <WheelProvider store={store}>
      <WheelFace display={null} />
    </WheelProvider>
  );
  const face = view.container.querySelector<HTMLElement>(
    '[data-slot="wheel-face"]'
  );
  const grip = view.container.querySelector<SVGPathElement>(
    '[data-grip-handle="right"]'
  );
  if (face === null || grip === null) {
    throw new Error("The wheel has no face or no grip.");
  }
  const steering = screen.getByRole("slider", { name: "Steering" });
  /** The wheel's angle as drawn, in degrees. */
  const turned = (): number =>
    Number(face.style.rotate.replace("deg", "") || 0);
  return { face, grip, steering, store, turned, view };
};

/** Hub-relative pointer positions: jsdom lays the stage out at the origin. */
const at = (degrees: number, radius = 100) => {
  const radians = (degrees * Math.PI) / 180;
  return {
    button: 0,
    clientX: radius * Math.cos(radians),
    clientY: radius * Math.sin(radians),
    pointerId: 1,
  };
};

const press = (element: HTMLElement, key: string, times = 1): void => {
  for (let count = 0; count < times; count += 1) {
    fireEvent.keyDown(element, { key });
  }
};

describe("steering", () => {
  it("steers with the arrow keys, reading out the side and the angle", () => {
    const { steering, turned } = renderWheel();
    expect(steering.getAttribute("aria-valuetext")).toBe("centre");
    press(steering, "ArrowRight", 4);
    expect(steering.getAttribute("aria-valuetext")).toBe("20° right");
    expect(turned()).toBe(20);
    press(steering, "ArrowLeft", 8);
    expect(steering.getAttribute("aria-valuetext")).toBe("20° left");
    expect(turned()).toBe(-20);
  });

  it("goes to lock on Home and End and no further, and stays there until Escape", () => {
    const { steering, turned } = renderWheel();
    press(steering, "End");
    press(steering, "ArrowRight");
    expect(steering.getAttribute("aria-valuetext")).toBe("180° right");
    expect(turned()).toBe(180);
    press(steering, "Home");
    expect(steering.getAttribute("aria-valuetext")).toBe("180° left");

    fireEvent.blur(steering);
    advance(1000);
    expect(turned()).toBe(-180);

    press(steering, "Escape");
    advance(2000);
    expect(turned()).toBe(0);
    expect(steering.getAttribute("aria-valuetext")).toBe("centre");
  });

  it("follows a hand on a grip by its angle round the hub, from where the wheel is", () => {
    const { grip, steering, turned } = renderWheel();
    press(steering, "ArrowRight", 2);

    fireEvent.pointerDown(grip, at(0));
    expect(turned()).toBe(10);
    fireEvent.pointerMove(grip, at(45));
    expect(turned()).toBeCloseTo(55);
    fireEvent.pointerMove(grip, at(135));
    expect(turned()).toBeCloseTo(145);
    // Past atan2's seam, a further quarter turn: the rack stops it at lock.
    fireEvent.pointerMove(grip, at(-135));
    expect(turned()).toBe(180);
    fireEvent.pointerMove(grip, at(135));
    expect(turned()).toBeCloseTo(90);
  });

  it("springs back to centre on release, and a new grab catches it on the way", () => {
    const { grip, steering, turned } = renderWheel();
    fireEvent.pointerDown(grip, at(0));
    fireEvent.pointerMove(grip, at(90));
    expect(turned()).toBeCloseTo(90);
    fireEvent.pointerUp(grip, at(90));

    advance(100);
    const caught = turned();
    expect(caught).toBeGreaterThan(0);
    expect(caught).toBeLessThan(90);
    fireEvent.pointerDown(grip, at(0));
    advance(500);
    expect(turned()).toBeCloseTo(caught);

    fireEvent.pointerUp(grip, at(0));
    let crossed = false;
    for (let step = 0; step < 100; step += 1) {
      advance(FRAME_MS);
      crossed ||= turned() < 0;
    }
    expect(crossed).toBe(true);
    expect(turned()).toBe(0);
    expect(steering.getAttribute("aria-valuetext")).toBe("centre");
  });

  it("eases back without overshoot when motion is reduced", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
    }));
    const { grip, turned } = renderWheel();
    fireEvent.pointerDown(grip, at(0));
    fireEvent.pointerMove(grip, at(-90));
    fireEvent.pointerUp(grip, at(-90));
    let lowest = turned();
    for (let step = 0; step < 150; step += 1) {
      advance(FRAME_MS);
      lowest = Math.min(lowest, turned());
      expect(turned()).toBeLessThanOrEqual(0);
    }
    expect(lowest).toBeCloseTo(-90);
    expect(turned()).toBe(0);
  });

  it("presses the brake-balance pad on a grip instead of steering", () => {
    const { store, turned } = renderWheel();
    const pad = screen.getByRole("button", { name: "Brake balance forward" });
    const before = store.getState().brakeBalance;
    fireEvent.pointerDown(pad, at(0));
    fireEvent.pointerMove(pad, at(60));
    fireEvent.pointerUp(pad, at(60));
    fireEvent.click(pad);
    expect(store.getState().brakeBalance).toBe(before + BRAKE_BALANCE_STEP);
    expect(turned()).toBe(0);
  });

  it("turns a rotary up the wheel, whichever way the wheel is turned", () => {
    const { steering, store, view } = renderWheel();
    const dial = view.container.querySelector<HTMLElement>(
      '[data-rotary="eng"] [data-wheel-dial]'
    );
    if (dial === null) {
      throw new Error("No ENG dial.");
    }
    const start = store.getState().rotaries.eng;
    const pitch = 18;

    fireEvent.pointerDown(dial, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 2,
    });
    fireEvent.pointerMove(dial, {
      clientX: 0,
      clientY: -2 * pitch,
      pointerId: 2,
    });
    fireEvent.pointerUp(dial, { pointerId: 2 });
    expect(store.getState().rotaries.eng).toBe(start + 2);

    press(steering, "End");
    // Upside down, the wheel's "up" is the page's down.
    fireEvent.pointerDown(dial, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 3,
    });
    fireEvent.pointerMove(dial, {
      clientX: 0,
      clientY: 3 * pitch,
      pointerId: 3,
    });
    fireEvent.pointerUp(dial, { pointerId: 3 });
    expect(store.getState().rotaries.eng).toBe(start + 5);
  });

  it("buffets at speed without moving the steering slider", () => {
    const { steering, turned } = renderWheel({
      distanceM: 400,
      rpm: 11_500,
      session: "track",
      speedKph: 310,
      start: { elapsedMs: 60_000, kind: "go" },
    });
    const angles: number[] = [];
    for (let step = 0; step < 40; step += 1) {
      advance(FRAME_MS);
      angles.push(turned());
    }
    const widest = Math.max(...angles.map(Math.abs));
    expect(widest).toBeGreaterThan(0.1);
    expect(widest).toBeLessThanOrEqual(0.8);
    expect(
      new Set(angles.map((angle) => angle.toFixed(3))).size
    ).toBeGreaterThan(10);
    expect(steering).toHaveProperty("value", "0");
    expect(steering.getAttribute("aria-valuetext")).toBe("centre");
  });

  it("holds still in the garage and when motion is reduced", () => {
    const garage = renderWheel();
    advance(500);
    expect(garage.turned()).toBe(0);
    cleanup();

    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
    }));
    const reduced = renderWheel({
      distanceM: 400,
      rpm: 11_500,
      session: "track",
      speedKph: 310,
      start: { elapsedMs: 60_000, kind: "go" },
    });
    advance(500);
    expect(reduced.turned()).toBe(0);
    expect(reduced.face.style.transform).toBe("");
  });
});

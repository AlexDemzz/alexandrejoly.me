// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { RACE_LAPS } from "../model/car";
import { initialState, toTrack } from "../model/initial-state";
import { WheelProvider, createWheelStore } from "../model/store";
import type { WheelStore } from "../model/store";
import { LAP_LENGTH_M } from "../model/track";
import type { WheelAction, WheelState } from "../model/types";
import { RaceToggle } from "./race-toggle";

declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}

const nothing = (): undefined => undefined;

beforeEach(() => {
  globalThis.__UI_SDK_STRICT__ = true;
  Element.prototype.getAnimations = () => [];
  Element.prototype.scrollIntoView = nothing;
  Element.prototype.checkVisibility = () => true;
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", nothing);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

interface Rig {
  store: WheelStore;
  dispatched: WheelAction[];
}

const renderToggle = (state: WheelState = initialState(0)): Rig => {
  const base = createWheelStore(state);
  const dispatched: WheelAction[] = [];
  const store: WheelStore = {
    ...base,
    dispatch: (action) => {
      dispatched.push(action);
      base.dispatch(action);
    },
  };
  render(
    <WheelProvider store={store}>
      <RaceToggle />
    </WheelProvider>
  );
  return { dispatched, store };
};

const race = (): HTMLElement => screen.getByRole("button", { name: "Race" });

const sessionActions = (dispatched: WheelAction[]): WheelAction[] =>
  dispatched.filter((action) => action.type === "session");

it("is named Race and stays unpressed while the car is in the garage", () => {
  renderToggle();

  expect(race().getAttribute("aria-pressed")).toBe("false");
});

it("starts the race when pressed and stops it when pressed again", () => {
  const { dispatched, store } = renderToggle();

  fireEvent.click(race());
  expect(store.getState().session).toBe("track");
  expect(race().getAttribute("aria-pressed")).toBe("true");

  fireEvent.click(race());
  expect(store.getState().session).toBe("garage");
  expect(race().getAttribute("aria-pressed")).toBe("false");

  expect(sessionActions(dispatched)).toEqual([
    { session: "track", type: "session" },
    { session: "garage", type: "session" },
  ]);
});

it("is a native button in the tab order, so Enter and Space press it", () => {
  renderToggle();
  const button = race();

  expect(button.tagName).toBe("BUTTON");
  expect(button.getAttribute("type")).toBe("button");
  expect(button.tabIndex).toBe(0);
  expect(button.hasAttribute("disabled")).toBe(false);
});

it("lets go when the race ends after the last lap", () => {
  const onTrack = toTrack(initialState(0));
  const lastLap: WheelState = {
    ...onTrack,
    distanceM: LAP_LENGTH_M - 1,
    speedKph: 290,
    start: { elapsedMs: 0, kind: "go" },
    timing: { ...onTrack.timing, lap: RACE_LAPS },
  };
  const { store } = renderToggle(lastLap);
  expect(race().getAttribute("aria-pressed")).toBe("true");

  act(() => {
    for (
      let now = 20;
      now <= 2000 && store.getState().session === "track";
      now += 20
    ) {
      store.dispatch({ now, type: "tick" });
    }
  });

  expect(store.getState().session).toBe("garage");
  expect(race().getAttribute("aria-pressed")).toBe("false");
});

const agent = createAgent();

it("lets an agent find the Race toggle and start the race", async () => {
  // The bridge waits for frames to settle each step.
  vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) =>
    setTimeout(() => frame(0), 0)
  );
  vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
    clearTimeout(handle)
  );
  const { store } = renderToggle();

  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more");
  for (const entry of components) {
    expect(
      entry.label,
      `${entry.component} ${entry.ref} has no name`
    ).toBeTruthy();
  }
  expect(components.map((entry) => entry.label)).toContain("Race");

  const result = await act(() =>
    agent.act({ steps: [{ action: "setPressed", args: [true], ref: "Race" }] })
  );
  expect(result.ok, result.error?.message).toBe(true);
  expect(store.getState().session).toBe("track");
  expect(race().getAttribute("aria-pressed")).toBe("true");
});

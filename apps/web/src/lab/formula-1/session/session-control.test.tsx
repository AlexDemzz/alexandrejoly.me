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

import { initialState } from "../model/initial-state";
import { WheelProvider, createWheelStore } from "../model/store";
import type { WheelStore } from "../model/store";
import type { Session, WheelAction } from "../model/types";
import { SessionControl } from "./session-control";

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

const renderControl = (session: Session = "garage"): Rig => {
  const base = createWheelStore({ ...initialState(0), session });
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
      <SessionControl />
    </WheelProvider>
  );
  return { dispatched, store };
};

const item = (name: string): HTMLElement => screen.getByRole("radio", { name });

const sessionActions = (dispatched: WheelAction[]): WheelAction[] =>
  dispatched.filter((action) => action.type === "session");

it("names the control Session and checks the store's session", () => {
  renderControl("track");

  const group = screen.getByRole("radiogroup", { name: "Session" });
  expect(group.contains(item("Garage"))).toBe(true);
  expect(group.contains(item("On track"))).toBe(true);
  expect(item("On track").getAttribute("aria-checked")).toBe("true");
  expect(item("Garage").getAttribute("aria-checked")).toBe("false");
});

it("sends the car on track when On track is clicked", () => {
  const { dispatched, store } = renderControl();

  fireEvent.click(item("On track"));

  expect(sessionActions(dispatched)).toEqual([
    { session: "track", type: "session" },
  ]);
  expect(store.getState().session).toBe("track");
  expect(item("On track").getAttribute("aria-checked")).toBe("true");
  expect(item("Garage").getAttribute("aria-checked")).toBe("false");
});

it("follows a session change made outside the control", () => {
  const { store } = renderControl();

  act(() => {
    store.dispatch({ session: "track", type: "session" });
  });

  expect(item("On track").getAttribute("aria-checked")).toBe("true");
});

it("moves between sessions with the arrow keys", () => {
  const { dispatched, store } = renderControl();
  const garage = item("Garage");
  const track = item("On track");

  expect(garage.getAttribute("tabindex")).toBe("0");
  expect(track.getAttribute("tabindex")).toBe("-1");

  act(() => {
    garage.focus();
  });
  fireEvent.keyDown(garage, { key: "ArrowRight" });
  expect(store.getState().session).toBe("track");
  expect(document.activeElement).toBe(track);
  expect(track.getAttribute("tabindex")).toBe("0");

  fireEvent.keyDown(track, { key: "ArrowLeft" });
  expect(store.getState().session).toBe("garage");
  expect(document.activeElement).toBe(garage);

  expect(sessionActions(dispatched)).toEqual([
    { session: "track", type: "session" },
    { session: "garage", type: "session" },
  ]);
});

const agent = createAgent();

it("lets an agent find the session and put the car on track", async () => {
  // The bridge waits for frames to settle each step.
  vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) =>
    setTimeout(() => frame(0), 0)
  );
  vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
    clearTimeout(handle)
  );
  const { store } = renderControl();

  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more");
  for (const entry of components) {
    expect(
      entry.label,
      `${entry.component} ${entry.ref} has no name`
    ).toBeTruthy();
  }
  expect(components.map((entry) => entry.label)).toContain("Session");

  const result = await act(() =>
    agent.act({
      steps: [{ action: "setValue", args: ["On track"], ref: "Session" }],
    })
  );
  expect(result.ok, result.error?.message).toBe(true);
  expect(store.getState().session).toBe("track");
  expect(item("On track").getAttribute("aria-checked")).toBe("true");
});

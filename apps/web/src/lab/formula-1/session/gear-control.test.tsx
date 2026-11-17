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

import { initialState, toTrack } from "../model/initial-state";
import { WheelProvider, createWheelStore } from "../model/store";
import type { WheelStore } from "../model/store";
import type { WheelAction, WheelState } from "../model/types";
import { GearControl } from "./gear-control";

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

const renderControl = (state: WheelState = initialState(0)): Rig => {
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
      <GearControl />
    </WheelProvider>
  );
  return { dispatched, store };
};

const item = (name: string): HTMLElement => screen.getByRole("radio", { name });

const checked = (name: string): string | null =>
  item(name).getAttribute("aria-checked");

const gearActions = (dispatched: WheelAction[]): WheelAction[] =>
  dispatched.filter((action) => action.type === "gearControl");

it("is named Gears and starts on Auto", () => {
  renderControl();

  const group = screen.getByRole("radiogroup", { name: "Gears" });
  expect(group.contains(item("Auto"))).toBe(true);
  expect(group.contains(item("Manual"))).toBe(true);
  expect(checked("Auto")).toBe("true");
  expect(checked("Manual")).toBe("false");
});

it("switches to Manual and back to Auto", () => {
  const { dispatched, store } = renderControl();

  fireEvent.click(item("Manual"));
  expect(store.getState().gearControl).toBe("manual");
  expect(checked("Manual")).toBe("true");

  fireEvent.click(item("Auto"));
  expect(store.getState().gearControl).toBe("auto");
  expect(checked("Auto")).toBe("true");

  expect(gearActions(dispatched)).toEqual([
    { type: "gearControl", value: "manual" },
    { type: "gearControl", value: "auto" },
  ]);
});

it("moves between Auto and Manual with the arrow keys", () => {
  const { store } = renderControl();
  const auto = item("Auto");
  const manual = item("Manual");

  expect(auto.getAttribute("tabindex")).toBe("0");
  expect(manual.getAttribute("tabindex")).toBe("-1");

  act(() => {
    auto.focus();
  });
  fireEvent.keyDown(auto, { key: "ArrowRight" });
  expect(store.getState().gearControl).toBe("manual");
  expect(document.activeElement).toBe(manual);

  fireEvent.keyDown(manual, { key: "ArrowLeft" });
  expect(store.getState().gearControl).toBe("auto");
  expect(document.activeElement).toBe(auto);
});

it("shows Manual once a paddle on track takes the gearbox", () => {
  const racing: WheelState = {
    ...toTrack(initialState(0)),
    start: { elapsedMs: 0, kind: "go" },
  };
  const { store } = renderControl(racing);
  expect(checked("Auto")).toBe("true");

  act(() => {
    store.dispatch({ paddle: "upshift", type: "paddle" });
  });

  expect(store.getState().gearControl).toBe("manual");
  expect(checked("Manual")).toBe("true");
  expect(checked("Auto")).toBe("false");
});

const agent = createAgent();

it("lets an agent find Gears and switch back to Auto", async () => {
  // The bridge waits for frames to settle each step.
  vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) =>
    setTimeout(() => frame(0), 0)
  );
  vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
    clearTimeout(handle)
  );
  const { store } = renderControl({
    ...initialState(0),
    gearControl: "manual",
  });

  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more");
  for (const entry of components) {
    expect(
      entry.label,
      `${entry.component} ${entry.ref} has no name`
    ).toBeTruthy();
  }
  expect(components.map((entry) => entry.label)).toContain("Gears");

  const result = await act(() =>
    agent.act({ steps: [{ action: "setValue", args: ["Auto"], ref: "Gears" }] })
  );
  expect(result.ok, result.error?.message).toBe(true);
  expect(store.getState().gearControl).toBe("auto");
  expect(checked("Auto")).toBe("true");
});

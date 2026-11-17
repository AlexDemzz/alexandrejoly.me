// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initialState } from "../model/initial-state";
import { BRAKE_BALANCE_STEP } from "../model/ranges";
import { WheelProvider, createWheelStore } from "../model/store";
import type { WheelStore } from "../model/store";
import type { WheelAction, WheelState } from "../model/types";
import { WheelFace } from "./wheel-face";

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

const renderFace = (overrides: Partial<WheelState> = {}): Rig => {
  const base = createWheelStore({ ...initialState(0), ...overrides });
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
      <WheelFace display={null} />
    </WheelProvider>
  );
  return { dispatched, store };
};

const button = (name: string): HTMLElement =>
  screen.getByRole("button", { name });
const slider = (name: string): HTMLElement =>
  screen.getByRole("slider", { name });
const thumbwheels = (): WheelState["thumbwheels"] =>
  initialState(0).thumbwheels;

const BUTTONS = [
  "DRS, open rear wing",
  "R, reverse",
  "Downshift",
  "Upshift",
  "N, neutral",
  "RF, acknowledge message",
  "PC, pit confirm",
  "RADIO, push to talk",
  "OK, close menu",
  "CHR, recharge mode",
  "K1, overtake boost",
  "P, pit limiter",
  "1+, step up",
  "10−, step down",
  "K2, ERS preset 2",
  "K0, ERS base mode",
  "Brake balance rearward",
  "Brake balance forward",
];

const SLIDERS = [
  "Steering",
  "DIF IN, differential entry",
  "SOC, state of charge",
  "D MID, differential mid-corner",
  "EB, engine braking",
  "BS, brake shaping",
  "Mode short-cut selector",
  "Left multi-function",
  "Right multi-function",
  "TARGET",
  "TYRE PHASE",
  "ENG, engine map",
  "TRQ, torque map",
];

const SWITCH = "P/S, dash page scroll";

describe("WheelFace", () => {
  it("names every control with its printed label and function, in driver order", () => {
    renderFace();
    expect(
      screen
        .getAllByRole("button")
        .map((element) => element.getAttribute("aria-label"))
    ).toEqual(BUTTONS);
    expect(
      screen
        .getAllByRole("slider")
        .map((element) => element.getAttribute("aria-label"))
    ).toEqual(SLIDERS);
    expect(screen.getByRole("switch", { name: SWITCH })).toBeTruthy();
  });

  it("puts the display in the screen", () => {
    render(
      <WheelProvider store={createWheelStore(initialState(0))}>
        <WheelFace display={<p>Lap 1</p>} />
      </WheelProvider>
    );
    expect(
      screen.getByText("Lap 1").closest('[data-slot="wheel-screen"]')
    ).not.toBeNull();
  });

  it("asks for neutral from N", () => {
    const { store } = renderFace({ gear: 1 });
    fireEvent.click(button("N, neutral"));
    expect(store.getState().shift?.to).toBe("N");
  });

  it("shifts up from neutral with the rocker", () => {
    const { store } = renderFace();
    fireEvent.click(button("Upshift"));
    expect(store.getState().shift?.to).toBe(1);
  });

  it("latches the pit limiter on P and shows it pressed while the car has it on", () => {
    const { store } = renderFace();
    const pit = button("P, pit limiter");
    expect(pit.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(pit);
    expect(store.getState().pitLimiter).toBe(true);
    expect(pit.getAttribute("aria-pressed")).toBe("true");
    act(() => store.dispatch({ button: "pit", type: "press" }));
    expect(pit.getAttribute("aria-pressed")).toBe("false");
  });

  it("latches CHR and K2 as ERS modes, and K0 clears them", () => {
    const { store } = renderFace();
    const chr = button("CHR, recharge mode");
    const k2 = button("K2, ERS preset 2");
    fireEvent.click(chr);
    expect(store.getState().ers).toBe("chr");
    expect(chr.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(k2);
    expect(store.getState().ers).toBe("k2");
    expect(k2.getAttribute("aria-pressed")).toBe("true");
    expect(chr.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(button("K0, ERS base mode"));
    expect(store.getState().ers).toBe("base");
    expect(k2.getAttribute("aria-pressed")).toBe("false");
  });

  it("boosts only while K1 is held, by pointer or by key, ignoring key repeat", () => {
    const { dispatched, store } = renderFace();
    const k1 = button("K1, overtake boost");
    fireEvent.pointerDown(k1, { button: 0 });
    expect(store.getState().ers).toBe("k1");
    expect(Object.hasOwn(k1.dataset, "held")).toBe(true);
    fireEvent.pointerUp(k1);
    expect(store.getState().ers).toBe("base");

    fireEvent.keyDown(k1, { key: " " });
    fireEvent.keyDown(k1, { key: " ", repeat: true });
    expect(
      dispatched.filter(
        (action) => action.type === "press" && action.button === "k1"
      )
    ).toHaveLength(2);
    fireEvent.blur(k1);
    expect(store.getState().ers).toBe("base");
  });

  it("talks on the radio only while RADIO is held", () => {
    const { store } = renderFace();
    const radio = button("RADIO, push to talk");
    fireEvent.pointerDown(radio, { button: 0 });
    expect(store.getState().radio).toBe(true);
    fireEvent.pointerCancel(radio);
    expect(store.getState().radio).toBe(false);
    fireEvent.keyDown(radio, { key: "Enter" });
    fireEvent.keyUp(radio, { key: "Enter" });
    expect(store.getState().radio).toBe(false);
  });

  it("steps the brake balance from the grip pads", () => {
    const { store } = renderFace();
    const start = store.getState().brakeBalance;
    fireEvent.click(button("Brake balance rearward"));
    expect(store.getState().brakeBalance).toBe(start - BRAKE_BALANCE_STEP);
    fireEvent.click(button("Brake balance forward"));
    fireEvent.click(button("Brake balance forward"));
    expect(store.getState().brakeBalance).toBe(start + BRAKE_BALANCE_STEP);
  });

  it("throws the P/S lever to S and back", () => {
    const { dispatched, store } = renderFace();
    const lever = screen.getByRole("switch", { name: SWITCH });
    fireEvent.click(lever);
    expect(dispatched.at(-1)).toEqual({ type: "dashSwitch", value: "S" });
    expect(store.getState().dashSwitch).toBe("S");
    expect(lever.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(lever);
    expect(store.getState().dashSwitch).toBe("P");
  });

  it("reads a legend rotary by its legend and rolls it past the last detent", () => {
    const { store } = renderFace();
    const mode = slider("Mode short-cut selector");
    expect(mode.getAttribute("aria-valuetext")).toBe("RACE");
    fireEvent.keyDown(mode, { key: "ArrowUp" });
    fireEvent.keyUp(mode, { key: "ArrowUp" });
    expect(store.getState().rotaries.mode).toBe(1);
    expect(mode.getAttribute("aria-valuetext")).toBe("TS");

    fireEvent.keyDown(mode, { key: "ArrowDown" });
    fireEvent.keyDown(mode, { key: "ArrowDown" });
    expect(mode.getAttribute("aria-valuetext")).toBe("AD");
    expect(store.getState().rotaries.mode).toBe(11);
  });

  it("reads a numbered rotary by its number and follows the car", () => {
    const { store } = renderFace();
    const eng = slider("ENG, engine map");
    const before = store.getState().rotaries.eng;
    fireEvent.keyDown(eng, { key: "ArrowUp" });
    expect(store.getState().rotaries.eng).toBe(before + 1);
    expect(eng.getAttribute("aria-valuetext")).toBe(String(before + 1));

    act(() => store.dispatch({ index: 11, rotary: "target", type: "rotary" }));
    expect(slider("TARGET").getAttribute("aria-valuetext")).toBe("12");
  });

  it("rolls SOC from 12 on to 1, and stops BS at its end", () => {
    const { store } = renderFace({
      thumbwheels: { ...thumbwheels(), bs: 3, soc: 12 },
    });
    const soc = slider("SOC, state of charge");
    fireEvent.keyDown(soc, { key: "ArrowUp" });
    fireEvent.keyUp(soc, { key: "ArrowUp" });
    expect(store.getState().thumbwheels.soc).toBe(1);
    expect(soc.getAttribute("aria-valuetext")).toBe("1");

    const bs = slider("BS, brake shaping");
    expect(bs.getAttribute("aria-valuetext")).toBe("+3");
    fireEvent.keyDown(bs, { key: "ArrowUp" });
    expect(store.getState().thumbwheels.bs).toBe(3);
    fireEvent.keyDown(bs, { key: "Home" });
    expect(store.getState().thumbwheels.bs).toBe(-3);
    expect(bs.getAttribute("aria-valuetext")).toBe("−3");
  });

  it("presses the rear DRS stalk and the R lever", () => {
    const { dispatched } = renderFace();
    fireEvent.click(button("DRS, open rear wing"));
    fireEvent.click(button("R, reverse"));
    expect(dispatched).toEqual([
      { button: "drs", type: "press" },
      { button: "reverse", type: "press" },
    ]);
  });
});

const agent = createAgent();

describe("WheelFace for an agent", () => {
  it("lets an agent find every control and work the wheel", async () => {
    // The bridge waits for frames to settle each step.
    vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) =>
      setTimeout(() => frame(0), 0)
    );
    vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
      clearTimeout(handle)
    );
    const { dispatched, store } = renderFace();

    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== "more");
    for (const entry of components) {
      expect(
        entry.label,
        `${entry.component} ${entry.ref} has no name`
      ).toBeTruthy();
    }
    const labels = components.map((entry) => entry.label);
    for (const label of [...BUTTONS, ...SLIDERS, SWITCH]) {
      expect(labels, `${label} is missing from the snapshot`).toContain(label);
    }

    const result = await agent.act({
      steps: [
        { action: "setValue", args: [4], ref: "Mode short-cut selector" },
        { action: "setValue", args: [7], ref: "SOC, state of charge" },
        { action: "toggle", ref: "P, pit limiter" },
        { action: "toggle", ref: SWITCH },
        { action: "press", ref: "Brake balance forward" },
        { action: "press", ref: "K1, overtake boost" },
      ],
    });
    expect(result.ok, result.error?.message).toBe(true);

    const state = store.getState();
    expect(state.rotaries.mode).toBe(4);
    expect(state.thumbwheels.soc).toBe(7);
    expect(state.pitLimiter).toBe(true);
    expect(state.dashSwitch).toBe("S");
    expect(state.brakeBalance).toBe(
      initialState(0).brakeBalance + BRAKE_BALANCE_STEP
    );
    expect(
      dispatched.filter(
        (action) => "button" in action && action.button === "k1"
      )
    ).toEqual([
      { button: "k1", type: "press" },
      { button: "k1", type: "release" },
    ]);
    expect(state.ers).toBe("base");
  });
});

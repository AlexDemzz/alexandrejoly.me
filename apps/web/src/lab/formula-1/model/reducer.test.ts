import { describe, expect, it } from "vitest";

import { POPUP_MS } from "./feedback";
import { initialState } from "./initial-state";
import { DOWNSHIFT_MS, UPSHIFT_MS } from "./ranges";
import { MULTI_MENU_MS, reduce } from "./reducer";
import { DISPLAY_PAGES, MFL_POSITIONS, MFR_POSITIONS } from "./types";
import type { WheelAction, WheelButton, WheelState } from "./types";

const FRAME_MS = 20;

const wheel = (overrides: Partial<WheelState> = {}): WheelState => ({
  ...initialState(0),
  ...overrides,
});

const apply = (state: WheelState, ...actions: WheelAction[]): WheelState => {
  let next = state;
  for (const action of actions) {
    next = reduce(next, action);
  }
  return next;
};

const tick = (state: WheelState, ms: number): WheelState => {
  let next = state;
  for (let elapsed = 0; elapsed < ms; elapsed += FRAME_MS) {
    next = reduce(next, { now: next.now + FRAME_MS, type: "tick" });
  }
  return next;
};

const press = (button: WheelButton): WheelAction => ({ button, type: "press" });
const release = (button: WheelButton): WheelAction => ({
  button,
  type: "release",
});
const up: WheelAction = { paddle: "upshift", type: "paddle" };
const down: WheelAction = { paddle: "downshift", type: "paddle" };

const turnTo = (wheelName: "bs" | "difIn" | "soc" | "trq", value: number) =>
  apply(wheel(), { type: "thumbwheel", value, wheel: wheelName }).thumbwheels[
    wheelName
  ];

describe("gearbox", () => {
  it("lands an upshift after its shift time, not before", () => {
    const requested = apply(wheel(), up);
    expect(requested.shift).toEqual({ doneAt: UPSHIFT_MS, to: 1 });
    expect(tick(requested, UPSHIFT_MS - FRAME_MS).gear).toBe("N");
    expect(tick(requested, UPSHIFT_MS).gear).toBe(1);
  });

  it("steps up from neutral through 8th and back down to 1st, one gear a shift", () => {
    let state = wheel();
    const seen: WheelState["gear"][] = [];
    for (let shift = 0; shift < 9; shift += 1) {
      state = tick(apply(state, up), UPSHIFT_MS);
      seen.push(state.gear);
    }
    expect(seen).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 8]);
    for (let shift = 0; shift < 8; shift += 1) {
      state = tick(apply(state, down), DOWNSHIFT_MS);
    }
    expect(state.gear).toBe(1);
  });

  it("ignores requests while a shift is in progress", () => {
    const first = apply(wheel(), up);
    expect(apply(first, up, down, press("neutral")).shift).toEqual(first.shift);
  });

  it("selects neutral from any gear with N", () => {
    expect(apply(wheel({ gear: 6 }), press("neutral")).shift?.to).toBe("N");
  });

  it("selects reverse with the R lever from neutral, and neutral again from reverse", () => {
    expect(apply(wheel(), press("reverse")).shift?.to).toBe("R");
    expect(apply(wheel({ gear: "R" }), press("reverse")).shift?.to).toBe("N");
  });

  it("rejects reverse from a forward gear", () => {
    const rejected = apply(wheel({ gear: 3 }), press("reverse"));
    expect(rejected.shift).toBeNull();
    expect(rejected.message).toMatchObject({
      text: "SHIFT REJECTED",
      tone: "warn",
    });
  });

  it("shifts in the garage without any hand-over to make", () => {
    const shifted = apply(wheel(), up);
    expect(shifted.gearControl).toBe("auto");
    expect(shifted.popup).toBeNull();
  });

  it("ignores a switch to the session it is already in", () => {
    const parked = wheel();
    expect(apply(parked, { session: "garage", type: "session" })).toBe(parked);
  });

  it("never reaches reverse from the paddles", () => {
    const parked = wheel();
    expect(apply(parked, down)).toBe(parked);
  });
});

describe("buttons", () => {
  it("latches the pit limiter on P and shows it", () => {
    const on = apply(wheel(), press("pit"));
    expect(on.pitLimiter).toBe(true);
    expect(on.popup).toMatchObject({ label: "PIT LIMITER", value: "ON" });
    expect(apply(on, press("pit")).pitLimiter).toBe(false);
  });

  it("holds RADIO only while pressed", () => {
    const held = apply(wheel(), press("radio"));
    expect(held.radio).toBe(true);
    expect(apply(held, release("radio")).radio).toBe(false);
  });

  it("says DRS is not enabled: a car standing still has no zone and no car ahead", () => {
    expect(apply(wheel(), press("drs")).popup).toMatchObject({
      label: "DRS",
      value: "NOT ENABLED",
    });
  });

  it("confirms to the pit wall with PC, and RF acknowledges the message", () => {
    const confirmed = apply(wheel(), press("pitConfirm"));
    expect(confirmed.message).toMatchObject({
      text: "PIT CONFIRMED",
      tone: "info",
    });
    expect(apply(confirmed, press("rf")).message).toBeNull();
  });
});

describe("ERS buttons", () => {
  it("deploys K1 while held, then returns to the latched mode", () => {
    const held = apply(wheel(), press("k2"), press("k1"));
    expect(held).toMatchObject({ ers: "k1", ersLatched: "k2" });
    expect(apply(held, release("k1")).ers).toBe("k2");
  });

  it("latches K2 and CHR on a press and unlatches on a second", () => {
    expect(apply(wheel(), press("k2")).ers).toBe("k2");
    expect(apply(wheel(), press("k2"), press("k2")).ers).toBe("base");
    expect(apply(wheel(), press("chr")).ers).toBe("chr");
    expect(apply(wheel(), press("k2"), press("chr")).ers).toBe("chr");
  });

  it("clears everything back to base on K0", () => {
    expect(apply(wheel(), press("chr"), press("k0"))).toMatchObject({
      ers: "base",
      ersLatched: "base",
    });
  });
});

describe("brake balance", () => {
  it("steps by 0.5% on the grip pads and shows the value", () => {
    const forward = apply(wheel({ brakeBalance: 56.5 }), press("bbForward"));
    expect(forward.brakeBalance).toBe(57);
    expect(forward.popup).toMatchObject({ label: "BBAL", value: "57.0%" });
    expect(
      apply(forward, press("bbRearward"), press("bbRearward")).brakeBalance
    ).toBe(56);
  });

  it("stays between 50% and 65%", () => {
    expect(
      apply(wheel({ brakeBalance: 65 }), press("bbForward")).brakeBalance
    ).toBe(65);
    expect(
      apply(wheel({ brakeBalance: 50 }), press("bbRearward")).brakeBalance
    ).toBe(50);
  });
});

describe("thumbwheels", () => {
  it("clamps the signed drums at their ends", () => {
    expect(turnTo("difIn", 9)).toBe(5);
    expect(turnTo("difIn", -9)).toBe(-5);
    expect(turnTo("bs", 4)).toBe(3);
  });

  it("wraps SOC (1..12) and TRQ (1..8) past their ends", () => {
    expect(turnTo("soc", 13)).toBe(1);
    expect(turnTo("soc", 0)).toBe(12);
    expect(turnTo("trq", 9)).toBe(1);
    expect(turnTo("trq", 0)).toBe(8);
  });

  it("pops up signed values with a sign", () => {
    const raised = apply(wheel(), {
      type: "thumbwheel",
      value: 2,
      wheel: "eb",
    });
    expect(raised.popup).toMatchObject({ label: "EB", value: "+2" });
    const lowered = apply(wheel(), {
      type: "thumbwheel",
      value: -3,
      wheel: "eb",
    });
    expect(lowered.popup?.value).toBe("−3");
  });
});

describe("rotaries", () => {
  it("stores MODE as a legend index and ENG, TARGET, TYRE PHASE as 1..12", () => {
    const set = apply(
      wheel(),
      { index: 6, rotary: "mode", type: "rotary" },
      { index: 0, rotary: "eng", type: "rotary" },
      { index: 11, rotary: "target", type: "rotary" },
      { index: 12, rotary: "tyrePhase", type: "rotary" }
    );
    expect(set.rotaries).toMatchObject({
      eng: 1,
      mode: 6,
      target: 12,
      tyrePhase: 1,
    });
    expect(set.popup).toMatchObject({ label: "TYRE PHASE", value: "1" });
  });

  it("names the MODE position in its pop-up", () => {
    const push = apply(wheel(), { index: 6, rotary: "mode", type: "rotary" });
    expect(push.popup).toMatchObject({ label: "MODE", value: "PSH" });
  });
});

describe("multi-function menu", () => {
  const ersIndex = MFL_POSITIONS.indexOf("ERS");
  const opened = apply(wheel(), {
    index: ersIndex,
    rotary: "mfl",
    type: "rotary",
  });

  it("opens on the parameter an MFL or MFR turn picks", () => {
    expect(opened.multiMenu).toEqual({
      param: "ERS",
      rotary: "mfl",
      until: MULTI_MENU_MS,
    });
    const rec = apply(wheel(), {
      index: MFR_POSITIONS.indexOf("REC"),
      rotary: "mfr",
      type: "rotary",
    });
    expect(rec.multiMenu?.param).toBe("REC");
  });

  it("keeps the D on MFL apart from the D on MFR", () => {
    const left = apply(
      wheel(),
      { index: MFL_POSITIONS.indexOf("D"), rotary: "mfl", type: "rotary" },
      press("plus")
    );
    expect(left.multi.mfl.D).toBe(wheel().multi.mfl.D + 1);
    expect(left.multi.mfr.D).toBe(wheel().multi.mfr.D);
  });

  it("steps the parameter with + and −, within 1..12", () => {
    const raised = apply(opened, press("plus"), press("plus"));
    expect(raised.multi.mfl.ERS).toBe(opened.multi.mfl.ERS + 2);
    expect(raised.popup).toMatchObject({
      label: "ERS",
      value: String(raised.multi.mfl.ERS),
    });
    let low = opened;
    for (let step = 0; step < 15; step += 1) {
      low = apply(low, press("minus"));
    }
    expect(low.multi.mfl.ERS).toBe(1);
  });

  it("stays open while + / − are used and closes on its own after 4 s", () => {
    const refreshed = apply(tick(opened, MULTI_MENU_MS - 1000), press("plus"));
    expect(tick(refreshed, 2000).multiMenu).not.toBeNull();
    expect(tick(opened, MULTI_MENU_MS).multiMenu).toBeNull();
  });

  it("closes on OK, handing + / − back to the dash", () => {
    const closed = apply(opened, press("ok"));
    expect(closed.multiMenu).toBeNull();
    const paged = apply({ ...closed, dashSwitch: "S" }, press("plus"));
    expect(paged.multi).toEqual(closed.multi);
    expect(paged.page).toBe(DISPLAY_PAGES[1]);
  });
});

describe("dash paging", () => {
  it("pages the dash with + / − on S, wrapping", () => {
    const paging = apply(wheel(), { type: "dashSwitch", value: "S" });
    expect(apply(paging, press("plus")).page).toBe(DISPLAY_PAGES[1]);
    expect(apply(paging, press("minus")).page).toBe(DISPLAY_PAGES.at(-1));
  });

  it("pins the race page on P, where + / − only say so", () => {
    const pinned = apply(wheel({ dashSwitch: "S", page: "energy" }), {
      type: "dashSwitch",
      value: "P",
    });
    expect(pinned.page).toBe("race");
    const pressed = apply(pinned, press("plus"));
    expect(pressed.page).toBe("race");
    expect(pressed.popup).toMatchObject({ label: "DASH", value: "P" });
  });
});

describe("tick", () => {
  it("drops a pop-up after 1.5 s", () => {
    const shown = apply(wheel(), press("bbForward"));
    expect(tick(shown, POPUP_MS - FRAME_MS).popup).not.toBeNull();
    expect(tick(shown, POPUP_MS).popup).toBeNull();
  });

  it("ignores a tick that does not move time forward", () => {
    const state = wheel({ now: 500 });
    expect(reduce(state, { now: 500, type: "tick" })).toBe(state);
  });
});

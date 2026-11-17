// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initialState, toTrack } from "../model/initial-state";
import { WheelProvider, createWheelStore } from "../model/store";
import type { WheelStore } from "../model/store";
import { DISPLAY_PAGES } from "../model/types";
import type { WheelState } from "../model/types";
import { PAGE_NAMES } from "./format";
import type { Screen } from "./screen";
import { WheelDisplay } from "./wheel-display";

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const NOW = 100_000;
const garage = (): WheelState => initialState(NOW);
const track = (): WheelState => toTrack(initialState(NOW));

/** A store the test moves by hand: the screen is a read-out of the state. */
const renderDisplay = (
  start: WheelState,
  overrides: Partial<WheelState> = {}
) => {
  let state: WheelState = { ...start, ...overrides };
  const listeners = new Set<() => void>();
  const store: WheelStore = {
    dispatch: () => {},
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  render(
    <WheelProvider store={store}>
      <WheelDisplay />
    </WheelProvider>
  );
  const set = (next: Partial<WheelState>): void => {
    act(() => {
      state = { ...state, ...next };
      for (const listener of listeners) {
        listener();
      }
    });
  };
  return { set, state: () => state };
};

const renderModel = (state: WheelState) => {
  const store = createWheelStore(state);
  render(
    <WheelProvider store={store}>
      <WheelDisplay />
    </WheelProvider>
  );
  return store;
};

/** TEMPS and LAPS are screens before they are in DISPLAY_PAGES; see screen.ts. */
const onPage = (page: Screen): Partial<WheelState> =>
  ({ dashSwitch: "S", page }) as Partial<WheelState>;

const display = (): HTMLElement =>
  screen.getByRole("region", { name: "Wheel display" });

const status = (): string => screen.getByRole("status").textContent ?? "";

const cellOf = (text: string): HTMLElement | null =>
  within(display()).getByText(text).closest('[data-slot="dash-cell"]');

/** The ON / OFF under an ERS button's name on the energy page. */
const buttonState = (button: string): string | null =>
  screen
    .getByText(button, { selector: '[data-slot="dash-label"]' })
    .closest('[data-slot="dash-cell"]')
    ?.querySelector('[data-slot="dash-value"]')?.textContent ?? null;

/** Whether an announcement says the state's current message or pop-up. */
const heardEvent = (state: WheelState, heard: string): boolean => {
  const { message, popup } = state;
  const events = [message?.text, popup && `${popup.label} ${popup.value}`];
  return events.some(
    (text) => text !== undefined && text !== null && heard.includes(text)
  );
};

const meterValue = (name: string): string | null =>
  screen.getByRole("meter", { name }).getAttribute("aria-valuenow");

/** What C9.1.2 and C9.2.7 keep off the dash. */
const FORBIDDEN = /slip|spin|engag/iu;

const textRuns = (root: HTMLElement): string[] => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const runs: string[] = [];
  while (walker.nextNode()) {
    runs.push(walker.currentNode.textContent ?? "");
  }
  return runs;
};

const SCREENS: readonly Screen[] = ["race", "temps", "energy", "setup", "laps"];

const PAGE_MARKS: Record<Screen, string> = {
  energy: "ERS MODE",
  laps: "LAPS",
  race: "BEHIND",
  setup: "DIF IN",
  temps: "TEMPS",
};

describe("pages", () => {
  it.each(SCREENS)("shows the %s page with the switch on S", (page) => {
    renderDisplay(track(), onPage(page));
    expect(screen.getByText(PAGE_MARKS[page])).toBeTruthy();
    for (const other of SCREENS.filter((name) => name !== page)) {
      expect(screen.queryByText(PAGE_MARKS[other])).toBeNull();
    }
  });

  it("keeps the race page while the switch is on P", () => {
    const { set } = renderDisplay(garage(), { dashSwitch: "P", page: "setup" });
    expect(screen.getByText("BEHIND")).toBeTruthy();

    set({ dashSwitch: "S" });
    expect(screen.getByText("DIF IN")).toBeTruthy();
  });

  it("pages with + once the switch is on S, through the wheel model", () => {
    const store = renderModel(initialState(0));
    act(() => store.dispatch({ button: "plus", type: "press" }));
    expect(screen.getByText("BEHIND")).toBeTruthy();

    act(() => store.dispatch({ type: "dashSwitch", value: "S" }));
    act(() => store.dispatch({ button: "plus", type: "press" }));
    expect(screen.getByText(PAGE_NAMES[DISPLAY_PAGES[1]])).toBeTruthy();
  });
});

describe("in the garage", () => {
  it("dashes out what only a moving car gives: lap, revs, delta, gaps, tyres, fuel", () => {
    renderDisplay(garage());
    const region = within(display());
    for (const name of [
      "Last lap",
      "Engine speed",
      "Delta",
      "Car behind",
      "Car ahead",
      "Lap",
      "Front left tyre",
      "Rear right tyre",
      "Fuel against target, grams",
    ]) {
      expect(region.getByText(`${name}: none`)).toBeTruthy();
    }
    expect(region.queryByText("AUTO")).toBeNull();
  });

  it("shows a full battery and DRS off", () => {
    renderDisplay(garage());
    const battery = within(display()).getByRole("meter", { name: "Battery" });
    expect(battery.getAttribute("aria-valuenow")).toBe("100");
    expect(within(display()).getByText("100")).toBeTruthy();
    expect(within(display()).getByText("OFF")).toBeTruthy();
  });

  it("dashes out temperatures and has no lap times", () => {
    renderDisplay(garage(), onPage("temps"));
    expect(screen.getByText("FL tyre: none")).toBeTruthy();
    expect(screen.getByText("RR brake: none")).toBeTruthy();
    cleanup();

    renderDisplay(garage(), onPage("laps"));
    expect(screen.getByText("NO LAP TIMES")).toBeTruthy();
    expect(screen.queryByText("NOW")).toBeNull();
  });

  it("follows the controls: gear, brake balance, mode and ERS", () => {
    const { set } = renderDisplay(garage());
    set({
      brakeBalance: 58,
      ers: "chr",
      gear: 3,
      rotaries: { ...garage().rotaries, mode: 6 },
    });
    const region = within(display());
    expect(region.getByText("58.0")).toBeTruthy();
    expect(region.getByText("PSH")).toBeTruthy();
    expect(region.getByText("CHR")).toBeTruthy();
    expect(
      display().querySelector('[data-slot="dash-gear"]')?.textContent
    ).toBe("Gear 3");
  });
});

describe("on track", () => {
  it("reads the joined lap off the model: lap, gaps by position, tyres over the reference", () => {
    const store = renderModel(initialState(NOW));
    act(() => store.dispatch({ session: "track", type: "session" }));
    const region = within(display());
    const { gapAheadS, gapBehindS, position, timing, tyreTempsC } =
      store.getState();

    expect(display().textContent).toContain(`Lap ${timing.lap}/20`);
    expect(region.getByText(`P${position + 1}`)).toBeTruthy();
    expect(region.getByText(`−${gapBehindS.toFixed(1)}`)).toBeTruthy();
    expect(region.getByText(`P${position - 1}`)).toBeTruthy();
    expect(region.getByText(`+${gapAheadS.toFixed(1)}`)).toBeTruthy();
    expect(
      region.getAllByText(String(Math.round(tyreTempsC.fl) - 85))
    ).toHaveLength(4);
    expect(region.queryByText("Engine speed: none")).toBeNull();
    expect(region.getByText("Delta: none")).toBeTruthy();
    expect(status()).toBe("On track");
  });

  it("colours the live delta by its sign", () => {
    const { set } = renderDisplay(track(), {
      timing: { ...track().timing, bestMs: 75_000, deltaMs: -234 },
    });
    expect(cellOf("−0.23")?.dataset.fill).toBe("green");

    set({ timing: { ...track().timing, bestMs: 75_000, deltaMs: 412 } });
    expect(cellOf("+0.41")?.dataset.fill).toBe("red");
  });

  it("says LEAD in P1 and keeps the car behind", () => {
    renderDisplay(track(), {
      gapAheadS: Number.POSITIVE_INFINITY,
      gapBehindS: 1.2,
      position: 1,
    });
    expect(screen.getByText("LEAD")).toBeTruthy();
    expect(screen.getByText("P2")).toBeTruthy();
    expect(screen.getByText("−1.2")).toBeTruthy();
  });

  it("tells each DRS state apart", () => {
    const { set } = renderDisplay(track());
    const seen = new Set<string>();
    for (const drs of ["disabled", "available", "enabled", "open"] as const) {
      set({ drs });
      const cell = display().querySelector(`[data-drs="${drs}"]`);
      expect(cell).not.toBeNull();
      seen.add(cell?.textContent ?? "");
    }
    expect(seen).toEqual(
      new Set(["DRSOFF", "DRSAVAILABLE", "DRSENABLED", "DRSOPEN"])
    );
  });

  it("marks who shifts", () => {
    const { set } = renderDisplay(track());
    expect(screen.getByText("AUTO")).toBeTruthy();
    set({ gearControl: "manual" });
    expect(screen.getByText("MAN")).toBeTruthy();
  });

  it("reads this lap's energy against the 4 MJ and 2 MJ caps", () => {
    renderDisplay(track(), {
      ...onPage("energy"),
      deployedThisLapMJ: 4,
      harvestedThisLapMJ: 1.2,
      mgukKW: -96,
    });
    expect(meterValue("DEPLOYED / 4")).toBe("4");
    expect(meterValue("HARVESTED / 2")).toBe("1.2");
    expect(meterValue("MGU-K harvest")).toBe("96");
    expect(meterValue("MGU-K deploy")).toBe("0");
    expect(screen.getByText("MGU-K HARVEST")).toBeTruthy();
  });

  it("lists lap times with the best one marked", () => {
    renderDisplay(track(), {
      ...onPage("laps"),
      timing: {
        ...track().timing,
        bestMs: 75_210,
        lap: 6,
        lapTimesMs: [76_004, 75_210, 75_640],
        lastMs: 75_640,
      },
    });
    const rows = within(screen.getByRole("list", { name: "Lap times" }))
      .getAllByRole("listitem")
      .map((row) => [row.textContent, row.dataset.best !== undefined]);
    expect(rows).toEqual([
      [expect.stringContaining("NOW"), false],
      ["LAP 501:15.640+0.430", false],
      ["LAP 401:15.210+0.000", true],
      ["LAP 301:16.004+0.794", false],
    ]);
  });

  it("only announces discrete events while the car laps", () => {
    const store = renderModel(initialState(NOW));
    act(() => store.dispatch({ session: "track", type: "session" }));
    let heard = status();
    for (let now = NOW + 16; now <= NOW + 20_000; now += 16) {
      act(() => store.dispatch({ now, type: "tick" }));
      if (status() !== heard) {
        heard = status();
        expect(heardEvent(store.getState(), heard)).toBe(true);
      }
    }
  });
});

describe("overlays and announcements", () => {
  it("shows a pop-up until its time is up", () => {
    const { set } = renderDisplay(garage());
    const until = NOW + 1500;
    set({ popup: { label: "ENG", until, value: "9" } });
    expect(screen.getByText("ENG")).toBeTruthy();

    set({ now: until - 1 });
    expect(screen.getByText("ENG")).toBeTruthy();

    set({ now: until });
    expect(screen.queryByText("ENG")).toBeNull();
  });

  it("lists the turned rotary's parameters with the active one highlighted", () => {
    const { set, state } = renderDisplay(garage());
    const until = NOW + 3000;
    set({ multiMenu: { param: "ERS", rotary: "mfl", until } });
    const menu = screen.getByRole("list", { name: "Left multi-function" });
    const current = (): string | null =>
      menu.querySelector('[aria-current="true"]')?.textContent ?? null;
    expect(within(menu).getAllByRole("listitem")).toHaveLength(12);
    expect(current()).toBe("ERS6");

    set({ multi: { ...state().multi, mfl: { ...state().multi.mfl, ERS: 9 } } });
    expect(current()).toBe("ERS9");

    set({ multiMenu: { param: "REC", rotary: "mfr", until } });
    expect(
      screen.getByRole("list", { name: "Right multi-function" })
    ).toBeTruthy();
  });

  it("lights K1, K2 and CHR on the energy page as they latch or are held", () => {
    const { set } = renderDisplay(garage(), onPage("energy"));
    expect([buttonState("K1"), buttonState("K2"), buttonState("CHR")]).toEqual([
      "OFF",
      "OFF",
      "OFF",
    ]);

    set({ ers: "k1", ersLatched: "k2" });
    expect([buttonState("K1"), buttonState("K2"), buttonState("CHR")]).toEqual([
      "ON",
      "ON",
      "OFF",
    ]);
  });

  it("announces pages, menu values and messages, not the numbers that move every frame", () => {
    const { set, state } = renderDisplay(track(), { dashSwitch: "S" });
    expect(status()).toBe("");

    set({ page: "setup" });
    expect(status()).toBe("Setup page");

    for (let frame = 1; frame <= 300; frame += 1) {
      set({
        distanceM: state().distanceM + 1.3,
        mgukKW: (frame % 240) - 120,
        now: state().now + 16,
        rpm: 10_000 + ((frame * 37) % 2000),
        socMJ: 3 - frame / 1000,
        speedKph: 200 + (frame % 100),
        timing: { ...state().timing, currentMs: state().timing.currentMs + 16 },
      });
    }
    expect(status()).toBe("Setup page");

    set({
      multiMenu: { param: "ERS", rotary: "mfl", until: state().now + 3000 },
      popup: { label: "ERS", until: state().now + 1500, value: "6" },
    });
    expect(status()).toBe("ERS 6");

    set({
      message: {
        text: "SHIFT REJECTED",
        tone: "warn",
        until: state().now + 2000,
      },
    });
    expect(status()).toBe("SHIFT REJECTED");
  });

  it("never mentions clutch slip or wheelspin, on any page, in either session", () => {
    for (const start of [garage(), track()]) {
      const { set } = renderDisplay(start);
      for (const page of SCREENS) {
        set(onPage(page));
        for (const run of textRuns(display())) {
          expect(run).not.toMatch(FORBIDDEN);
        }
      }
      cleanup();
    }
  });
});

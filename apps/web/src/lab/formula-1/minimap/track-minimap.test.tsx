// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { initialState, toTrack } from "../model/initial-state";
import { WheelProvider } from "../model/store";
import type { WheelStore } from "../model/store";
import type { WheelState } from "../model/types";
import { TrackMinimap } from "./track-minimap";
import { poseAt } from "./track-outline";

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const NOW = 100_000;
const track = (): WheelState => toTrack(initialState(NOW));

const renderMinimap = (start: WheelState) => {
  let state = start;
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
  const view = render(
    <WheelProvider store={store}>
      <TrackMinimap />
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
  const part = (slot: string): Element | null =>
    view.container.querySelector(`[data-slot="track-minimap-${slot}"]`);
  const visible = (): boolean =>
    view.container.querySelector<HTMLElement>('[data-slot="track-minimap"]')
      ?.dataset.visible !== undefined;
  return { part, set, visible };
};

/** The car's position from its transform, in map units. */
const carAt = (car: Element | null): { x: number; y: number } => {
  const match = /translate\((?<x>[\d.]+) (?<y>[\d.]+)\)/u.exec(
    car?.getAttribute("transform") ?? ""
  );
  return { x: Number(match?.groups?.x), y: Number(match?.groups?.y) };
};

describe("TrackMinimap", () => {
  it("shows only on track", () => {
    const { set, visible } = renderMinimap(initialState(NOW));
    expect(visible()).toBe(false);

    set(track());
    expect(visible()).toBe(true);

    set(initialState(NOW));
    expect(visible()).toBe(false);
  });

  it("puts the car where the store says it is on the lap", () => {
    const { part, set } = renderMinimap(track());
    for (const distanceM of [400, 1850, 3690, 4980]) {
      set({ distanceM });
      const expected = poseAt(distanceM);
      const shown = carAt(part("car"));
      expect(shown.x).toBeCloseTo(expected.x, 1);
      expect(shown.y).toBeCloseTo(expected.y, 1);
    }
  });

  it("calls out the next corner and how far it is", () => {
    const { part, set } = renderMinimap(track());
    set({ distanceM: 3500 });
    expect(part("callout")?.textContent).toBe("T6150 m");

    set({ distanceM: 3700 });
    expect(part("callout")?.textContent).toBe("T6now");
  });
});

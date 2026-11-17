// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { Profiler } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { initialState } from "./initial-state";
import {
  WheelProvider,
  createWheelStore,
  runTicks,
  useLeds,
  useWheel,
} from "./store";
import { DISPLAY_PAGES } from "./types";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("createWheelStore", () => {
  it("notifies subscribers only when the state changes", () => {
    const store = createWheelStore(initialState(0));
    const listener = vi.fn();
    store.subscribe(listener);
    store.dispatch({ button: "radio", type: "release" });
    expect(listener).not.toHaveBeenCalled();
    store.dispatch({ button: "radio", type: "press" });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getState().radio).toBe(true);
  });
});

describe("runTicks", () => {
  it("ticks every frame and pauses while the page is hidden", () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (frame: FrameRequestCallback) => {
      frames.push(frame);
      return frames.length;
    });
    const cancel = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancel);
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    const store = createWheelStore();
    const stop = runTicks(store);

    frames.shift()?.(16);
    expect(store.getState().now).toBe(16);
    expect(frames).toHaveLength(1);

    hidden.mockReturnValue(true);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(cancel).toHaveBeenCalled();

    frames.length = 0;
    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(frames).toHaveLength(1);
    stop();
  });
});

const Page = () => {
  const page = useWheel((state) => state.page);
  const leds = useLeds();
  return (
    <span>
      {page} {leds.shift.length}
    </span>
  );
};

describe("useWheel", () => {
  it("re-renders a consumer only when its slice changes", () => {
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const store = createWheelStore(initialState(0));
    const commits = vi.fn();
    const view = render(
      <WheelProvider store={store}>
        <Profiler id="page" onRender={commits}>
          <Page />
        </Profiler>
      </WheelProvider>
    );
    const before = commits.mock.calls.length;

    act(() => store.dispatch({ type: "thumbwheel", value: 2, wheel: "bs" }));
    expect(commits).toHaveBeenCalledTimes(before);

    act(() => store.dispatch({ type: "dashSwitch", value: "S" }));
    act(() => store.dispatch({ button: "plus", type: "press" }));
    expect(commits).toHaveBeenCalledTimes(before + 1);
    expect(view.container.textContent).toBe(`${DISPLAY_PAGES[1]} 15`);
    view.unmount();
  });
});

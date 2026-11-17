import {
  createContext,
  createElement,
  use,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import { initialState } from "./initial-state";
import { reduce } from "./reducer";
import { ledsEqual, selectLeds } from "./selectors";
import type { Leds, WheelAction, WheelState } from "./types";

export interface WheelStore {
  dispatch: (action: WheelAction) => void;
  getState: () => WheelState;
  subscribe: (listener: () => void) => () => void;
}

/** A plain store around `reduce`, usable without React. */
export const createWheelStore = (
  state: WheelState = initialState(0)
): WheelStore => {
  let current = state;
  const listeners = new Set<() => void>();
  return {
    dispatch: (action) => {
      const next = reduce(current, action);
      if (next === current) {
        return;
      }
      current = next;
      for (const listener of listeners) {
        listener();
      }
    },
    getState: () => current,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

/** Dispatches a `tick` every animation frame while the page is visible. */
export const runTicks = (store: WheelStore): (() => void) => {
  let frame = 0;
  const loop = (time: number): void => {
    store.dispatch({ now: time, type: "tick" });
    frame = requestAnimationFrame(loop);
  };
  const start = (): void => {
    if (frame === 0 && !document.hidden) {
      frame = requestAnimationFrame(loop);
    }
  };
  const stop = (): void => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const onVisibility = (): void => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);
  start();
  return () => {
    stop();
    document.removeEventListener("visibilitychange", onVisibility);
  };
};

const WheelContext = createContext<WheelStore | null>(null);

interface WheelProviderProps {
  children: ReactNode;
  /** An existing store, e.g. one built from a custom state; one is created otherwise. */
  store?: WheelStore;
}

export const WheelProvider = ({
  children,
  store: given,
}: WheelProviderProps) => {
  const store = useMemo(() => given ?? createWheelStore(), [given]);
  useEffect(() => runTicks(store), [store]);
  return createElement(WheelContext, { value: store }, children);
};

/** The store itself, for code that needs `subscribe` or `getState` outside a render. */
export const useWheelStore = (): WheelStore => {
  const store = use(WheelContext);
  if (store === null) {
    throw new Error("useWheel needs a <WheelProvider> above it.");
  }
  return store;
};

interface Selection<T> {
  selector: (state: WheelState) => T;
  state: WheelState;
  value: T;
}

/**
 * Reads one slice of the wheel. The state changes every frame, so select a
 * primitive (`(s) => s.gear`) or pass `isEqual` for anything built per call;
 * a component re-renders only when its slice changes.
 */
export const useWheel = <T>(
  selector: (state: WheelState) => T,
  isEqual: (a: T, b: T) => boolean = Object.is
): T => {
  const store = useWheelStore();
  const last = useRef<Selection<T> | null>(null);
  const getSnapshot = (): T => {
    const state = store.getState();
    const previous = last.current;
    if (previous?.state === state && previous.selector === selector) {
      return previous.value;
    }
    const value = selector(state);
    const kept =
      previous !== null && isEqual(previous.value, value)
        ? previous.value
        : value;
    last.current = { selector, state, value: kept };
    return kept;
  };
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

export const useWheelDispatch = (): ((action: WheelAction) => void) =>
  useWheelStore().dispatch;

/** The 15 + 3 + 3 LEDs, re-rendering only when a light changes. */
export const useLeds = (): Leds => useWheel(selectLeds, ledsEqual);

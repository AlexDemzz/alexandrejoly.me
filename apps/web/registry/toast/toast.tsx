"use client";

import { Button } from "@ui-sdk/react/button";
import { mergeProps } from "@ui-sdk/react/primitive";
import {
  Slider,
  SliderControl,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import {
  Toast as SdkToast,
  ToastRegion as SdkToastRegion,
  ToastTitle,
} from "@ui-sdk/react/toast";
import type {
  ToastDismissDetails,
  ToastDismissReason,
  ToastOptions,
  ToastRegionProps,
  ToastType,
  Toaster as ToastQueue,
} from "@ui-sdk/react/toast";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type {
  ComponentProps,
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  ReactNode,
} from "react";

import { createToastEvents } from "./toast-events";
import type { ToastEvent, ToastEvents } from "./toast-events";
import {
  BODY,
  DIAL,
  FRAME,
  HEADROOM,
  LEVER,
  LIP_Y,
  SLICE,
  SLICE_UNITS_PER_METRE,
  STOP,
} from "./toast-frame";
import { DIAL_ANGLES, createRig } from "./toast-rig";
import type { Pose } from "./toast-rig";
import type { ToastScene } from "./toast-scene";

import "./toast.css";

type ToastLevel = 1 | 2 | 3 | 4 | 5;

interface ToastCycle {
  browning: number;
  burnt: boolean;
  id: string;
  level: ToastLevel;
  signal: AbortSignal;
}

type ToastOutcome =
  | string
  | Omit<
      ToastOptions<ReactNode>,
      "dismissible" | "duration" | "id" | "onDismiss"
    >;

type ToastView = "live" | "poster" | "static";

const PALEST: ToastLevel = 1;
const DARKEST: ToastLevel = 5;
const TOASTING_MS: Record<ToastLevel, number> = {
  1: 1400,
  2: 1800,
  3: 2200,
  4: 2600,
  5: 3000,
};
const BROWNING_ADDED: Record<ToastLevel, number> = {
  1: 0.12,
  2: 0.24,
  3: 0.4,
  4: 0.6,
  5: 0.9,
};
const BURNT_AT = 0.85;

const LEVER_UP = 100;
const LEVER_DOWN = 0;
const LEVER_CATCH = 14;
const LATCH_KEYS = new Set(["ArrowDown", "End", "Enter", " "]);
const PRESS_KEYS = new Set(["Enter", " "]);
const NEXT_SLICE_MS = 700;
const STALE_MOVE_MS = 100;
const STOPPED = Symbol("stopped");
const UNSAFE_ANCHOR = /[^\w-]/gu;

interface Slice {
  browning: number;
  id: string;
}

interface Shown {
  description?: ReactNode;
  title?: ReactNode;
  type: ToastType;
}

type Settled = { error: unknown } | { value: ToastOutcome | void };

const isLevel = (value: unknown): value is ToastLevel =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= PALEST &&
  value <= DARKEST;

const brandOf = (shown: Shown | undefined) =>
  !shown ||
  shown.type === "default" ||
  shown.type === "loading" ||
  typeof shown.title !== "string"
    ? ""
    : shown.title;

const travelOf = (lever: number) => 1 - lever / LEVER_UP;

const trackOf = (element: HTMLElement) =>
  element.querySelector<HTMLElement>('[data-slot="slider-track"]');

const webglAvailable = () => {
  const probe = document.createElement("canvas").getContext("webgl2");
  probe?.getExtension("WEBGL_lose_context")?.loseContext();
  return probe !== null;
};

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

function useStableEvent<Args extends unknown[], Result>(
  handler: (...args: Args) => Result
) {
  const latest = useRef(handler);
  useLayoutEffect(() => {
    latest.current = handler;
  });
  return useCallback((...args: Args) => latest.current(...args), []);
}

function createStage(level: ToastLevel, emit: ToastEvents["emit"]) {
  let scene: ToastScene | null = null;
  let frame: HTMLElement | null = null;
  let hand = LEVER_UP;
  let message = "";
  const rig = createRig(
    (pose: Pose) => {
      scene?.render(pose);
      frame?.style.setProperty(
        "--lever-lag",
        String(pose.lever - travelOf(hand))
      );
      frame?.style.setProperty(
        "--slice-drop",
        String(pose.slice.drop * SLICE.sink)
      );
    },
    { dial: DIAL_ANGLES[level - 1], emit }
  );
  return {
    attach: (element: HTMLElement | null) => {
      frame = element;
    },
    brand: (next: string) => {
      if (next === message) {
        return;
      }
      message = next;
      scene?.setMessage(next);
      rig.invalidate();
    },
    hold: (lever: number) => {
      hand = lever;
    },
    rig,
    show: (next: ToastScene | null) => {
      scene = next;
      next?.setMessage(message);
      next?.render(rig.pose);
    },
  };
}

type StageController = ReturnType<typeof createStage>;

function createLeverMoves(emit: ToastEvents["emit"]) {
  let frame = 0;
  let pending = LEVER_UP;
  let told = { at: 0, height: LEVER_UP };
  const tell = (now: number) => {
    frame = 0;
    const elapsed = now - told.at;
    const speed =
      elapsed > 0 && elapsed < STALE_MOVE_MS
        ? ((pending - told.height) * 1000) / elapsed
        : 0;
    told = { at: now, height: pending };
    emit({ height: pending, speed, type: "lever-move" });
  };
  return {
    dispose: () => {
      cancelAnimationFrame(frame);
      frame = 0;
    },
    move: (height: number) => {
      pending = height;
      if (frame === 0) {
        frame = requestAnimationFrame(tell);
      }
    },
  };
}

interface ToastContextValue {
  events: ToastEvents;
  level: ToastLevel;
  lever: number;
  letGo: (height: number) => void;
  moveLever: (height: number) => void;
  pressStop: (pressed: boolean) => void;
  push: () => void;
  stage: StageController;
  stop: () => void;
  toaster: ToastQueue<ReactNode>;
  toasting: boolean;
  turnDial: (level: ToastLevel) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function useToastContext() {
  const context = use(ToastContext);
  if (!context) {
    throw new Error("Toast parts must be used within a Toast component");
  }
  return context;
}

function useToastEvents(): Pick<ToastEvents, "subscribe"> {
  const { events } = useToastContext();
  return { subscribe: events.subscribe };
}

interface ToastProps extends ComponentProps<"div"> {
  canToast?: () => boolean;
  defaultLevel?: ToastLevel;
  defaultToasting?: boolean;
  idleTitle?: string;
  level?: ToastLevel;
  onLevelChange?: (level: ToastLevel) => void;
  onToast: (
    cycle: ToastCycle
  ) => ToastOutcome | void | Promise<ToastOutcome | void>;
  onToastingChange?: (toasting: boolean) => void;
  toaster: ToastQueue<ReactNode>;
  toasting?: boolean;
  toastingTitle?: string;
}

function Toast({
  canToast,
  defaultLevel = 3,
  defaultToasting = false,
  idleTitle = "Plain bread, ready to toast",
  level: levelProp,
  onLevelChange,
  onToast,
  onToastingChange,
  toaster,
  toasting: toastingProp,
  toastingTitle = "Toasting…",
  ...props
}: ToastProps) {
  const [uncontrolledLevel, setUncontrolledLevel] = useState(defaultLevel);
  const level = levelProp ?? uncontrolledLevel;
  const wanted = toastingProp ?? defaultToasting;
  const [lever, setLever] = useState(LEVER_UP);
  const [toasting, setToasting] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [events] = useState(createToastEvents);
  const [stage] = useState(() => createStage(level, events.emit));
  const [leverMoves] = useState(() => createLeverMoves(events.emit));
  const { rig } = stage;
  const busy = useRef(false);
  const alive = useRef(true);
  // Bumped when the toaster unmounts, so a cycle cut short there ends quietly
  // and one started on the next mount (React's StrictMode remounts) runs.
  const cycle = useRef(0);
  const slice = useRef<Slice | null>(null);
  const stopPressed = useRef(false);
  const release = useRef<(() => void) | null>(null);

  const shownOf = (id: string | undefined): Shown | undefined => {
    const found = toaster.toasts().find((each) => each.id === id);
    return (
      found && {
        description: found.description,
        title: found.title,
        type: found.type,
      }
    );
  };

  const brandSlice = useStableEvent(() => {
    stage.brand(brandOf(shownOf(slice.current?.id)));
  });

  const reportToasting = useStableEvent((next: boolean) => {
    if (next !== (toastingProp ?? toasting)) {
      onToastingChange?.(next);
    }
  });

  const takeOut = (id: string, reason: ToastDismissReason) => {
    if (slice.current?.id !== id) {
      return;
    }
    slice.current = null;
    rig.removeSlice(reason === "swipe" ? "up" : "down");
    if (!alive.current) {
      return;
    }
    events.emit({ type: "slice-out" });
    setEmpty(true);
  };

  const onSliceDismiss =
    (id: () => string) => (details: ToastDismissDetails) => {
      const holding =
        alive.current &&
        (details.reason === "timeout" ||
          (busy.current && slice.current?.id === id()));
      if (holding) {
        details.cancel();
        return;
      }
      takeOut(id(), details.reason);
    };

  const addSlice = (type: "default" | "loading") => {
    let id = "";
    id = toaster({
      duration: Number.POSITIVE_INFINITY,
      onDismiss: onSliceDismiss(() => id),
      title: type === "loading" ? toastingTitle : idleTitle,
      type,
    });
    const fresh: Slice = { browning: 0, id };
    slice.current = fresh;
    brandSlice();
    return fresh;
  };

  const dropFreshSlice = useStableEvent(() => {
    setEmpty(false);
    if (slice.current || busy.current) {
      return;
    }
    addSlice("default");
    rig.dropSlice(0);
    events.emit({ type: "slice-in" });
  });

  useEffect(() => {
    if (!empty) {
      return;
    }
    const timer = setTimeout(dropFreshSlice, NEXT_SLICE_MS);
    return () => clearTimeout(timer);
  }, [dropFreshSlice, empty]);

  const placeFirstSlice = useStableEvent(() => {
    addSlice("default");
    rig.placeSlice(0);
  });

  useEffect(() => {
    alive.current = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const follow = () => rig.setReducedMotion(motion.matches);
    follow();
    motion.addEventListener("change", follow);
    placeFirstSlice();
    return () => {
      alive.current = false;
      cycle.current += 1;
      busy.current = false;
      motion.removeEventListener("change", follow);
      release.current?.();
      if (slice.current) {
        toaster.dismiss(slice.current.id);
      }
      leverMoves.dispose();
      rig.dispose();
    };
  }, [leverMoves, placeFirstSlice, rig, toaster]);

  useEffect(() => toaster.subscribe(brandSlice), [brandSlice, toaster]);

  useEffect(() => {
    rig.setDial(DIAL_ANGLES[level - 1]);
  }, [level, rig]);

  const loadSlice = () => {
    const { current } = slice;
    const loading = {
      duration: Number.POSITIVE_INFINITY,
      title: toastingTitle,
      type: "loading",
    } as const;
    if (current && toaster.update(current.id, loading)) {
      return current;
    }
    const fresh = addSlice("loading");
    rig.insertSlice(0);
    events.emit({ type: "slice-in" });
    return fresh;
  };

  const springBack = () => {
    setLever(LEVER_UP);
    stage.hold(LEVER_UP);
    rig.releaseLever();
  };

  const settle = (id: string, settled: Settled, before: Shown) => {
    let outcome: ToastOptions<ReactNode> | null = null;
    if ("error" in settled) {
      outcome = { title: messageOf(settled.error), type: "error" };
    } else if (typeof settled.value === "string") {
      outcome = { title: settled.value, type: "success" };
    } else if (settled.value) {
      outcome = { type: "success", ...settled.value };
    } else if (shownOf(id)?.type === "loading") {
      outcome = before;
    }
    if (outcome) {
      toaster.update(id, { ...outcome, duration: Number.POSITIVE_INFINITY });
    }
  };

  const toast = async () => {
    if (busy.current) {
      return;
    }
    if (canToast && !canToast()) {
      springBack();
      reportToasting(false);
      return;
    }
    busy.current = true;
    const mine = cycle.current;
    reportToasting(true);
    setEmpty(false);
    setToasting(true);
    setLever(LEVER_DOWN);
    stage.hold(LEVER_DOWN);
    rig.catchLever();
    rig.setHeat(true);
    const before = shownOf(slice.current?.id) ?? {
      title: idleTitle,
      type: "default",
    };
    const current = loadSlice();
    brandSlice();

    const setting = level;
    const browning = Math.min(1, current.browning + BROWNING_ADDED[setting]);
    const controller = new AbortController();
    let timer = 0;
    const stopped = new Promise<typeof STOPPED>((resolve) => {
      release.current = () => resolve(STOPPED);
    });
    const minimum = new Promise<void>((resolve) => {
      timer = window.setTimeout(resolve, TOASTING_MS[setting]);
    });
    const work = (async (): Promise<Settled> => {
      try {
        return {
          value: await onToast({
            browning,
            burnt: browning >= BURNT_AT,
            id: current.id,
            level: setting,
            signal: controller.signal,
          }),
        };
      } catch (error) {
        return { error };
      }
    })();
    events.emit({ durationMs: TOASTING_MS[setting], type: "toasting-start" });
    const result = await Promise.race([
      stopped,
      Promise.all([minimum, work]).then(([, settled]) => settled),
    ]);
    clearTimeout(timer);
    if (result === STOPPED) {
      controller.abort();
    }
    if (!alive.current || cycle.current !== mine) {
      return;
    }
    release.current = null;
    events.emit({ stopped: result === STOPPED, type: "toasting-end" });
    if (result === STOPPED) {
      toaster.update(current.id, {
        ...before,
        duration: Number.POSITIVE_INFINITY,
      });
    } else {
      current.browning = browning;
      settle(current.id, result, before);
    }
    rig.setBrowning(current.browning);
    brandSlice();

    busy.current = false;
    reportToasting(false);
    setToasting(false);
    setLever(LEVER_UP);
    stage.hold(LEVER_UP);
    rig.setHeat(false);
    rig.releaseLever();
    events.emit({ type: "pop" });
  };

  const follow = useStableEvent((next: boolean) => {
    if (next && !busy.current) {
      void toast();
    } else if (!next) {
      release.current?.();
    }
  });

  useEffect(() => {
    follow(wanted);
  }, [follow, wanted]);

  const context: ToastContextValue = {
    events,
    letGo: (height) => {
      if (busy.current) {
        return;
      }
      if (height <= LEVER_CATCH) {
        void toast();
        return;
      }
      springBack();
    },
    level,
    lever,
    moveLever: (height) => {
      setLever(height);
      stage.hold(height);
      rig.holdLever(travelOf(height));
      leverMoves.move(height);
    },
    pressStop: (pressed) => {
      rig.setStop(pressed);
      if (stopPressed.current === pressed) {
        return;
      }
      stopPressed.current = pressed;
      events.emit({ type: pressed ? "stop-down" : "stop-up" });
    },
    push: () => {
      void toast();
    },
    stage,
    stop: () => {
      release.current?.();
    },
    toaster,
    toasting,
    turnDial: (next) => {
      if (next !== level) {
        events.emit({ level: next, type: "dial-step" });
      }
      setUncontrolledLevel(next);
      onLevelChange?.(next);
    },
  };

  return (
    <ToastContext value={context}>
      <div
        data-slot="literal-toast"
        data-toasting={toasting ? "" : undefined}
        {...props}
      />
    </ToastContext>
  );
}

function startScene(
  canvas: HTMLCanvasElement,
  frame: HTMLElement,
  hooks: {
    onLost: () => void;
    onReady: (scene: ToastScene) => void;
    onUnavailable: () => void;
  }
) {
  let disposed = false;
  let scene: ToastScene | null = null;

  const fit = () => {
    const width = frame.clientWidth;
    scene?.setSize(width, (width * (FRAME.height + HEADROOM)) / FRAME.width);
  };
  const resize = new ResizeObserver(() => {
    if (scene) {
      fit();
      hooks.onReady(scene);
    }
  });

  const load = async () => {
    try {
      if (!webglAvailable()) {
        hooks.onUnavailable();
        return;
      }
      const { createToastScene } = await import("./toast-scene");
      if (disposed) {
        return;
      }
      const made = await createToastScene(canvas, {
        onContextLost: () => {
          scene = null;
          hooks.onLost();
        },
      });
      if (disposed) {
        made.dispose();
        return;
      }
      scene = made;
      fit();
      resize.observe(frame);
      hooks.onReady(made);
    } catch {
      if (!disposed) {
        hooks.onUnavailable();
      }
    }
  };
  void load();

  return () => {
    disposed = true;
    resize.disconnect();
    scene?.dispose();
    scene = null;
  };
}

function ToastCanvas({
  onLost,
  onReady,
  onRestored,
  onUnavailable,
}: {
  onLost: () => void;
  onReady: (scene: ToastScene) => void;
  onRestored: () => void;
  onUnavailable: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const frame = element?.parentElement;
    if (!element || !frame) {
      return;
    }
    element.addEventListener("webglcontextrestored", onRestored);
    const stop = startScene(element, frame, { onLost, onReady, onUnavailable });
    return () => {
      element.removeEventListener("webglcontextrestored", onRestored);
      stop();
    };
  }, [onLost, onReady, onRestored, onUnavailable]);
  return (
    <canvas aria-hidden="true" data-slot="literal-toast-canvas" ref={canvas} />
  );
}

const FRAME_BOXES = {
  "--body-h": BODY.h,
  "--body-w": BODY.w,
  "--body-x": BODY.x,
  "--body-y": BODY.y,
  "--dial-r": DIAL.r,
  "--dial-x": DIAL.x,
  "--dial-y": DIAL.y,
  "--frame-h": FRAME.height,
  "--frame-w": FRAME.width,
  "--headroom": HEADROOM,
  "--lever-h": LEVER.h,
  "--lever-travel": LEVER.travel,
  "--lever-w": LEVER.w,
  "--lever-x": LEVER.x,
  "--lever-y": LEVER.y,
  "--lip": LIP_Y,
  "--slice-h": SLICE.h,
  "--slice-w": SLICE.w,
  "--slice-x": SLICE.x,
  "--slice-y": SLICE.y,
  "--stop-r": STOP.r,
  "--stop-x": STOP.x,
  "--stop-y": STOP.y,
};

function ToastStage({ children, ...props }: ComponentProps<"div">) {
  const { stage, toasting } = useToastContext();
  const { rig } = stage;
  const [view, setView] = useState<ToastView>("poster");
  const [generation, setGeneration] = useState(0);
  const [poster, setPoster] = useState<string | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const anchor = `--literal-${useId().replaceAll(UNSAFE_ANCHOR, "")}`;

  useEffect(() => {
    let current = true;
    void import("./toast-poster").then(({ toastPoster }) => {
      if (current) {
        setPoster(toastPoster);
      }
    });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    const element = frame.current;
    stage.attach(element);
    if (!element) {
      return;
    }
    const observer = new MutationObserver((records) => {
      for (const { target } of records) {
        if (
          target instanceof HTMLElement &&
          target.dataset.slot === "toast" &&
          !Object.hasOwn(target.dataset, "endingStyle")
        ) {
          const pulled =
            Number(
              target.style.getPropertyValue("--toast-swipe-y").replace("px", "")
            ) || 0;
          const unit = element.clientWidth / FRAME.width;
          rig.setLift(
            Object.hasOwn(target.dataset, "swiping")
              ? Math.max(0, -pulled) / unit / SLICE_UNITS_PER_METRE
              : null
          );
        }
      }
    });
    observer.observe(element, {
      attributeFilter: ["data-swiping", "style"],
      attributes: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
      stage.attach(null);
    };
  }, [rig, stage]);

  const onLost = useCallback(() => {
    stage.show(null);
    setView("poster");
  }, [stage]);
  const onReady = useCallback(
    (scene: ToastScene) => {
      stage.show(scene);
      setView("live");
    },
    [stage]
  );
  const onRestored = useCallback(() => setGeneration((each) => each + 1), []);
  const onUnavailable = useCallback(() => setView("static"), []);

  return (
    <div
      data-slot="literal-toast-stage"
      data-toasting={toasting ? "" : undefined}
      data-view={view}
      {...mergeProps(
        {
          onKeyDownCapture: (event: KeyboardEvent<HTMLDivElement>) => {
            event.currentTarget.dataset.keyboard = "";
          },
          onPointerDownCapture: (event: PointerEvent<HTMLDivElement>) => {
            delete event.currentTarget.dataset.keyboard;
          },
          ref: frame,
          style: {
            ...FRAME_BOXES,
            "--literal-anchor": anchor,
          } as CSSProperties,
        },
        props
      )}
    >
      {poster && (
        <img
          alt=""
          data-slot="literal-toast-poster"
          decoding="async"
          height={FRAME.height}
          src={poster}
          width={FRAME.width}
        />
      )}
      <ToastCanvas
        key={generation}
        onLost={onLost}
        onReady={onReady}
        onRestored={onRestored}
        onUnavailable={onUnavailable}
      />
      <span aria-hidden="true" data-slot="literal-toast-body" />
      {children}
    </div>
  );
}

function ToastRegion(
  props: Omit<ToastRegionProps, "children" | "container" | "toaster">
) {
  const { toaster } = useToastContext();
  return (
    <SdkToastRegion
      align="center"
      data-literal-toast="region"
      side="top"
      toaster={toaster}
      {...props}
    >
      {() => (
        <SdkToast>
          <ToastTitle />
          <span aria-hidden="true" data-slot="literal-toast-smoke">
            <span />
            <span />
            <span />
          </span>
        </SdkToast>
      )}
    </SdkToastRegion>
  );
}

type SliderPartProps = Omit<
  Parameters<typeof Slider<number>>[0],
  "children" | "defaultValue" | "max" | "min" | "orientation" | "step" | "value"
>;

function ToastDial({
  "aria-label": label = "Browning",
  ...props
}: SliderPartProps) {
  const { level, turnDial } = useToastContext();

  const grip = (event: PointerEvent<HTMLElement>) => {
    const track = trackOf(event.currentTarget);
    if (!track) {
      return;
    }
    track.style.removeProperty("translate");
    const { bottom, height } = track.getBoundingClientRect();
    const turn = (level - PALEST) / (DARKEST - PALEST);
    track.style.translate = `0 ${event.clientY + turn * height - bottom}px`;
  };

  return (
    <Slider<number>
      data-literal-toast="dial"
      max={DARKEST}
      min={PALEST}
      orientation="vertical"
      step={1}
      value={level}
      {...mergeProps(
        {
          onPointerDown: (event: PointerEvent<HTMLElement>) => {
            trackOf(event.currentTarget)?.style.removeProperty("translate");
          },
          onPointerDownCapture: grip,
          onValueChange: (value: number) => {
            if (isLevel(value)) {
              turnDial(value);
            }
          },
        },
        props
      )}
    >
      <SliderControl>
        <SliderTrack>
          <SliderThumb aria-label={label} />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}

function ToastLever({
  "aria-label": label = "Lever",
  ...props
}: Omit<SliderPartProps, "onValueChange" | "onValueCommit">) {
  const { letGo, lever, moveLever, push, toasting } = useToastContext();
  return (
    <Slider<number>
      data-literal-toast="lever"
      max={LEVER_UP}
      min={LEVER_DOWN}
      onValueChange={moveLever}
      onValueCommit={letGo}
      orientation="vertical"
      readOnly={toasting}
      step={1}
      value={lever}
      {...mergeProps(
        {
          onKeyDownCapture: (event: KeyboardEvent<HTMLElement>) => {
            if (LATCH_KEYS.has(event.key)) {
              event.preventDefault();
              push();
            }
          },
        },
        props
      )}
    >
      <SliderControl>
        <SliderTrack>
          <SliderThumb aria-label={label} />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}

function ToastStop(props: ComponentProps<typeof Button>) {
  const { pressStop, stop } = useToastContext();
  return (
    <Button
      {...mergeProps(
        {
          "aria-label": "Stop",
          "data-literal-toast": "stop",
          onBlur: () => pressStop(false),
          onClick: stop,
          onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
            if (PRESS_KEYS.has(event.key)) {
              pressStop(true);
            }
          },
          onKeyUp: () => pressStop(false),
          onPointerCancel: () => pressStop(false),
          onPointerDown: () => pressStop(true),
          onPointerLeave: () => pressStop(false),
          onPointerUp: () => pressStop(false),
        },
        props
      )}
    />
  );
}

export {
  Toast,
  ToastDial,
  ToastLever,
  ToastRegion,
  ToastStage,
  ToastStop,
  useToastEvents,
};
export type { ToastCycle, ToastEvent, ToastLevel, ToastOutcome, ToastProps };

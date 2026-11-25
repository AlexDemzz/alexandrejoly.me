"use client";

import {
  Carousel as SdkCarousel,
  CarouselContent as SdkCarouselContent,
  CarouselItem as SdkCarouselItem,
  CarouselNext as SdkCarouselNext,
  CarouselPlayToggle as SdkCarouselPlayToggle,
  CarouselPrevious as SdkCarouselPrevious,
  CarouselViewport,
  createCarouselController,
} from "@ui-sdk/react/carousel";
import type {
  CarouselController,
  CarouselPageChangeReason,
} from "@ui-sdk/react/carousel";
import { mergeProps } from "@ui-sdk/react/primitive";
import {
  Slider,
  SliderControl,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import {
  createContext,
  use,
  useCallback,
  useEffect,
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

import { createCarouselEvents } from "./carousel-events";
import type { CarouselEvent, CarouselEvents } from "./carousel-events";
import {
  FOCUS,
  FORWARD,
  FRAME,
  PICTURE,
  REVERSE,
  TIMER,
  TRAY,
} from "./carousel-frame";
import { createRig } from "./carousel-rig";
import type { Pose } from "./carousel-rig";
import type { CarouselScene } from "./carousel-scene";

import "./carousel.css";

type CarouselView = "live" | "poster" | "static";
type CarouselKey = "forward" | "reverse";

const FOCUS_MIN = 0;
const FOCUS_MAX = 100;
const FOCUS_SHARP = 50;
const BLUR_AT_END = 26;
const REST_FALLBACK_MS = 900;
const BLANK_HOLD_MS = 64;
const PRESS_KEYS = new Set(["Enter", " "]);
const FORWARD_REASONS = new Set<CarouselPageChangeReason>([
  "next-press",
  "timeout",
]);

const focusOf = (value: number) => (value - FOCUS_SHARP) / FOCUS_SHARP;

const trackOf = (element: HTMLElement) =>
  element.querySelector<HTMLElement>('[data-slot="slider-track"]');

const webglAvailable = () => {
  const probe = document.createElement("canvas").getContext("webgl2");
  probe?.getExtension("WEBGL_lose_context")?.loseContext();
  return probe !== null;
};

const slotsBetween = (
  from: number,
  to: number,
  count: number,
  reason: CarouselPageChangeReason | null
) => {
  const direct = to - from;
  const round = reason !== null && FORWARD_REASONS.has(reason);
  const back = reason === "previous-press";
  const wrapsOn = count > 2 && direct === 1 - count;
  const wrapsBack = count > 2 && direct === count - 1;
  if (direct < 0 && (round || (wrapsOn && !back))) {
    return direct + TRAY.slots;
  }
  if (direct > 0 && (back || (wrapsBack && !round))) {
    return direct - TRAY.slots;
  }
  return direct;
};

function useStableEvent<Args extends unknown[], Result>(
  handler: (...args: Args) => Result
) {
  const latest = useRef(handler);
  useLayoutEffect(() => {
    latest.current = handler;
  });
  return useCallback((...args: Args) => latest.current(...args), []);
}

function createStage(focus: number, emit: CarouselEvents["emit"]) {
  let scene: CarouselScene | null = null;
  let screen: HTMLElement | null = null;
  let frame: HTMLElement | null = null;
  let film: HTMLElement | null = null;
  let slides = 0;
  let painted = { blur: -1, shutter: -1 };
  let blanked = 0;
  const paint = (pose: Pose) => {
    if (!screen) {
      return;
    }
    const blur = Math.abs(pose.focus);
    const shutter = blanked === 0 ? pose.shutter : 1;
    film ??= screen.querySelector<HTMLElement>(
      '[data-slot="carousel-viewport"]'
    );
    if (film && shutter !== painted.shutter) {
      film.style.opacity = String(1 - shutter);
      frame?.style.setProperty("--film", String(1 - shutter));
    }
    if (blur !== painted.blur) {
      screen.style.filter =
        blur === 0 ? "" : `blur(calc(${blur * BLUR_AT_END} * var(--u)))`;
    }
    painted = { blur, shutter };
  };
  const rig = createRig(
    (pose: Pose) => {
      scene?.render(pose);
      paint(pose);
    },
    { emit, focus }
  );
  return {
    attach: (element: HTMLElement | null) => {
      frame?.style.removeProperty("--film");
      screen = element;
      frame =
        element?.closest<HTMLElement>('[data-slot="literal-carousel-stage"]') ??
        element;
      film = null;
      painted = { blur: -1, shutter: -1 };
      paint(rig.pose);
    },
    blank: () => {
      clearTimeout(blanked);
      blanked = window.setTimeout(() => {
        blanked = 0;
        rig.invalidate();
      }, BLANK_HOLD_MS);
      paint(rig.pose);
    },
    count: (next: number) => {
      slides = next;
      scene?.setSlides(next);
      rig.invalidate();
    },
    rig,
    show: (next: CarouselScene | null) => {
      scene = next;
      next?.setSlides(slides);
      next?.render(rig.pose);
    },
  };
}

type StageController = ReturnType<typeof createStage>;

type SdkCarouselProps = ComponentProps<typeof SdkCarousel>;

type CarouselPassed = Pick<
  SdkCarouselProps,
  | "defaultPage"
  | "defaultPlaying"
  | "interval"
  | "onPageChange"
  | "onPageChangeComplete"
  | "onPlayingChange"
  | "page"
  | "playing"
>;

interface CarouselContextValue {
  carousel: CarouselPassed;
  controller: CarouselController;
  events: CarouselEvents;
  focus: number;
  playing: boolean;
  pressKey: (key: CarouselKey, pressed: boolean) => void;
  round: (direction: 1 | -1) => void;
  setFocus: (focus: number, held: boolean) => void;
  stage: StageController;
  sync: (state: {
    page: number;
    pageCount: number | null;
    playing: boolean;
  }) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarouselContext() {
  const context = use(CarouselContext);
  if (!context) {
    throw new Error("Carousel parts must be used within a Carousel component");
  }
  return context;
}

function useCarouselEvents(): Pick<CarouselEvents, "subscribe"> {
  const { events } = useCarouselContext();
  return { subscribe: events.subscribe };
}

interface CarouselProps extends ComponentProps<"div">, CarouselPassed {
  defaultFocus?: number;
  focus?: number;
  onFocusChange?: (focus: number) => void;
}

function Carousel({
  defaultFocus = FOCUS_SHARP,
  defaultPage,
  defaultPlaying,
  focus: focusProp,
  interval,
  onFocusChange,
  onPageChange,
  onPageChangeComplete,
  onPlayingChange,
  page,
  playing: playingProp,
  ...props
}: CarouselProps) {
  const [uncontrolledFocus, setUncontrolledFocus] = useState(defaultFocus);
  const focus = focusProp ?? uncontrolledFocus;
  const [playing, setPlaying] = useState(false);
  const [controller] = useState(createCarouselController);
  const [events] = useState(createCarouselEvents);
  const [stage] = useState(() => createStage(focusOf(focus), events.emit));
  const { rig } = stage;
  const shown = useRef<number | null>(null);
  const turns = useRef(0);
  const count = useRef(0);
  const reason = useRef<CarouselPageChangeReason | null>(null);
  const rested = useRef<number | null>(null);
  const pressed = useRef<Record<CarouselKey, boolean>>({
    forward: false,
    reverse: false,
  });
  const fallback = useRef(0);
  const held = useRef(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const follow = () => rig.setReducedMotion(motion.matches);
    follow();
    motion.addEventListener("change", follow);
    return () => {
      motion.removeEventListener("change", follow);
      clearTimeout(fallback.current);
      rig.dispose();
    };
  }, [rig]);

  useEffect(() => {
    if (!held.current) {
      rig.setFocus(focusOf(focus));
    }
  }, [focus, rig]);

  const turnTo = (next: number) => {
    if (shown.current === null) {
      shown.current = next;
      turns.current = next - 1;
      rig.place(turns.current);
      return;
    }
    if (shown.current === next) {
      return;
    }
    turns.current += slotsBetween(
      shown.current,
      next,
      count.current,
      reason.current
    );
    shown.current = next;
    reason.current = null;
    clearTimeout(fallback.current);
    const atRest = rested.current === next;
    rig.setReady(atRest);
    if (!atRest) {
      fallback.current = window.setTimeout(
        () => rig.setReady(true),
        REST_FALLBACK_MS
      );
    }
    rig.goTo(turns.current);
  };

  const context: CarouselContextValue = {
    carousel: {
      defaultPage,
      defaultPlaying,
      interval,
      onPageChange: (next, details) => {
        reason.current = details.reason;
        rested.current = null;
        stage.blank();
        onPageChange?.(next, details);
      },
      onPageChangeComplete: (at) => {
        rested.current = at;
        if (shown.current === at) {
          clearTimeout(fallback.current);
          rig.setReady(true);
        }
        onPageChangeComplete?.(at);
      },
      onPlayingChange,
      page,
      playing: playingProp,
    },
    controller,
    events,
    focus,
    playing,
    pressKey: (key, down) => {
      rig.setKey(key, down);
      if (pressed.current[key] === down) {
        return;
      }
      pressed.current[key] = down;
      events.emit({ key, type: down ? "key-down" : "key-up" });
    },
    round: (direction) => {
      if (count.current !== 1 || shown.current === null) {
        return;
      }
      turns.current += direction * TRAY.slots;
      clearTimeout(fallback.current);
      rig.setReady(true);
      rig.goTo(turns.current);
    },
    setFocus: (next, byHand) => {
      held.current = byHand;
      if (byHand) {
        rig.holdFocus(focusOf(next));
      } else {
        rig.releaseFocus();
        rig.setFocus(focusOf(next));
      }
      if (next !== focus) {
        setUncontrolledFocus(next);
        onFocusChange?.(next);
      }
    },
    stage,
    sync: (state) => {
      if (state.pageCount !== null && state.pageCount !== count.current) {
        count.current = state.pageCount;
        stage.count(state.pageCount);
      }
      turnTo(state.page);
      if (state.playing !== playing) {
        rig.setTimer(state.playing);
        events.emit({ on: state.playing, type: "timer" });
        setPlaying(state.playing);
      }
    },
  };

  return (
    <CarouselContext value={context}>
      <div
        data-playing={playing ? "" : undefined}
        data-slot="literal-carousel"
        {...props}
      />
    </CarouselContext>
  );
}

function startScene(
  canvas: HTMLCanvasElement,
  frame: HTMLElement,
  hooks: {
    onLost: () => void;
    onReady: (scene: CarouselScene) => void;
    onUnavailable: () => void;
  }
) {
  let disposed = false;
  let scene: CarouselScene | null = null;

  const fit = () => {
    const width = frame.clientWidth;
    scene?.setSize(width, (width * FRAME.height) / FRAME.width);
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
      const { createCarouselScene } = await import("./carousel-scene");
      if (disposed) {
        return;
      }
      const made = await createCarouselScene(canvas, {
        dim: dimLighting(frame),
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

function CarouselCanvas({
  onLost,
  onReady,
  onRestored,
  onUnavailable,
}: {
  onLost: () => void;
  onReady: (scene: CarouselScene) => void;
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
    <canvas
      aria-hidden="true"
      data-slot="literal-carousel-canvas"
      ref={canvas}
    />
  );
}

const FRAME_BOXES = {
  "--focus-h": FOCUS.h,
  "--focus-w": FOCUS.w,
  "--focus-x": FOCUS.x,
  "--focus-y": FOCUS.y,
  "--forward-h": FORWARD.h,
  "--forward-w": FORWARD.w,
  "--forward-x": FORWARD.x,
  "--forward-y": FORWARD.y,
  "--frame-h": FRAME.height,
  "--frame-w": FRAME.width,
  "--picture-h": PICTURE.h,
  "--picture-w": PICTURE.w,
  "--picture-x": PICTURE.x,
  "--picture-y": PICTURE.y,
  "--reverse-h": REVERSE.h,
  "--reverse-w": REVERSE.w,
  "--reverse-x": REVERSE.x,
  "--reverse-y": REVERSE.y,
  "--timer-h": TIMER.h,
  "--timer-w": TIMER.w,
  "--timer-x": TIMER.x,
  "--timer-y": TIMER.y,
};

const dimLighting = (element: Element) =>
  getComputedStyle(element).getPropertyValue("--literal-lighting").trim() ===
  "dim";

const loadPoster = async (dim: boolean) => {
  if (dim) {
    const { carouselPosterDim } = await import("./carousel-poster-dim");
    return carouselPosterDim;
  }
  const { carouselPoster } = await import("./carousel-poster");
  return carouselPoster;
};

function CarouselStage({ children, ...props }: ComponentProps<"div">) {
  const { stage } = useCarouselContext();
  const [view, setView] = useState<CarouselView>("poster");
  const [generation, setGeneration] = useState(0);
  const [poster, setPoster] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) {
      return;
    }
    let current = true;
    const show = async () => {
      const loaded = await loadPoster(dimLighting(element));
      if (current) {
        setPoster(loaded);
      }
    };
    void show();
    return () => {
      current = false;
    };
  }, []);

  const onLost = useCallback(() => {
    stage.show(null);
    setView("poster");
  }, [stage]);
  const onReady = useCallback(
    (scene: CarouselScene) => {
      stage.show(scene);
      setView("live");
    },
    [stage]
  );
  const onRestored = useCallback(() => setGeneration((each) => each + 1), []);
  const onUnavailable = useCallback(() => setView("static"), []);

  return (
    <div
      data-slot="literal-carousel-stage"
      data-view={view}
      {...mergeProps(
        {
          onKeyDownCapture: (event: KeyboardEvent<HTMLDivElement>) => {
            event.currentTarget.dataset.keyboard = "";
          },
          onPointerDownCapture: (event: PointerEvent<HTMLDivElement>) => {
            delete event.currentTarget.dataset.keyboard;
          },
          ref: root,
          style: FRAME_BOXES as CSSProperties,
        },
        props
      )}
    >
      {poster && (
        <img
          alt=""
          data-slot="literal-carousel-poster"
          decoding="async"
          height={FRAME.height}
          src={poster}
          width={FRAME.width}
        />
      )}
      <CarouselCanvas
        key={generation}
        onLost={onLost}
        onReady={onReady}
        onRestored={onRestored}
        onUnavailable={onUnavailable}
      />
      {children}
    </div>
  );
}

function CarouselSync(state: {
  page: number;
  pageCount: number | null;
  playing: boolean;
}) {
  const { sync } = useCarouselContext();
  const follow = useStableEvent(sync);
  const { page, pageCount, playing } = state;
  useEffect(() => {
    follow({ page, pageCount, playing });
  }, [follow, page, pageCount, playing]);
  return null;
}

function CarouselContent({
  children,
  ...props
}: Omit<
  SdkCarouselProps,
  | "align"
  | "children"
  | "controller"
  | "drag"
  | "dragFree"
  | "loop"
  | "orientation"
  | "skipSnaps"
  | "slidesPerPage"
  | keyof CarouselPassed
> & { children?: ReactNode }) {
  const { carousel, controller, stage } = useCarouselContext();
  const attach = useCallback(
    (element: HTMLDivElement | null) => {
      stage.attach(element);
      return () => stage.attach(null);
    },
    [stage]
  );
  return (
    <SdkCarousel
      controller={controller}
      data-literal-carousel="content"
      drag={false}
      loop
      {...carousel}
      {...mergeProps({ ref: attach }, props)}
    >
      {(state) => (
        <>
          <CarouselSync
            page={state.page}
            pageCount={state.pageCount}
            playing={state.playing}
          />
          <CarouselViewport>
            <SdkCarouselContent>{children}</SdkCarouselContent>
          </CarouselViewport>
        </>
      )}
    </SdkCarousel>
  );
}

function CarouselItem(props: ComponentProps<typeof SdkCarouselItem>) {
  return <SdkCarouselItem data-literal-carousel="item" {...props} />;
}

function usePress(key: CarouselKey) {
  const { pressKey } = useCarouselContext();
  return {
    onBlur: () => pressKey(key, false),
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (PRESS_KEYS.has(event.key)) {
        pressKey(key, true);
      }
    },
    onKeyUp: () => pressKey(key, false),
    onPointerCancel: () => pressKey(key, false),
    onPointerDown: () => pressKey(key, true),
    onPointerLeave: () => pressKey(key, false),
    onPointerUp: () => pressKey(key, false),
  };
}

function CarouselNext(props: ComponentProps<typeof SdkCarouselNext>) {
  const { controller, round } = useCarouselContext();
  const press = usePress("forward");
  return (
    <SdkCarouselNext
      controller={controller}
      {...mergeProps(
        {
          "aria-label": "Next slide",
          "data-literal-carousel": "next",
          onClick: () => round(1),
          ...press,
        },
        props
      )}
    />
  );
}

function CarouselPrevious(props: ComponentProps<typeof SdkCarouselPrevious>) {
  const { controller, round } = useCarouselContext();
  const press = usePress("reverse");
  return (
    <SdkCarouselPrevious
      controller={controller}
      {...mergeProps(
        {
          "aria-label": "Previous slide",
          "data-literal-carousel": "previous",
          onClick: () => round(-1),
          ...press,
        },
        props
      )}
    />
  );
}

function CarouselPlayToggle({
  startLabel = "Start the timer",
  stopLabel = "Stop the timer",
  ...props
}: ComponentProps<typeof SdkCarouselPlayToggle> & {
  startLabel?: string;
  stopLabel?: string;
}) {
  const { controller, playing } = useCarouselContext();
  return (
    <SdkCarouselPlayToggle
      aria-label={playing ? stopLabel : startLabel}
      controller={controller}
      data-literal-carousel="play-toggle"
      {...props}
    />
  );
}

type SliderPartProps = Omit<
  Parameters<typeof Slider<number>>[0],
  | "children"
  | "defaultValue"
  | "max"
  | "min"
  | "onValueChange"
  | "onValueCommit"
  | "orientation"
  | "value"
>;

function CarouselFocus({
  "aria-label": label = "Focus",
  ...props
}: SliderPartProps) {
  const { focus, setFocus } = useCarouselContext();
  const dragging = useRef(false);

  const grip = (event: PointerEvent<HTMLElement>) => {
    dragging.current = true;
    const track = trackOf(event.currentTarget);
    if (!track) {
      return;
    }
    track.style.removeProperty("translate");
    const { bottom, height } = track.getBoundingClientRect();
    const turn = (focus - FOCUS_MIN) / (FOCUS_MAX - FOCUS_MIN);
    track.style.translate = `0 ${event.clientY + turn * height - bottom}px`;
  };

  return (
    <Slider<number>
      data-literal-carousel="focus"
      max={FOCUS_MAX}
      min={FOCUS_MIN}
      onValueChange={(value: number) => setFocus(value, dragging.current)}
      onValueCommit={(value: number) => {
        dragging.current = false;
        setFocus(value, false);
      }}
      orientation="vertical"
      value={focus}
      {...mergeProps(
        {
          onPointerDown: (event: PointerEvent<HTMLElement>) => {
            trackOf(event.currentTarget)?.style.removeProperty("translate");
          },
          onPointerDownCapture: grip,
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

export {
  Carousel,
  CarouselFocus,
  CarouselNext,
  CarouselPrevious,
  CarouselContent,
  CarouselItem,
  CarouselStage,
  CarouselPlayToggle,
  useCarouselEvents,
};
export type { CarouselEvent, CarouselProps };

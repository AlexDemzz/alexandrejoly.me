"use client";

import { Button } from "@ui-sdk/react/button";
import { mergeProps } from "@ui-sdk/react/primitive";
import {
  Radio as SdkRadio,
  RadioGroup as SdkRadioGroup,
  createRadioGroupController,
} from "@ui-sdk/react/radio";
import type { RadioGroupController } from "@ui-sdk/react/radio";
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

import { createRadioEvents } from "./radio-events";
import type {
  RadioEvent,
  RadioEvents,
  RadioState,
  RadioStation,
} from "./radio-events";
import {
  FRAME,
  KEY_ROW,
  LABELS,
  MAX_BANDS,
  TUNING,
  VOLUME,
} from "./radio-frame";
import { createRig } from "./radio-rig";
import type { Pose } from "./radio-rig";
import type { RadioScene } from "./radio-scene";

import "./radio.css";

type RadioView = "live" | "poster" | "static";
type RadioKnob = "tuning" | "volume";

const KNOB_MIN = 0;
const KNOB_MAX = 100;
const DEFAULT_VOLUME = 35;
const DEFAULT_TUNING = 50;
const DEFAULT_POSITION = 50;
const TUNING_STEP = 0.5;
const TUNING_LARGE_STEP = 5;
const OFF_KEY = 0;
const PRESS_KEYS = new Set(["Enter", " "]);
const ITEM = '[data-literal-radio="item"]';

const turnOf = (value: number) => (value - KNOB_MIN) / (KNOB_MAX - KNOB_MIN);

const trackOf = (element: HTMLElement) =>
  element.querySelector<HTMLElement>('[data-slot="slider-track"]');

const webglAvailable = () => {
  const probe = document.createElement("canvas").getContext("webgl2");
  probe?.getExtension("WEBGL_lose_context")?.loseContext();
  return probe !== null;
};

const itemsOf = (group: Element | null) => [
  ...(group?.querySelectorAll<HTMLElement>(ITEM) ?? []),
];

const bandOf = (group: Element | null, item: Element | null) => {
  const index = item ? itemsOf(group).indexOf(item as HTMLElement) : -1;
  return index >= 0 && index < MAX_BANDS ? index : null;
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

function createStage(
  knobs: Record<RadioKnob, number>,
  emit: RadioEvents["emit"]
) {
  let scene: RadioScene | null = null;
  let bands = 0;
  const rig = createRig((pose: Pose) => scene?.render(pose), {
    emit,
    tuning: knobs.tuning,
    volume: knobs.volume,
  });
  return {
    count: (next: number) => {
      if (next === bands) {
        return;
      }
      bands = next;
      rig.setBands(next);
      scene?.setBands(next);
      rig.invalidate();
    },
    dispose: () => rig.dispose(),
    rig,
    show: (next: RadioScene | null) => {
      scene = next;
      next?.setBands(bands);
      next?.render(rig.pose);
    },
  };
}

type StageController = ReturnType<typeof createStage>;

type SdkRadioGroupProps = ComponentProps<typeof SdkRadioGroup<string>>;

type RadioPassed = Pick<
  SdkRadioGroupProps,
  "defaultValue" | "onValueChange" | "value"
>;

interface RadioContextValue {
  bands: number;
  controller: RadioGroupController<string>;
  events: RadioEvents;
  group: RadioPassed;
  knobs: Record<RadioKnob, number>;
  pressKey: (key: number, pressed: boolean) => void;
  setKnob: (name: RadioKnob, value: number, held: boolean) => void;
  stage: StageController;
  sync: (band: number | null, count: number, stations: RadioStation[]) => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

function useRadioContext() {
  const context = use(RadioContext);
  if (!context) {
    throw new Error("Radio parts must be used within a Radio component");
  }
  return context;
}

function useRadioEvents(): Pick<RadioEvents, "state" | "subscribe"> {
  const { events } = useRadioContext();
  return { state: events.state, subscribe: events.subscribe };
}

interface RadioProps
  extends
    Omit<ComponentProps<"div">, "defaultValue" | "onVolumeChange">,
    RadioPassed {
  defaultTuning?: number;
  defaultVolume?: number;
  onTuningChange?: (tuning: number) => void;
  onVolumeChange?: (volume: number) => void;
  tuning?: number;
  volume?: number;
}

function Radio({
  defaultTuning = DEFAULT_TUNING,
  defaultValue,
  defaultVolume = DEFAULT_VOLUME,
  onTuningChange,
  onValueChange,
  onVolumeChange,
  tuning: tuningProp,
  value,
  volume: volumeProp,
  ...props
}: RadioProps) {
  const [uncontrolled, setUncontrolled] = useState({
    tuning: defaultTuning,
    volume: defaultVolume,
  });
  const knobs = {
    tuning: tuningProp ?? uncontrolled.tuning,
    volume: volumeProp ?? uncontrolled.volume,
  };
  const [on, setOn] = useState(false);
  const [bands, setBands] = useState(0);
  const [controller] = useState(() => createRadioGroupController<string>());
  const [events] = useState(createRadioEvents);
  const [stage] = useState(() =>
    createStage(
      { tuning: turnOf(knobs.tuning), volume: turnOf(knobs.volume) },
      events.emit
    )
  );
  const { rig } = stage;
  const placed = useRef(false);
  const lit = useRef(false);
  const broadcast = useRef("[]");
  const pressed = useRef<boolean[]>([]);
  const held = useRef<Record<RadioKnob, boolean>>({
    tuning: false,
    volume: false,
  });

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const follow = () => rig.setReducedMotion(motion.matches);
    follow();
    motion.addEventListener("change", follow);
    return () => {
      motion.removeEventListener("change", follow);
      stage.dispose();
    };
  }, [rig, stage]);

  const { tuning, volume } = knobs;
  useEffect(() => {
    if (!held.current.tuning) {
      rig.setKnob("tuning", turnOf(tuning));
    }
  }, [rig, tuning]);
  useEffect(() => {
    if (!held.current.volume) {
      rig.setKnob("volume", turnOf(volume));
    }
  }, [rig, volume]);

  const context: RadioContextValue = {
    bands,
    controller,
    events,
    group: { defaultValue, onValueChange, value },
    knobs,
    pressKey: (key, down) => {
      rig.setKey(key, down);
      if ((pressed.current[key] ?? false) === down) {
        return;
      }
      pressed.current[key] = down;
      events.emit({ key, type: down ? "key-down" : "key-up" });
    },
    setKnob: (name, next, byHand) => {
      held.current[name] = byHand;
      if (byHand) {
        rig.holdKnob(name, turnOf(next));
      } else {
        rig.releaseKnob(name);
        rig.setKnob(name, turnOf(next));
      }
      if (next !== knobs[name]) {
        setUncontrolled((each) => ({ ...each, [name]: next }));
        (name === "tuning" ? onTuningChange : onVolumeChange)?.(next);
      }
    },
    stage,
    sync: (band, count, stations) => {
      const told = JSON.stringify(stations);
      if (told !== broadcast.current) {
        broadcast.current = told;
        events.setStations(stations);
      }
      stage.count(count);
      if (count !== bands) {
        setBands(count);
      }
      if (placed.current) {
        rig.setBand(band);
      } else {
        placed.current = true;
        rig.place(band);
      }
      if (lit.current !== (band !== null)) {
        lit.current = band !== null;
        setOn(band !== null);
      }
    },
  };

  return (
    <RadioContext value={context}>
      <div data-on={on ? "" : undefined} data-slot="literal-radio" {...props} />
    </RadioContext>
  );
}

function startScene(
  canvas: HTMLCanvasElement,
  frame: HTMLElement,
  hooks: {
    onLost: () => void;
    onReady: (scene: RadioScene) => void;
    onUnavailable: () => void;
  }
) {
  let disposed = false;
  let scene: RadioScene | null = null;
  let made: RadioScene | null = null;

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
      const { createRadioScene } = await import("./radio-scene");
      if (disposed) {
        return;
      }
      made = await createRadioScene(canvas, {
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
    made?.dispose();
    made = null;
    scene = null;
  };
}

function RadioCanvas({
  onLost,
  onReady,
  onRestored,
  onUnavailable,
}: {
  onLost: () => void;
  onReady: (scene: RadioScene) => void;
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
    <canvas aria-hidden="true" data-slot="literal-radio-canvas" ref={canvas} />
  );
}

interface FrameBox {
  h: number;
  w: number;
  x: number;
  y: number;
}

const box = (name: string, { h, w, x, y }: FrameBox) => ({
  [`--${name}-h`]: h,
  [`--${name}-w`]: w,
  [`--${name}-x`]: x,
  [`--${name}-y`]: y,
});

const FRAME_BOXES = {
  "--frame-h": FRAME.height,
  "--frame-w": FRAME.width,
  "--label-cap": LABELS.capHeight,
  "--label-w": LABELS.w,
  "--label-x": LABELS.x,
  "--label-y": LABELS.y,
  ...box("row", KEY_ROW),
  ...box("tuning", TUNING),
  ...box("volume", VOLUME),
};

const POSTER_BANDS = 4;

interface Poster {
  bands: number;
  patch: { box: FrameBox; src: string } | null;
  src: string;
}

const loadPoster = async (bands: number): Promise<Poster> => {
  const [{ radioPoster }, patches] = await Promise.all([
    import("./radio-poster"),
    bands === POSTER_BANDS ? null : import("./radio-poster-bands"),
  ]);
  const patch = patches?.radioPosterBands[bands];
  return {
    bands,
    patch:
      patches && patch ? { box: patches.POSTER_BANDS_BOX, src: patch } : null,
    src: radioPoster,
  };
};

function RadioStage({ children, ...props }: ComponentProps<"div">) {
  const { bands, stage } = useRadioContext();
  const [view, setView] = useState<RadioView>("poster");
  const [generation, setGeneration] = useState(0);
  const [poster, setPoster] = useState<Poster | null>(null);
  useEffect(() => {
    if (bands === 0) {
      return;
    }
    let current = true;
    const show = async () => {
      const loaded = await loadPoster(bands).catch(() => null);
      if (current) {
        setPoster(loaded);
      }
    };
    void show();
    return () => {
      current = false;
    };
  }, [bands]);

  const onLost = useCallback(() => {
    stage.show(null);
    setView("poster");
  }, [stage]);
  const onReady = useCallback(
    (scene: RadioScene) => {
      stage.show(scene);
      setView("live");
    },
    [stage]
  );
  const onRestored = useCallback(() => setGeneration((each) => each + 1), []);
  const onUnavailable = useCallback(() => setView("static"), []);

  return (
    <div
      data-slot="literal-radio-stage"
      data-view={view}
      {...mergeProps(
        {
          onKeyDownCapture: (event: KeyboardEvent<HTMLDivElement>) => {
            event.currentTarget.dataset.keyboard = "";
          },
          onPointerDownCapture: (event: PointerEvent<HTMLDivElement>) => {
            delete event.currentTarget.dataset.keyboard;
          },
          style: FRAME_BOXES as CSSProperties,
        },
        props
      )}
    >
      {poster?.bands === bands && (
        <div data-slot="literal-radio-poster">
          <img
            alt=""
            decoding="async"
            height={FRAME.height}
            src={poster.src}
            width={FRAME.width}
          />
          {poster.patch && (
            <img
              alt=""
              data-literal-radio="poster-bands"
              decoding="async"
              height={poster.patch.box.h}
              src={poster.patch.src}
              style={box("patch", poster.patch.box) as CSSProperties}
              width={poster.patch.box.w}
            />
          )}
        </div>
      )}
      <RadioCanvas
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

function RadioSync({
  group,
  value,
}: {
  group: { current: HTMLElement | null };
  value: string | null;
}) {
  const { sync } = useRadioContext();
  const follow = useStableEvent(sync);
  useEffect(() => {
    const items = itemsOf(group.current);
    if (items.length > MAX_BANDS) {
      throw new Error(
        `Radio has ${MAX_BANDS + 1} keys: it takes up to ${MAX_BANDS} RadioGroupItem parts.`
      );
    }
    const checked = items.find((item) => item.dataset.value === value);
    const stations = items.map((item) => ({
      position: turnOf(Number(item.dataset.position ?? DEFAULT_POSITION)),
      src: item.dataset.src ?? null,
    }));
    follow(bandOf(group.current, checked ?? null), items.length, stations);
  });
  return null;
}

function RadioGroup({
  children,
  ...props
}: Omit<SdkRadioGroupProps, "children" | "controller" | keyof RadioPassed> & {
  children?: ReactNode;
}) {
  const { controller, group } = useRadioContext();
  const root = useRef<HTMLDivElement>(null);
  return (
    <SdkRadioGroup<string>
      controller={controller}
      data-literal-radio="group"
      {...group}
      {...mergeProps({ ref: root }, props)}
    >
      {(state) => (
        <>
          <RadioSync group={root} value={state.value} />
          {children}
        </>
      )}
    </SdkRadioGroup>
  );
}

function usePress(keyOf: (element: HTMLElement) => number | null) {
  const { pressKey } = useRadioContext();
  const press = (element: HTMLElement, down: boolean) => {
    const key = keyOf(element);
    if (key !== null) {
      pressKey(key, down);
    }
  };
  return {
    onBlur: (event: { currentTarget: HTMLElement }) =>
      press(event.currentTarget, false),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (PRESS_KEYS.has(event.key)) {
        press(event.currentTarget, true);
      }
    },
    onKeyUp: (event: KeyboardEvent<HTMLElement>) =>
      press(event.currentTarget, false),
    onPointerCancel: (event: PointerEvent<HTMLElement>) =>
      press(event.currentTarget, false),
    onPointerDown: (event: PointerEvent<HTMLElement>) =>
      press(event.currentTarget, true),
    onPointerLeave: (event: PointerEvent<HTMLElement>) =>
      press(event.currentTarget, false),
    onPointerUp: (event: PointerEvent<HTMLElement>) =>
      press(event.currentTarget, false),
  };
}

const bandKeyOf = (element: HTMLElement) => {
  const band = bandOf(element.closest('[data-literal-radio="group"]'), element);
  return band === null ? null : band + 1;
};

const offKeyOf = () => OFF_KEY;

function RadioGroupItem({
  children,
  position,
  src,
  value,
  ...props
}: Omit<ComponentProps<typeof SdkRadio>, "children"> & {
  children?: ReactNode;
  position?: number;
  src?: string;
}) {
  const press = usePress(bandKeyOf);
  return (
    <SdkRadio
      value={value}
      {...mergeProps(
        {
          "data-literal-radio": "item",
          "data-position": position,
          "data-src": src,
          "data-value": value,
          ...press,
        },
        props
      )}
    >
      <span data-literal-radio="label">{children}</span>
    </SdkRadio>
  );
}

function RadioOff(props: ComponentProps<typeof Button>) {
  const { controller } = useRadioContext();
  const press = usePress(offKeyOf);
  return (
    <Button
      {...mergeProps(
        {
          "aria-label": "Off",
          "data-literal-radio": "off",
          onClick: () => {
            controller.setValue(null);
          },
          ...press,
        },
        props
      )}
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

function RadioKnobSlider({
  knob,
  label,
  ...props
}: SliderPartProps & { knob: RadioKnob; label: string }) {
  const { knobs, setKnob } = useRadioContext();
  const value = knobs[knob];
  const dragging = useRef(false);

  const grip = (event: PointerEvent<HTMLElement>) => {
    dragging.current = true;
    const track = trackOf(event.currentTarget);
    if (!track) {
      return;
    }
    track.style.removeProperty("translate");
    const { bottom, height } = track.getBoundingClientRect();
    track.style.translate = `0 ${event.clientY + turnOf(value) * height - bottom}px`;
  };

  return (
    <Slider<number>
      data-literal-radio={knob}
      max={KNOB_MAX}
      min={KNOB_MIN}
      onValueChange={(next: number) => setKnob(knob, next, dragging.current)}
      onValueCommit={(next: number) => {
        dragging.current = false;
        setKnob(knob, next, false);
      }}
      orientation="vertical"
      value={value}
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

function RadioVolume({
  "aria-label": label = "Volume",
  ...props
}: SliderPartProps) {
  return <RadioKnobSlider knob="volume" label={label} {...props} />;
}

function RadioTuning({
  "aria-label": label = "Tuning",
  ...props
}: SliderPartProps) {
  return (
    <RadioKnobSlider
      knob="tuning"
      label={label}
      largeStep={TUNING_LARGE_STEP}
      step={TUNING_STEP}
      {...props}
    />
  );
}

export {
  Radio,
  RadioGroup,
  RadioGroupItem,
  RadioOff,
  RadioStage,
  RadioTuning,
  RadioVolume,
  useRadioEvents,
};
export type { RadioEvent, RadioProps, RadioState };

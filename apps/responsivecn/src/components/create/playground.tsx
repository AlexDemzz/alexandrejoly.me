import {
  ArrowRightIcon,
  DeviceMobileIcon,
  MonitorIcon,
} from "@phosphor-icons/react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@portfolio/ui/components/native-select";
import { cn } from "@portfolio/ui/lib/utils";
import * as React from "react";

import {
  BREAKPOINT,
  MAX_WIDTH,
  MIN_WIDTH,
  PAIRS,
  clampWidth,
  pairByDesktop,
} from "@/components/create/pairs";
import type { DesktopName, Pair } from "@/components/create/pairs";
import { fitScale } from "@/components/create/viewport";
import { useElementSize } from "@/hooks/use-element-size";

const HANDLE_ROOM = 48;
const NUDGE = 10;
const NUDGE_LARGE = 100;

// The frame is centered, so each edge moves half the width change: the delta
// is doubled to keep the edge under the pointer, then unscaled when the frame
// is drawn smaller than its declared width.
const useDragResize = (
  width: number,
  scale: number,
  setWidth: (width: number) => void,
  setDragging: (dragging: boolean) => void,
  direction: 1 | -1
) =>
  React.useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault();
      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      setDragging(true);
      const onMove = (moveEvent: PointerEvent) => {
        const dx = ((moveEvent.clientX - startX) * direction * 2) / scale;
        setWidth(clampWidth(width + dx));
      };
      const onUp = () => {
        setDragging(false);
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        handle.removeEventListener("pointercancel", onUp);
      };
      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);
    },
    [width, scale, setWidth, setDragging, direction]
  );

const ResizeHandle = ({
  side,
  onPointerDown,
  onNudge,
}: {
  side: "left" | "right";
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onNudge: (delta: number) => void;
}) => (
  <button
    type="button"
    aria-label={`Resize the canvas from its ${side} edge`}
    title="Drag, or use the arrow keys. Hold Shift for 100px steps."
    onPointerDown={(event) => {
      // preventDefault in the drag suppresses click focus; restore it so
      // the arrow keys work right after grabbing the handle.
      event.currentTarget.focus();
      onPointerDown(event);
    }}
    onKeyDown={(event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }
      event.preventDefault();
      const step = event.shiftKey ? NUDGE_LARGE : NUDGE;
      onNudge(event.key === "ArrowLeft" ? -step : step);
    }}
    className="group focus-visible:ring-ring/50 flex w-6 shrink-0 cursor-ew-resize touch-none items-center justify-center rounded-lg outline-none focus-visible:ring-3"
  >
    <span className="bg-muted-foreground/30 group-active:bg-muted-foreground/80 can-hover:group-hover:bg-muted-foreground/60 h-12 w-1.5 rounded-full transition-colors duration-150 ease-out" />
  </button>
);

const PreviewFrame = ({
  pair,
  width,
  height,
  scale,
  dragging,
}: {
  pair: Pair;
  width: number;
  height: number;
  scale: number;
  dragging: boolean;
}) => {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <iframe
      src={`/preview?pair=${pair.slug}`}
      title={`${pair.desktop}${pair.mobile} live preview`}
      onLoad={() => setLoaded(true)}
      style={
        {
          "--preview-width": `${width}px`,
          "--preview-height": `${height}px`,
          "--preview-zoom": scale,
        } as React.CSSProperties
      }
      className={cn(
        "absolute start-0 top-0 h-(--preview-height) w-(--preview-width) [zoom:var(--preview-zoom)] border-0 transition-opacity duration-200 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        // The iframe must not swallow pointer events while dragging.
        dragging && "pointer-events-none"
      )}
    />
  );
};

// The live preview: an iframe whose own window is `width` px wide, so the
// registry components' use-mobile sees the canvas width and swaps at 768px.
// When the canvas has less room than that, zoom draws it smaller without
// changing the width its window reports.
const Frame = ({
  pair,
  width,
  scale,
  dragging,
}: {
  pair: Pair;
  width: number;
  scale: number;
  dragging: boolean;
}) => {
  const [bodyRef, body] = useElementSize<HTMLDivElement>();
  const isMobile = width < BREAKPOINT;
  const SideIcon = isMobile ? DeviceMobileIcon : MonitorIcon;

  return (
    <div
      className="bg-background flex w-(--frame-width) max-w-full min-w-0 flex-col overflow-clip rounded-2xl border"
      style={
        {
          "--frame-width": `${Math.round(width * scale) + 2}px`,
        } as React.CSSProperties
      }
    >
      <div className="text-muted-foreground flex min-h-9 shrink-0 items-center justify-center gap-1.5 border-b px-3 py-2 text-xs">
        <SideIcon aria-hidden className="size-3.5 shrink-0" />
        <span className="text-balance">
          <span className="text-foreground tabular-nums">{width}px</span>{" "}
          renders the {isMobile ? pair.mobile : pair.desktop}
          {scale < 1 ? (
            <span className="tabular-nums">
              {" "}
              · shown at {Math.round(scale * 100)}%
            </span>
          ) : null}
        </span>
      </div>
      <div ref={bodyRef} className="relative min-h-0 flex-1">
        {body.height > 0 ? (
          <PreviewFrame
            key={pair.slug}
            pair={pair}
            width={width}
            height={Math.round(body.height / scale)}
            scale={scale}
            dragging={dragging}
          />
        ) : null}
      </div>
    </div>
  );
};

const WidthInput = ({
  width,
  onChange,
}: {
  width: number;
  onChange: (width: number) => void;
}) => {
  const [draft, setDraft] = React.useState<string | null>(null);

  const commit = () => {
    if (draft === null) {
      return;
    }
    const parsed = Number(draft);
    if (draft !== "" && Number.isFinite(parsed)) {
      onChange(clampWidth(parsed));
    }
    setDraft(null);
  };

  return (
    <label className="border-input bg-background text-muted-foreground focus-within:border-ring focus-within:ring-ring/50 dark:bg-input/30 flex h-8 items-center gap-1 rounded-lg border ps-2.5 pe-2 font-mono text-base focus-within:ring-3 sm:text-sm">
      <input
        type="number"
        inputMode="numeric"
        aria-label="Canvas width in pixels"
        min={MIN_WIDTH}
        max={MAX_WIDTH}
        value={draft ?? String(width)}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          const parsed = Number(next);
          if (parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
            onChange(Math.round(parsed));
          }
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commit();
          }
        }}
        className="text-foreground w-12 [appearance:textfield] bg-transparent text-end tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      px
    </label>
  );
};

// The playground: pair picker and width input over a resizable canvas, with
// `trailing` at the end of the toolbar. The parent owns the state and sets
// the height.
export const Playground = ({
  desktop,
  onDesktopChange,
  width,
  onWidthChange,
  trailing,
  className,
}: {
  desktop: DesktopName;
  onDesktopChange: (desktop: DesktopName) => void;
  width: number;
  onWidthChange: (width: number) => void;
  trailing: React.ReactNode;
  className?: string;
}) => {
  const [dragging, setDragging] = React.useState(false);
  const [canvasRef, canvas] = useElementSize<HTMLDivElement>();

  const pair = pairByDesktop(desktop);
  const scale = fitScale(width, canvas.width - HANDLE_ROOM);
  const onDragLeft = useDragResize(
    width,
    scale,
    onWidthChange,
    setDragging,
    -1
  );
  const onDragRight = useDragResize(
    width,
    scale,
    onWidthChange,
    setDragging,
    1
  );
  const nudge = (delta: number) => onWidthChange(clampWidth(width + delta));

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex flex-wrap items-center gap-2 px-3 py-3 sm:px-4">
        <div className="flex items-center gap-1.5">
          <NativeSelect
            aria-label="Desktop component"
            value={desktop}
            onChange={(event) =>
              onDesktopChange(event.target.value as DesktopName)
            }
          >
            {PAIRS.map((item) => (
              <NativeSelectOption key={item.slug} value={item.desktop}>
                {item.desktop}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <ArrowRightIcon
            aria-hidden
            className="text-muted-foreground size-3.5 max-sm:hidden"
          />
          <span
            className="bg-muted flex h-8 items-center gap-1.5 rounded-lg ps-2.5 pe-1.5 text-sm"
            title="Each desktop component has exactly one mobile side"
          >
            <span>{pair.mobile}</span>
            <span className="bg-background text-muted-foreground shadow-hairline rounded-sm px-1 text-xs">
              auto
            </span>
          </span>
        </div>

        <WidthInput width={width} onChange={onWidthChange} />

        {trailing}
      </div>

      <div
        ref={canvasRef}
        className="flex min-h-0 flex-1 items-stretch justify-center px-2 pb-4 sm:px-6 sm:pb-6"
      >
        <ResizeHandle
          side="left"
          onPointerDown={onDragLeft}
          onNudge={(delta) => nudge(-delta)}
        />
        <Frame pair={pair} width={width} scale={scale} dragging={dragging} />
        <ResizeHandle
          side="right"
          onPointerDown={onDragRight}
          onNudge={nudge}
        />
      </div>
    </div>
  );
};

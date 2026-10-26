import {
  CaretDownIcon,
  DeviceMobileIcon,
  MonitorIcon,
} from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@portfolio/ui/components/dropdown-menu";
import { cn } from "@portfolio/ui/lib/utils";
import * as React from "react";

import {
  BREAKPOINT,
  PAIRS,
  clampWidth,
  npxCommand,
  pairByDesktop,
} from "@/components/create/pairs";
import type { DesktopName, Pair } from "@/components/create/pairs";
import { fitScale } from "@/components/create/viewport";
import { InstallCommand } from "@/components/landing/install-command";
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
      // the arrow keys work right after grabbing the handle, without the
      // keyboard focus ring.
      event.currentTarget.focus({ focusVisible: false });
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
    className={cn(
      "group flex w-6 shrink-0 cursor-ew-resize touch-none items-center justify-center outline-hidden [view-transition-class:playground]",
      side === "left"
        ? "[view-transition-name:playground-handle-left]"
        : "[view-transition-name:playground-handle-right]"
    )}
  >
    <span className="bg-muted-foreground/30 group-active:bg-muted-foreground/80 can-hover:group-hover:bg-muted-foreground/60 group-focus-visible:outline-ring/50 h-12 w-1.5 rounded-full outline-offset-2 transition-colors duration-150 ease-out group-focus-visible:outline-3" />
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
          "--preview-scale": scale,
        } as React.CSSProperties
      }
      className={cn(
        "absolute start-0 top-0 h-(--preview-height) w-(--preview-width) origin-top-left scale-(--preview-scale) border-0 transition-opacity duration-200 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        // The iframe must not swallow pointer events while dragging.
        dragging && "pointer-events-none"
      )}
    />
  );
};

// The live preview: an iframe whose own window is `width` px wide, so the
// registry components' use-mobile sees the canvas width and swaps at 768px.
// When the canvas has less room than that, a scale transform draws it
// smaller without changing the width its window reports.
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
      className="bg-background flex w-(--frame-width) max-w-full min-w-0 flex-col overflow-clip rounded-2xl border [view-transition-class:playground] [view-transition-name:playground-frame]"
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

const PairMenu = ({
  pair,
  onDesktopChange,
}: {
  pair: Pair;
  onDesktopChange: (desktop: DesktopName) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger
      render={<Button variant="outline" size="sm" />}
      className="group"
    >
      {pair.desktop}
      {pair.mobile}
      <CaretDownIcon
        aria-hidden
        data-icon="inline-end"
        className="text-muted-foreground transition-transform duration-150 ease-out group-data-popup-open:rotate-180 motion-reduce:transition-none"
      />
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-auto">
      <DropdownMenuRadioGroup
        value={pair.desktop}
        onValueChange={(value: DesktopName) => onDesktopChange(value)}
      >
        {PAIRS.map((item) => (
          <DropdownMenuRadioItem key={item.slug} value={item.desktop}>
            {item.desktop}
            {item.mobile}
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
);

// The playground: the pair menu and `trailing` over a resizable canvas, with
// the pair's install command below. The parent owns the pair and width, and
// sets the height.
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
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <PairMenu pair={pair} onDesktopChange={onDesktopChange} />
        {trailing}
      </div>

      <div
        ref={canvasRef}
        className="flex min-h-0 flex-1 items-stretch justify-center px-2 sm:px-6"
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

      <InstallCommand
        command={npxCommand(pair.slug)}
        className="mx-3 my-3 sm:mx-4 sm:my-4"
      />
    </div>
  );
};

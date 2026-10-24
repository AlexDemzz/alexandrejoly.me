"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { IconPlaceholder } from "@/components/icon-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarqueeContextValue {
  paused: boolean;
  setPaused: (paused: boolean) => void;
}

const MarqueeContext = createContext<MarqueeContextValue | null>(null);

function useMarquee() {
  const context = use(MarqueeContext);
  if (!context) {
    throw new Error("useMarquee must be used within a Marquee.");
  }
  return context;
}

type MarqueeProps = React.ComponentProps<"div"> & {
  defaultPaused?: boolean;
  onPausedChange?: (paused: boolean) => void;
  paused?: boolean;
};

function Marquee({
  className,
  defaultPaused = false,
  onPausedChange,
  paused: pausedProp,
  ...props
}: MarqueeProps) {
  const [uncontrolledPaused, setUncontrolledPaused] = useState(defaultPaused);
  const paused = pausedProp ?? uncontrolledPaused;

  const setPaused = useCallback(
    (value: boolean) => {
      setUncontrolledPaused(value);
      onPausedChange?.(value);
    },
    [onPausedChange]
  );

  const context = useMemo(() => ({ paused, setPaused }), [paused, setPaused]);

  return (
    <MarqueeContext value={context}>
      <div
        className={cn(
          "group/marquee flex items-center gap-2",
          "supports-[timeline-scope:none]:animate-marquee-overflow supports-[timeline-scope:none]:[animation-timeline:--marquee] supports-[timeline-scope:none]:[timeline-scope:--marquee]",
          className
        )}
        data-paused={paused || undefined}
        data-slot="marquee"
        {...props}
      />
    </MarqueeContext>
  );
}

function MarqueeViewport({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group/marquee-viewport flex min-w-0 flex-1 scroll-p-[50%] flex-col gap-4 self-stretch overflow-hidden [--scroll-fade-reveal:0px] has-[[data-slot=marquee-copy]:not([aria-hidden])_:focus-visible]:[--scroll-fade-reveal:initial]",
        "[scroll-timeline:--marquee_inline] has-[>div>[data-slot=marquee-content][data-orientation=vertical]]:[scroll-timeline:--marquee_block]",
        className
      )}
      data-slot="marquee-viewport"
      {...props}
    >
      <div className="supports-[animation-timeline:scroll()]:animate-marquee-overflow contents [--scroll-fade-reveal:initial] supports-[animation-timeline:scroll()]:[animation-timeline:--marquee]">
        {children}
      </div>
    </div>
  );
}

const TRACK_ANIMATION = {
  forward:
    "not-supports-[animation-timeline:scroll()]:motion-safe:animate-marquee [@container_style(--marquee-overflowing:1)]:motion-safe:animate-marquee",
  reverse:
    "not-supports-[animation-timeline:scroll()]:motion-safe:animate-marquee-reverse [@container_style(--marquee-overflowing:1)]:motion-safe:animate-marquee-reverse",
  vertical:
    "not-supports-[animation-timeline:scroll()]:motion-safe:animate-marquee-vertical [@container_style(--marquee-overflowing:1)]:motion-safe:animate-marquee-vertical",
} as const;

function useUntabbableClone() {
  const cloneRef = useRef<HTMLDivElement>(null);
  const [inert, setInert] = useState(true);

  useEffect(() => {
    const clone = cloneRef.current;
    if (!clone) {
      return;
    }
    const skipTab = () => {
      for (const element of clone.querySelectorAll<HTMLElement>("*")) {
        if (element.tabIndex >= 0) {
          element.tabIndex = -1;
        }
      }
    };
    skipTab();
    setInert(false);
    const observer = new MutationObserver(skipTab);
    observer.observe(clone, {
      attributeFilter: ["tabindex"],
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  return { cloneRef, inert };
}

type MarqueeOrientation = "horizontal" | "vertical";

const MarqueeOrientationContext =
  createContext<MarqueeOrientation>("horizontal");

type MarqueeContentProps = React.ComponentProps<"div"> & {
  orientation?: MarqueeOrientation;
  pauseOnHover?: boolean;
  reverse?: boolean;
};

function MarqueeContent({
  children,
  className,
  orientation = "horizontal",
  pauseOnHover = false,
  reverse = false,
  ...props
}: MarqueeContentProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const { cloneRef, inert } = useUntabbableClone();
  const vertical = orientation === "vertical";
  const copy = cn("flex shrink-0", vertical ? "flex-col" : "items-center");
  const clone =
    "supports-[animation-timeline:scroll()]:not-[@container_style(--marquee-overflowing:1)]:hidden group-has-[[data-slot=marquee-copy]:not([aria-hidden])_:focus-visible]/marquee-viewport:hidden";

  return (
    <MarqueeOrientationContext value={orientation}>
      <div
        className={cn(
          vertical ? "flex h-max flex-col" : "flex w-max items-center",
          vertical && TRACK_ANIMATION.vertical,
          !vertical && TRACK_ANIMATION[reverse ? "reverse" : "forward"],
          "group-focus-within/marquee-viewport:[animation-play-state:paused] group-has-[[data-slot=marquee-copy]:not([aria-hidden])_:focus-visible]/marquee-viewport:animate-none group-data-paused/marquee:[animation-play-state:paused]",
          pauseOnHover &&
            "group-hover/marquee-viewport:[animation-play-state:paused]",
          className
        )}
        data-direction={reverse ? "reverse" : "forward"}
        data-orientation={orientation}
        data-slot="marquee-content"
        {...props}
      >
        <div className={copy} data-slot="marquee-copy">
          {items}
        </div>
        <div
          aria-hidden
          className={cn(copy, clone)}
          data-slot="marquee-copy"
          inert={inert}
          ref={cloneRef}
        >
          {items}
        </div>
      </div>
    </MarqueeOrientationContext>
  );
}

function MarqueeItem({ className, ...props }: React.ComponentProps<"div">) {
  const orientation = use(MarqueeOrientationContext);
  return (
    <div
      className={cn(
        orientation === "horizontal" ? "px-4" : "py-2 text-center",
        className
      )}
      data-slot="marquee-item"
      {...props}
    />
  );
}

function MarqueePause(props: React.ComponentProps<typeof Button>) {
  const { paused, setPaused } = useMarquee();

  return (
    <Button
      data-slot="marquee-pause"
      {...mergeProps<typeof Button>(
        {
          className:
            "motion-reduce:hidden supports-[timeline-scope:none]:not-[@container_style(--marquee-overflowing:1)]:hidden",
          onClick: () => setPaused(!paused),
          size: "icon",
          variant: "ghost",
        },
        props
      )}
    >
      {paused ? (
        <IconPlaceholder
          lucide="PlayIcon"
          tabler="IconPlayerPlay"
          hugeicons="PlayIcon"
          phosphor="PlayIcon"
          remixicon="RiPlayLine"
          aria-hidden
        />
      ) : (
        <IconPlaceholder
          lucide="PauseIcon"
          tabler="IconPlayerPause"
          hugeicons="PauseIcon"
          phosphor="PauseIcon"
          remixicon="RiPauseLine"
          aria-hidden
        />
      )}
      <span className="sr-only">{paused ? "Play" : "Pause"}</span>
    </Button>
  );
}

export { Marquee, MarqueeContent, MarqueeItem, MarqueePause, MarqueeViewport };

"use client";

import {
  Children,
  createContext,
  isValidElement,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

interface MarqueeContextValue {
  containerRef: React.RefObject<HTMLDivElement | null>;
  originalRef: React.RefObject<HTMLDivElement | null>;
  shouldScroll: boolean;
  trackRef: React.RefObject<HTMLDivElement | null>;
}

const MarqueeContext = createContext<MarqueeContextValue | null>(null);

function useMarqueeContext() {
  const context = use(MarqueeContext);
  if (!context) {
    throw new Error(
      "Marquee compound components must be used within <Marquee>"
    );
  }
  return context;
}

type MarqueeProps = React.ComponentProps<"div"> & {
  /** Scroll speed in pixels per second. */
  speed?: number;
  pauseOnHover?: boolean;
};

function Marquee({
  children,
  className,
  speed = 40,
  pauseOnHover = false,
  ...props
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const originalRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (!children) {
      return;
    }
    const container = containerRef.current;
    const original = originalRef.current;
    const track = trackRef.current;
    if (!(container && original && track)) {
      return;
    }

    const measure = () => {
      const containerWidth = container.offsetWidth;
      const originalWidth = original.offsetWidth;
      const overflow = originalWidth > containerWidth;
      setShouldScroll(overflow);
      if (!overflow) {
        setDistance(0);
        return;
      }
      // The gap between the original and its clone comes from the track's CSS gap.
      const gap =
        // oxlint-disable-next-line unicorn/prefer-number-coercion -- columnGap carries a unit, e.g. "8px"
        Number.parseFloat(getComputedStyle(track).columnGap || "0") || 0;
      setDistance(originalWidth + gap);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(original);
    observer.observe(track);

    return () => observer.disconnect();
  }, [children]);

  useEffect(() => {
    const track = trackRef.current;
    // An infinite auto-scroll offers no way to stop it, so reduced motion gets
    // no animation at all: the first copy stays in place and readable.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion || !(track && shouldScroll && distance > 0)) {
      animationRef.current?.cancel();
      animationRef.current = null;
      return;
    }

    const animation = track.animate(
      [
        { transform: "translateX(0)" },
        { transform: `translateX(-${distance}px)` },
      ],
      {
        duration: (distance / speed) * 1000,
        easing: "linear",
        iterations: Number.POSITIVE_INFINITY,
      }
    );
    animationRef.current = animation;

    return () => animation.cancel();
  }, [shouldScroll, distance, speed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!(container && pauseOnHover)) {
      return;
    }

    const pause = () => animationRef.current?.pause();
    const resume = () => animationRef.current?.play();

    container.addEventListener("pointerenter", pause);
    container.addEventListener("pointerleave", resume);

    return () => {
      container.removeEventListener("pointerenter", pause);
      container.removeEventListener("pointerleave", resume);
    };
  }, [pauseOnHover]);

  const context = useMemo(
    () => ({ containerRef, originalRef, shouldScroll, trackRef }),
    [shouldScroll]
  );

  return (
    <MarqueeContext value={context}>
      <div
        className={cn("relative overflow-hidden", className)}
        data-slot="marquee"
        ref={containerRef}
        {...props}
      >
        {children}
      </div>
    </MarqueeContext>
  );
}

function MarqueeContent({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { trackRef, originalRef, shouldScroll } = useMarqueeContext();
  // oxlint-disable-next-line react/no-react-children -- the copies drop text and empty children so only items repeat
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <div
      className={cn("flex w-max items-center", className)}
      data-slot="marquee-content"
      ref={trackRef}
      {...props}
    >
      <div
        // oxlint-disable-next-line shadcn/no-arbitrary-values -- each copy takes the consumer's gap from the track, which also spaces the loop seam
        className="flex shrink-0 items-center gap-[inherit]"
        data-slot="marquee-copy"
        ref={originalRef}
      >
        {items}
      </div>
      {shouldScroll && (
        <div
          aria-hidden
          // oxlint-disable-next-line shadcn/no-arbitrary-values -- same gap as the original copy
          className="flex shrink-0 items-center gap-[inherit]"
          data-slot="marquee-copy"
        >
          {items}
        </div>
      )}
    </div>
  );
}

function MarqueeItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("shrink-0", className)}
      data-slot="marquee-item"
      {...props}
    />
  );
}

type MarqueeFadeProps = React.ComponentProps<"div"> & {
  side: "left" | "right";
};

function MarqueeFade({ className, side, ...props }: MarqueeFadeProps) {
  const { shouldScroll } = useMarqueeContext();
  if (!shouldScroll) {
    return null;
  }
  return (
    <div
      aria-hidden
      className={cn(
        "from-background to-background/0 pointer-events-none absolute inset-y-0 z-10 w-8 bg-linear-to-r",
        side === "left" && "left-0",
        side === "right" && "right-0 rotate-180",
        className
      )}
      data-side={side}
      data-slot="marquee-fade"
      {...props}
    />
  );
}

export { Marquee, MarqueeContent, MarqueeFade, MarqueeItem };

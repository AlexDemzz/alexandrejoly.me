import { Children, isValidElement } from "react";

import { cn } from "@/lib/utils";

/**
 * A strip of items that slides forever, in CSS alone: the track renders its
 * items twice and a keyframe moves it by one copy per cycle, so it runs
 * before hydration and without any JavaScript. Reduced motion stops it on the
 * first copy, which stays in place and readable.
 */
function Marquee({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("group/marquee relative overflow-hidden", className)}
      data-slot="marquee"
      {...props}
    />
  );
}

type MarqueeContentProps = React.ComponentProps<"div"> & {
  /** One full cycle, as a CSS time. */
  duration?: string;
  /** The space between items, which also spaces the loop's seam. */
  gap?: string;
  /** `vertical` stacks the items and slides them upward. */
  orientation?: "horizontal" | "vertical";
  pauseOnHover?: boolean;
  /** Slides the other way. Horizontal only. */
  reverse?: boolean;
};

function MarqueeContent({
  children,
  className,
  duration = "40s",
  gap = "2rem",
  orientation = "horizontal",
  pauseOnHover = false,
  reverse = false,
  style,
  ...props
}: MarqueeContentProps) {
  // oxlint-disable-next-line react/no-react-children -- the copy drops text and empty children so only items repeat
  const items = Children.toArray(children).filter(isValidElement);
  const vertical = orientation === "vertical";
  // Each copy ends on one gap, so the seam is as wide as any other gap. A
  // vertical copy splits it above and below, centering the first item in a
  // frame one item plus one gap tall.
  const copy = vertical
    ? // oxlint-disable-next-line shadcn/no-arbitrary-values -- half the consumer's gap has no scale step
      "flex shrink-0 flex-col items-center gap-(--marquee-gap) py-[calc(var(--marquee-gap)/2)]"
    : "flex shrink-0 items-center gap-(--marquee-gap) pe-(--marquee-gap)";

  return (
    <div
      className={cn(
        vertical
          ? "flex h-max w-full flex-col items-center"
          : "flex w-max items-center",
        vertical && "motion-safe:animate-marquee-vertical",
        !vertical &&
          (reverse
            ? "motion-safe:animate-marquee-reverse"
            : "motion-safe:animate-marquee"),
        // oxlint-disable-next-line shadcn/no-arbitrary-values -- Tailwind has no animation-play-state utility
        pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
        className
      )}
      data-direction={reverse ? "reverse" : "forward"}
      data-orientation={orientation}
      data-slot="marquee-content"
      style={
        {
          "--marquee-duration": duration,
          "--marquee-gap": gap,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div className={copy} data-slot="marquee-copy">
        {items}
      </div>
      <div aria-hidden className={copy} data-slot="marquee-copy">
        {items}
      </div>
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

"use client";

import { Children, createContext, isValidElement, use } from "react";

import { cn } from "@/lib/utils";

/**
 * A strip of items that slides forever, in CSS alone: the track renders its
 * items twice and a keyframe moves it by one copy per cycle, so it runs
 * before hydration and without any JavaScript. Items that fit the frame stand
 * still, through the scroll timeline in its CSS. Reduced motion stops it on
 * the first copy, which stays in place and readable.
 */
function Marquee({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group/marquee relative overflow-hidden",
        // Its scroll timeline is inactive while nothing overflows, so the
        // animation flagging --marquee-overflowing only applies once the first
        // copy outgrows the frame; the track, the clone and the fades query
        // that flag. Without scroll timelines the marquee always runs.
        // oxlint-disable-next-line shadcn/no-arbitrary-values -- no utility sets a scroll timeline
        "supports-[animation-timeline:scroll()]:animate-marquee-overflow supports-[animation-timeline:scroll()]:[animation-timeline:scroll(self_inline)] supports-[animation-timeline:scroll()]:has-[>[data-orientation=vertical]]:[animation-timeline:scroll(self_block)]",
        className
      )}
      data-slot="marquee"
      {...props}
    />
  );
}

// A track runs while the marquee flags an overflow, or always where scroll
// timelines are missing.
// oxlint-disable shadcn/no-arbitrary-values -- Tailwind has no style query variant
const TRACK_ANIMATION = {
  forward:
    "not-supports-[animation-timeline:scroll()]:motion-safe:animate-marquee [@container_style(--marquee-overflowing:1)]:motion-safe:animate-marquee",
  reverse:
    "not-supports-[animation-timeline:scroll()]:motion-safe:animate-marquee-reverse [@container_style(--marquee-overflowing:1)]:motion-safe:animate-marquee-reverse",
  vertical:
    "not-supports-[animation-timeline:scroll()]:motion-safe:animate-marquee-vertical [@container_style(--marquee-overflowing:1)]:motion-safe:animate-marquee-vertical",
} as const;
// oxlint-enable shadcn/no-arbitrary-values

type MarqueeOrientation = "horizontal" | "vertical";

const MarqueeContext = createContext<MarqueeOrientation>("horizontal");

type MarqueeContentProps = React.ComponentProps<"div"> & {
  /** `vertical` stacks the items and slides them upward. */
  orientation?: MarqueeOrientation;
  pauseOnHover?: boolean;
  /** Slides the other way. Horizontal only. */
  reverse?: boolean;
};

/**
 * The track. One cycle lasts `--marquee-duration` (40s by default), set from
 * a class such as `[--marquee-duration:20s]`.
 */
function MarqueeContent({
  children,
  className,
  orientation = "horizontal",
  pauseOnHover = false,
  reverse = false,
  ...props
}: MarqueeContentProps) {
  // oxlint-disable-next-line react/no-react-children -- the copy drops text and empty children so only items repeat
  const items = Children.toArray(children).filter(isValidElement);
  const vertical = orientation === "vertical";
  const copy = cn("flex shrink-0", vertical ? "flex-col" : "items-center");
  // oxlint-disable-next-line shadcn/no-arbitrary-values -- shown while the marquee flags an overflow
  const clone =
    "supports-[animation-timeline:scroll()]:not-[@container_style(--marquee-overflowing:1)]:hidden";

  return (
    <MarqueeContext value={orientation}>
      <div
        className={cn(
          vertical ? "flex h-max w-full flex-col" : "flex w-max items-center",
          vertical && TRACK_ANIMATION.vertical,
          !vertical && TRACK_ANIMATION[reverse ? "reverse" : "forward"],
          // oxlint-disable-next-line shadcn/no-arbitrary-values -- Tailwind has no animation-play-state utility
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
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
        <div aria-hidden className={cn(copy, clone)} data-slot="marquee-copy">
          {items}
        </div>
      </div>
    </MarqueeContext>
  );
}

/**
 * One item. Its padding spaces the items and the loop's seam alike, so
 * override it to change the spacing: `px-2` across, `py-1` down.
 */
function MarqueeItem({ className, ...props }: React.ComponentProps<"div">) {
  const orientation = use(MarqueeContext);
  return (
    <div
      className={cn(
        "shrink-0",
        orientation === "horizontal" ? "px-4" : "py-2 text-center",
        className
      )}
      data-slot="marquee-item"
      {...props}
    />
  );
}

const FADE_SIDE = {
  bottom: "inset-x-0 bottom-0 h-8 rotate-180 bg-linear-to-b",
  left: "inset-y-0 left-0 w-8 bg-linear-to-r",
  right: "inset-y-0 right-0 w-8 rotate-180 bg-linear-to-r",
  top: "inset-x-0 top-0 h-8 bg-linear-to-b",
} as const;

type MarqueeFadeProps = React.ComponentProps<"div"> & {
  side: keyof typeof FADE_SIDE;
};

function MarqueeFade({ className, side, ...props }: MarqueeFadeProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "from-background to-background/0 pointer-events-none absolute z-10",
        // oxlint-disable-next-line shadcn/no-arbitrary-values -- shown while the marquee flags an overflow
        "supports-[animation-timeline:scroll()]:not-[@container_style(--marquee-overflowing:1)]:hidden",
        FADE_SIDE[side],
        className
      )}
      data-side={side}
      data-slot="marquee-fade"
      {...props}
    />
  );
}

export { Marquee, MarqueeContent, MarqueeFade, MarqueeItem };

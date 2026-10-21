"use client";

import { Children, createContext, isValidElement, use } from "react";

import { cn } from "@/lib/utils";

function Marquee({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group/marquee relative flex flex-col gap-4 overflow-hidden",
        "supports-[animation-timeline:scroll()]:animate-marquee-overflow supports-[animation-timeline:scroll()]:[animation-timeline:scroll(self_inline)] supports-[animation-timeline:scroll()]:has-[>[data-orientation=vertical]]:[animation-timeline:scroll(self_block)]",
        className
      )}
      data-slot="marquee"
      {...props}
    />
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

type MarqueeOrientation = "horizontal" | "vertical";

const MarqueeContext = createContext<MarqueeOrientation>("horizontal");

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
  const vertical = orientation === "vertical";
  const copy = cn("flex shrink-0", vertical ? "flex-col" : "items-center");
  const clone =
    "supports-[animation-timeline:scroll()]:not-[@container_style(--marquee-overflowing:1)]:hidden";

  return (
    <MarqueeContext value={orientation}>
      <div
        className={cn(
          vertical ? "flex h-max flex-col" : "flex w-max items-center",
          vertical && TRACK_ANIMATION.vertical,
          !vertical && TRACK_ANIMATION[reverse ? "reverse" : "forward"],
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

function MarqueeItem({ className, ...props }: React.ComponentProps<"div">) {
  const orientation = use(MarqueeContext);
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

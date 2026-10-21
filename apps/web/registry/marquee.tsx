"use client";

import { Children, createContext, isValidElement, use } from "react";

import { cn } from "@/lib/utils";

function Marquee({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "group/marquee flex flex-col gap-4 overflow-hidden [--scroll-fade-reveal:0px]",
        "[scroll-timeline:--marquee_inline] has-[>[data-slot=marquee-viewport]>[data-orientation=vertical]]:[scroll-timeline:--marquee_block]",
        className
      )}
      data-slot="marquee"
      {...props}
    >
      <div
        className="supports-[animation-timeline:scroll()]:animate-marquee-overflow contents [--scroll-fade-reveal:initial] supports-[animation-timeline:scroll()]:[animation-timeline:--marquee]"
        data-slot="marquee-viewport"
      >
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
          "group-focus-within/marquee:[animation-play-state:paused]",
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
        <div className={cn(copy, clone)} data-slot="marquee-copy" inert>
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

export { Marquee, MarqueeContent, MarqueeItem };

import { PlusIcon } from "@phosphor-icons/react";
import { Button, buttonVariants } from "@portfolio/ui/components/button";
import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MarqueePause,
  MarqueeViewport,
} from "@registry/marquee";
import { useState } from "react";

import type { Showcase, ShowcaseStep } from "@/showcases/showcase";

// Six items fit the strip; the second click adds the seventh, which overflows.
const START_ITEMS = 5;
const ADD = 'role=button[name="Add item"]';
const TABS = 5;

const Scene = () => {
  const [count, setCount] = useState(START_ITEMS);

  return (
    <div className="flex w-[592px] flex-col items-center gap-10">
      {/* The pause button sits left of the strip, out of the layout, so the items don't shift when it appears. */}
      <Marquee className="relative w-full">
        <MarqueePause className="absolute right-full me-2" />
        <MarqueeViewport className="scroll-fade-x items-center-safe py-1">
          <MarqueeContent className="[--marquee-duration:12s]">
            {Array.from({ length: count }, (_, index) => (
              <MarqueeItem key={index}>
                <a
                  className={buttonVariants({ variant: "link" })}
                  href={`#item-${index + 1}`}
                >
                  Item {index + 1}
                </a>
              </MarqueeItem>
            ))}
          </MarqueeContent>
        </MarqueeViewport>
      </Marquee>
      <Button
        aria-label="Add item"
        onClick={() => setCount((current) => current + 1)}
        size="icon"
        variant="outline"
      >
        <PlusIcon aria-hidden />
      </Button>
    </div>
  );
};

export const marqueeHoldsStill: Showcase = {
  Scene,
  start: [0.76, 0.84],
  steps: [
    { rest: 900 },
    { click: ADD },
    { rest: 800 },
    { click: ADD },
    { rest: 500 },
    { moveTo: [0.7, 0.9] },
    { rest: 1500 },
    { click: 'role=button[name="Pause"]' },
    { rest: 1000 },
    { click: 'role=button[name="Play"]' },
    { rest: 400 },
    // The hand leaves the mouse for the keyboard, out of the strip's way.
    { moveTo: [0.24, 0.72] },
    { rest: 600 },
    // Each Tab focuses the next item: the strip stops and scrolls it into view.
    ...Array.from({ length: TABS }, (): ShowcaseStep[] => [
      { press: "Tab" },
      { rest: 700 },
    ]).flat(),
    { rest: 1000 },
  ],
};

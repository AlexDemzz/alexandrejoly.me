import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselStage,
} from "@registry/carousel/carousel";
import { FRAME } from "@registry/carousel/carousel-frame";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

import { CAROUSEL_WINDOW } from "./carousel-window";
import type { LiveProps } from "./pieces";

const WINDOW_STYLE = {
  "--stage-h": `${(FRAME.height / CAROUSEL_WINDOW.h) * 100}%`,
  "--stage-x": `${(-CAROUSEL_WINDOW.x / CAROUSEL_WINDOW.w) * 100}%`,
  "--window-ratio": `${CAROUSEL_WINDOW.w} / ${CAROUSEL_WINDOW.h}`,
} as CSSProperties;

const STAGE_STYLE = {
  "--frame-ratio": `${FRAME.width} / ${FRAME.height}`,
} as CSSProperties;

/**
 * The projector in its slot, with one slide in its tray: each hover presses
 * Next, and the tray turns a whole round back to that slide.
 */
const CarouselLive = ({ active }: LiveProps) => {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = frame.current;
    if (!(active && element)) {
      return;
    }
    let waiting = 0;
    // The slot mounts the piece on its first hover: the press waits for the scene.
    const press = () => {
      const stage = element.querySelector<HTMLElement>(
        '[data-slot="literal-carousel-stage"]'
      );
      const key = element.querySelector<HTMLElement>(
        '[data-literal-carousel="next"]'
      );
      if (!(stage && key) || stage.dataset.view === "poster") {
        waiting = requestAnimationFrame(press);
        return;
      }
      key.click();
    };
    press();
    return () => cancelAnimationFrame(waiting);
  }, [active]);

  return (
    <div
      className="relative aspect-(--window-ratio) h-full overflow-clip"
      ref={frame}
      style={WINDOW_STYLE}
    >
      <Carousel
        className="absolute bottom-0 left-(--stage-x) aspect-(--frame-ratio) h-(--stage-h)"
        // The slot is a link, and a press inside it would follow it. Cancelled
        // here, once the key has taken it.
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        style={STAGE_STYLE}
      >
        <CarouselStage>
          <CarouselContent aria-label="Slide" className="invisible">
            <CarouselItem />
          </CarouselContent>
          <CarouselNext />
        </CarouselStage>
      </Carousel>
    </div>
  );
};

export default CarouselLive;

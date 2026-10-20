import { useEffect, useId, useRef } from "react";
import type { RefObject } from "react";

const PERIOD = 8;
const ITEM_STARTS = [0, 1, 2, 3].map((index) => 1 + index * PERIOD);

// Runs through the Web Animations API rather than CSS so that leaving the row
// can glide on to the next tile, which is the rest pose, instead of snapping.
const SLIDE_MS = 1200;
const SETTLE_MS = 400;
const EASE_SETTLE = "cubic-bezier(0.23, 1, 0.32, 1)";
const SLIDE_FRAMES: Keyframe[] = [
  { transform: "none" },
  { transform: `translateX(-${PERIOD}px)` },
];

const useSlideOnRowHover = (ref: RefObject<SVGGElement | null>) => {
  useEffect(() => {
    const strip = ref.current;
    const row = strip?.closest<HTMLElement>(".group\\/item");
    if (!(strip && row)) {
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canHover = window.matchMedia("(hover: hover)");
    let running: Animation | undefined;

    const settle = () => {
      if (!running) {
        return;
      }
      const { transform } = getComputedStyle(strip);
      running.cancel();
      running = strip.animate(
        [{ transform }, { transform: `translateX(-${PERIOD}px)` }],
        { duration: SETTLE_MS, easing: EASE_SETTLE }
      );
    };

    const slide = () => {
      if (reducedMotion.matches) {
        return;
      }
      running?.cancel();
      running = strip.animate(SLIDE_FRAMES, {
        duration: SLIDE_MS,
        iterations: Number.POSITIVE_INFINITY,
      });
    };

    const onEnter = () => canHover.matches && slide();
    const onLeave = () => {
      if (!row.matches(":focus-visible")) {
        settle();
      }
    };
    const onFocus = () => row.matches(":focus-visible") && slide();
    const onBlur = () => {
      if (!row.matches(":hover")) {
        settle();
      }
    };

    row.addEventListener("pointerenter", onEnter);
    row.addEventListener("pointerleave", onLeave);
    row.addEventListener("focus", onFocus);
    row.addEventListener("blur", onBlur);
    return () => {
      row.removeEventListener("pointerenter", onEnter);
      row.removeEventListener("pointerleave", onLeave);
      row.removeEventListener("focus", onFocus);
      row.removeEventListener("blur", onBlur);
      running?.cancel();
    };
  }, [ref]);
};

// A strip of filled tiles cut at both ends by a scroll fade. On row hover the
// strip slides left one tile at a time, forever, like the marquee; every loop
// frame is the rest pose, so leaving the row eases on to the next one.
export const MarqueeIcon = () => {
  const fadeId = useId();
  const maskId = useId();
  const ref = useRef<SVGGElement>(null);
  useSlideOnRowHover(ref);
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={16}
      viewBox="0 0 24 24"
      width={16}
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={fadeId}
          x1={0}
          x2={24}
          y1={0}
          y2={0}
        >
          <stop offset={0} stopOpacity={0} />
          <stop offset={0.25} />
          <stop offset={0.75} />
          <stop offset={1} stopOpacity={0} />
        </linearGradient>
        {/* Alpha, so the fade needs no colour. */}
        <mask
          className="mask-type-alpha"
          id={maskId}
          maskUnits="userSpaceOnUse"
        >
          <rect fill={`url(#${fadeId})`} height={24} width={24} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <g ref={ref}>
          {ITEM_STARTS.map((start) => (
            <rect height={4} key={start} rx={1} width={6} x={start} y={10} />
          ))}
        </g>
      </g>
    </svg>
  );
};

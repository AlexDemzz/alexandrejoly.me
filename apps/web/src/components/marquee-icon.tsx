import { useId } from "react";

// Keep in step with the marquee-glyph keyframe, which slides one period.
const PERIOD = 8;
const ITEM_STARTS = [0, 1, 2, 3].map((index) => 1 + index * PERIOD);

// A strip of filled tiles cut at both ends by a scroll fade. On row hover the
// strip slides left one tile at a time, forever, like the marquee; every loop
// frame is the rest pose, so leaving the row never looks cut off.
export const MarqueeIcon = () => {
  const fadeId = useId();
  const maskId = useId();
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
        <g className="motion-safe:can-hover:group-hover/item:animate-marquee-glyph motion-safe:group-focus-visible/item:animate-marquee-glyph">
          {ITEM_STARTS.map((start) => (
            <rect height={4} key={start} rx={1} width={6} x={start} y={10} />
          ))}
        </g>
      </g>
    </svg>
  );
};

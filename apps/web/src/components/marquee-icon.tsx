import { useId } from "react";

// Keep in step with the marquee-glyph keyframe, which slides one period.
const PERIOD = 6;
const ITEM_WIDTH = 4;
const ITEM_STARTS = [0, 1, 2, 3].map((index) => 4 + index * PERIOD);

// A frame holding a strip of blocks that fade out at both edges. On row hover
// the strip slides left one block at a time, forever, like the marquee; every
// loop frame is the rest pose, so leaving the row never looks cut off.
export const MarqueeIcon = () => {
  const fadeId = useId();
  const maskId = useId();
  return (
    <svg
      aria-hidden
      fill="none"
      height={16}
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={16}
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={fadeId}
          x1={3}
          x2={21}
          y1={0}
          y2={0}
        >
          <stop offset={0} stopOpacity={0} />
          <stop offset={0.15} />
          <stop offset={0.85} />
          <stop offset={1} stopOpacity={0} />
        </linearGradient>
        {/* Alpha, so the fade needs no colour. */}
        <mask
          className="mask-type-alpha"
          id={maskId}
          maskUnits="userSpaceOnUse"
        >
          <rect
            fill={`url(#${fadeId})`}
            height={14}
            stroke="none"
            width={18}
            x={3}
            y={5}
          />
        </mask>
      </defs>
      <rect height={14} rx={3} width={20} x={2} y={5} />
      <g mask={`url(#${maskId})`}>
        <g className="motion-safe:can-hover:group-hover/item:animate-marquee-glyph motion-safe:group-focus-visible/item:animate-marquee-glyph fill-current stroke-none">
          {ITEM_STARTS.map((start) => (
            <rect
              height={6}
              key={start}
              rx={1}
              width={ITEM_WIDTH}
              x={start}
              y={9}
            />
          ))}
        </g>
      </g>
    </svg>
  );
};

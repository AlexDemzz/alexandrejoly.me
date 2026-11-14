import { useId } from "react";
import type { ReactNode } from "react";

/** Line art on a 24px grid, drawn at the panel's 1.5px stroke. */
const Glyph = ({
  children,
  height = 24,
  width = 24,
}: {
  children: ReactNode;
  height?: number;
  width?: number;
}) => (
  <svg
    aria-hidden
    data-formula-glyph
    fill="none"
    height={height}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    viewBox={`0 0 ${width} ${height}`}
    width={width}
  >
    {children}
  </svg>
);

export const SeatHeatGlyph = () => (
  <Glyph>
    <path d="M6 4.5 7.75 14.5h6.5" />
    <path d="M7.25 18.5h9" />
    <path d="M7.75 14.5 7 18.5" />
    <path d="M13.5 4.5c1 1.25-1 2.5 0 3.75s-1 2.5 0 3.75M17 4.5c1 1.25-1 2.5 0 3.75s-1 2.5 0 3.75M20.5 4.5c1 1.25-1 2.5 0 3.75s-1 2.5 0 3.75" />
  </Glyph>
);

export const DefrostGlyph = () => (
  <Glyph>
    <path d="M3.5 17.5 5.5 9c4.25-1.5 8.75-1.5 13 0l2 8.5" />
    <path d="M3.5 17.5h17" />
    <path d="M9 6.5c.75-.75-.75-1.5 0-2.25M12 6c.75-.75-.75-1.5 0-2.25M15 6.5c.75-.75-.75-1.5 0-2.25" />
  </Glyph>
);

export const WiperGlyph = () => (
  <Glyph>
    <path d="M3 17.5C5 10 19 10 21 17.5" />
    <path d="m12 17.5 5.5-6.5" />
    <path d="M18 6.5v.01M20 8.5v.01M15.5 5.5v.01" />
  </Glyph>
);

export const SpeakerGlyph = ({ muted }: { muted: boolean }) => (
  <Glyph>
    <path d="M4 9.5v5h3.25L12 18.5v-13L7.25 9.5z" />
    {muted ? (
      <path d="m15.5 9.5 5 5m0-5-5 5" />
    ) : (
      <path d="M15.25 9a4.25 4.25 0 0 1 0 6M17.75 6.5a7.75 7.75 0 0 1 0 11" />
    )}
  </Glyph>
);

export const CarGlyph = () => (
  <Glyph width={40}>
    <path d="M3.5 16.5h2.25M11.75 16.5h15.5M33.25 16.5h2.5c.75 0 1-.5 1-1.25V14c0-1.25-.75-2-2-2.25L28 10.5 22 7.5c-1-.5-2-.75-3.25-.75H12c-1.25 0-2.25.5-3 1.25L6 11l-2 .75c-.75.25-1 .75-1 1.5v2c0 .75.25 1.25.5 1.25" />
    <path d="M9.5 11h18.5M18 7v4" />
    <circle cx={8.75} cy={16.5} r={2.5} />
    <circle cx={30.25} cy={16.5} r={2.5} />
  </Glyph>
);

export const TruckGlyph = () => (
  <Glyph>
    <path d="M6 3.5h12c.75 0 1.25.5 1.25 1.25V17.5H4.75V4.75c0-.75.5-1.25 1.25-1.25Z" />
    <path d="M6.75 6h10.5v4.5H6.75z" />
    <path d="M7.5 14h1M15.5 14h1" />
    <path d="M6.5 17.5v2.75h2.5V17.5M15 17.5v2.75h2.5V17.5" />
    <path d="M4.75 8.5h-1.5M19.25 8.5h1.5" />
  </Glyph>
);

export const ArrowUpGlyph = () => (
  <Glyph>
    <path d="M12 18.5v-13M7.5 10 12 5.5l4.5 4.5" />
  </Glyph>
);

export const ArrowDownGlyph = () => (
  <Glyph>
    <path d="M12 5.5v13M7.5 14l4.5 4.5 4.5-4.5" />
  </Glyph>
);

/** The single engraved stroke of a blank key. */
export const EngravedLineGlyph = () => (
  <Glyph width={32}>
    <path d="M3 12h26" />
  </Glyph>
);

export const EngravedArrowGlyph = () => (
  <Glyph>
    <path d="M6 13V6h7M6 6l12 12" />
  </Glyph>
);

/** A four-point sparkle, the one multicoloured mark on the panel. */
export const SparkleGlyph = () => {
  const gradient = useId();
  return (
    <svg
      aria-hidden
      data-formula-sparkle
      height={24}
      viewBox="0 0 24 24"
      width={24}
    >
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id={gradient}
          x1="4"
          x2="20"
          y1="20"
          y2="4"
        >
          <stop offset="0" />
          <stop offset="0.35" />
          <stop offset="0.7" />
          <stop offset="1" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5c.6 5.1 4.4 8.9 9.5 9.5-5.1.6-8.9 4.4-9.5 9.5-.6-5.1-4.4-8.9-9.5-9.5 5.1-.6 8.9-4.4 9.5-9.5Z"
        fill={`url(#${gradient})`}
      />
    </svg>
  );
};

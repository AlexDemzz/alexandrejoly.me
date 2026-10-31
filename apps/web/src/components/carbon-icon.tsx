import type { CSSProperties } from "react";

// Carbon's menu bar glyph: three soft lattice cells around a dot. On row hover
// it turns into the mic meter Carbon shows while a meeting is transcribed: the
// cells fold away and three bars grow out of the dot, then move.
const CELLS = [
  "M6.359 8.5 6.315 8.475C5.779 8.165 5.449 7.556 5.449 6.875V5.925C5.449 4.656 6.126 3.484 7.225 2.85 8.324 2.216 9.676 2.216 10.775 2.85 11.874 3.484 12.551 4.656 12.551 5.925V6.875C12.551 7.556 12.221 8.165 11.685 8.475L11.641 8.5",
  "M9 13.075V13.125C9 13.744 8.637 14.335 8.047 14.675L7.225 15.15C6.126 15.784 4.773 15.784 3.674 15.15 2.575 14.516 1.899 13.344 1.899 12.075 1.899 10.806 2.575 9.634 3.674 9L4.497 8.525C5.086 8.185 5.779 8.165 6.315 8.475L6.359 8.5",
  "M11.641 8.5 11.685 8.475C12.221 8.165 12.914 8.185 13.503 8.525L14.326 9C15.425 9.634 16.101 10.806 16.101 12.075 16.101 13.344 15.425 14.516 14.326 15.15 13.227 15.784 11.874 15.784 10.775 15.15L9.953 14.675C9.363 14.335 9 13.744 9 13.125V13.075",
  "M5.449 6.875C5.449 7.556 5.086 8.185 4.497 8.525",
  "M12.551 6.875C12.551 7.556 12.914 8.185 13.503 8.525",
  "M8.047 14.675C8.637 14.335 9.363 14.335 9.953 14.675",
];

// Carbon 0.5.0's meter: 2 pt bars, 4 pt apart, up to 12 pt tall. `level` is the
// still height reduced motion keeps; `duration` and `delay` desync the bars.
const BARS = [
  { delay: "-0.4s", duration: "1.1s", level: 0.6, x: 4 },
  { delay: "0s", duration: "0.9s", level: 1, x: 8 },
  { delay: "-0.7s", duration: "1.3s", level: 0.75, x: 12 },
];
const BAR_HEIGHT = 12;

const SHOWN =
  "can-hover:group-hover/item:opacity-100 group-focus-visible/item:opacity-100";
const HIDDEN =
  "can-hover:group-hover/item:opacity-0 group-focus-visible/item:opacity-0";

export const CarbonIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={className}
    fill="none"
    height={16}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    viewBox="0 0 18 18"
    width={16}
  >
    <g
      className={`ease-settle motion-safe:can-hover:group-hover/item:scale-75 origin-center transition duration-300 transform-fill motion-safe:group-focus-visible/item:scale-75 ${HIDDEN}`}
    >
      {CELLS.map((d) => (
        <path d={d} key={d} />
      ))}
      <circle cx={9} cy={10.025} fill="currentColor" r={1.4} stroke="none" />
    </g>
    {BARS.map((bar) => (
      <g
        className={`ease-settle motion-safe:can-hover:group-hover/item:scale-y-100 origin-center opacity-0 transition duration-300 transform-fill motion-safe:scale-y-[0.17] motion-safe:group-focus-visible/item:scale-y-100 ${SHOWN}`}
        key={bar.x}
      >
        <rect
          className="mic-meter can-hover:group-hover/item:mic-meter-running group-focus-visible/item:mic-meter-running origin-center fill-current transform-fill"
          height={BAR_HEIGHT}
          rx={1}
          stroke="none"
          style={
            {
              "--mic-meter-delay": bar.delay,
              "--mic-meter-duration": bar.duration,
              "--mic-meter-level": bar.level,
            } as CSSProperties
          }
          width={2}
          x={bar.x}
          y={9 - BAR_HEIGHT / 2}
        />
      </g>
    ))}
  </svg>
);

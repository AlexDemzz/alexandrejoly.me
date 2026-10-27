// Carbon's mark, the 18 pt menu bar glyph from the icon board
// (carbon/.scratch/carbon-v1/prototypes/icon-board/final/menubar-idle.svg).
// While a Meeting is live only the central dot turns red.
const CELLS = [
  "M6.359 8.5 6.315 8.475C5.779 8.165 5.449 7.556 5.449 6.875V5.925C5.449 4.656 6.126 3.484 7.225 2.85 8.324 2.216 9.676 2.216 10.775 2.85 11.874 3.484 12.551 4.656 12.551 5.925V6.875C12.551 7.556 12.221 8.165 11.685 8.475L11.641 8.5",
  "M9 13.075V13.125C9 13.744 8.637 14.335 8.047 14.675L7.225 15.15C6.126 15.784 4.773 15.784 3.674 15.15 2.575 14.516 1.899 13.344 1.899 12.075 1.899 10.806 2.575 9.634 3.674 9L4.497 8.525C5.086 8.185 5.779 8.165 6.315 8.475L6.359 8.5",
  "M11.641 8.5 11.685 8.475C12.221 8.165 12.914 8.185 13.503 8.525L14.326 9C15.425 9.634 16.101 10.806 16.101 12.075 16.101 13.344 15.425 14.516 14.326 15.15 13.227 15.784 11.874 15.784 10.775 15.15L9.953 14.675C9.363 14.335 9 13.744 9 13.125V13.075",
  "M5.449 6.875C5.449 7.556 5.086 8.185 4.497 8.525",
  "M12.551 6.875C12.551 7.556 12.914 8.185 13.503 8.525",
  "M8.047 14.675C8.637 14.335 9.363 14.335 9.953 14.675",
];

export const RECORDING_RED = "#ff3b30";

export const CarbonMark = ({
  size,
  color = "currentColor",
  live = false,
}: {
  size: number;
  color?: string;
  live?: boolean;
}) => (
  <svg height={size} viewBox="0 0 18 18" width={size}>
    {CELLS.map((d) => (
      <path
        d={d}
        fill="none"
        key={d}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
      />
    ))}
    <circle cx={9} cy={10.025} fill={live ? RECORDING_RED : color} r={1.4} />
  </svg>
);

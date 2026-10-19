import { cn } from "@portfolio/ui/lib/utils";

// The modal stack. On row hover it fans out vertically, each layer further
// back and fainter. Opacity sits on the group and the transform on the path,
// so each element transitions only its own property.
const Layer = ({
  d,
  fade,
  move,
  timing,
}: {
  d: string;
  fade?: string;
  move: string;
  timing: string;
}) => (
  <g className={cn("transition-opacity", timing, fade)}>
    <path
      className={cn("transition-transform transform-fill", timing, move)}
      clipRule="evenodd"
      d={d}
      fillRule="evenodd"
    />
  </g>
);

export const ReactEasyModalsIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={cn("overflow-visible", className)}
    fill="currentColor"
    height={16}
    viewBox="0 0 500 500"
    width={16}
  >
    <Layer
      d="M442.515 470.873C441.34 486.958 427.92 499.643 411.536 499.643H88.4652C72.0806 499.643 58.6595 486.958 57.4849 470.873C63.1615 473.568 69.5098 475.079 76.2115 475.079H423.788C430.49 475.079 436.838 473.568 442.515 470.873Z"
      fade="motion-safe:can-hover:group-hover/item:opacity-60 motion-safe:group-focus-visible/item:opacity-60"
      move="motion-safe:can-hover:group-hover/item:translate-y-[40px] motion-safe:group-focus-visible/item:translate-y-[40px]"
      timing="ease-settle duration-250 motion-safe:can-hover:group-hover/item:delay-60 motion-safe:group-focus-visible/item:delay-60"
    />
    <Layer
      d="M43.4246 431.686C51.0253 437.231 60.3877 440.505 70.5161 440.505H429.484C439.611 440.505 448.974 437.233 456.574 431.69C456.396 449.647 441.787 464.149 423.788 464.149H76.2115C58.2115 464.149 43.6008 449.645 43.4246 431.686Z"
      fade="motion-safe:can-hover:group-hover/item:opacity-80 motion-safe:group-focus-visible/item:opacity-80"
      move="motion-safe:can-hover:group-hover/item:translate-y-[6px] motion-safe:group-focus-visible/item:translate-y-[6px]"
      timing="ease-settle duration-250 motion-safe:can-hover:group-hover/item:delay-30 motion-safe:group-focus-visible/item:delay-30"
    />
    <Layer
      d="M429.484 1C448.547 1 464 16.4534 464 35.5161V394.484C464 413.547 448.547 429 429.484 429H70.5161C51.4534 429 36 413.547 36 394.484V35.5161C36 16.4534 51.4534 1 70.5161 1H429.484ZM403.315 53.5202L383.383 33.5881L371.179 45.7912L391.112 65.7234L371.179 85.6555L383.383 97.8586L403.315 77.9265L423.247 97.8586L435.45 85.6555L415.518 65.7234L435.45 45.7912L423.247 33.5881L403.315 53.5202Z"
      move="motion-safe:can-hover:group-hover/item:translate-y-[-36px] motion-safe:group-focus-visible/item:translate-y-[-36px]"
      timing="ease-settle duration-250"
    />
  </svg>
);

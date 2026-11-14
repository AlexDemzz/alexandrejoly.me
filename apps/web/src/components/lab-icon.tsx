const CELLS = [0, 1, 2].flatMap((row) =>
  [0, 1, 2].map((col) => ({ col, row }))
);

// Light falls from the top left; on hover or focus it crosses to the bottom right.
const TONES = [
  "opacity-100 can-hover:group-hover/item:opacity-25 group-focus-visible/item:opacity-25",
  "opacity-80 can-hover:group-hover/item:opacity-45 group-focus-visible/item:opacity-45",
  "opacity-60",
  "opacity-45 can-hover:group-hover/item:opacity-80 group-focus-visible/item:opacity-80",
  "opacity-25 can-hover:group-hover/item:opacity-100 group-focus-visible/item:opacity-100",
] as const;

// A field of glyph cells shaded as one luminance ramp, like a Lab canvas.
export const LabIcon = () => (
  <svg
    aria-hidden
    fill="currentColor"
    height={16}
    viewBox="0 0 24 24"
    width={16}
  >
    {CELLS.map(({ col, row }) => (
      <rect
        className={`${TONES[col + row]} transition-opacity duration-300 ease-out`}
        height={4}
        key={`${col}-${row}`}
        rx={1}
        width={4}
        x={3 + col * 7}
        y={3 + row * 7}
      />
    ))}
  </svg>
);

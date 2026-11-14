// The g-force display: a cross of two rulers with the reading's square at the
// centre. On row hover the square slides out along a corner, as if the car
// braked into a turn, and settles back on leave.
export const FormulaIcon = () => (
  <svg
    aria-hidden
    fill="none"
    height={16}
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    width={16}
  >
    <path className="opacity-45" d="M3 12h18M12 3v18" />
    <rect
      className="ease-settle motion-safe:can-hover:group-hover/item:translate-x-1 motion-safe:can-hover:group-hover/item:-translate-y-1 transition-transform duration-300 transform-fill motion-safe:group-focus-visible/item:translate-x-1 motion-safe:group-focus-visible/item:-translate-y-1"
      fill="currentColor"
      height={4}
      width={4}
      x={10}
      y={10}
    />
  </svg>
);

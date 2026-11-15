// The Formula 2030 mark: a plain square that grows on row hover.
export const FormulaIcon = () => (
  <svg
    aria-hidden
    fill="currentColor"
    height={16}
    viewBox="0 0 24 24"
    width={16}
  >
    <rect
      className="ease-settle motion-safe:can-hover:group-hover/item:scale-125 origin-center transition-transform duration-300 transform-fill motion-safe:group-focus-visible/item:scale-125"
      height={12}
      width={12}
      x={6}
      y={6}
    />
  </svg>
);

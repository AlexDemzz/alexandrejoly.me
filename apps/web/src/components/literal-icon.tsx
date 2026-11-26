// The Literal UI mark: a button taken at its word, a key seen from the front.
// On row hover its top presses down into the skirt.
export const LiteralIcon = () => (
  <svg
    aria-hidden
    fill="none"
    height={16}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    width={16}
  >
    <path d="M3 10v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7" />
    <rect
      className="ease-settle motion-safe:can-hover:group-hover/item:translate-y-[3px] transition-transform duration-200 motion-safe:group-focus-visible/item:translate-y-[3px]"
      height={10}
      rx={3}
      width={18}
      x={3}
      y={4}
    />
  </svg>
);

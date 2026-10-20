// Four tiles, the shadcn "add a component" glyph. On row hover the corner tile
// turns into a diamond, as if snapping into place.
export const ComponentIcon = () => (
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
    <rect height={6} rx={1} width={6} x={4} y={4} />
    <rect height={6} rx={1} width={6} x={4} y={14} />
    <rect height={6} rx={1} width={6} x={14} y={14} />
    <rect
      className="ease-settle motion-safe:can-hover:group-hover/item:rotate-45 origin-center transition-transform duration-200 transform-fill motion-safe:group-focus-visible/item:rotate-45"
      height={6}
      rx={1}
      width={6}
      x={14}
      y={4}
    />
  </svg>
);

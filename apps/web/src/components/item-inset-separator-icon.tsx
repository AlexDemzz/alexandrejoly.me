// One row, a media square then a line of text, with a faint separator below
// that starts where the text starts. On row hover the separator draws out from
// the text start to the row's end.
export const ItemInsetSeparatorIcon = () => (
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
    <rect
      fill="currentColor"
      height={6}
      rx={1.5}
      stroke="none"
      width={6}
      x={3}
      y={6}
    />
    <path d="M13 9H21" />
    <path
      className="ease-settle motion-safe:can-hover:group-hover/item:scale-x-100 motion-safe:can-hover:group-hover/item:opacity-100 origin-left scale-x-50 opacity-35 transition duration-200 transform-fill motion-safe:group-focus-visible/item:scale-x-100 motion-safe:group-focus-visible/item:opacity-100"
      d="M13 17H21"
      strokeWidth={1.5}
    />
  </svg>
);

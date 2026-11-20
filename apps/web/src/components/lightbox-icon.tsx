// A thumbnail inside four faint corner marks. On row hover the thumbnail
// grows toward the corners as they light up, the way the viewer opens.
export const LightboxIcon = () => (
  <svg
    aria-hidden
    fill="none"
    height={16}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    width={16}
  >
    <path
      className="ease-settle motion-safe:can-hover:group-hover/item:opacity-100 opacity-35 transition duration-200 motion-safe:group-focus-visible/item:opacity-100"
      d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"
    />
    <rect
      className="ease-settle motion-safe:can-hover:group-hover/item:scale-125 origin-center transition duration-200 transform-fill motion-safe:group-focus-visible/item:scale-125"
      height={8}
      rx={1.5}
      width={8}
      x={8}
      y={8}
    />
  </svg>
);

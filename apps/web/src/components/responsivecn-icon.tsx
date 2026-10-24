// A centred dialog box. On row hover it slides down and widens into a bottom
// drawer with its handle, the desktop overlay turning into its mobile one.
export const ResponsivecnIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={className}
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
      className="ease-settle motion-safe:can-hover:group-hover/item:translate-y-[5px] motion-safe:can-hover:group-hover/item:scale-x-125 motion-safe:can-hover:group-hover/item:opacity-0 origin-center transition duration-300 transform-fill motion-safe:group-focus-visible/item:translate-y-[5px] motion-safe:group-focus-visible/item:scale-x-125 motion-safe:group-focus-visible/item:opacity-0"
      d="M7 8h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z"
    />
    <g className="ease-settle motion-safe:can-hover:group-hover/item:translate-y-0 motion-safe:can-hover:group-hover/item:scale-x-100 motion-safe:can-hover:group-hover/item:opacity-100 origin-bottom -translate-y-[5px] scale-x-80 opacity-0 transition duration-300 transform-fill motion-safe:group-focus-visible/item:translate-y-0 motion-safe:group-focus-visible/item:scale-x-100 motion-safe:group-focus-visible/item:opacity-100">
      <path d="M3 21v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5" />
      <path d="M10.5 17.5h3" />
    </g>
  </svg>
);

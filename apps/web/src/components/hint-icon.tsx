// A small trigger with a popover bubble pointing down at it. On row hover the
// faint bubble opens out of the trigger, growing from its tail.
export const HintIcon = () => (
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
    <path
      className="ease-settle motion-safe:can-hover:group-hover/item:scale-100 motion-safe:can-hover:group-hover/item:opacity-100 origin-bottom scale-90 opacity-35 transition duration-200 transform-fill motion-safe:group-focus-visible/item:scale-100 motion-safe:group-focus-visible/item:opacity-100"
      d="M6 3h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-4l-2 2-2-2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
    />
    <circle cx={12} cy={18} r={3} />
  </svg>
);

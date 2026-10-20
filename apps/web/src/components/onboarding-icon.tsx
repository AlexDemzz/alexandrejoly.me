// The onboarding's segmented progress: three steps, the first one done. On row
// hover the second segment fills from its left edge, as if "next" was pressed.
export const OnboardingIcon = () => (
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
    <path d="M3 12H6" />
    <path className="opacity-35" d="M10.5 12H13.5" />
    <path className="opacity-35" d="M18 12H21" />
    <path
      className="ease-settle motion-safe:can-hover:group-hover/item:scale-x-100 motion-safe:can-hover:group-hover/item:opacity-100 origin-left scale-x-25 opacity-0 transition duration-200 transform-fill motion-safe:group-focus-visible/item:scale-x-100 motion-safe:group-focus-visible/item:opacity-100"
      d="M10.5 12H13.5"
    />
  </svg>
);

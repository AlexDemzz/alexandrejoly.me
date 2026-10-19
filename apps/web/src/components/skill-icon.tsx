// The slash of a slash command. On row hover it straightens into a text caret
// and blinks, as if waiting for the command to be typed.
export const SkillIcon = () => (
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
    <path
      className="ease-settle motion-safe:can-hover:group-hover/item:rotate-0 motion-safe:can-hover:group-hover/item:animate-caret-blink motion-safe:group-focus-visible/item:animate-caret-blink origin-center rotate-20 transition-transform duration-200 transform-fill motion-safe:group-focus-visible/item:rotate-0"
      d="M12 5V19"
    />
  </svg>
);

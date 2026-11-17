// The Ferrari SF-25 Wheel mark: a wheel with its screen and grips that turns into a
// corner on row hover.
export const Formula1Icon = () => (
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
    <g className="ease-settle motion-safe:can-hover:group-hover/item:-rotate-20 origin-center transition-transform duration-300 transform-fill motion-safe:group-focus-visible/item:-rotate-20">
      <path d="M7 6H17C19.5 6 21 7.5 21 10V17C21 18.5 19.5 19 18.5 18L16.5 15H7.5L5.5 18C4.5 19 3 18.5 3 17V10C3 7.5 4.5 6 7 6Z" />
      <rect height={3} rx={1} width={6} x={9} y={9} />
    </g>
  </svg>
);

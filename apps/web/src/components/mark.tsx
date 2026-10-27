// DESIGN.md › Components › Identity: the 2025 arc and bar redrawn as a single
// 2px line on a 24px grid, drawn on when the page loads.
export const Mark = () => (
  <svg
    aria-hidden
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      className="animate-mark-draw"
      d="M3 12A9 9 0 1 1 12 21"
      pathLength={1}
    />
    <path className="animate-mark-draw-late" d="M9.5 12H14.5" pathLength={1} />
  </svg>
);

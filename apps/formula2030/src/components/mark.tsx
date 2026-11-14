/** The site mark, the same drawing as public/favicon.svg. */
export const Mark = () => (
  <svg aria-hidden="true" className="mark" viewBox="0 0 32 32">
    <rect fill="var(--formula-glass)" height="32" rx="7" width="32" />
    <path
      d="M8.5 14.5v3M11 14.5v3M13.5 14.5v3M18.5 14.5v3M21 14.5v3M23.5 14.5v3"
      stroke="var(--formula-glass-dim)"
    />
    <path d="M6 13v6M26 13v6" stroke="var(--formula-limit)" />
    <path d="M16 7v18" stroke="var(--formula-glass-ink)" strokeWidth="1.25" />
    <rect
      fill="var(--formula-glass-ink)"
      height="7"
      width="7"
      x="12.5"
      y="12.5"
    />
  </svg>
);

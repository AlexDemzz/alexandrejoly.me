import type { ReactNode } from "react";

const Glyph = ({ children }: { children: ReactNode }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="20"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 20 20"
    width="20"
  >
    {children}
  </svg>
);

export const CopyGlyph = () => (
  <Glyph>
    <rect height="10" rx="1.5" width="10" x="7" y="7" />
    <path d="M13 4.5V4.25A1.25 1.25 0 0 0 11.75 3h-7.5A1.25 1.25 0 0 0 3 4.25v7.5A1.25 1.25 0 0 0 4.25 13h.25" />
  </Glyph>
);

export const CheckGlyph = () => (
  <Glyph>
    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
  </Glyph>
);

export const LockGlyph = () => (
  <Glyph>
    <rect height="8" rx="1.5" width="11" x="4.5" y="9" />
    <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
  </Glyph>
);

export const BoostGlyph = () => (
  <Glyph>
    <path d="M11 2.5 5 11h4.5L9 17.5l6-8.5h-4.5z" />
  </Glyph>
);

export const HornGlyph = () => (
  <Glyph>
    <path d="M3.5 8v4h2.75L10 15V5L6.25 8z" />
    <path d="M12.75 7.5a3.5 3.5 0 0 1 0 5" />
    <path d="M15 5.25a6.5 6.5 0 0 1 0 9.5" />
  </Glyph>
);

export const BeamGlyph = () => (
  <Glyph>
    <path d="M9 4.5a5.5 5.5 0 0 0 0 11c1.4-1.4 2-3.3 2-5.5s-.6-4.1-2-5.5z" />
    <path d="M13.5 6.5h3M13.75 10h3M13.5 13.5h3" />
  </Glyph>
);

export const PreviousGlyph = () => (
  <Glyph>
    <path d="M12.5 5.5 8 10l4.5 4.5" />
  </Glyph>
);

export const NextGlyph = () => (
  <Glyph>
    <path d="M7.5 5.5 12 10l-4.5 4.5" />
  </Glyph>
);

export const DefrostGlyph = () => (
  <Glyph>
    <rect height="10" rx="2" width="14" x="3" y="5" />
    <path d="M7 8c1 1-1 2.5 0 4M10 8c1 1-1 2.5 0 4M13 8c1 1-1 2.5 0 4" />
  </Glyph>
);

export const RecirculateGlyph = () => (
  <Glyph>
    <path d="M15.5 10a5.5 5.5 0 0 1-9.6 3.7" />
    <path d="M4.5 10a5.5 5.5 0 0 1 9.6-3.7" />
    <path d="M14.25 3.5v3h-3M5.75 16.5v-3h3" />
  </Glyph>
);

export const SeatGlyph = () => (
  <Glyph>
    <path d="M6 3.5 7.5 12H14" />
    <path d="M6.5 15.5H15" />
    <path d="M11 4c1 1-1 2 0 3.5M14 4c1 1-1 2 0 3.5" />
  </Glyph>
);

export const HazardGlyph = () => (
  <Glyph>
    <path d="M10 3.5 17 16H3z" />
    <path d="M10 8.25 12.75 13.5h-5.5z" />
  </Glyph>
);

export const FaceGlyph = () => (
  <Glyph>
    <circle cx="6.5" cy="5.5" r="2" />
    <path d="M5 9.5v4.25h4.5l2 3" />
    <path d="M10.5 6.5h5M13.5 4.5l2 2-2 2" />
  </Glyph>
);

export const FeetGlyph = () => (
  <Glyph>
    <circle cx="6.5" cy="5.5" r="2" />
    <path d="M5 9.5v4.25h4.5l2 3" />
    <path d="M10.5 12h5M13.5 10l2 2-2 2" />
  </Glyph>
);

export const ScreenGlyph = () => (
  <Glyph>
    <path d="M3.5 7.5C7.5 5 12.5 5 16.5 7.5L15 14H5z" />
    <path d="M10 8.5v3M8.5 10l1.5-1.5 1.5 1.5" />
  </Glyph>
);

import { useId } from "react";

// A list clipped to its frame, the next page waiting below it. On row hover the
// list scrolls up one row and the next row fades in at the bottom.
export const InfiniteScrollIcon = () => {
  const clipId = useId();
  return (
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
      <clipPath id={clipId}>
        <rect height={16} width={24} y={4} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <g className="ease-settle motion-safe:can-hover:group-hover/item:-translate-y-[6px] transition-transform duration-200 motion-safe:group-focus-visible/item:-translate-y-[6px]">
          <path d="M4 6H20" />
          <path d="M4 12H16" />
          <path d="M4 18H20" />
          <path
            className="ease-settle motion-safe:can-hover:group-hover/item:opacity-100 opacity-0 transition-opacity duration-200 motion-safe:group-focus-visible/item:opacity-100"
            d="M4 24H14"
          />
        </g>
      </g>
    </svg>
  );
};

import { useId } from "react";

// Skippr's soft-compass mark, the centre ring knocked out by a mask. On row
// hover the star turns a quarter (90deg, its four-fold symmetry).
export const SkipprIcon = ({ className }: { className?: string }) => {
  const maskId = useId();
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      height={16}
      viewBox="0 0 100 100"
      width={16}
    >
      <mask id={maskId}>
        <rect className="fill-white" height={100} width={100} />
        <circle className="fill-black" cx={50} cy={50} r={7.5} />
        <circle className="fill-white" cx={50} cy={50} r={3.2} />
      </mask>
      <path
        className="ease-settle motion-safe:can-hover:group-hover/item:rotate-90 origin-center transition-transform duration-600 transform-fill motion-safe:group-focus-visible/item:rotate-90"
        d="M50 7 L59 41 L93 50 L59 59 L50 93 L41 59 L7 50 L41 41 Z"
        mask={`url(#${maskId})`}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={6}
      />
    </svg>
  );
};

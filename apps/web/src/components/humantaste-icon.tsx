// humantaste's palette mark: a disc with a thumb hole and a bite taken out of
// its edge. On row hover the palette tilts, as if picked up to paint.
export const HumantasteIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={className}
    fill="currentColor"
    height={16}
    viewBox="3.5 3.5 25 25"
    width={16}
  >
    <path
      className="ease-settle motion-safe:can-hover:group-hover/item:-rotate-30 origin-center transition-transform duration-600 transform-fill motion-safe:group-focus-visible/item:-rotate-30"
      d="M27.72 18.58A12 12 0 1 0 18.58 27.72A1 1 0 0 0 19.29 26.36A5.4 5.4 0 0 1 26.36 19.29A1 1 0 0 0 27.72 18.58ZM12.48 15.28a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0Z"
      fillRule="evenodd"
    />
  </svg>
);

// The collar holding the plate on the bar, and the plate itself. On row hover
// the plate turns one lobe (72deg, its five-fold symmetry) around the bar.
export const GymupIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden
    className={className}
    fill="currentColor"
    height={16}
    viewBox="0 0 103 103"
    width={16}
  >
    <path d="M51 28.8691C63.3535 28.8692 73.3686 38.8839 73.3691 51.2373C73.3691 63.5911 63.3538 73.6064 51 73.6064C38.6462 73.6064 28.6318 63.5912 28.6318 51.2373C28.6324 38.8839 38.6465 28.8692 51 28.8691Z" />
    <path
      className="ease-settle motion-safe:can-hover:group-hover/item:rotate-72 origin-center transition-transform duration-600 transform-fill motion-safe:group-focus-visible/item:rotate-72"
      clipRule="evenodd"
      d="M51.4805 0.457031C79.6701 0.457034 102.523 23.3095 102.523 51.499C102.523 79.689 79.6704 102.542 51.4805 102.542C23.2907 102.542 0.438477 79.6888 0.438477 51.499C0.438974 23.3096 23.291 0.457266 51.4805 0.457031ZM73.1299 23.2793C72.2823 9.50164 54.3982 4.70967 46.7754 16.2178C43.3866 21.3346 37.1248 23.7391 31.1826 22.2041C17.8166 18.7515 7.73313 34.2797 16.3232 45.0859C20.142 49.8898 20.4927 56.5878 17.1973 61.7646C9.78306 73.4097 21.4351 87.7988 34.3672 82.9678C40.1161 80.8204 46.595 82.557 50.5 87.291C59.284 97.9408 76.5698 91.3055 75.9717 77.5137C75.7061 71.3825 79.359 65.7567 85.0684 63.5059C97.9107 58.4425 96.9421 39.9528 83.6406 36.2598C77.7271 34.618 73.5063 29.405 73.1299 23.2793Z"
      fillRule="evenodd"
    />
  </svg>
);

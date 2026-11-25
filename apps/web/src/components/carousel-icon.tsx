import { SlideshowIcon } from "@phosphor-icons/react";

// The Carousel mark: a slide that steps aside on row hover.
export const CarouselIcon = () => (
  <SlideshowIcon
    aria-hidden
    className="ease-settle motion-safe:can-hover:group-hover/item:translate-x-0.5 transition-transform duration-300 motion-safe:group-focus-visible/item:translate-x-0.5"
    size={16}
  />
);

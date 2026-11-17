import { GameControllerIcon } from "@phosphor-icons/react";

// The Ferrari SF-25 Wheel mark: a game controller that steers into a corner on
// row hover.
export const Formula1Icon = () => (
  <GameControllerIcon
    aria-hidden
    className="ease-settle motion-safe:can-hover:group-hover/item:-rotate-20 origin-center transition-transform duration-300 motion-safe:group-focus-visible/item:-rotate-20"
    size={16}
  />
);

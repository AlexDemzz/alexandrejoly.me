import { RadioIcon as RadioSetIcon } from "@phosphor-icons/react";

// The Radio mark: a set that hops on row hover.
export const RadioIcon = () => (
  <RadioSetIcon
    aria-hidden
    className="ease-settle motion-safe:can-hover:group-hover/item:-translate-y-0.5 transition-transform duration-300 motion-safe:group-focus-visible/item:-translate-y-0.5"
    size={16}
  />
);

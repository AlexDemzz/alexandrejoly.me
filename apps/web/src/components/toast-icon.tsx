import { BreadIcon } from "@phosphor-icons/react";

// The Toast mark: a slice of bread that pops up on row hover.
export const ToastIcon = () => (
  <BreadIcon
    aria-hidden
    className="ease-settle motion-safe:can-hover:group-hover/item:-translate-y-0.5 transition-transform duration-300 motion-safe:group-focus-visible/item:-translate-y-0.5"
    size={16}
  />
);

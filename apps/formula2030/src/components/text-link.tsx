import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const BASE =
  "focus-ring rounded-xs underline decoration-1 underline-offset-3 transition-colors duration-150 ease-out touch-manipulation hover:decoration-current active:text-fg active:decoration-current";

/**
 * A text link, underlined in a faint tint of its colour. `quiet` hides the
 * underline until hover, for links whose place already says they are links.
 */
export const TextLink = ({
  children,
  className,
  quiet = false,
  ...props
}: ComponentProps<"a"> & { quiet?: boolean }) => (
  <a
    className={cn(
      BASE,
      quiet ? "decoration-transparent" : "decoration-current/35",
      className
    )}
    {...props}
  >
    {children}
  </a>
);

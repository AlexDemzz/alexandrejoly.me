import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

// DESIGN.md › Components › Divider: four segments, sparse to solid.
const Dither = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    aria-hidden
    className={cn("text-foreground grid h-8 grid-cols-4", className)}
    data-slot="dither"
    {...props}
  >
    <span className="dither-sparse bg-current" />
    <span className="dither-light bg-current" />
    <span className="dither-half bg-current" />
    <span className="bg-current" />
  </div>
);

export { Dither };

import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

// DESIGN.md › Components › Preview: a live demo centred on the page itself,
// no frame, no fill; space alone sets it apart.
const Preview = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex min-h-60 items-center justify-center overflow-clip py-10",
      className
    )}
    data-slot="preview"
    {...props}
  />
);

export { Preview };

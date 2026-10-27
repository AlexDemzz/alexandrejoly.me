import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

// DESIGN.md › Docs pages › Preview: docs-only card, a single hairline at a
// 16px radius and no fill, so demos keep the page background they fade into.
const Preview = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "ring-border flex min-h-60 items-center justify-center overflow-clip rounded-xl p-6 ring-1 sm:p-10",
      className
    )}
    data-slot="preview"
    {...props}
  />
);

export { Preview };

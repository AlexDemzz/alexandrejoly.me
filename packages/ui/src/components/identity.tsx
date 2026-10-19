import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

// DESIGN.md › Typography: a 44px mark, the name at 500 over the role at 450.
const Identity = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("flex items-center gap-3 leading-snug", className)}
    data-slot="identity"
    {...props}
  />
);

const IdentityMark = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "text-foreground flex size-11 shrink-0 items-center justify-center [&_svg]:size-full",
      className
    )}
    data-slot="identity-mark"
    {...props}
  />
);

const IdentityName = ({
  children,
  className,
  ...props
}: React.ComponentProps<"h1">) => (
  <h1
    className={cn("font-medium", className)}
    data-slot="identity-name"
    {...props}
  >
    {children}
  </h1>
);

const IdentityRole = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p
    className={cn("font-book text-muted-foreground", className)}
    data-slot="identity-role"
    {...props}
  />
);

export { Identity, IdentityMark, IdentityName, IdentityRole };

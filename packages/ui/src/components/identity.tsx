import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

// DESIGN.md › Identity: a 40px mark over one 20px statement that names the
// person at 500 in ink while the rest of the statement stays muted.
const Identity = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("flex flex-col gap-6", className)}
    data-slot="identity"
    {...props}
  />
);

const IdentityMark = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("text-foreground size-10 [&_svg]:size-full", className)}
    data-slot="identity-mark"
    {...props}
  />
);

const IdentityStatement = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "text-muted-foreground text-xl leading-relaxed text-balance",
      className
    )}
    data-slot="identity-statement"
    {...props}
  />
);

const IdentityName = ({
  children,
  className,
  ...props
}: React.ComponentProps<"h1">) => (
  <h1
    className={cn("text-foreground inline font-medium", className)}
    data-slot="identity-name"
    {...props}
  >
    {children}
  </h1>
);

export { Identity, IdentityMark, IdentityName, IdentityStatement };

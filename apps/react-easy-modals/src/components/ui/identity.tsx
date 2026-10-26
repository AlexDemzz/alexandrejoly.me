import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type * as React from "react";

import { cn } from "@/lib/utils";

// DESIGN.md › Typography: a 44px mark, the name at 500 over the role at 450.
// The whole identity is the `group/identity` that fans out the stack mark.
const Identity = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "group/identity flex items-center gap-3 leading-snug",
      className
    )}
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

// An `h1` on a page header; `render` picks another element, e.g. in the rail.
const IdentityName = ({
  className,
  render,
  ...props
}: useRender.ComponentProps<"h1">) =>
  useRender({
    defaultTagName: "h1",
    props: mergeProps<"h1">(
      { className: cn("text-foreground font-medium", className) },
      props
    ),
    render,
    state: { slot: "identity-name" },
  });

const IdentityRole = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p
    className={cn("font-book text-muted-foreground", className)}
    data-slot="identity-role"
    {...props}
  />
);

export { Identity, IdentityMark, IdentityName, IdentityRole };

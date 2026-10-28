import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

// DESIGN.md › Site › Components › Identity: a 40px mark over one 20px statement
// that names the person at 500 in foreground while the rest of the statement
// stays muted.
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

// Renders an `h1` unless `render` picks another element.
const IdentityName = ({
  className,
  render,
  ...props
}: useRender.ComponentProps<"h1">) =>
  useRender({
    defaultTagName: "h1",
    props: mergeProps<"h1">(
      { className: cn("text-foreground inline font-medium", className) },
      props
    ),
    render,
    state: { slot: "identity-name" },
  });

export { Identity, IdentityMark, IdentityName, IdentityStatement };

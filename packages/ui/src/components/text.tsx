import { cn } from "@portfolio/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

// DESIGN.md › Colour: prose is muted by default; links switch to ink.
const textVariants = cva("text-pretty", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "text-muted-foreground",
      faint: "text-faint-foreground text-sm",
    },
  },
});

const Text = ({
  className,
  variant,
  ...props
}: React.ComponentProps<"p"> & VariantProps<typeof textVariants>) => (
  <p
    className={cn(textVariants({ className, variant }))}
    data-slot="text"
    {...props}
  />
);

// DESIGN.md › Components › Text link.
const textLinkVariants = cva(
  "font-book text-foreground decoration-underline can-hover:hover:decoration-muted-foreground inline-flex items-baseline gap-1 underline underline-offset-3 transition-[color,text-decoration-color] duration-200 ease-out [&_img]:size-4 [&_img]:self-center [&_img]:rounded-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:self-center"
);

type TextLinkProps = React.ComponentProps<"a"> & {
  external?: boolean;
};

const TextLink = ({
  children,
  className,
  external = false,
  ...props
}: TextLinkProps) => (
  <a
    className={cn(textLinkVariants({ className }))}
    data-slot="text-link"
    {...(external ? { rel: "noreferrer", target: "_blank" } : {})}
    {...props}
  >
    {children}
    {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
  </a>
);

export { Text, TextLink, textLinkVariants, textVariants };

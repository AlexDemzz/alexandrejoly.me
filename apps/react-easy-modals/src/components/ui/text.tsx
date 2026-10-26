import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

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

// DESIGN.md › Components › Text link. `faint` keeps the 14px footer's ink
// until hovered; only the underline marks it.
const textLinkVariants = cva(
  "font-book decoration-underline can-hover:hover:decoration-muted-foreground inline-flex items-baseline gap-1 underline underline-offset-3 transition-[color,text-decoration-color] duration-200 ease-out [&_img]:size-4 [&_img]:self-center [&_img]:rounded-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:self-center",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "text-foreground",
        faint: "text-faint-foreground can-hover:hover:text-foreground",
      },
    },
  }
);

type TextLinkProps = useRender.ComponentProps<"a"> &
  VariantProps<typeof textLinkVariants> & {
    external?: boolean;
  };

// Renders an `a`; pass `render={<Link to="…" />}` for an internal route.
const TextLink = ({
  children,
  className,
  external = false,
  render,
  variant,
  ...props
}: TextLinkProps) =>
  useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(textLinkVariants({ className, variant })),
        children: (
          <>
            {children}
            {external ? (
              <span className="sr-only"> (opens in a new tab)</span>
            ) : null}
          </>
        ),
        ...(external ? { rel: "noopener noreferrer", target: "_blank" } : {}),
      },
      props
    ),
    render,
    state: { slot: "text-link" },
  });

export { Text, TextLink, textLinkVariants, textVariants };

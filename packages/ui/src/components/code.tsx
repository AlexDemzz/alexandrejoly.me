import { cn } from "@portfolio/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

// DESIGN.md › Components › Code: system mono at the body's 16px, no fill, no
// border; ink by default, fog for secondary code such as prop types.
const codeVariants = cva("font-mono wrap-anywhere", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground",
    },
  },
});

const Code = ({
  className,
  variant,
  ...props
}: React.ComponentProps<"code"> & VariantProps<typeof codeVariants>) => (
  <code
    className={cn(codeVariants({ className, variant }))}
    data-slot="code"
    {...props}
  />
);

// A block of highlighted code beside its action column, so scrolled code never
// runs under the copy button. Shiki's output is styled in globals.css through
// `[data-slot=code-block-content]`.
const CodeBlock = ({ className, ...props }: React.ComponentProps<"figure">) => (
  <figure
    className={cn(
      "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1",
      className
    )}
    data-slot="code-block"
    {...props}
  />
);

const CodeBlockTitle = ({
  className,
  ...props
}: React.ComponentProps<"figcaption">) => (
  <figcaption
    className={cn("text-muted-foreground col-start-1 font-mono", className)}
    data-slot="code-block-title"
    {...props}
  />
);

const CodeBlockContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "col-start-1 max-h-112 overflow-auto overscroll-contain",
      className
    )}
    data-slot="code-block-content"
    {...props}
  />
);

const CodeBlockAction = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn("col-start-2 row-start-1", className)}
    data-slot="code-block-action"
    {...props}
  />
);

export {
  Code,
  CodeBlock,
  CodeBlockAction,
  CodeBlockContent,
  CodeBlockTitle,
  codeVariants,
};

import { cn } from "@portfolio/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

// DESIGN.md › Components › Code: system mono at the body's 16px; ink by
// default, fog for secondary code such as prop types. Code in prose may break
// anywhere; `wrap="token"` keeps short tokens whole, so a table column sized
// to its content never splits `string` mid-word.
const codeVariants = cva("font-mono", {
  defaultVariants: {
    variant: "default",
    wrap: "anywhere",
  },
  variants: {
    variant: {
      default: "text-foreground",
      muted: "text-muted-foreground",
    },
    wrap: {
      anywhere: "wrap-anywhere",
      token: "wrap-break-word",
    },
  },
});

const Code = ({
  className,
  variant,
  wrap,
  ...props
}: React.ComponentProps<"code"> & VariantProps<typeof codeVariants>) => (
  <code
    className={cn(codeVariants({ className, variant, wrap }))}
    data-slot="code"
    {...props}
  />
);

// DESIGN.md › Components › Code: docs-only card on the tint, 16px radius, no
// border. The code sits beside its action column, so scrolled code never runs
// under the copy button. Shiki's output is styled in globals.css through
// `[data-slot=code-block-content]`.
const CodeBlock = ({ className, ...props }: React.ComponentProps<"figure">) => (
  <figure
    className={cn(
      "bg-muted grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 rounded-xl p-4",
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

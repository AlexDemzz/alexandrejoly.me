import { cn } from "@portfolio/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

// DESIGN.md › Components › Code: system mono at the surrounding size; ink by
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

export { Code, codeVariants };

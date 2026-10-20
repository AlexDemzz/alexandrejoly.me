import { ScrollArea } from "@portfolio/ui/components/scroll-area";
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
// border. The code scrolls across the full width while the copy button stays
// pinned to the top end on the same tint. Shiki's output is styled in
// globals.css through `[data-slot=code-block-content]`.
const CodeBlock = ({ className, ...props }: React.ComponentProps<"figure">) => (
  <figure
    className={cn(
      "bg-muted relative flex min-w-0 flex-col rounded-xl",
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
    className={cn("text-muted-foreground px-4 pe-14 pt-4 font-mono", className)}
    data-slot="code-block-title"
    {...props}
  />
);

// The vertical padding lives inside the viewport so the code scrolls to the
// card's edge and the bars sit in that padding, inset to clear the corners.
// The viewport inherits the cap so long files scroll inside the card.
const CodeBlockContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <ScrollArea className="flex max-h-120 flex-col [&>[data-orientation=horizontal]]:mx-4 [&>[data-orientation=vertical]]:my-4 [&>[data-orientation=vertical]]:h-auto [&>[data-slot=scroll-area-viewport]]:max-h-[inherit] [[data-slot=code-block-title]+&_[data-slot=code-block-content]]:pt-1">
    <div
      className={cn("px-4 py-4", className)}
      data-slot="code-block-content"
      {...props}
    />
  </ScrollArea>
);

const CodeBlockAction = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn("bg-muted absolute end-3 top-3 rounded-md", className)}
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

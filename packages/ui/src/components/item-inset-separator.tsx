import { ItemSeparator } from "@portfolio/ui/components/item";
import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

function ItemInsetSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ItemSeparator>) {
  return (
    <ItemSeparator
      className={cn(
        "[[data-slot=item]:has(>&)]:relative",
        "[[data-slot=item]:has(>&)]:[anchor-scope:--item-content]",
        "[[data-slot=item]:has(>&)>[data-slot=item-content]:not([data-slot=item-content]~*)]:[anchor-name:--item-content]",
        "absolute start-0 end-0 bottom-0 my-0 w-auto!",
        "supports-[anchor-name:--a]:start-[anchor(--item-content_start)]",
        className
      )}
      {...props}
    />
  );
}

export { ItemInsetSeparator };

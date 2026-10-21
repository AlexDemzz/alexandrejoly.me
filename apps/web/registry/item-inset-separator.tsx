import type * as React from "react";

import { ItemSeparator } from "@/components/ui/item";
import { cn } from "@/lib/utils";

// Placed inside an Item, rules its bottom from where ItemContent starts, so it
// follows the row's media. The `[…:has(>&)]` variants position the parent Item
// and anchor its first ItemContent from this element's own classes, so the
// stock Item stays untouched.
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

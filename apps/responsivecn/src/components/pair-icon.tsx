import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

import type { PairSlug } from "@/components/create/pairs";

// One icon per pair, drawn in the mark's language on a 20px grid: a faint
// screen with the overlay on it. At rest the overlay has its desktop shape; on
// row hover or focus its clip-path morphs into the mobile one. A clip-path
// inset keeps the corner radius true through the morph, where a scale would
// stretch it.

interface Shape {
  // A clip-path inset() from the 20px box: top right bottom left, then radius.
  desktop: string;
  mobile: string;
  // The trigger the overlay hangs from, when the pair has one.
  trigger?: boolean;
}

const DRAWER = "inset(10px 3px 3px 3px round 2px)";

const SHAPES: Record<PairSlug, Shape> = {
  "dialog-drawer": {
    desktop: "inset(6.5px 5px 6.5px 5px round 1.5px)",
    mobile: DRAWER,
  },
  "sheet-drawer": {
    desktop: "inset(3px 3px 3px 11px round 2px)",
    mobile: DRAWER,
  },
  "popover-drawer": {
    desktop: "inset(8px 5px 6px 5px round 1.5px)",
    mobile: DRAWER,
    trigger: true,
  },
};

export const PairIcon = ({ slug }: { slug: PairSlug }) => {
  const shape = SHAPES[slug];
  return (
    <span
      aria-hidden
      className="shadow-hairline text-muted-foreground/80 can-hover:group-hover/item:text-foreground group-focus-visible/item:text-foreground flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ease-out"
    >
      <span className="relative size-5">
        <span className="absolute inset-0.5 rounded-xs bg-current opacity-25" />
        <span
          style={
            {
              "--desktop": shape.desktop,
              "--mobile": shape.mobile,
            } as React.CSSProperties
          }
          className={cn(
            "can-hover:group-hover/item:[clip-path:var(--mobile)] absolute inset-0 bg-current opacity-80 [clip-path:var(--desktop)] group-focus-visible/item:[clip-path:var(--mobile)]",
            "transition-clip-path ease-settle duration-250 motion-reduce:transition-none"
          )}
        />
        {shape.trigger ? (
          <span className="absolute top-[4.5px] left-2 h-0.5 w-1 rounded-full bg-current" />
        ) : null}
      </span>
    </span>
  );
};

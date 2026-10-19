import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

// DESIGN.md › Components › Section: a 500-weight heading 12px above its list.
const Section = ({ className, ...props }: React.ComponentProps<"section">) => (
  <section
    className={cn("flex flex-col gap-3", className)}
    data-slot="section"
    {...props}
  />
);

const SectionTitle = ({
  children,
  className,
  ...props
}: React.ComponentProps<"h2">) => (
  <h2
    className={cn("flex items-baseline gap-1.5 font-medium", className)}
    data-slot="section-title"
    {...props}
  >
    {children}
  </h2>
);

const SectionCount = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    className={cn("text-muted-foreground font-normal tabular-nums", className)}
    data-slot="section-count"
    {...props}
  />
);

export { Section, SectionCount, SectionTitle };

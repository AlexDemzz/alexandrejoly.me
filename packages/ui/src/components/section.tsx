import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

// DESIGN.md › Layout: the title sits in an 8rem margin and stays in view while
// its rows scroll; one column on narrow screens.
const Section = ({ className, ...props }: React.ComponentProps<"section">) => (
  <section
    className={cn(
      "grid gap-4 py-10 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8",
      className
    )}
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
    className={cn(
      "text-muted-foreground self-start sm:sticky sm:top-10",
      className
    )}
    data-slot="section-title"
    {...props}
  >
    {children}
  </h2>
);

const SectionContent = ({
  className,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn("min-w-0", className)}
    data-slot="section-content"
    {...props}
  />
);

export { Section, SectionContent, SectionTitle };

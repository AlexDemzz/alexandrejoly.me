import type * as React from "react";

import { cn } from "@/lib/utils";

// DESIGN.md › Layout: the title stacks above its content at every width.
const Section = ({ className, ...props }: React.ComponentProps<"section">) => (
  <section
    className={cn("flex flex-col gap-3 py-10", className)}
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
    className={cn("text-muted-foreground", className)}
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

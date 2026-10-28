import { cn } from "@portfolio/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

// DESIGN.md › Site › Layout: the title always sits above its content, muted by
// default; `stacked` sets it as an 18px docs heading in foreground. `spacing`
// "none" drops the 40px above and below for a column that spaces its sections
// with a gap (DESIGN.md › Library landings › Rhythm).
const sectionVariants = cva("group/section flex flex-col gap-4", {
  defaultVariants: {
    spacing: "default",
    variant: "default",
  },
  variants: {
    spacing: {
      default: "py-10",
      none: "",
    },
    variant: {
      default: "",
      stacked: "",
    },
  },
});

const Section = ({
  className,
  spacing = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"section"> & VariantProps<typeof sectionVariants>) => (
  <section
    className={cn(sectionVariants({ className, spacing, variant }))}
    data-slot="section"
    data-variant={variant}
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
      "text-muted-foreground group-data-[variant=stacked]/section:text-foreground self-start group-data-[variant=stacked]/section:text-lg group-data-[variant=stacked]/section:leading-snug group-data-[variant=stacked]/section:font-medium group-data-[variant=stacked]/section:text-balance",
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

export { Section, SectionContent, SectionTitle, sectionVariants };

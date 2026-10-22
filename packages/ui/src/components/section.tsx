import { cn } from "@portfolio/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

// DESIGN.md › Layout: `margin` puts the title in an 8rem margin, in view while
// its rows scroll, and falls back to one column on narrow screens; `stacked`
// always sets the title above its content, as an 18px docs heading in ink.
const sectionVariants = cva("group/section py-10", {
  defaultVariants: {
    variant: "margin",
  },
  variants: {
    variant: {
      margin: "grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8",
      stacked: "flex flex-col gap-4",
    },
  },
});

const Section = ({
  className,
  variant = "margin",
  ...props
}: React.ComponentProps<"section"> & VariantProps<typeof sectionVariants>) => (
  <section
    className={cn(sectionVariants({ className, variant }))}
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
      "text-muted-foreground group-data-[variant=stacked]/section:text-foreground self-start group-data-[variant=stacked]/section:text-lg group-data-[variant=stacked]/section:leading-snug group-data-[variant=stacked]/section:font-medium group-data-[variant=stacked]/section:text-balance sm:group-data-[variant=margin]/section:sticky sm:group-data-[variant=margin]/section:top-10",
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

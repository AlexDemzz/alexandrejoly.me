import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@portfolio/ui/lib/utils";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

// DESIGN.md › Site › Components › Heading: 16px at 500 in foreground; `title`
// is the docs page title, one step above the docs section titles. Renders an
// `h2` unless `render` picks another level.
const headingVariants = cva("text-foreground font-medium text-balance", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "text-base leading-relaxed",
      title: "text-xl leading-snug",
    },
  },
});

const Heading = ({
  className,
  render,
  variant,
  ...props
}: useRender.ComponentProps<"h2"> & VariantProps<typeof headingVariants>) =>
  useRender({
    defaultTagName: "h2",
    props: mergeProps<"h2">(
      { className: cn(headingVariants({ className, variant })) },
      props
    ),
    render,
    state: { slot: "heading" },
  });

export { Heading, headingVariants };

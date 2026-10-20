import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "@portfolio/ui/lib/utils";

// DESIGN.md › Typography › heading: 16px at 500 in ink; hierarchy comes from
// weight, never size. Renders an `h2` unless `render` picks another level.
const Heading = ({
  className,
  render,
  ...props
}: useRender.ComponentProps<"h2">) =>
  useRender({
    defaultTagName: "h2",
    props: mergeProps<"h2">(
      {
        className: cn(
          "text-foreground text-base font-medium text-balance",
          className
        ),
      },
      props
    ),
    render,
    state: { slot: "heading" },
  });

export { Heading };

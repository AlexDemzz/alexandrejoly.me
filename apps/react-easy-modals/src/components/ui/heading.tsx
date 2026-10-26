import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn } from "@/lib/utils";

const HEADING_TAGS = { 1: "h1", 2: "h2", 3: "h3" } as const;

// DESIGN.md › Typography › heading: 16px at 500 in ink; hierarchy comes from
// weight, never size. `level` picks the element, an `h2` by default.
const Heading = ({
  className,
  level = 2,
  render,
  ...props
}: useRender.ComponentProps<"h2"> & { level?: keyof typeof HEADING_TAGS }) =>
  useRender({
    defaultTagName: HEADING_TAGS[level],
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

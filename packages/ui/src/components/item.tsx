import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Separator } from "@portfolio/ui/components/separator";
import { cn } from "@portfolio/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

// DESIGN.md › Components › Row: rows ruled by a hairline, the first one flush
// with its section title.
function ItemGroup({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="item-group"
      className={cn(
        "group/item-group *:border-border flex w-full flex-col *:border-b *:last:border-b-0 [&>li:first-child>[data-slot=item]]:pt-0",
        className
      )}
      {...props}
    />
  );
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-2", className)}
      {...props}
    />
  );
}

// DESIGN.md › Components › Row: no fill, no radius; hover only underlines the
// title.
const itemVariants = cva(
  "group/item focus-visible:outline-ring flex items-center gap-4 py-3.5 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
);

function Item({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof itemVariants>) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(itemVariants({ className })),
      },
      props
    ),
    render,
    state: {
      slot: "item",
    },
  });
}

// DESIGN.md › Shape and depth: a 36px round logo on the hairline shadow, its
// icon faint until the row is hovered or focused.
const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        logo: "shadow-hairline text-muted-foreground/80 can-hover:group-hover/item:text-foreground group-focus-visible/item:text-foreground relative size-9 overflow-hidden rounded-full transition-colors duration-200 ease-out [&_img]:size-full [&_img]:object-cover [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn("flex min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "font-book text-foreground can-hover:group-hover/item:decoration-underline group-focus-visible/item:decoration-underline w-fit text-pretty underline decoration-transparent underline-offset-3 transition-[text-decoration-color] duration-200 ease-out",
        className
      )}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn("text-muted-foreground text-pretty", className)}
      {...props}
    />
  );
}

// Years on the right edge of a row.
function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn(
        "text-muted-foreground flex shrink-0 items-center gap-2 tabular-nums",
        className
      )}
      {...props}
    />
  );
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
  itemMediaVariants,
  itemVariants,
};

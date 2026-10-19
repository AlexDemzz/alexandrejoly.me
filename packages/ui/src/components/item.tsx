import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Separator } from "@portfolio/ui/components/separator";
import { cn } from "@portfolio/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRightIcon } from "lucide-react";
import * as React from "react";

// DESIGN.md › Layout: rows sit 8px apart.
function ItemGroup({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="item-group"
      className={cn("group/item-group flex w-full flex-col gap-2", className)}
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

// DESIGN.md › Components › Row: text on the column edge (-mx-2 p-2), a hit
// area stretched 4px up and down, no fill at rest or on hover.
const itemVariants = cva(
  "group/item focus-visible:outline-ring relative -mx-2 flex items-center gap-3 rounded-2xl p-2 text-base leading-relaxed outline-none before:absolute before:inset-x-0 before:-inset-y-1 focus-visible:outline-2 focus-visible:outline-offset-2"
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

// DESIGN.md › Shape and depth: a 3px paper frame around a 40×48 preview card
// holding a 28px glyph.
const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        frame:
          "bg-background shadow-hairline *:bg-card *:shadow-hairline rounded-md p-[3px] *:flex *:h-12 *:w-10 *:items-center *:justify-center *:overflow-hidden *:rounded-sm [&_img]:size-7 [&_img]:rounded-md [&_img]:object-contain",
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
        "font-book text-foreground flex w-fit items-center gap-1.5 text-pretty",
        className
      )}
      {...props}
    />
  );
}

// DESIGN.md › States: the arrow is the row's only hover signal, and only on
// devices that can hover.
function ItemArrow({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <ArrowUpRightIcon
      aria-hidden
      data-slot="item-arrow"
      className={cn(
        "text-subtle-foreground can-hover:group-hover/item:translate-x-0 can-hover:group-hover/item:scale-100 can-hover:group-hover/item:opacity-100 size-4 -translate-x-0.5 scale-75 opacity-0 transition-[opacity,translate,scale] duration-200 ease-out group-focus-visible/item:translate-x-0 group-focus-visible/item:scale-100 group-focus-visible/item:opacity-100",
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

// Years and counts on the right edge of a row.
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
  ItemArrow,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
  itemMediaVariants,
  itemVariants,
};

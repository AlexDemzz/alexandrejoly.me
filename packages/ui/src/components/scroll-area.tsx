import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { cn } from "@portfolio/ui/lib/utils";

// DESIGN.md › Components › Code: a 4px thumb, shown whenever the area
// overflows so the hidden content has a cue; it darkens to ink under the
// pointer.
const ScrollBar = ({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) => (
  <ScrollAreaPrimitive.Scrollbar
    className={cn(
      "group/scrollbar flex touch-none p-0.5 select-none data-horizontal:h-2 data-horizontal:flex-col data-vertical:h-full data-vertical:w-2",
      className
    )}
    data-orientation={orientation}
    data-slot="scroll-area-scrollbar"
    orientation={orientation}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb
      className="bg-scrollbar can-hover:group-hover/scrollbar:bg-foreground relative flex-1 rounded-full transition-[background-color] duration-150 ease-out"
      data-slot="scroll-area-thumb"
    />
  </ScrollAreaPrimitive.Scrollbar>
);

// Both bars mount here; Base UI only shows one when its axis overflows. The
// viewport keeps the global :focus-visible outline.
const ScrollArea = ({
  className,
  children,
  ...props
}: ScrollAreaPrimitive.Root.Props) => (
  <ScrollAreaPrimitive.Root
    className={cn("relative", className)}
    data-slot="scroll-area"
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      className="size-full rounded-[inherit]"
      data-slot="scroll-area-viewport"
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollBar orientation="horizontal" />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
);

export { ScrollArea, ScrollBar };

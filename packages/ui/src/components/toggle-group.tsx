import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import { toggleVariants } from "@portfolio/ui/components/toggle";
import { cn } from "@portfolio/ui/lib/utils";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
});

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-full data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-full group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-full group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-full group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-full group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        "has-data-[slot=toggle-group-item-label]:ease-settle has-data-[slot=toggle-group-item-label]:transition-[background-color,color,border-color,box-shadow] has-data-[slot=toggle-group-item-label]:duration-220",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}

function ToggleGroupItemLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="toggle-group-item-label"
      className={cn(
        "ease-settle -my-2 -ms-3 -me-2 box-content hidden w-0 min-w-0 overflow-clip [mask-image:linear-gradient(black,black),linear-gradient(to_left,transparent,black)] [mask-size:calc(100%-var(--spacing)*6)_100%,calc(var(--spacing)*6)_100%] [mask-position:left,right] [mask-repeat:no-repeat] p-2 opacity-0 blur-[2px] [transition-property:opacity,filter,display] transition-discrete [transition-duration:80ms,80ms,220ms] [interpolate-size:allow-keywords] motion-safe:[transition-property:opacity,filter,display,width,margin-inline-start,mask-size] motion-safe:[transition-duration:80ms,80ms,220ms,220ms,220ms,220ms]",
        "group-data-pressed/toggle:-ms-2 group-data-pressed/toggle:block group-data-pressed/toggle:w-auto group-data-pressed/toggle:[mask-size:calc(100%-var(--spacing)*2)_100%,calc(var(--spacing)*2)_100%] group-data-pressed/toggle:opacity-100 group-data-pressed/toggle:blur-[0px] group-data-pressed/toggle:[transition-delay:40ms,40ms,0s,0s,0s,0s] group-data-pressed/toggle:[transition-duration:240ms,240ms,220ms,220ms,220ms,220ms]",
        "starting:group-data-pressed/toggle:-ms-3 starting:group-data-pressed/toggle:w-0 starting:group-data-pressed/toggle:[mask-size:calc(100%-var(--spacing)*6)_100%,calc(var(--spacing)*6)_100%] starting:group-data-pressed/toggle:opacity-0 starting:group-data-pressed/toggle:blur-[2px]",
        className
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem, ToggleGroupItemLabel };

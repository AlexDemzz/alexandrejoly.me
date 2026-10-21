"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { createContext, use, useMemo } from "react";

import { cn } from "@/lib/utils";

const NotificationBadgeContext = createContext<{
  value?: number | string;
  visible: boolean;
}>({ visible: false });

const notificationBadgeVariants = cva(
  "group/notification-badge relative inline-flex [--hole-arc-left:calc(100%_+_var(--hole-right)_-_var(--hole-w)_+_var(--hole-h)/2)] [--hole-arc-radius:calc(var(--hole-h)/2_+_var(--hole-gap))] [--hole-arc-right:calc(100%_+_var(--hole-right)_-_var(--hole-h)/2)] [--hole-center-y:calc(var(--hole-h)/2_+_var(--hole-top))] [--hole-gap:1.5px] [--hole-top:calc(0.125rem_-_var(--hole-h)/2_+_var(--hole-radius,0px)_*_0.293)]",
  {
    defaultVariants: { variant: "default" },
    variants: {
      variant: {
        default:
          "[--hole-h:1rem] [--hole-right:calc(var(--hole-w)/2_-_var(--hole-radius,0px)_*_0.293)] [--hole-w:calc(var(--hole-h)_+_(var(--hole-chars,1)_-_1)_*_0.5rem)]",
        dot: "[--hole-h:0.5rem] [--hole-right:calc(var(--hole-w)/2_-_0.125rem_-_var(--hole-radius,0px)_*_0.293)] [--hole-w:0.5rem]",
      },
    },
  }
);

function NotificationBadge({
  className,
  style,
  value,
  variant,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof notificationBadgeVariants> & {
    value: number | string;
  }) {
  const isDot = variant === "dot";
  const visible = typeof value === "number" ? value > 0 : value !== "";
  const context = useMemo(
    () => ({ value: isDot ? undefined : value, visible }),
    [isDot, value, visible]
  );

  return (
    <NotificationBadgeContext value={context}>
      <span
        className={cn(notificationBadgeVariants({ variant }), className)}
        data-slot="notification-badge"
        data-visible={visible || undefined}
        style={
          {
            "--hole-chars": String(value).length,
            ...style,
          } as React.CSSProperties
        }
        {...props}
      />
    </NotificationBadgeContext>
  );
}

function NotificationBadgeContent({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex",
        "group-data-visible/notification-badge:[clip-path:shape(evenodd_from_-9999px_-9999px,hline_to_calc(100%_+_9999px),vline_to_calc(100%_+_9999px),hline_to_-9999px,close,move_to_var(--hole-arc-right)_calc(var(--hole-center-y)_-_var(--hole-arc-radius)),arc_to_var(--hole-arc-right)_calc(var(--hole-center-y)_+_var(--hole-arc-radius))_of_var(--hole-arc-radius)_cw,hline_to_var(--hole-arc-left),arc_to_var(--hole-arc-left)_calc(var(--hole-center-y)_-_var(--hole-arc-radius))_of_var(--hole-arc-radius)_cw,close)]",
        className
      )}
      data-slot="notification-badge-content"
      {...props}
    />
  );
}

function NotificationBadgeIndicator({
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children">) {
  const { value, visible } = use(NotificationBadgeContext);
  if (!visible) {
    return null;
  }
  return (
    <span
      aria-hidden
      className={cn(
        "bg-destructive absolute top-(--hole-top) -right-(--hole-right) inline-flex h-(--hole-h) w-(--hole-w) items-center justify-center rounded-full text-xs font-medium whitespace-nowrap text-white",
        className
      )}
      data-slot="notification-badge-indicator"
      {...props}
    >
      {value}
    </span>
  );
}

export {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
};

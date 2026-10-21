"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { createContext, use, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NotificationBadgeContext = createContext<{
  count?: number;
  visible: boolean;
}>({ visible: false });

const notificationBadgeVariants = cva(
  "group/notification-badge relative inline-flex [--hole-arc-left:calc(100%_+_var(--hole-right)_-_var(--hole-w)_+_var(--hole-h)/2)] [--hole-arc-radius:calc(var(--hole-h)/2_+_var(--hole-gap))] [--hole-arc-right:calc(100%_+_var(--hole-right)_-_var(--hole-h)/2)] [--hole-center-y:calc(var(--hole-h)/2_+_var(--hole-top))] [--hole-gap:1.5px] [--hole-top:calc(2px_-_var(--hole-h)/2_+_var(--hole-radius,0px)_*_0.293)]",
  {
    defaultVariants: { variant: "default" },
    variants: {
      variant: {
        default:
          "[--hole-h:16px] [--hole-right:calc(var(--hole-w)/2_-_var(--hole-radius,0px)_*_0.293)] data-[length=1]:[--hole-w:16px] data-[length=2]:[--hole-w:24px] data-[length=3]:[--hole-w:32px]",
        dot: "[--hole-h:8px] [--hole-right:calc(var(--hole-w)/2_-_2px_-_var(--hole-radius,0px)_*_0.293)] [--hole-w:8px]",
      },
    },
  }
);

const MAX_COUNT = 99;
const MAX_DIGITS = 3;

function NotificationBadge({
  className,
  count,
  variant,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof notificationBadgeVariants> & { count: number }) {
  const isDot = variant === "dot";
  const context = useMemo(
    () => ({ count: isDot ? undefined : count, visible: count > 0 }),
    [count, isDot]
  );

  return (
    <NotificationBadgeContext value={context}>
      <span
        className={cn(notificationBadgeVariants({ variant }), className)}
        data-length={
          isDot || !count
            ? undefined
            : Math.min(String(count).length, MAX_DIGITS)
        }
        data-slot="notification-badge"
        data-visible={count > 0 || undefined}
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
}: Omit<React.ComponentProps<typeof Badge>, "children">) {
  const { count, visible } = use(NotificationBadgeContext);
  if (!visible) {
    return null;
  }
  return (
    <Badge
      className={cn(
        "absolute top-(--hole-top) -right-(--hole-right) h-(--hole-h) w-(--hole-w)",
        // oxlint-disable-next-line shadcn/no-restyle -- the indicator must match the clip-path hole: a pill exactly --hole-w wide, which Badge's padding would widen
        "rounded-full px-0",
        className
      )}
      data-slot="notification-badge-indicator"
      variant="destructive"
      {...props}
    >
      {count !== undefined && (count > MAX_COUNT ? `${MAX_COUNT}+` : count)}
    </Badge>
  );
}

export {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
};

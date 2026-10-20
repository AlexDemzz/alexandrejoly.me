"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { createContext, use, useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * A counter (or a plain dot) pinned to the top-right of an icon or avatar. The
 * size, the `99+` clamp and the hide-at-zero live here.
 *
 * The gap between the indicator and the content is punched with a clip-path on
 * the content (not painted with a ring), so it stays correct on any surface:
 * hover overlays, photos, dark mode. The root owns the hole geometry
 * (`--hole-*`): `variant="default"` derives the pill width from the digit count
 * of `count` (`data-length` → `--hole-w`) without measuring, so the server HTML
 * is already final; `variant="dot"` is an 8px circle shown while `count > 0`.
 *
 * The pill is centered on the content's top-right corner (2px lower), so wider
 * counts grow both ways. Over a rounded element, set `--hole-radius` to its
 * corner radius: the anchor slides along the diagonal onto the arc's 45° point
 * (inset = radius × (1 − 1/√2) ≈ 0.293), so a `rounded-full size-12` button
 * takes `[--hole-radius:24px]` and an avatar circle `[--hole-radius:50%]`.
 * Move it freely with `--hole-top` / `--hole-right` on the root; the hole
 * follows since both derive from the same numbers. A counter that sits beside
 * a label rather than over anything renders no `NotificationBadgeContent` and
 * takes the indicator out of the overlay with `className="static"`.
 */
const NotificationBadgeContext = createContext<{
  count?: number;
  visible: boolean;
}>({ visible: false });

const notificationBadgeVariants = cva(
  // Hole geometry derived from --hole-*: radius, center y, left/right arc centers.
  // Spaced operators are required: Tailwind mangles `var(--x)-var(--y)`.
  "group/notification-badge relative inline-flex [--hole-arc-left:calc(100%_+_var(--hole-right)_-_var(--hole-w)_+_var(--hole-h)/2)] [--hole-arc-radius:calc(var(--hole-h)/2_+_var(--hole-gap))] [--hole-arc-right:calc(100%_+_var(--hole-right)_-_var(--hole-h)/2)] [--hole-center-y:calc(var(--hole-h)/2_+_var(--hole-top))] [--hole-gap:1.5px] [--hole-top:calc(2px_-_var(--hole-h)/2_+_var(--hole-radius,0px)_*_0.293)]",
  {
    defaultVariants: { variant: "default" },
    variants: {
      variant: {
        // A single digit is a circle (`--hole-w` = `--hole-h`); 2–3 digits are pills.
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
        // Pill-shaped hole under the indicator (evenodd: overshooting outer rect minus
        // the pill) so the gap is transparent on any surface. Browsers without shape()
        // (Chrome < 135, Safari < 18.4, Firefox < 148) render the badge without a gap.
        "group-data-visible/notification-badge:[clip-path:shape(evenodd_from_-9999px_-9999px,hline_to_calc(100%_+_9999px),vline_to_calc(100%_+_9999px),hline_to_-9999px,close,move_to_var(--hole-arc-right)_calc(var(--hole-center-y)_-_var(--hole-arc-radius)),arc_to_var(--hole-arc-right)_calc(var(--hole-center-y)_+_var(--hole-arc-radius))_of_var(--hole-arc-radius)_cw,hline_to_var(--hole-arc-left),arc_to_var(--hole-arc-left)_calc(var(--hole-center-y)_-_var(--hole-arc-radius))_of_var(--hole-arc-radius)_cw,close)]",
        className
      )}
      data-slot="notification-badge-content"
      {...props}
    />
  );
}

// Positioned from the same custom properties the content hole reads, so moving
// the pill (`className="[--hole-right:12px]"` on the root) moves the hole too.
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

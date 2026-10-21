import { Button } from "@portfolio/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@portfolio/ui/components/tooltip";
import { cn } from "@portfolio/ui/lib/utils";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";
import { BellIcon, SquareDashedIcon } from "lucide-react";
import { useState } from "react";

const TRACED_HOLE =
  // oxlint-disable-next-line shadcn/no-raw-colors, shadcn/no-arbitrary-values -- a debug overlay, deliberately off the theme so it never reads as part of the badge
  "bg-purple-500/20 text-transparent shadow-[0_0_0_var(--hole-gap)_color-mix(in_oklab,var(--color-purple-500)_20%,transparent)] outline-1 outline-offset-(--hole-gap) outline-purple-500 outline-dashed";

export const NotificationBadgeDemo = () => {
  const [count, setCount] = useState(3);
  const [showHole, setShowHole] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 [[data-slot=preview]:has(&)]:relative">
      <NotificationBadge count={count}>
        <NotificationBadgeContent>
          <Button
            aria-label={
              count > 0 ? `Notifications, ${count} unread` : "Notifications"
            }
            size="icon-lg"
            variant="outline"
          >
            <BellIcon />
          </Button>
        </NotificationBadgeContent>
        <NotificationBadgeIndicator className={cn(showHole && TRACED_HOLE)} />
      </NotificationBadge>
      <div className="flex gap-2">
        <Button
          onClick={() => setCount((value) => value + 1)}
          variant="outline"
        >
          Add
        </Button>
        <Button onClick={() => setCount(0)} variant="ghost">
          Clear
        </Button>
      </div>
      <Tooltip>
        <TooltipTrigger
          delay={0}
          render={
            <Button
              aria-label="Show hole"
              aria-pressed={showHole}
              className="absolute top-3 right-3"
              onClick={() => setShowHole((value) => !value)}
              size="icon"
              variant={showHole ? "secondary" : "ghost"}
            />
          }
        >
          <SquareDashedIcon aria-hidden />
        </TooltipTrigger>
        <TooltipContent>Show hole</TooltipContent>
      </Tooltip>
    </div>
  );
};

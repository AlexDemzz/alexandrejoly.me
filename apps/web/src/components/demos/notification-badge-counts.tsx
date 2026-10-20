import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";
import { BellIcon } from "lucide-react";

const COUNTS = [7, 42, 99, 128];

export const NotificationBadgeCounts = () => (
  <div className="flex flex-wrap items-center justify-center gap-8">
    {COUNTS.map((count) => (
      <NotificationBadge count={count} key={count}>
        <NotificationBadgeContent>
          <Button
            aria-label={`Notifications, ${count} unread`}
            size="icon-lg"
            variant="outline"
          >
            <BellIcon />
          </Button>
        </NotificationBadgeContent>
        <NotificationBadgeIndicator />
      </NotificationBadge>
    ))}
  </div>
);

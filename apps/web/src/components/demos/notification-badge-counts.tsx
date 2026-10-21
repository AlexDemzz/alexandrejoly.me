import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";
import { BellIcon } from "lucide-react";

const COUNTS = [7, 42, 99, 128];
const MAX_COUNT = 99;

const toBadgeValue = (count: number) =>
  count > MAX_COUNT ? `${MAX_COUNT}+` : count;

const toUnreadLabel = (count: number) => {
  const shownCount = count > MAX_COUNT ? `more than ${MAX_COUNT}` : count;
  return `Notifications, ${shownCount} unread`;
};

export const NotificationBadgeCounts = () => (
  <div className="flex flex-wrap items-center justify-center gap-8">
    {COUNTS.map((count) => (
      <NotificationBadge key={count} value={toBadgeValue(count)}>
        <NotificationBadgeContent>
          <Button
            aria-label={toUnreadLabel(count)}
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

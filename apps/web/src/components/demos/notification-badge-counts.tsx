import { BellIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";

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
            // site-only: this site's Button is rounded-full; shadcn's is rounded-md, where the badge's default corner placement is the right one.
            // oxlint-disable-next-line shadcn/no-restyle -- see site-only above
            className="rounded-md"
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

import { BellIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";
import { useState } from "react";

export const NotificationBadgeDemo = () => {
  const [count, setCount] = useState(3);

  return (
    <div className="flex flex-col items-center gap-6">
      <NotificationBadge value={count}>
        <NotificationBadgeContent>
          <Button
            aria-label={
              count > 0 ? `Notifications, ${count} unread` : "Notifications"
            }
            // oxlint-disable-next-line shadcn/no-restyle -- shadcn's stock radius, where the badge's default corner placement is the right one
            className="rounded-md"
            size="icon-lg"
            variant="outline"
          >
            <BellIcon />
          </Button>
        </NotificationBadgeContent>
        <NotificationBadgeIndicator />
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
    </div>
  );
};

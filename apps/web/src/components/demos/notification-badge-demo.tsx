import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";
import { BellIcon } from "lucide-react";
import { useState } from "react";

export const NotificationBadgeDemo = () => {
  const [count, setCount] = useState(3);

  return (
    <div className="flex flex-col items-center gap-6">
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
        <NotificationBadgeIndicator />
      </NotificationBadge>
      <div className="flex gap-2">
        <Button
          onClick={() => setCount((value) => value + 1)}
          variant="outline"
        >
          Add one
        </Button>
        <Button onClick={() => setCount(0)} variant="ghost">
          Clear
        </Button>
      </div>
    </div>
  );
};

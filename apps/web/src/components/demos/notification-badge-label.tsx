import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";

export const NotificationBadgeLabel = () => (
  <Button variant="outline">
    Inbox
    <NotificationBadge value={12}>
      <NotificationBadgeIndicator className="static" />
    </NotificationBadge>
    <span className="sr-only">, 12 unread</span>
  </Button>
);

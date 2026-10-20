import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";

export const NotificationBadgeLabel = () => (
  <Button variant="outline">
    Inbox
    <NotificationBadge count={12}>
      <NotificationBadgeIndicator className="static" />
    </NotificationBadge>
  </Button>
);

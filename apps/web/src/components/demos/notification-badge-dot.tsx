import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";
import { MailIcon } from "lucide-react";

export const NotificationBadgeDot = () => (
  <NotificationBadge value={2} variant="dot">
    <NotificationBadgeContent>
      <Button
        aria-label="Messages, new activity"
        size="icon-lg"
        variant="outline"
      >
        <MailIcon />
      </Button>
    </NotificationBadgeContent>
    <NotificationBadgeIndicator />
  </NotificationBadge>
);

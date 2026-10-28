import { EnvelopeIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";

export const NotificationBadgeDot = () => (
  <NotificationBadge value={2} variant="dot">
    <NotificationBadgeContent>
      <Button
        aria-label="Messages, new activity"
        // oxlint-disable-next-line shadcn/no-restyle -- shadcn's stock radius, where the badge's default corner placement is the right one
        className="rounded-md"
        size="icon-lg"
        variant="outline"
      >
        <EnvelopeIcon />
      </Button>
    </NotificationBadgeContent>
    <NotificationBadgeIndicator />
  </NotificationBadge>
);

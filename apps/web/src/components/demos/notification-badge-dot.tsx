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
        // site-only: this site's Button is rounded-full; shadcn's is rounded-md, where the badge's default corner placement is the right one.
        // oxlint-disable-next-line shadcn/no-restyle -- see site-only above
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

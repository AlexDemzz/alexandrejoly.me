import { ChatCircleIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";

const COUNTS = [1234, 56_789];

const compactFormat = new Intl.NumberFormat("en", { notation: "compact" });
const fullFormat = new Intl.NumberFormat("en");

export const NotificationBadgeCompact = () => (
  <div className="flex flex-wrap items-center justify-center gap-8">
    {COUNTS.map((count) => (
      <NotificationBadge key={count} value={compactFormat.format(count)}>
        <NotificationBadgeContent>
          <Button
            aria-label={`Comments, ${fullFormat.format(count)} unread`}
            // oxlint-disable-next-line shadcn/no-restyle -- shadcn's stock radius, where the badge's default corner placement is the right one
            className="rounded-md"
            size="icon-lg"
            variant="outline"
          >
            <ChatCircleIcon />
          </Button>
        </NotificationBadgeContent>
        <NotificationBadgeIndicator />
      </NotificationBadge>
    ))}
  </div>
);

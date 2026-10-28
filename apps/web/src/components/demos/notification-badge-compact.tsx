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
            // site-only: this site's Button is rounded-full; shadcn's is rounded-md, where the badge's default corner placement is the right one.
            // oxlint-disable-next-line shadcn/no-restyle -- see site-only above
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

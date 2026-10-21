import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";
import { MessageCircleIcon } from "lucide-react";

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
            size="icon-lg"
            variant="outline"
          >
            <MessageCircleIcon />
          </Button>
        </NotificationBadgeContent>
        <NotificationBadgeIndicator />
      </NotificationBadge>
    ))}
  </div>
);

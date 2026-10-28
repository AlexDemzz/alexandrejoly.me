import { ArrowsLeftRightIcon, BellIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import {
  NotificationBadge,
  NotificationBadgeContent,
  NotificationBadgeIndicator,
} from "@registry/notification-badge";
import { useState } from "react";

import type { Showcase } from "@/showcases/showcase";

// One digit cuts a circle; the second click reaches 10, two digits, a pill.
const START_COUNT = 8;
const ADD = 'role=button[name="Add"]';
const SWITCH = 'role=button[name="Switch content"]';
const INDICATOR = '[data-slot="notification-badge-indicator"]';

// The bell, then the badge on a round avatar, then the dot variant on it.
const CONTENTS = ["bell", "avatar", "dot"] as const;

// The demo from components/demos/notification-badge-demo.tsx, from 8, on a
// striped backdrop (index.css) so the hole shows something other than the page.
const Scene = () => {
  const [count, setCount] = useState(START_COUNT);
  const [contentIndex, setContentIndex] = useState(0);
  const content = CONTENTS[contentIndex];

  return (
    <div
      className="grid h-dvh w-dvw place-items-center"
      data-slot="showcase-backdrop"
    >
      {/* Twice the size, so the badge reads on a phone. */}
      <div className="flex [zoom:2] flex-col items-center gap-6">
        <NotificationBadge
          style={
            content === "bell"
              ? undefined
              : ({ "--hole-radius": "50%" } as React.CSSProperties)
          }
          value={count}
          variant={content === "dot" ? "dot" : "default"}
        >
          <NotificationBadgeContent>
            {content === "bell" ? (
              <Button
                aria-label={`Notifications, ${count} unread`}
                // oxlint-disable-next-line shadcn/no-restyle -- shadcn's stock radius, where the badge's default corner placement is the right one
                className="rounded-md"
                size="icon-lg"
                variant="outline"
              >
                <BellIcon />
              </Button>
            ) : (
              <span className="bg-foreground text-background inline-flex size-9 items-center justify-center rounded-full text-xs font-medium">
                AJ
              </span>
            )}
          </NotificationBadgeContent>
          <NotificationBadgeIndicator />
        </NotificationBadge>
        <div className="flex gap-2">
          <Button
            onClick={() => setCount((current) => current + 1)}
            variant="outline"
          >
            Add
          </Button>
          <Button
            aria-label="Switch content"
            onClick={() =>
              setContentIndex((current) => (current + 1) % CONTENTS.length)
            }
            size="icon"
            variant="ghost"
          >
            <ArrowsLeftRightIcon aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const notificationBadgeHole: Showcase = {
  Scene,
  start: [0.3, 0.88],
  steps: [
    // One glide per beat: two moves in a row stop the cursor between them.
    { click: ADD },
    { rest: 600 },
    { click: ADD },
    { rest: 600 },
    { zoomIn: INDICATOR, scale: 4 },
    { rest: 600 },
    { zoomOut: true },
    { click: SWITCH },
    { rest: 600 },
    { click: SWITCH },
    { rest: 600 },
    { zoomIn: INDICATOR, scale: 4 },
    { rest: 600 },
    { zoomOut: true },
    { moveTo: [0.86, 0.9] },
  ],
};

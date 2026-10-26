import { BellIcon, SelectionIcon } from "@phosphor-icons/react";
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
const SHOW_HOLE = 'role=button[name="Show hole"]';

// The demo from components/demos/notification-badge-demo.tsx, from 8, on a
// gradient so the hole shows something other than the page.
const Scene = () => {
  const [count, setCount] = useState(START_COUNT);
  const [inspecting, setInspecting] = useState(false);

  return (
    <div
      className="from-background to-selection grid h-dvh w-dvw place-items-center bg-linear-to-br"
      data-inspect={inspecting ? "hole" : undefined}
    >
      {/* Twice the size, so the badge reads on a phone. */}
      <div className="flex [zoom:2] flex-col items-center gap-6">
        <NotificationBadge value={count}>
          <NotificationBadgeContent>
            <Button
              aria-label={`Notifications, ${count} unread`}
              size="icon-lg"
              variant="outline"
            >
              <BellIcon />
            </Button>
          </NotificationBadgeContent>
          <NotificationBadgeIndicator />
        </NotificationBadge>
        <Button
          aria-label="Show hole"
          aria-pressed={inspecting}
          onClick={() => setInspecting((current) => !current)}
          size="icon"
          variant={inspecting ? "secondary" : "ghost"}
        >
          <SelectionIcon aria-hidden />
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={() => setCount((current) => current + 1)}
            variant="outline"
          >
            Add
          </Button>
          <Button onClick={() => setCount(0)} variant="ghost">
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export const notificationBadgeHole: Showcase = {
  Scene,
  start: [0.38, 0.86],
  steps: [
    { rest: 1100 },
    // The trace hides the digits, so the count changes before it turns on.
    { click: ADD },
    { rest: 1200 },
    { click: ADD },
    { rest: 1200 },
    { click: SHOW_HOLE },
    { rest: 800 },
    // Down and away from the bell, so the pill reads untouched.
    { moveTo: [0.62, 0.9] },
    { rest: 5500 },
  ],
};

import { InfoIcon } from "@phosphor-icons/react";
import { Button } from "@portfolio/ui/components/button";
import { TooltipProvider } from "@portfolio/ui/components/tooltip";
import { useIsMobile } from "@portfolio/ui/hooks/use-mobile";

import {
  TooltipPopover,
  TooltipPopoverContent,
  TooltipPopoverTrigger,
} from "@/components/ui/tooltip-popover";

export const TooltipPopoverPreview = () => {
  const isMobile = useIsMobile();

  return (
    <div className="not-prose flex flex-col items-center gap-4 rounded-xl border p-10">
      <TooltipProvider>
        <div className="flex items-center gap-1 text-sm">
          Response rate: 98%
          <TooltipPopover>
            <TooltipPopoverTrigger
              aria-label="About response rate"
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <InfoIcon />
            </TooltipPopoverTrigger>
            <TooltipPopoverContent popover={{ className: "w-auto max-w-xs" }}>
              The share of messages you reply to within 24 hours.
            </TooltipPopoverContent>
          </TooltipPopover>
        </div>
      </TooltipProvider>
      <p className="text-muted-foreground text-xs">
        {isMobile
          ? "Below 768px: tap the icon to open a Popover."
          : "At 768px and up: hover or focus the icon for a Tooltip."}{" "}
        Resize the window across 768px to see the swap.
      </p>
    </div>
  );
};

import { InfoIcon } from "lucide-react";

import { PreviewFrame } from "@/components/previews/preview-frame";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  TooltipPopover,
  TooltipPopoverContent,
  TooltipPopoverTrigger,
} from "@/components/ui/tooltip-popover";

export const TooltipPopoverContentBoxExample = () => (
  <PreviewFrame
    desktop="At 768px and up: hover or focus the icon for a Tooltip."
    mobile="Below 768px: tap the icon for a Popover that opens on top and fits its text."
  >
    <TooltipProvider>
      <div className="flex items-center gap-1 text-sm">
        Storage used: 4.2 GB
        <TooltipPopover>
          <TooltipPopoverTrigger
            aria-label="About storage used"
            render={<Button variant="ghost" size="icon-sm" />}
          >
            <InfoIcon />
          </TooltipPopoverTrigger>
          <TooltipPopoverContent
            popover={{ className: "w-auto max-w-xs", side: "top" }}
          >
            Includes files in the trash.
          </TooltipPopoverContent>
        </TooltipPopover>
      </div>
    </TooltipProvider>
  </PreviewFrame>
);

export const TooltipPopoverOverrideExample = () => (
  <PreviewFrame
    desktop="At 768px and up: a Tooltip. The override applies below 768px only."
    mobile="Below 768px: a modal Popover 8px below the button. Tap outside to close it."
  >
    <TooltipProvider>
      <TooltipPopover popover={{ modal: true }}>
        <TooltipPopoverTrigger render={<Button variant="outline" />}>
          Info
        </TooltipPopoverTrigger>
        <TooltipPopoverContent popover={{ side: "bottom", sideOffset: 8 }}>
          Drafts are saved every 30 seconds.
        </TooltipPopoverContent>
      </TooltipPopover>
    </TooltipProvider>
  </PreviewFrame>
);

export const TooltipPopoverAriaLabelExample = () => (
  <PreviewFrame
    desktop="At 768px and up: screen readers announce the label, then the Tooltip."
    mobile="Below 768px: screen readers announce the label before anything opens."
  >
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
          <TooltipPopoverContent>
            The share of messages you reply to within 24 hours.
          </TooltipPopoverContent>
        </TooltipPopover>
      </div>
    </TooltipProvider>
  </PreviewFrame>
);

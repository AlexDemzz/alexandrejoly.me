import { Button } from "@portfolio/ui/components/button";
import {
  PopoverDrawer,
  PopoverDrawerContent,
  PopoverDrawerDescription,
  PopoverDrawerFooter,
  PopoverDrawerHeader,
  PopoverDrawerTitle,
  PopoverDrawerTrigger,
} from "@portfolio/ui/components/popover-drawer";
import * as React from "react";

import {
  PreviewFrame,
  previewInputClassName,
} from "@/components/previews/preview-frame";

const STATUSES = ["Open", "In review", "Closed"];

const StatusFilters = ({ idPrefix }: { idPrefix: string }) => (
  <fieldset className="grid gap-2 text-sm">
    <legend className="mb-2 font-medium">Status</legend>
    {STATUSES.map((status) => {
      const id = `${idPrefix}-${status}`;
      return (
        <label key={status} htmlFor={id} className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            defaultChecked={status !== "Closed"}
            className="accent-primary size-4"
          />
          {status}
        </label>
      );
    })}
  </fieldset>
);

export const PopoverDrawerContentBoxExample = () => (
  <PreviewFrame
    desktop="At 768px and up: a 320px Popover."
    mobile="Below 768px: the w-80 box sits centered in a full-width Drawer."
  >
    <PopoverDrawer>
      <PopoverDrawerTrigger render={<Button variant="outline" />}>
        Share
      </PopoverDrawerTrigger>
      <PopoverDrawerContent
        className="w-80"
        drawer={{ className: "max-h-[80dvh]" }}
      >
        <PopoverDrawerHeader>
          <PopoverDrawerTitle>Share link</PopoverDrawerTitle>
          <PopoverDrawerDescription>
            Anyone with the link can view this page.
          </PopoverDrawerDescription>
        </PopoverDrawerHeader>
        <label htmlFor="popover-drawer-content-box-link" className="sr-only">
          Link
        </label>
        <input
          id="popover-drawer-content-box-link"
          readOnly
          defaultValue="https://example.com/p/4f2a"
          className={previewInputClassName}
        />
      </PopoverDrawerContent>
    </PopoverDrawer>
  </PreviewFrame>
);

export const PopoverDrawerNonModalExample = () => (
  <PreviewFrame
    desktop="At 768px and up: the Popover keeps its non-modal default."
    mobile="Below 768px: a Drawer with no overlay, so the page behind stays usable."
  >
    <PopoverDrawer drawer={{ modal: false }}>
      <PopoverDrawerTrigger render={<Button variant="outline" />}>
        Notifications
      </PopoverDrawerTrigger>
      <PopoverDrawerContent>
        <PopoverDrawerHeader>
          <PopoverDrawerTitle>Notifications</PopoverDrawerTitle>
          <PopoverDrawerDescription>
            You have no unread notifications.
          </PopoverDrawerDescription>
        </PopoverDrawerHeader>
      </PopoverDrawerContent>
    </PopoverDrawer>
  </PreviewFrame>
);

export const PopoverDrawerFooterExample = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <PreviewFrame
      desktop="At 768px and up: Apply sits at the end of a row and closes the Popover."
      mobile="Below 768px: Apply sits in the Drawer footer and closes the Drawer."
    >
      <PopoverDrawer open={open} onOpenChange={setOpen}>
        <PopoverDrawerTrigger render={<Button variant="outline" />}>
          Filters
        </PopoverDrawerTrigger>
        <PopoverDrawerContent>
          <PopoverDrawerHeader>
            <PopoverDrawerTitle>Filters</PopoverDrawerTitle>
            <PopoverDrawerDescription>
              Show only the issues you need.
            </PopoverDrawerDescription>
          </PopoverDrawerHeader>
          <StatusFilters idPrefix="popover-drawer-footer" />
          <PopoverDrawerFooter>
            <Button type="button" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </PopoverDrawerFooter>
        </PopoverDrawerContent>
      </PopoverDrawer>
    </PreviewFrame>
  );
};

export const PopoverDrawerHiddenTitleExample = () => (
  <PreviewFrame
    desktop="At 768px and up: the hidden title names the Popover."
    mobile="Below 768px: the hidden title names the Drawer for screen readers."
  >
    <PopoverDrawer>
      <PopoverDrawerTrigger render={<Button variant="outline" />}>
        Filters
      </PopoverDrawerTrigger>
      <PopoverDrawerContent>
        <PopoverDrawerTitle className="sr-only">Filters</PopoverDrawerTitle>
        <StatusFilters idPrefix="popover-drawer-hidden-title" />
      </PopoverDrawerContent>
    </PopoverDrawer>
  </PreviewFrame>
);

import * as React from "react";

import {
  PreviewFrame,
  previewInputClassName,
} from "@/components/previews/preview-frame";
import { Button } from "@/components/ui/button";
import {
  DialogDrawer,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
  DialogDrawerTrigger,
} from "@/components/ui/dialog-drawer";

const SHORTCUTS = [
  { keys: "⌘ K", action: "Open the command menu" },
  { keys: "⌘ N", action: "Create a project" },
  { keys: "⌘ F", action: "Search this page" },
  { keys: "⌘ /", action: "Show shortcuts" },
  { keys: "⌘ ,", action: "Open settings" },
  { keys: "⌘ B", action: "Toggle the sidebar" },
  { keys: "⌘ ⇧ D", action: "Duplicate the selection" },
  { keys: "⌘ ⌫", action: "Delete the selection" },
  { keys: "G then H", action: "Go to home" },
  { keys: "G then P", action: "Go to projects" },
  { keys: "G then S", action: "Go to settings" },
  { keys: "Esc", action: "Close the open panel" },
];

export const DialogDrawerSnapPointsExample = () => (
  <PreviewFrame
    desktop="At 768px and up: a Dialog. The snap points apply below 768px only."
    mobile="Below 768px: a Drawer that opens at half height. Drag the handle up to expand it."
  >
    <DialogDrawer
      drawer={{
        snapPoints: [0.5, 1],
        defaultSnapPoint: 0.5,
        showSwipeHandle: true,
      }}
    >
      <DialogDrawerTrigger render={<Button variant="outline" />}>
        Keyboard shortcuts
      </DialogDrawerTrigger>
      <DialogDrawerContent>
        <DialogDrawerHeader>
          <DialogDrawerTitle>Keyboard shortcuts</DialogDrawerTitle>
          <DialogDrawerDescription>
            Move around the app without a mouse.
          </DialogDrawerDescription>
        </DialogDrawerHeader>
        <dl className="grid min-h-0 gap-2 overflow-y-auto px-4 text-sm md:px-0">
          {SHORTCUTS.map(({ keys, action }) => (
            <div key={keys} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{action}</dt>
              <dd className="font-mono">{keys}</dd>
            </div>
          ))}
        </dl>
        <DialogDrawerFooter showCloseButton />
      </DialogDrawerContent>
    </DialogDrawer>
  </PreviewFrame>
);

export const DialogDrawerSizingExample = () => (
  <PreviewFrame
    desktop="At 768px and up: a Dialog capped at sm:max-w-sm."
    mobile="Below 768px: a full-width Drawer, since sm:max-w-none resets the Dialog width."
  >
    <DialogDrawer>
      <DialogDrawerTrigger render={<Button variant="outline" />}>
        Rename file
      </DialogDrawerTrigger>
      <DialogDrawerContent
        className="sm:max-w-sm"
        drawer={{ className: "sm:max-w-none" }}
      >
        <DialogDrawerHeader>
          <DialogDrawerTitle>Rename file</DialogDrawerTitle>
          <DialogDrawerDescription>
            The new name shows everywhere the file is shared.
          </DialogDrawerDescription>
        </DialogDrawerHeader>
        <form className="grid gap-4 p-4 md:p-0">
          <label
            className="grid gap-1.5 text-sm font-medium"
            htmlFor="dialog-drawer-sizing-name"
          >
            File name
            <input
              id="dialog-drawer-sizing-name"
              defaultValue="Quarterly report.pdf"
              className={previewInputClassName}
            />
          </label>
        </form>
        <DialogDrawerFooter showCloseButton />
      </DialogDrawerContent>
    </DialogDrawer>
  </PreviewFrame>
);

export const DialogDrawerBodyPaddingExample = () => (
  <PreviewFrame
    desktop="At 768px and up: md:p-0 drops the form padding, since the Dialog pads its whole box."
    mobile="Below 768px: the form keeps p-4, in line with the Drawer header and footer."
  >
    <DialogDrawer>
      <DialogDrawerTrigger render={<Button variant="outline" />}>
        Invite member
      </DialogDrawerTrigger>
      <DialogDrawerContent>
        <DialogDrawerHeader>
          <DialogDrawerTitle>Invite member</DialogDrawerTitle>
          <DialogDrawerDescription>
            They get an email with a link to join.
          </DialogDrawerDescription>
        </DialogDrawerHeader>
        <form className="grid gap-4 p-4 md:p-0">
          <label
            className="grid gap-1.5 text-sm font-medium"
            htmlFor="dialog-drawer-padding-email"
          >
            Email
            <input
              id="dialog-drawer-padding-email"
              type="email"
              placeholder="name@example.com"
              className={previewInputClassName}
            />
          </label>
        </form>
        <DialogDrawerFooter showCloseButton />
      </DialogDrawerContent>
    </DialogDrawer>
  </PreviewFrame>
);

export const DialogDrawerSwipeReasonExample = () => {
  const [open, setOpen] = React.useState(false);
  const [swipeCount, setSwipeCount] = React.useState(0);

  return (
    <PreviewFrame
      desktop="At 768px and up: the Dialog has no swipe, so the count stays the same."
      mobile="Below 768px: swipe the Drawer down to close it, and the count goes up."
    >
      <DialogDrawer
        open={open}
        onOpenChange={setOpen}
        drawer={{
          onOpenChange: (_open, eventDetails) => {
            if (eventDetails.reason === "swipe") {
              setSwipeCount((count) => count + 1);
            }
          },
        }}
      >
        <DialogDrawerTrigger render={<Button variant="outline" />}>
          Open
        </DialogDrawerTrigger>
        <DialogDrawerContent>
          <DialogDrawerHeader>
            <DialogDrawerTitle>Close it your way</DialogDrawerTitle>
            <DialogDrawerDescription>
              Only a swipe adds to the count.
            </DialogDrawerDescription>
          </DialogDrawerHeader>
          <DialogDrawerFooter showCloseButton />
        </DialogDrawerContent>
      </DialogDrawer>
      <p className="text-sm tabular-nums" aria-live="polite">
        Closed with a swipe: {swipeCount}
      </p>
    </PreviewFrame>
  );
};

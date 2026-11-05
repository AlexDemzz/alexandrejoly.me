import { Button } from "@portfolio/ui/components/button";
import {
  DialogDrawer,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
  DialogDrawerTrigger,
} from "@portfolio/ui/components/dialog-drawer";
import { Input } from "@portfolio/ui/components/input";
import * as React from "react";

import { PreviewFrame } from "@/components/previews/preview-frame";

export const DialogDrawerSizingExample = () => {
  const [fileName, setFileName] = React.useState("Quarterly report.pdf");

  return (
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
              <Input
                id="dialog-drawer-sizing-name"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
              />
            </label>
          </form>
          <DialogDrawerFooter showCloseButton />
        </DialogDrawerContent>
      </DialogDrawer>
    </PreviewFrame>
  );
};

export const DialogDrawerBodyPaddingExample = () => {
  const [email, setEmail] = React.useState("");

  return (
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
              <Input
                id="dialog-drawer-padding-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          </form>
          <DialogDrawerFooter showCloseButton />
        </DialogDrawerContent>
      </DialogDrawer>
    </PreviewFrame>
  );
};

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
          <p className="text-muted-foreground p-4 text-sm md:p-0">
            Swipe it down, press Esc or use Close.
          </p>
          <DialogDrawerFooter showCloseButton />
        </DialogDrawerContent>
      </DialogDrawer>
      <p className="text-sm tabular-nums" aria-live="polite">
        Closed with a swipe: {swipeCount}
      </p>
    </PreviewFrame>
  );
};

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

// The name lives above DialogDrawer: crossing 768px swaps the Dialog subtree
// for the Drawer one, which would reset an uncontrolled input.
export const DialogDrawerPreview = () => {
  const [name, setName] = React.useState("Jordan Lee");

  return (
    <PreviewFrame
      desktop="At 768px and up: opens as a Dialog. Resize the window across 768px while it is open: it stays open on the other side."
      mobile="Below 768px: opens as a Drawer. Resize the window across 768px while it is open: it stays open on the other side."
    >
      <DialogDrawer>
        <DialogDrawerTrigger render={<Button variant="outline" />}>
          Edit profile
        </DialogDrawerTrigger>
        <DialogDrawerContent
          className="sm:max-w-sm"
          drawer={{ className: "sm:max-w-none" }}
        >
          <DialogDrawerHeader>
            <DialogDrawerTitle>Edit profile</DialogDrawerTitle>
            <DialogDrawerDescription>
              Change the name shown on your profile.
            </DialogDrawerDescription>
          </DialogDrawerHeader>
          <form className="grid gap-4 p-4 md:p-0">
            <label
              className="grid gap-1.5 text-sm font-medium"
              htmlFor="dialog-drawer-preview-name"
            >
              Name
              <Input
                id="dialog-drawer-preview-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          </form>
          <DialogDrawerFooter showCloseButton />
        </DialogDrawerContent>
      </DialogDrawer>
    </PreviewFrame>
  );
};

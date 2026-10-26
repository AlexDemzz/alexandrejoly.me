import { Button } from "@portfolio/ui/components/button";
import { useIsMobile } from "@portfolio/ui/hooks/use-mobile";

import {
  DialogDrawer,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
  DialogDrawerTrigger,
} from "@/components/ui/dialog-drawer";

export const DialogDrawerPreview = () => {
  const isMobile = useIsMobile();

  return (
    <div className="not-prose flex flex-col items-center gap-4 rounded-xl border p-10">
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
              <input
                id="dialog-drawer-preview-name"
                defaultValue="Jordan Lee"
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-md border bg-transparent px-3 text-sm font-normal outline-none focus-visible:ring-3"
              />
            </label>
          </form>
          <DialogDrawerFooter showCloseButton />
        </DialogDrawerContent>
      </DialogDrawer>
      <p className="text-muted-foreground text-xs">
        {isMobile
          ? "Below 768px: opens as a Drawer."
          : "At 768px and up: opens as a Dialog."}{" "}
        Resize the window across 768px while it is open: it stays open on the
        other side.
      </p>
    </div>
  );
};

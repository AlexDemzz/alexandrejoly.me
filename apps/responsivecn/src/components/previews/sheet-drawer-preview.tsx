import { Button } from "@portfolio/ui/components/button";
import {
  SheetDrawer,
  SheetDrawerClose,
  SheetDrawerContent,
  SheetDrawerDescription,
  SheetDrawerFooter,
  SheetDrawerHeader,
  SheetDrawerTitle,
  SheetDrawerTrigger,
} from "@portfolio/ui/components/sheet-drawer";

import { PreviewFrame } from "@/components/previews/preview-frame";

export const SheetDrawerPreview = () => (
  <PreviewFrame
    desktop="At 768px and up: a Sheet from the right edge. Resize the window across 768px to see the swap."
    mobile="Below 768px: a Drawer from the right edge. Resize the window across 768px to see the swap."
  >
    <SheetDrawer>
      <SheetDrawerTrigger render={<Button variant="outline" />}>
        Open menu
      </SheetDrawerTrigger>
      <SheetDrawerContent side="right">
        <SheetDrawerHeader>
          <SheetDrawerTitle>Workspace</SheetDrawerTitle>
          <SheetDrawerDescription>
            Go to any page in this workspace.
          </SheetDrawerDescription>
        </SheetDrawerHeader>
        <nav className="grid gap-1 px-4 text-sm">
          {["Dashboard", "Projects", "Members", "Settings"].map((item) => (
            <button
              key={item}
              type="button"
              className="hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-left font-medium"
            >
              {item}
            </button>
          ))}
        </nav>
        <SheetDrawerFooter>
          <SheetDrawerClose render={<Button variant="outline" />}>
            Close
          </SheetDrawerClose>
        </SheetDrawerFooter>
      </SheetDrawerContent>
    </SheetDrawer>
  </PreviewFrame>
);

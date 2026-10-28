import { Button } from "@portfolio/ui/components/button";
import {
  PopoverDrawer,
  PopoverDrawerContent,
  PopoverDrawerDescription,
  PopoverDrawerHeader,
  PopoverDrawerTitle,
  PopoverDrawerTrigger,
} from "@portfolio/ui/components/popover-drawer";

import { PreviewFrame } from "@/components/previews/preview-frame";

const DIMENSIONS = [
  { id: "popover-drawer-preview-width", label: "Width", value: "100%" },
  { id: "popover-drawer-preview-height", label: "Height", value: "25px" },
];

// Live preview for the PopoverDrawer docs page. It renders the real registry
// component with the children of the shadcn Popover demo, unchanged: the
// Content pads them on both sides.

export const PopoverDrawerPreview = () => (
  <PreviewFrame
    desktop="At 768px and up: a non-modal Popover anchored to the button. Resize the window across 768px while it is open: it stays open on the other side."
    mobile="Below 768px: a modal Drawer. Resize the window across 768px while it is open: it stays open on the other side."
  >
    <PopoverDrawer>
      <PopoverDrawerTrigger render={<Button variant="outline" />}>
        Open popover
      </PopoverDrawerTrigger>
      <PopoverDrawerContent className="w-80">
        <PopoverDrawerHeader>
          <PopoverDrawerTitle>Dimensions</PopoverDrawerTitle>
          <PopoverDrawerDescription>
            Set the dimensions for the layer.
          </PopoverDrawerDescription>
        </PopoverDrawerHeader>
        <div className="grid gap-2">
          {DIMENSIONS.map(({ id, label, value }) => (
            <div
              key={id}
              className="grid grid-cols-3 items-center gap-4 text-sm"
            >
              <label htmlFor={id} className="font-medium">
                {label}
              </label>
              <input
                id={id}
                defaultValue={value}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 col-span-2 h-8 rounded-md border bg-transparent px-2.5 outline-none focus-visible:ring-3"
              />
            </div>
          ))}
        </div>
      </PopoverDrawerContent>
    </PopoverDrawer>
  </PreviewFrame>
);

import { Button } from "@portfolio/ui/components/button";
import { Input } from "@portfolio/ui/components/input";
import {
  PopoverDrawer,
  PopoverDrawerContent,
  PopoverDrawerDescription,
  PopoverDrawerHeader,
  PopoverDrawerTitle,
  PopoverDrawerTrigger,
} from "@portfolio/ui/components/popover-drawer";
import * as React from "react";

import { PreviewFrame } from "@/components/previews/preview-frame";

const DIMENSIONS = [
  { id: "popover-drawer-preview-width", label: "Width" },
  { id: "popover-drawer-preview-height", label: "Height" },
] as const;

type DimensionId = (typeof DIMENSIONS)[number]["id"];

const DEFAULT_VALUES: Record<DimensionId, string> = {
  "popover-drawer-preview-width": "100%",
  "popover-drawer-preview-height": "25px",
};

// Live preview for the PopoverDrawer docs page. It renders the real registry
// component with the children of the shadcn Popover demo: the Content pads
// them on both sides. The values live above PopoverDrawer, so crossing 768px
// keeps what was typed.

export const PopoverDrawerPreview = () => {
  const [values, setValues] = React.useState(DEFAULT_VALUES);

  return (
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
            {DIMENSIONS.map(({ id, label }) => (
              <div
                key={id}
                className="grid grid-cols-3 items-center gap-4 text-sm"
              >
                <label htmlFor={id} className="font-medium">
                  {label}
                </label>
                <Input
                  id={id}
                  value={values[id]}
                  onChange={(event) => {
                    const { value } = event.target;
                    setValues((current) => ({ ...current, [id]: value }));
                  }}
                  className="col-span-2"
                />
              </div>
            ))}
          </div>
        </PopoverDrawerContent>
      </PopoverDrawer>
    </PreviewFrame>
  );
};

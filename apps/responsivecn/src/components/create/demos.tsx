import { Button } from "@portfolio/ui/components/button";
import { TooltipProvider } from "@portfolio/ui/components/tooltip";
import * as React from "react";

import {
  DialogDrawer,
  DialogDrawerClose,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
  DialogDrawerTrigger,
} from "@/components/ui/dialog-drawer";
import {
  PopoverDrawer,
  PopoverDrawerContent,
  PopoverDrawerDescription,
  PopoverDrawerHeader,
  PopoverDrawerTitle,
  PopoverDrawerTrigger,
} from "@/components/ui/popover-drawer";
import {
  SheetDrawer,
  SheetDrawerClose,
  SheetDrawerContent,
  SheetDrawerDescription,
  SheetDrawerFooter,
  SheetDrawerHeader,
  SheetDrawerTitle,
  SheetDrawerTrigger,
} from "@/components/ui/sheet-drawer";
import {
  TooltipPopover,
  TooltipPopoverContent,
  TooltipPopoverTrigger,
} from "@/components/ui/tooltip-popover";

import type { PairSlug } from "./pairs";

// Live demos wired to the REAL registry components. They render inside the
// /preview iframe, so their use-mobile hook reads the iframe window — the
// canvas width in the playground is the viewport that decides which side renders.
// Free-standing children (the fields) pad themselves per side: the mobile
// Drawer doesn't pad its children while the desktop counterparts do, and
// `md:` inside the iframe flips at the exact same 768px as the swap.

interface DemoProps {
  open: boolean;
}

// A demo mounted open must not pull focus into the iframe on page load; the
// first time it closes, focus goes back to moving into the popup as usual.
const useOpenOnLoad = (open: boolean) => {
  const [quiet, setQuiet] = React.useState(open);
  return {
    root: {
      defaultOpen: open,
      onOpenChange: (next: boolean) => {
        if (!next) {
          setQuiet(false);
        }
      },
    },
    initialFocus: quiet ? false : undefined,
  };
};

const Field = ({
  id,
  label,
  defaultValue,
}: {
  id: string;
  label: string;
  defaultValue: string;
}) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <input
      id={id}
      defaultValue={defaultValue}
      className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full min-w-0 rounded-lg border bg-transparent px-3 text-sm shadow-xs transition-shadow outline-none focus-visible:ring-3"
    />
  </div>
);

const DialogDrawerDemo = ({ open }: DemoProps) => {
  const load = useOpenOnLoad(open);
  return (
    <DialogDrawer {...load.root}>
      <DialogDrawerTrigger render={<Button variant="outline" />}>
        Edit profile
      </DialogDrawerTrigger>
      <DialogDrawerContent
        initialFocus={load.initialFocus}
        className="sm:max-w-sm"
        drawer={{ className: "sm:max-w-none" }}
      >
        <DialogDrawerHeader>
          <DialogDrawerTitle>Edit profile</DialogDrawerTitle>
          <DialogDrawerDescription>
            Make changes to your profile here, then save them.
          </DialogDrawerDescription>
        </DialogDrawerHeader>
        <div className="flex flex-col gap-4 p-4 md:p-0">
          <Field id="name" label="Name" defaultValue="Jordan Lee" />
          <Field id="username" label="Username" defaultValue="@jordanlee" />
        </div>
        <DialogDrawerFooter>
          <DialogDrawerClose render={<Button variant="outline" />}>
            Cancel
          </DialogDrawerClose>
          <DialogDrawerClose render={<Button />}>
            Save changes
          </DialogDrawerClose>
        </DialogDrawerFooter>
      </DialogDrawerContent>
    </DialogDrawer>
  );
};

const SheetDrawerDemo = ({ open }: DemoProps) => {
  const load = useOpenOnLoad(open);
  return (
    <SheetDrawer {...load.root}>
      <SheetDrawerTrigger render={<Button variant="outline" />}>
        Open sheet
      </SheetDrawerTrigger>
      <SheetDrawerContent initialFocus={load.initialFocus} side="right">
        <SheetDrawerHeader>
          <SheetDrawerTitle>Edit profile</SheetDrawerTitle>
          <SheetDrawerDescription>
            Make changes to your profile here, then save them.
          </SheetDrawerDescription>
        </SheetDrawerHeader>
        <div className="flex flex-col gap-4 p-4 md:py-0">
          <Field id="sheet-name" label="Name" defaultValue="Jordan Lee" />
          <Field
            id="sheet-username"
            label="Username"
            defaultValue="@jordanlee"
          />
        </div>
        <SheetDrawerFooter>
          <SheetDrawerClose render={<Button />}>Save changes</SheetDrawerClose>
        </SheetDrawerFooter>
      </SheetDrawerContent>
    </SheetDrawer>
  );
};

const PopoverDrawerDemo = ({ open }: DemoProps) => {
  const load = useOpenOnLoad(open);
  return (
    <PopoverDrawer {...load.root}>
      <PopoverDrawerTrigger render={<Button variant="outline" />}>
        Open popover
      </PopoverDrawerTrigger>
      <PopoverDrawerContent initialFocus={load.initialFocus} className="w-80">
        <PopoverDrawerHeader>
          <PopoverDrawerTitle>Dimensions</PopoverDrawerTitle>
          <PopoverDrawerDescription>
            Set the dimensions for the layer.
          </PopoverDrawerDescription>
        </PopoverDrawerHeader>
        <div className="flex flex-col gap-3">
          {(
            [
              ["width", "Width", "100%"],
              ["height", "Height", "25px"],
            ] as const
          ).map(([id, label, defaultValue]) => (
            <div
              key={id}
              className="grid grid-cols-[4rem_1fr] items-center gap-2"
            >
              <label htmlFor={id} className="text-sm font-medium">
                {label}
              </label>
              <input
                id={id}
                defaultValue={defaultValue}
                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 text-sm shadow-xs transition-shadow outline-none focus-visible:ring-3"
              />
            </div>
          ))}
        </div>
      </PopoverDrawerContent>
    </PopoverDrawer>
  );
};

const TooltipPopoverDemo = ({ open }: DemoProps) => {
  const load = useOpenOnLoad(open);
  return (
    <TooltipProvider>
      <TooltipPopover {...load.root}>
        <TooltipPopoverTrigger render={<Button variant="outline" />}>
          Hover or tap
        </TooltipPopoverTrigger>
        <TooltipPopoverContent>
          The share of messages you reply to within 24 hours.
        </TooltipPopoverContent>
      </TooltipPopover>
    </TooltipProvider>
  );
};

const DEMOS: Record<PairSlug, (props: DemoProps) => React.JSX.Element> = {
  "dialog-drawer": DialogDrawerDemo,
  "sheet-drawer": SheetDrawerDemo,
  "popover-drawer": PopoverDrawerDemo,
  "tooltip-popover": TooltipPopoverDemo,
};

export const PairDemo = ({ slug, open }: { slug: PairSlug; open: boolean }) => {
  const Demo = DEMOS[slug];
  return <Demo open={open} />;
};

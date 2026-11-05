import { Button } from "@portfolio/ui/components/button";
import {
  DialogDrawer,
  DialogDrawerClose,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
  DialogDrawerTrigger,
} from "@portfolio/ui/components/dialog-drawer";
import { Input } from "@portfolio/ui/components/input";
import {
  PopoverDrawer,
  PopoverDrawerContent,
  PopoverDrawerDescription,
  PopoverDrawerHeader,
  PopoverDrawerTitle,
  PopoverDrawerTrigger,
} from "@portfolio/ui/components/popover-drawer";
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
import * as React from "react";

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

// The field lives above the component: crossing 768px swaps the Dialog or
// Sheet subtree for the Drawer one, which would reset an uncontrolled input.
// One field keeps the Drawer short enough that it never scrolls in the
// playground's iframe.
const useName = () => {
  const [value, setValue] = React.useState("Jordan Lee");
  return { value, onValueChange: setValue };
};

const Field = ({
  id,
  label,
  value,
  onValueChange,
}: {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <Input
      id={id}
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
    />
  </div>
);

const DialogDrawerDemo = ({ open }: DemoProps) => {
  const load = useOpenOnLoad(open);
  const name = useName();
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
            Change the name shown on your profile.
          </DialogDrawerDescription>
        </DialogDrawerHeader>
        <div className="p-4 md:p-0">
          <Field id="name" label="Name" {...name} />
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
  const name = useName();
  return (
    <SheetDrawer {...load.root} drawer={{ swipeDirection: "down" }}>
      <SheetDrawerTrigger render={<Button variant="outline" />}>
        Open sheet
      </SheetDrawerTrigger>
      <SheetDrawerContent initialFocus={load.initialFocus} side="right">
        <SheetDrawerHeader>
          <SheetDrawerTitle>Edit profile</SheetDrawerTitle>
          <SheetDrawerDescription>
            Change the name shown on your profile.
          </SheetDrawerDescription>
        </SheetDrawerHeader>
        <div className="p-4 md:py-0">
          <Field id="sheet-name" label="Name" {...name} />
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
  const [size, setSize] = React.useState({ width: "100%", height: "25px" });
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
              ["width", "Width"],
              ["height", "Height"],
            ] as const
          ).map(([id, label]) => (
            <div
              key={id}
              className="grid grid-cols-[4rem_1fr] items-center gap-2"
            >
              <label htmlFor={id} className="text-sm font-medium">
                {label}
              </label>
              <Input
                id={id}
                value={size[id]}
                onChange={(event) => {
                  const { value } = event.target;
                  setSize((current) => ({ ...current, [id]: value }));
                }}
              />
            </div>
          ))}
        </div>
      </PopoverDrawerContent>
    </PopoverDrawer>
  );
};

const DEMOS: Record<PairSlug, (props: DemoProps) => React.JSX.Element> = {
  "dialog-drawer": DialogDrawerDemo,
  "sheet-drawer": SheetDrawerDemo,
  "popover-drawer": PopoverDrawerDemo,
};

export const PairDemo = ({ slug, open }: { slug: PairSlug; open: boolean }) => {
  const Demo = DEMOS[slug];
  return <Demo open={open} />;
};

// Type-level tests for PopoverDrawer, compiled (never run) by `tsc` against this
// repo's Base UI wrappers. The item also installs on Radix: every case must
// typecheck there too, or fail there too where an expect-error directive
// says so (`pnpm registry:verify`). Not shipped: registry.json lists only
// the component.

import type { PopoverDrawerAnchor } from "@portfolio/ui/components/popover-drawer";
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

import type * as InstalledPopover from "@/components/ui/popover";
import type {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

type SameProps<A, B> = [A, keyof A] extends [B, keyof B]
  ? [B, keyof B] extends [A, keyof A]
    ? true
    : false
  : false;
type Expect<T extends true> = T;
type DesktopProps<Part extends React.ElementType> = Omit<
  React.ComponentProps<Part>,
  "drawer"
>;

// PopoverAnchor ships with the Radix wrapper only: the Anchor part takes its
// props where it exists, and accepts nothing where it does not.
type AnchorContract = typeof InstalledPopover extends {
  PopoverAnchor: infer Anchor extends React.ElementType;
}
  ? SameProps<
      Parameters<typeof PopoverDrawerAnchor>[0],
      React.ComponentProps<Anchor>
    >
  : [Parameters<typeof PopoverDrawerAnchor>[0]] extends [never]
    ? true
    : false;

// The drop-in contract: every part takes exactly the installed desktop
// wrapper's props (render on Base UI, asChild on Radix), whatever the base.
export type DropIn = [
  Expect<AnchorContract>,
  Expect<
    SameProps<
      DesktopProps<typeof PopoverDrawer>,
      React.ComponentProps<typeof Popover>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof PopoverDrawerTrigger>,
      React.ComponentProps<typeof PopoverTrigger>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof PopoverDrawerContent>,
      React.ComponentProps<typeof PopoverContent>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof PopoverDrawerHeader>,
      React.ComponentProps<typeof PopoverHeader>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof PopoverDrawerTitle>,
      React.ComponentProps<typeof PopoverTitle>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof PopoverDrawerDescription>,
      React.ComponentProps<typeof PopoverDescription>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof PopoverDrawerFooter>,
      React.ComponentProps<"div">
    >
  >,
];

export const BasicUsage = () => (
  <PopoverDrawer>
    <PopoverDrawerTrigger>Filters</PopoverDrawerTrigger>
    <PopoverDrawerContent>
      <PopoverDrawerHeader>
        <PopoverDrawerTitle>Filters</PopoverDrawerTitle>
        <PopoverDrawerDescription>
          Narrow down the list.
        </PopoverDrawerDescription>
      </PopoverDrawerHeader>
      <PopoverDrawerFooter>
        <button type="button">Apply</button>
      </PopoverDrawerFooter>
    </PopoverDrawerContent>
  </PopoverDrawer>
);

export const ControlledWithSetState = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverDrawer open={open} onOpenChange={setOpen}>
      <PopoverDrawerTrigger>Open</PopoverDrawerTrigger>
      <PopoverDrawerContent side="top" align="start" sideOffset={8}>
        …
      </PopoverDrawerContent>
    </PopoverDrawer>
  );
};

export const MobileOverrides = () => (
  <PopoverDrawer
    modal={false}
    drawer={{
      snapPoints: [0.5, 1],
      modal: true,
      onOpenChange: (open) => console.log("drawer", open),
    }}
  >
    <PopoverDrawerTrigger drawer={{ className: "w-full" }}>
      Open
    </PopoverDrawerTrigger>
    <PopoverDrawerContent className="w-80" drawer={{ className: "p-4" }}>
      <PopoverDrawerFooter drawer={{ className: "pt-0" }} />
    </PopoverDrawerContent>
  </PopoverDrawer>
);

export const InvalidUsages = () => (
  <>
    {/* @ts-expect-error snapPoints is mobile-only: it lives in drawer={{}} */}
    <PopoverDrawer snapPoints={[0.5, 1]}>
      <PopoverDrawerContent>…</PopoverDrawerContent>
    </PopoverDrawer>

    {/* @ts-expect-error open belongs to the root, not to one side */}
    <PopoverDrawer drawer={{ open: true }}>
      <PopoverDrawerContent>…</PopoverDrawerContent>
    </PopoverDrawer>

    {/* @ts-expect-error defaultOpen belongs to the root, not to one side */}
    <PopoverDrawer drawer={{ defaultOpen: true }}>
      <PopoverDrawerContent>…</PopoverDrawerContent>
    </PopoverDrawer>

    {/* @ts-expect-error detached triggers are desktop-only */}
    <PopoverDrawer drawer={{ triggerId: "settings" }}>
      <PopoverDrawerContent>…</PopoverDrawerContent>
    </PopoverDrawer>

    <PopoverDrawer>
      {/* @ts-expect-error detached triggers are desktop-only */}
      <PopoverDrawerTrigger drawer={{ payload: "settings" }}>
        Open
      </PopoverDrawerTrigger>
    </PopoverDrawer>

    <PopoverDrawer>
      {/* @ts-expect-error sideOffset is anchor positioning, not a Drawer prop */}
      <PopoverDrawerContent drawer={{ sideOffset: 4 }}>…</PopoverDrawerContent>
    </PopoverDrawer>
  </>
);

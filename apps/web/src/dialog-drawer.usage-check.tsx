// Type-level tests for DialogDrawer, compiled (never run) by `tsc` against this
// repo's Base UI wrappers. The item also installs on Radix: every case must
// typecheck there too, or fail there too where an expect-error directive
// says so (`pnpm registry:verify`). Not shipped: registry.json lists only
// the component.

import {
  DialogDrawer,
  DialogDrawerClose,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
  DialogDrawerTrigger,
} from "@registry/dialog-drawer";
import * as React from "react";

import { Button } from "@/components/ui/button";
import type {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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

// The drop-in contract: every part takes exactly the installed desktop
// wrapper's props (render on Base UI, asChild on Radix), whatever the base.
export type DropIn = [
  Expect<
    SameProps<
      DesktopProps<typeof DialogDrawer>,
      React.ComponentProps<typeof Dialog>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof DialogDrawerTrigger>,
      React.ComponentProps<typeof DialogTrigger>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof DialogDrawerContent>,
      React.ComponentProps<typeof DialogContent>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof DialogDrawerHeader>,
      React.ComponentProps<typeof DialogHeader>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof DialogDrawerFooter>,
      React.ComponentProps<typeof DialogFooter>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof DialogDrawerTitle>,
      React.ComponentProps<typeof DialogTitle>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof DialogDrawerDescription>,
      React.ComponentProps<typeof DialogDescription>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof DialogDrawerClose>,
      React.ComponentProps<typeof DialogClose>
    >
  >,
];

// A desktop-only prop is one the installed Dialog part takes and the Drawer
// part does not. Each one must be on the list the component keeps off the
// Drawer (ROOT_DESKTOP_ONLY, TRIGGER_DESKTOP_ONLY, CONTENT_DESKTOP_ONLY, the
// Footer's showCloseButton), or it would be spread onto the Drawer. This fails
// when an upstream wrapper adds one.
type UnhandledDesktopOnly<
  Desktop extends React.ElementType,
  Mobile extends React.ElementType,
  Handled extends PropertyKey,
> = Exclude<
  keyof React.ComponentProps<Desktop>,
  keyof React.ComponentProps<Mobile> | Handled
>;
type ExpectNever<T extends never> = T;

export type DesktopOnlyHandled = [
  ExpectNever<
    UnhandledDesktopOnly<
      typeof Dialog,
      typeof Drawer,
      "handle" | "triggerId" | "defaultTriggerId"
    >
  >,
  ExpectNever<
    UnhandledDesktopOnly<
      typeof DialogTrigger,
      typeof DrawerTrigger,
      "handle" | "payload"
    >
  >,
  ExpectNever<
    UnhandledDesktopOnly<
      typeof DialogContent,
      typeof DrawerContent,
      "showCloseButton"
    >
  >,
  ExpectNever<
    UnhandledDesktopOnly<typeof DialogHeader, typeof DrawerHeader, never>
  >,
  ExpectNever<
    UnhandledDesktopOnly<
      typeof DialogFooter,
      typeof DrawerFooter,
      "showCloseButton"
    >
  >,
  ExpectNever<
    UnhandledDesktopOnly<typeof DialogTitle, typeof DrawerTitle, never>
  >,
  ExpectNever<
    UnhandledDesktopOnly<
      typeof DialogDescription,
      typeof DrawerDescription,
      never
    >
  >,
  ExpectNever<
    UnhandledDesktopOnly<typeof DialogClose, typeof DrawerClose, never>
  >,
];

export const BasicUsage = () => (
  <DialogDrawer>
    <DialogDrawerTrigger>Edit profile</DialogDrawerTrigger>
    <DialogDrawerContent>
      <DialogDrawerHeader>
        <DialogDrawerTitle>Edit profile</DialogDrawerTitle>
        <DialogDrawerDescription>
          Make changes to your profile here.
        </DialogDrawerDescription>
      </DialogDrawerHeader>
      <form />
      <DialogDrawerFooter>
        <DialogDrawerClose>Cancel</DialogDrawerClose>
        <button type="submit">Save</button>
      </DialogDrawerFooter>
    </DialogDrawerContent>
  </DialogDrawer>
);

// shadcn's Dialog docs make the Trigger and Close a Button: with
// render={<Button />} on Base UI, with asChild on Radix. The spread carries
// both spellings; each base type-checks the one it declares.
const asButton = { asChild: true, render: <Button variant="outline" /> };

export const ShadcnDialogDocsExample = () => (
  <DialogDrawer>
    <form>
      <DialogDrawerTrigger {...asButton}>Open Dialog</DialogDrawerTrigger>
      <DialogDrawerContent
        className="sm:max-w-sm"
        drawer={{ className: "sm:max-w-none" }}
      >
        <DialogDrawerHeader>
          <DialogDrawerTitle>Edit profile</DialogDrawerTitle>
          <DialogDrawerDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDrawerDescription>
        </DialogDrawerHeader>
        <div className="grid gap-4 p-4 md:p-0">
          <label htmlFor="dialog-name">Name</label>
          <input id="dialog-name" defaultValue="Jordan Lee" />
        </div>
        <DialogDrawerFooter>
          <DialogDrawerClose {...asButton}>Cancel</DialogDrawerClose>
          <Button type="submit">Save changes</Button>
        </DialogDrawerFooter>
      </DialogDrawerContent>
    </form>
  </DialogDrawer>
);

export const ControlledWithSetState = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <DialogDrawer open={open} onOpenChange={setOpen}>
      <DialogDrawerTrigger>Open</DialogDrawerTrigger>
      <DialogDrawerContent>…</DialogDrawerContent>
    </DialogDrawer>
  );
};

export const MobileOverrides = () => (
  <DialogDrawer
    modal
    onOpenChange={(open) => console.log("shared", open)}
    drawer={{
      snapPoints: [0.5, 1],
      modal: false,
      onOpenChange: (open) => console.log("drawer", open),
    }}
  >
    <DialogDrawerTrigger className="w-full" drawer={{ className: "h-12" }}>
      Open
    </DialogDrawerTrigger>
    <DialogDrawerContent
      className="sm:max-w-lg"
      showCloseButton={false}
      drawer={{ className: "max-h-[80dvh]" }}
    >
      <DialogDrawerHeader drawer={{ className: "text-center" }}>
        <DialogDrawerTitle drawer={{ className: "text-lg" }}>
          Title
        </DialogDrawerTitle>
      </DialogDrawerHeader>
      <DialogDrawerFooter showCloseButton>
        <DialogDrawerClose drawer={{ className: "h-12" }}>
          Cancel
        </DialogDrawerClose>
      </DialogDrawerFooter>
    </DialogDrawerContent>
  </DialogDrawer>
);

export const InvalidUsages = () => (
  <>
    {/* @ts-expect-error snapPoints is mobile-only: it lives in drawer={{}} */}
    <DialogDrawer snapPoints={[0.5, 1]}>
      <DialogDrawerContent>…</DialogDrawerContent>
    </DialogDrawer>

    {/* @ts-expect-error open belongs to the root, not to one side */}
    <DialogDrawer drawer={{ open: true }}>
      <DialogDrawerContent>…</DialogDrawerContent>
    </DialogDrawer>

    {/* @ts-expect-error defaultOpen belongs to the root, not to one side */}
    <DialogDrawer drawer={{ defaultOpen: true }}>
      <DialogDrawerContent>…</DialogDrawerContent>
    </DialogDrawer>

    <DialogDrawer
      // @ts-expect-error the shared onOpenChange has the Dialog's signature: no "swipe" reason on Base UI, no details on Radix
      onOpenChange={(_open, details) => details.reason === "swipe"}
    >
      <DialogDrawerContent>…</DialogDrawerContent>
    </DialogDrawer>

    <DialogDrawer>
      {/* @ts-expect-error showCloseButton is desktop-only, not a Drawer prop */}
      <DialogDrawerContent drawer={{ showCloseButton: false }}>
        …
      </DialogDrawerContent>
    </DialogDrawer>
  </>
);

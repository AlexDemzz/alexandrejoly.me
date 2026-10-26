// Type-level tests for TooltipPopover, compiled (never run) by `tsc` against this
// repo's Base UI wrappers. The item also installs on Radix: every case must
// typecheck there too, or fail there too where an expect-error directive
// says so (`pnpm registry:verify`). Not shipped: registry.json lists only
// the component.

import {
  TooltipPopover,
  TooltipPopoverContent,
  TooltipPopoverTrigger,
} from "@portfolio/ui/components/tooltip-popover";
import * as React from "react";

import { Button } from "@/components/ui/button";
import type {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";

type SameProps<A, B> = [A, keyof A] extends [B, keyof B]
  ? [B, keyof B] extends [A, keyof A]
    ? true
    : false
  : false;
type Expect<T extends true> = T;
type DesktopProps<Part extends React.ElementType> = Omit<
  React.ComponentProps<Part>,
  "popover"
>;

// The drop-in contract: every part takes exactly the installed desktop
// wrapper's props (render on Base UI, asChild on Radix), whatever the base,
// minus the native popover attribute, replaced by the override.
export type DropIn = [
  Expect<
    SameProps<
      DesktopProps<typeof TooltipPopover>,
      React.ComponentProps<typeof Tooltip>
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof TooltipPopoverTrigger>,
      Omit<React.ComponentProps<typeof TooltipTrigger>, "popover">
    >
  >,
  Expect<
    SameProps<
      DesktopProps<typeof TooltipPopoverContent>,
      Omit<React.ComponentProps<typeof TooltipContent>, "popover">
    >
  >,
];

// A desktop-only prop is one the installed Tooltip part takes and the Popover
// part does not. Each one must be on the list the component keeps off the
// Popover (ROOT_DESKTOP_ONLY, TRIGGER_DESKTOP_ONLY) or out of the public
// type, or it would be spread onto the Popover. This fails when an upstream
// wrapper adds one.
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
      typeof Tooltip,
      typeof Popover,
      | "disabled"
      | "trackCursorAxis"
      | "disableHoverablePopup"
      | "delayDuration"
      | "disableHoverableContent"
    >
  >,
  ExpectNever<
    UnhandledDesktopOnly<
      typeof TooltipTrigger,
      typeof PopoverTrigger,
      "disabled" | "delay" | "closeDelay" | "closeOnClick"
    >
  >,
  ExpectNever<
    UnhandledDesktopOnly<typeof TooltipContent, typeof PopoverContent, never>
  >,
];

export const BasicUsage = () => (
  <TooltipPopover>
    <TooltipPopoverTrigger aria-label="About response rate">
      i
    </TooltipPopoverTrigger>
    <TooltipPopoverContent>
      The share of messages you reply to within 24 hours.
    </TooltipPopoverContent>
  </TooltipPopover>
);

// shadcn's Tooltip docs make the Trigger a Button: with render={<Button />}
// on Base UI, with asChild on Radix. The spread carries both spellings; each
// base type-checks the one it declares.
const asButton = { asChild: true, render: <Button variant="outline" /> };

export const ShadcnTooltipDocsExample = () => (
  <TooltipProvider>
    <TooltipPopover>
      <TooltipPopoverTrigger {...asButton}>Hover</TooltipPopoverTrigger>
      <TooltipPopoverContent>
        <p>Add to library</p>
      </TooltipPopoverContent>
    </TooltipPopover>
  </TooltipProvider>
);

export const ControlledWithSetState = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <TooltipPopover open={open} onOpenChange={setOpen}>
      <TooltipPopoverTrigger>Info</TooltipPopoverTrigger>
      <TooltipPopoverContent side="right" sideOffset={8}>
        …
      </TooltipPopoverContent>
    </TooltipPopover>
  );
};

export const MobileOverrides = () => (
  <TooltipPopover
    onOpenChange={(open) => console.log("shared", open)}
    popover={{
      modal: true,
      onOpenChange: (open) => console.log("popover", open),
    }}
  >
    <TooltipPopoverTrigger className="ms-1" popover={{ className: "p-2" }}>
      Info
    </TooltipPopoverTrigger>
    <TooltipPopoverContent
      popover={{
        className: "w-auto max-w-xs",
        side: "bottom",
        sideOffset: 8,
      }}
    >
      …
    </TooltipPopoverContent>
  </TooltipPopover>
);

export const InvalidUsages = () => (
  <>
    {/* @ts-expect-error modal is a Popover prop: it lives in popover={{}} */}
    <TooltipPopover modal>
      <TooltipPopoverContent>…</TooltipPopoverContent>
    </TooltipPopover>

    {/* @ts-expect-error open belongs to the root, not to one side */}
    <TooltipPopover popover={{ open: true }}>
      <TooltipPopoverContent>…</TooltipPopoverContent>
    </TooltipPopover>

    <TooltipPopover>
      {/* @ts-expect-error the override is typed on the Popover, not free-form */}
      <TooltipPopoverContent popover={{ notAProp: true }}>
        …
      </TooltipPopoverContent>
    </TooltipPopover>

    <TooltipPopover>
      {/* @ts-expect-error the native popover attribute is replaced by the override */}
      <TooltipPopoverTrigger popover="auto">Info</TooltipPopoverTrigger>
    </TooltipPopover>
  </>
);

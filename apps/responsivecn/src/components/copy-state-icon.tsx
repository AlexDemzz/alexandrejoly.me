import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { cn } from "@portfolio/ui/lib/utils";
import type * as React from "react";

const ICON_CLASS =
  "absolute inset-0 size-full transition duration-300 ease-standard motion-reduce:transition-opacity";
const SHOWN = "scale-100 opacity-100 blur-none";
const HIDDEN =
  "scale-25 opacity-0 blur-xs motion-reduce:scale-100 motion-reduce:blur-none";

export const CopyStateIcon = ({
  copied,
  className,
  ...props
}: React.ComponentProps<"span"> & { copied: boolean }) => (
  <span
    aria-hidden
    className={cn("relative size-4 shrink-0", className)}
    {...props}
  >
    <CopyIcon className={cn(ICON_CLASS, copied ? HIDDEN : SHOWN)} />
    <CheckIcon className={cn(ICON_CLASS, copied ? SHOWN : HIDDEN)} />
  </span>
);

// Rendered empty first, outside the button, so screen readers announce the
// text when it appears.
export const CopyStatus = ({ copied }: { copied: boolean }) => (
  <output className="sr-only">{copied ? "Copied" : ""}</output>
);

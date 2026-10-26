import { cn } from "@portfolio/ui/lib/utils";
import * as React from "react";

import {
  DRAWER_OPACITY,
  DRAWER_PATH,
  HANDLE_PATH,
  MODAL_OPACITY,
  MODAL_PATH,
} from "@/lib/mark";

export const Mark = ({ className }: { className?: string }) => {
  const maskId = `${React.useId().replaceAll(/[^a-zA-Z0-9-]/gu, "")}-handle`;
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("shrink-0", className)}
    >
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect width="24" height="24" className="fill-white" />
          <path
            d={HANDLE_PATH}
            className="stroke-black"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <path d={MODAL_PATH} opacity={MODAL_OPACITY} />
      <path d={DRAWER_PATH} mask={`url(#${maskId})`} opacity={DRAWER_OPACITY} />
    </svg>
  );
};

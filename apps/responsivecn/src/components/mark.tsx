import { cn } from "@portfolio/ui/lib/utils";
import * as React from "react";

import { DRAWER_PATH, HANDLE_PATH, MODAL_PATH } from "@/lib/mark";

// The modal recedes and the drawer comes forward while `drawer` is set or the
// `group/mark` link is hovered or focused. The drawer-led opacities match
// MODAL_OPACITY and DRAWER_OPACITY in lib/mark.
const MODAL_LAYER =
  "opacity-55 transition-opacity duration-300 ease-settle motion-reduce:transition-none group-focus-visible/mark:opacity-25 group-data-[drawer=true]/svg:opacity-25 can-hover:group-hover/mark:opacity-25";
const DRAWER_LAYER =
  "opacity-35 transition-opacity duration-300 ease-settle motion-reduce:transition-none group-focus-visible/mark:opacity-85 group-data-[drawer=true]/svg:opacity-85 can-hover:group-hover/mark:opacity-85";

export const Mark = ({
  drawer = false,
  className,
}: {
  drawer?: boolean;
  className?: string;
}) => {
  const maskId = `${React.useId().replaceAll(/[^a-zA-Z0-9-]/gu, "")}-handle`;
  return (
    <svg
      aria-hidden
      data-drawer={drawer}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("group/svg shrink-0", className)}
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
      <path d={MODAL_PATH} className={MODAL_LAYER} />
      <path d={DRAWER_PATH} mask={`url(#${maskId})`} className={DRAWER_LAYER} />
    </svg>
  );
};

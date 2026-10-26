import { cn } from "@portfolio/ui/lib/utils";
import { useId } from "react";

// The responsivecn mark: a modal with a drawer inset at its bottom. On row hover
// the modal recedes and the drawer comes forward and grows up the modal, as the
// overlay turns into its mobile one. The drawer is two copies of its shape: the
// top one, with the handle, slides up while the bottom one stays put, so the
// corners keep their radius. Both share one opacity, so their overlap doesn't
// darken.
const MODAL_PATH =
  "M7.837 3H16.163C17.556 3 18.252 3.065 19.002 3.237C19.82 3.534 20.466 4.18 20.763 4.998C20.935 5.748 21 6.444 21 7.837V16.163C21 17.556 20.935 18.252 20.763 19.002C20.466 19.82 19.82 20.466 19.002 20.763C18.252 20.935 17.556 21 16.163 21H7.837C6.444 21 5.748 20.935 4.998 20.763C4.18 20.466 3.534 19.82 3.237 19.002C3.065 18.252 3 17.556 3 16.163V7.837C3 6.444 3.065 5.748 3.237 4.998C3.534 4.18 4.18 3.534 4.998 3.237C5.748 3.065 6.444 3 7.837 3Z";
const DRAWER_PATH =
  "M7.308 11H16.692C17.644 11 18.121 11.045 18.633 11.162C19.193 11.365 19.635 11.807 19.838 12.367C19.955 12.879 20 13.356 20 14.308V16.692C20 17.644 19.955 18.121 19.838 18.633C19.635 19.193 19.193 19.635 18.633 19.838C18.121 19.955 17.644 20 16.692 20H7.308C6.356 20 5.879 19.955 5.367 19.838C4.807 19.635 4.365 19.193 4.162 18.633C4.045 18.121 4 17.644 4 16.692V14.308C4 13.356 4.045 12.879 4.162 12.367C4.365 11.807 4.807 11.365 5.367 11.162C5.879 11.045 6.356 11 7.308 11Z";

const TIMING = "ease-settle duration-250";
const RISE = cn(
  "motion-safe:can-hover:group-hover/item:-translate-y-[5px] transition-transform transform-fill motion-safe:group-focus-visible/item:-translate-y-[5px]",
  TIMING
);

export const ResponsivecnIcon = ({ className }: { className?: string }) => {
  const maskId = useId();
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      height={16}
      viewBox="0 0 24 24"
      width={16}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse">
        <rect className="fill-white" height={24} width={24} />
        <path
          className={cn("stroke-black", RISE)}
          d="M10.5 12.75h3"
          strokeLinecap="round"
          strokeWidth={1}
        />
      </mask>
      <path
        className={cn(
          "can-hover:group-hover/item:opacity-25 opacity-55 transition-opacity group-focus-visible/item:opacity-25",
          TIMING
        )}
        d={MODAL_PATH}
      />
      <g
        className={cn(
          "can-hover:group-hover/item:opacity-85 opacity-35 transition-opacity group-focus-visible/item:opacity-85",
          TIMING
        )}
        mask={`url(#${maskId})`}
      >
        <path d={DRAWER_PATH} />
        <path className={RISE} d={DRAWER_PATH} />
      </g>
    </svg>
  );
};

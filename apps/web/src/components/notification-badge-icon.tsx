import { useId } from "react";

// A rounded avatar with a badge dot on its top-right corner, the gap around the
// dot cut by a mask like the component's clip-path. On row hover the dot swells
// and settles, the gap with it, as a new notification lands.
export const NotificationBadgeIcon = () => {
  const maskId = useId();
  const badgeMotion =
    "motion-safe:can-hover:group-hover/item:animate-badge-bump motion-safe:group-focus-visible/item:animate-badge-bump origin-center transform-fill";
  return (
    <svg
      aria-hidden
      fill="none"
      height={16}
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={16}
    >
      <mask height={24} id={maskId} maskUnits="userSpaceOnUse" width={24}>
        <rect className="fill-white stroke-none" height={24} width={24} />
        <circle
          className={`fill-black stroke-none ${badgeMotion}`}
          cx={18}
          cy={6}
          r={5.5}
        />
      </mask>
      <rect
        height={14}
        mask={`url(#${maskId})`}
        rx={4}
        width={14}
        x={3}
        y={7}
      />
      <circle
        className={`fill-current stroke-none ${badgeMotion}`}
        cx={18}
        cy={6}
        r={3}
      />
    </svg>
  );
};

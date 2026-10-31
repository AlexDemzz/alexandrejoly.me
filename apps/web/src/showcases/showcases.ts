import { marqueeHoldsStill } from "@/showcases/marquee-holds-still";
import { notificationBadgeHole } from "@/showcases/notification-badge-hole";
import { responsivecnLaunch } from "@/showcases/responsivecn-launch";
import type { Showcase } from "@/showcases/showcase";

/** Every showcase, keyed by the slug of the post it records for. */
export const SHOWCASES: Record<string, Showcase> = {
  "marquee-holds-still": marqueeHoldsStill,
  "notification-badge-hole": notificationBadgeHole,
  "responsivecn-launch": responsivecnLaunch,
};

import type { ComponentType } from "react";

import { HintIcon } from "@/components/hint-icon";
import { InfiniteScrollIcon } from "@/components/infinite-scroll-icon";
import { ItemInsetSeparatorIcon } from "@/components/item-inset-separator-icon";
import { MarqueeIcon } from "@/components/marquee-icon";
import { NotificationBadgeIcon } from "@/components/notification-badge-icon";
import { OnboardingIcon } from "@/components/onboarding-icon";
import type { RegistryItemName } from "@/lib/registry";

/**
 * Each registry item's row glyph, on the home page and its Open Graph card.
 * `scripts/og-images.mjs` reads `<name>-icon.tsx` to tell when a card is stale.
 */
export const COMPONENT_ICONS: Record<RegistryItemName, ComponentType> = {
  hint: HintIcon,
  "infinite-scroll": InfiniteScrollIcon,
  "item-inset-separator": ItemInsetSeparatorIcon,
  marquee: MarqueeIcon,
  "notification-badge": NotificationBadgeIcon,
  onboarding: OnboardingIcon,
};

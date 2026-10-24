import { cn } from "@portfolio/ui/lib/utils";

import { COMPONENT_ICONS } from "@/components/component-icons";
import { SITE } from "@/content";
import type { RegistryItem, RegistryItemName } from "@/lib/registry";

// Judged by eye on the 80px glyph: the badge's square sits low-left of the
// 24px grid and its dot pulls the mass up-right; the separator's lower rule
// rests faint, so its weight sits on top.
const OPTICAL_NUDGE: Partial<Record<RegistryItemName, string>> = {
  "item-inset-separator": "translate-y-1",
  "notification-badge": "translate-x-0.75 -translate-y-0.75",
};

/**
 * A component's 1200×630 Open Graph card: its row glyph, title and description,
 * signed. Captured with a light colour scheme, like `og.png`.
 */
export const OgCard = ({ item }: { item: RegistryItem }) => {
  const Icon = COMPONENT_ICONS[item.name];
  return (
    <div
      className="bg-background text-foreground flex h-157.5 w-300 flex-col justify-between overflow-hidden p-20"
      data-og-card
    >
      <div className="flex flex-col gap-8">
        <div className="shadow-hairline flex size-32 items-center justify-center rounded-full">
          {/* The 16px row glyph, scaled rather than resized so it keeps its grid. */}
          <span className={cn("flex", OPTICAL_NUDGE[item.name])}>
            <span className="flex scale-500">
              <Icon />
            </span>
          </span>
        </div>
        <div className="flex max-w-240 flex-col gap-4">
          <h1 className="text-6xl font-semibold tracking-tight">
            {item.title}
          </h1>
          <p className="text-muted-foreground text-3xl leading-snug text-balance">
            {/* Non-breaking hyphens keep “scroll-driven” and the like whole. */}
            {item.description.replaceAll("-", "‑")}.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <svg
          aria-hidden
          className="size-9"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M3 12A9 9 0 1 1 12 21" />
          <path d="M9.5 12H14.5" />
        </svg>
        <span className="text-3xl leading-none font-semibold">{SITE.name}</span>
      </div>
    </div>
  );
};

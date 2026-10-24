import { cn } from "@portfolio/ui/lib/utils";
import type { ReactNode } from "react";

import { COMPONENT_ICONS } from "@/components/component-icons";
import { SITE } from "@/content";
import { REGISTRY_ITEMS } from "@/lib/registry";
import type { RegistryItem, RegistryItemName } from "@/lib/registry";

// Judged by eye on the 80px glyph: the badge's square sits low-left of the
// 24px grid and its dot pulls the mass up-right; the separator's lower rule
// rests faint, so its weight sits on top.
const OPTICAL_NUDGE: Partial<Record<RegistryItemName, string>> = {
  "item-inset-separator": "translate-y-1",
  "notification-badge": "translate-x-0.75 -translate-y-0.75",
};

/** A row glyph in its hairline circle, scaled rather than resized so it keeps its grid. */
const OgGlyph = ({
  className,
  name,
  scale,
}: {
  className: string;
  name: RegistryItemName;
  scale: string;
}) => {
  const Icon = COMPONENT_ICONS[name];
  return (
    <div
      className={cn(
        "shadow-hairline flex items-center justify-center rounded-full",
        className
      )}
    >
      <span className={cn("flex", OPTICAL_NUDGE[name])}>
        <span className={cn("flex", scale)}>
          <Icon />
        </span>
      </span>
    </div>
  );
};

/**
 * A 1200×630 Open Graph card: media, title and description, signed. Captured
 * with a light colour scheme, like `og.png`.
 */
const OgCardFrame = ({
  description,
  media,
  title,
}: {
  description: string;
  media: ReactNode;
  title: string;
}) => (
  <div
    className="bg-background text-foreground flex h-157.5 w-300 flex-col justify-between overflow-hidden p-20"
    data-og-card
  >
    <div className="flex flex-col gap-8">
      {media}
      <div className="flex max-w-240 flex-col gap-4">
        <h1 className="text-6xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground text-3xl leading-snug text-balance">
          {/* Non-breaking hyphens keep “scroll-driven” and the like whole. */}
          {description.replaceAll("-", "‑")}
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

/** A component's card: its row glyph, title and description. */
export const OgCard = ({ item }: { item: RegistryItem }) => (
  <OgCardFrame
    description={`${item.description}.`}
    media={<OgGlyph className="size-32" name={item.name} scale="scale-500" />}
    title={item.title}
  />
);

// Kept here rather than in content.ts so the card's lock hash covers it.
export const COMPONENTS_CARD = {
  description:
    "Free and open source. Install each one with the shadcn CLI, then copy its usage.",
  title: "React components for shadcn/ui",
};

/** The `/components` index's card: every row glyph, in registry order. */
export const ComponentsOgCard = () => (
  <OgCardFrame
    description={COMPONENTS_CARD.description}
    media={
      <div className="flex gap-4">
        {REGISTRY_ITEMS.map(({ name }) => (
          <OgGlyph
            className="size-24"
            key={name}
            name={name}
            scale="scale-375"
          />
        ))}
      </div>
    }
    title={COMPONENTS_CARD.title}
  />
);

import { cn } from "@portfolio/ui/lib/utils";
import type { ReactNode } from "react";

import { COMPONENT_ICONS } from "@/components/component-icons";
import { LabIcon } from "@/components/lab-icon";
import { SkillIcon } from "@/components/skill-icon";
import { SITE } from "@/content";
import type { Skill } from "@/content";
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
const OgGlyphFrame = ({
  children,
  className,
  nudge,
  scale,
}: {
  children: ReactNode;
  className: string;
  nudge?: string;
  scale: string;
}) => (
  <div
    className={cn(
      "shadow-hairline flex items-center justify-center rounded-full",
      className
    )}
  >
    <span className={cn("flex", nudge)}>
      <span className={cn("flex", scale)}>{children}</span>
    </span>
  </div>
);

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
    <OgGlyphFrame
      className={className}
      nudge={OPTICAL_NUDGE[name]}
      scale={scale}
    >
      <Icon />
    </OgGlyphFrame>
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

/** An agent skill's card: the slash glyph of its home row, its name and description. */
export const SkillOgCard = ({ skill }: { skill: Skill }) => (
  <OgCardFrame
    description={`${skill.description}.`}
    media={
      <OgGlyphFrame className="size-32" scale="scale-500">
        <SkillIcon />
      </OgGlyphFrame>
    }
    title={skill.name}
  />
);

export const SKILLS_CARD = {
  description:
    "Instructions a coding agent loads to build interfaces the way a design engineer would.",
  title: "Agent skills",
};

/** The `/skills` index's card. */
export const SkillsOgCard = () => (
  <OgCardFrame
    description={SKILLS_CARD.description}
    media={
      <OgGlyphFrame className="size-32" scale="scale-500">
        <SkillIcon />
      </OgGlyphFrame>
    }
    title={SKILLS_CARD.title}
  />
);

export const LAB_CARD = {
  description:
    "Small experiments in interaction: studies of gesture and motion.",
  title: "Lab",
};

const LabGlyph = () => (
  <OgGlyphFrame className="size-32" scale="scale-500">
    <LabIcon />
  </OgGlyphFrame>
);

/** The `/lab` index's card. */
export const LabOgCard = () => (
  <OgCardFrame
    description={LAB_CARD.description}
    media={<LabGlyph />}
    title={LAB_CARD.title}
  />
);

export const ASCII_CARD = {
  description:
    "Pictures drawn in glyphs that answer a drag, a hold or a fling.",
  // oxlint-disable-next-line unicorn/text-encoding-identifier-case -- a title, not an encoding name
  title: "ASCII",
};

/** The `/lab/ascii` card. */
export const AsciiOgCard = () => (
  <OgCardFrame
    description={ASCII_CARD.description}
    media={<LabGlyph />}
    title={ASCII_CARD.title}
  />
);

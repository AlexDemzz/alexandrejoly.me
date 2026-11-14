import { createFileRoute } from "@tanstack/react-router";

import { SkillsOgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/skills.png`. */
export const Route = createFileRoute("/og/skills/")({
  component: SkillsOgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

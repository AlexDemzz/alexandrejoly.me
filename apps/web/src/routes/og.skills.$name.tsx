import { createFileRoute, notFound } from "@tanstack/react-router";

import { SkillOgCard } from "@/components/og-card";
import { SKILLS } from "@/content";

/** The page screenshotted into `public/og/skills/<name>.png`. */
const OgCardPage = () => <SkillOgCard skill={Route.useLoaderData()} />;

export const Route = createFileRoute("/og/skills/$name")({
  component: OgCardPage,
  loader: ({ params: { name } }) => {
    const skill = SKILLS.find((candidate) => candidate.name === name);
    if (skill === undefined) {
      throw notFound();
    }
    return skill;
  },
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

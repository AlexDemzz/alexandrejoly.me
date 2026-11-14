import { createFileRoute } from "@tanstack/react-router";

import { SkillRows } from "@/components/home-rows";
import { IndexPage } from "@/components/index-page";
import { SKILLS_CARD } from "@/components/og-card";
import { SKILLS_PAGE } from "@/content";
import { pageHead } from "@/lib/head";
import { SKILLS_PATH } from "@/skill-pages";

const SkillsPage = () => (
  <IndexPage
    intro={SKILLS_PAGE.intro}
    listTitle={SKILLS_PAGE.listTitle}
    title={SKILLS_PAGE.title}
  >
    <SkillRows />
  </IndexPage>
);

const head = pageHead({
  description: SKILLS_PAGE.description,
  image: {
    alt: `${SKILLS_CARD.title}: ${SKILLS_CARD.description}`,
    path: "og/skills.png",
  },
  path: SKILLS_PATH,
  title: SKILLS_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/skills/")({
  component: SkillsPage,
  head: () => head,
});

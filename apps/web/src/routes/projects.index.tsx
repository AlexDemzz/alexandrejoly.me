import { createFileRoute } from "@tanstack/react-router";

import { ProjectRows } from "@/components/home-rows";
import { IndexPage } from "@/components/index-page";
import { PROJECTS_PAGE, PROJECTS_PATH } from "@/content";
import { pageHead } from "@/lib/head";

const ProjectsPage = () => (
  <IndexPage
    intro={PROJECTS_PAGE.intro}
    listTitle={PROJECTS_PAGE.listTitle}
    title={PROJECTS_PAGE.title}
  >
    <ProjectRows />
  </IndexPage>
);

const head = pageHead({
  description: PROJECTS_PAGE.description,
  path: PROJECTS_PATH,
  title: PROJECTS_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
  head: () => head,
});

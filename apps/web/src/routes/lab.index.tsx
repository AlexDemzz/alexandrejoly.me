import { createFileRoute } from "@tanstack/react-router";

import { LabRows } from "@/components/home-rows";
import { IndexPage } from "@/components/index-page";
import { LAB_CARD } from "@/components/og-card";
import { LAB_PAGE } from "@/content";
import { LAB_PATH } from "@/lab/experiments";
import { pageHead } from "@/lib/head";

const LabPage = () => (
  <IndexPage
    intro={LAB_PAGE.intro}
    listTitle={LAB_PAGE.listTitle}
    title={LAB_PAGE.title}
  >
    <LabRows />
  </IndexPage>
);

const head = pageHead({
  description: LAB_PAGE.description,
  image: {
    alt: `${LAB_CARD.title}: ${LAB_CARD.description}`,
    path: "og/lab.png",
  },
  path: LAB_PATH,
  title: LAB_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/lab/")({
  component: LabPage,
  head: () => head,
});

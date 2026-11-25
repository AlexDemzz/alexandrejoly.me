import { createFileRoute } from "@tanstack/react-router";

import { IndexPage } from "@/components/index-page";
import { LITERAL_CARD } from "@/components/og-card";
import { LITERAL_PAGE } from "@/content";
import { LITERAL_PATH } from "@/lab/experiments";
import { LabBreadcrumb } from "@/lab/lab-page-heading";
import { PieceGrid } from "@/lab/literal-ui/piece-grid";
import { pageHead } from "@/lib/head";

const LiteralPage = () => (
  <IndexPage
    intro={LITERAL_PAGE.intro}
    listTitle={LITERAL_PAGE.listTitle}
    nav={<LabBreadcrumb />}
    title={LITERAL_PAGE.title}
  >
    <PieceGrid />
  </IndexPage>
);

const head = pageHead({
  description: LITERAL_PAGE.description,
  image: {
    alt: `${LITERAL_CARD.title}: ${LITERAL_CARD.description}`,
    path: "og/lab/literal-ui.png",
  },
  path: LITERAL_PATH,
  title: LITERAL_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/lab/literal-ui/")({
  component: LiteralPage,
  head: () => head,
});

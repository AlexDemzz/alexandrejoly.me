import { createFileRoute } from "@tanstack/react-router";

import { ComponentRows } from "@/components/home-rows";
import { IndexPage } from "@/components/index-page";
import { COMPONENTS_CARD } from "@/components/og-card";
import { COMPONENTS_PAGE } from "@/content";
import { componentsJsonLd } from "@/lib/component-json-ld";
import { pageHead } from "@/lib/head";
import { COMPONENTS_PATH } from "@/lib/registry";

const ComponentsPage = () => (
  <IndexPage
    intro={COMPONENTS_PAGE.intro}
    listTitle={COMPONENTS_PAGE.listTitle}
    title={COMPONENTS_PAGE.title}
  >
    <ComponentRows />
  </IndexPage>
);

const componentsHead = pageHead({
  description: COMPONENTS_PAGE.description,
  image: {
    alt: `${COMPONENTS_CARD.title}: ${COMPONENTS_CARD.description}`,
    path: "og/components.png",
  },
  path: COMPONENTS_PATH,
  title: COMPONENTS_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/components/")({
  component: ComponentsPage,
  head: () => ({
    links: componentsHead.links,
    meta: componentsHead.meta,
    scripts: [
      {
        children: JSON.stringify(componentsJsonLd()),
        type: "application/ld+json",
      },
    ],
  }),
});

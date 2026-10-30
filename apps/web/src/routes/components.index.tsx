import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@portfolio/ui/components/breadcrumb";
import { Heading } from "@portfolio/ui/components/heading";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import { Text } from "@portfolio/ui/components/text";
import { Link, createFileRoute } from "@tanstack/react-router";

import { ComponentRows } from "@/components/home-rows";
import { COMPONENTS_CARD } from "@/components/og-card";
import { SectionStack } from "@/components/section-stack";
import { SiteFooter } from "@/components/site-footer";
import { COMPONENTS_PAGE } from "@/content";
import { componentsJsonLd } from "@/lib/component-json-ld";
import { pageHead } from "@/lib/head";
import { EXACT_ACTIVE } from "@/lib/link";
import { COMPONENTS_PATH } from "@/lib/registry";

const ComponentsPage = () => (
  <main className="max-w-column mx-auto px-6 py-12 sm:py-32 md:py-16">
    <header className="flex flex-col items-start gap-5 pb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link activeOptions={EXACT_ACTIVE} to="/" />}
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Heading
        render={({ children, ...props }) => <h1 {...props}>{children}</h1>}
      >
        {COMPONENTS_PAGE.title}
      </Heading>
      <Text>{COMPONENTS_PAGE.intro}</Text>
    </header>

    <SectionStack>
      <Section spacing="none">
        <SectionTitle>{COMPONENTS_PAGE.listTitle}</SectionTitle>
        <SectionContent>
          <ComponentRows />
        </SectionContent>
      </Section>
    </SectionStack>

    <SiteFooter />
  </main>
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

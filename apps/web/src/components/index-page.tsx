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
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { SectionStack } from "@/components/section-stack";
import { SiteFooter } from "@/components/site-footer";
import { SITE } from "@/content";
import { EXACT_ACTIVE } from "@/lib/link";

/** A section's index: its title and intro, then one list of rows to its pages. */
export const IndexPage = ({
  children,
  intro,
  listTitle,
  title,
}: {
  children: ReactNode;
  intro: string;
  listTitle: string;
  title: string;
}) => (
  <main className="max-w-column mx-auto px-6 py-12 sm:py-32 md:py-16">
    <header className="flex flex-col items-start gap-5 pb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link activeOptions={EXACT_ACTIVE} to="/" />}
            >
              {SITE.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Heading
        render={({ children: heading, ...props }) => (
          <h1 {...props}>{heading}</h1>
        )}
      >
        {title}
      </Heading>
      <Text>{intro}</Text>
    </header>

    <SectionStack>
      <Section spacing="none">
        <SectionTitle>{listTitle}</SectionTitle>
        <SectionContent>{children}</SectionContent>
      </Section>
    </SectionStack>

    <SiteFooter />
  </main>
);

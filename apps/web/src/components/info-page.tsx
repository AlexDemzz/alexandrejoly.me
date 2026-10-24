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
import { Link } from "@tanstack/react-router";

import { Prose } from "@/components/prose";
import { SiteFooter } from "@/components/site-footer";
import { SITE } from "@/content";
import { INFO_PAGES } from "@/info-pages";
import type { InfoPageSlug } from "@/info-pages";
import { pageHead } from "@/lib/head";
import { EXACT_ACTIVE } from "@/lib/link";

export const InfoPageView = ({ slug }: { slug: InfoPageSlug }) => {
  const { intro, sections, title } = INFO_PAGES[slug];

  return (
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
          {title}
        </Heading>
        <Prose paragraphs={intro} />
      </header>

      {sections.map((section) => (
        <Section key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          <SectionContent>
            <div className="flex flex-col gap-5">
              <Prose paragraphs={section.paragraphs} />
            </div>
          </SectionContent>
        </Section>
      ))}

      <SiteFooter />
    </main>
  );
};

export const infoPageHead = (slug: InfoPageSlug) => {
  const { description, documentTitle, title } = INFO_PAGES[slug];
  return pageHead({
    description,
    path: slug,
    title: documentTitle ?? `${title} – ${SITE.name}`,
    type: slug === "about" ? "profile" : "website",
  });
};

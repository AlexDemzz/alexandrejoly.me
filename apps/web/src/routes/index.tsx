import {
  Identity,
  IdentityMark,
  IdentityName,
  IdentityRole,
} from "@portfolio/ui/components/identity";
import { ItemMedia } from "@portfolio/ui/components/item";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import { TextLink } from "@portfolio/ui/components/text";
import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";

import { ContributionGraph } from "@/components/contribution-graph";
import { HintIcon } from "@/components/hint-icon";
import { ComponentRow, ExternalRow, RowList } from "@/components/home-rows";
import { InfiniteScrollIcon } from "@/components/infinite-scroll-icon";
import { ItemInsetSeparatorIcon } from "@/components/item-inset-separator-icon";
import { LazyVideo } from "@/components/lazy-video";
import { Mark } from "@/components/mark";
import { MarqueeIcon } from "@/components/marquee-icon";
import { MediaBackdrop } from "@/components/media-backdrop";
import { NotificationBadgeIcon } from "@/components/notification-badge-icon";
import { OnboardingIcon } from "@/components/onboarding-icon";
import { Prose } from "@/components/prose";
import { SiteFooter } from "@/components/site-footer";
import { SkillIcon } from "@/components/skill-icon";
import {
  ARCHIVES,
  AWARDS,
  EMPLOYER,
  INTRO,
  LINKS,
  PROJECTS,
  SITE,
  SKILLS,
  X_HANDLE,
  SOCIALS,
  skillHref,
} from "@/content";
import type { Project } from "@/content";
import { getContributions } from "@/github-contributions";
import { pageHead } from "@/lib/head";
import { REGISTRY_ITEMS } from "@/lib/registry";
import type { RegistryItemName } from "@/lib/registry";

const COMPONENT_ICONS: Record<RegistryItemName, ComponentType> = {
  hint: HintIcon,
  "infinite-scroll": InfiniteScrollIcon,
  "item-inset-separator": ItemInsetSeparatorIcon,
  marquee: MarqueeIcon,
  "notification-badge": NotificationBadgeIcon,
  onboarding: OnboardingIcon,
};

const ProjectMedia = ({
  project: { backdrop, icon: Icon },
}: {
  project: Project;
}) => (
  <ItemMedia variant="image">
    {backdrop === undefined ? (
      <Icon />
    ) : (
      <>
        <MediaBackdrop src={backdrop} />
        <Icon className="can-hover:group-hover/item:text-white relative group-focus-visible/item:text-white" />
      </>
    )}
  </ItemMedia>
);

const HomeComponent = () => {
  const contributions = Route.useLoaderData();

  return (
    <main className="max-w-column mx-auto px-6 py-12 sm:py-32 md:py-16">
      <header className="flex flex-col gap-5 pb-6">
        <Identity className="mb-1">
          <IdentityMark>
            <Mark />
          </IdentityMark>
          <div>
            <IdentityName>Alexandre Joly</IdentityName>
            <IdentityRole>
              Developer at{" "}
              <TextLink external href={EMPLOYER.href}>
                {EMPLOYER.name}
              </TextLink>
            </IdentityRole>
          </div>
        </Identity>
        <Prose paragraphs={INTRO} />
        <nav aria-label="Social" className="-ml-2.5 flex items-center">
          {SOCIALS.map(({ href, icon: Icon, name }) => {
            const external = href.startsWith("https://");
            return (
              <a
                aria-label={external ? `${name} (opens in a new tab)` : name}
                className="text-muted-foreground can-hover:hover:bg-muted can-hover:hover:text-foreground focus-visible:text-foreground rounded-lg p-2.5 transition-colors duration-200 ease-out"
                href={href}
                key={name}
                {...(external ? { rel: "noreferrer", target: "_blank" } : {})}
              >
                <Icon className="size-4.5" />
              </a>
            );
          })}
        </nav>
        {contributions === null ? null : (
          <ContributionGraph contributions={contributions} />
        )}
      </header>

      <Section>
        <SectionTitle>Projects</SectionTitle>
        <SectionContent>
          <RowList>
            {PROJECTS.map((project) => (
              <ExternalRow
                aside={project.year}
                description={project.description}
                href={project.href}
                key={project.name}
                media={<ProjectMedia project={project} />}
                title={project.name}
              />
            ))}
          </RowList>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Agent skills</SectionTitle>
        <SectionContent>
          <RowList>
            {SKILLS.map((skill) => (
              <ExternalRow
                description={skill.description}
                href={skillHref(skill.name)}
                key={skill.name}
                media={
                  <ItemMedia variant="image">
                    <SkillIcon />
                  </ItemMedia>
                }
                title={skill.name}
              />
            ))}
          </RowList>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Components</SectionTitle>
        <SectionContent>
          <RowList>
            {REGISTRY_ITEMS.map((component) => {
              const Icon = COMPONENT_ICONS[component.name];
              return (
                <ComponentRow
                  description={component.description}
                  key={component.name}
                  media={
                    <ItemMedia variant="image">
                      <Icon />
                    </ItemMedia>
                  }
                  name={component.name}
                  title={component.title}
                />
              );
            })}
          </RowList>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Recognition</SectionTitle>
        <SectionContent>
          <RowList>
            {AWARDS.map((award) => (
              <ExternalRow
                aside={award.year}
                description={award.issuer}
                href={award.href}
                key={award.href}
                media={
                  <ItemMedia variant="image">
                    <award.icon />
                  </ItemMedia>
                }
                title={award.title}
              />
            ))}
          </RowList>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Previously</SectionTitle>
        <SectionContent>
          <RowList>
            {ARCHIVES.map((archive) => (
              <ExternalRow
                aside={archive.year}
                description={archive.description}
                href={archive.href}
                key={archive.href}
                media={
                  <ItemMedia variant="image">
                    <LazyVideo
                      className="size-full object-cover"
                      src={archive.media}
                    />
                  </ItemMedia>
                }
                title={archive.title}
              />
            ))}
          </RowList>
        </SectionContent>
      </Section>

      <SiteFooter />
    </main>
  );
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  address: {
    "@type": "PostalAddress",
    addressCountry: "CH",
    addressLocality: "Geneva",
  },
  description: SITE.description,
  jobTitle: "Developer",
  name: SITE.name,
  sameAs: [LINKS.github, LINKS.linkedin, LINKS.x],
  url: SITE.url,
  worksFor: {
    "@type": "Organization",
    name: EMPLOYER.name,
    url: EMPLOYER.href,
  },
};

const homeHead = pageHead({
  description: SITE.description,
  path: "",
  title: SITE.title,
  type: "profile",
});

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: () => getContributions(),
  head: () => ({
    links: homeHead.links,
    meta: [
      ...homeHead.meta,
      { content: `${SITE.url}og.png`, property: "og:image" },
      { content: "1200", property: "og:image:width" },
      { content: "630", property: "og:image:height" },
      { content: SITE.name, property: "og:image:alt" },
      { content: "summary_large_image", name: "twitter:card" },
      { content: `@${X_HANDLE}`, name: "twitter:creator" },
    ],
    scripts: [
      { children: JSON.stringify(personJsonLd), type: "application/ld+json" },
    ],
  }),
});

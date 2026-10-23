import {
  Identity,
  IdentityMark,
  IdentityName,
  IdentityRole,
} from "@portfolio/ui/components/identity";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import { TextLink } from "@portfolio/ui/components/text";
import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";

import { ContributionGraph } from "@/components/contribution-graph";
import type { ContributionSummary } from "@/components/contribution-graph";
import { HintIcon } from "@/components/hint-icon";
import { ComponentRow, ExternalRow, RowList } from "@/components/home-rows";
import { InfiniteScrollIcon } from "@/components/infinite-scroll-icon";
import { ItemInsetSeparatorIcon } from "@/components/item-inset-separator-icon";
import { ItemLightMedia } from "@/components/item-light";
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
import { personJsonLd } from "@/lib/person-json-ld";
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
  <ItemLightMedia>
    {backdrop === undefined ? (
      <Icon />
    ) : (
      <>
        <MediaBackdrop src={backdrop} />
        <Icon className="can-hover:group-hover/item:text-white relative group-focus-visible/item:text-white" />
      </>
    )}
  </ItemLightMedia>
);

const HomeComponent = () => {
  const contributions = Route.useLoaderData();

  return (
    <main className="max-w-column mx-auto px-6 py-12 sm:py-32 md:py-16">
      <div className="flex flex-col gap-5 pb-6">
        <Identity className="mb-1">
          <IdentityMark>
            <Mark />
          </IdentityMark>
          <div>
            <IdentityName>Alexandre Joly</IdentityName>
            <IdentityRole>
              Design engineer at{" "}
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
      </div>

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
                  <ItemLightMedia>
                    <SkillIcon />
                  </ItemLightMedia>
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
                    <ItemLightMedia>
                      <Icon />
                    </ItemLightMedia>
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
                  <ItemLightMedia>
                    <award.icon />
                  </ItemLightMedia>
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
                  <ItemLightMedia aria-hidden>
                    <LazyVideo
                      className="size-full object-cover"
                      poster={archive.poster}
                      src={archive.media}
                    />
                  </ItemLightMedia>
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

const homeHead = pageHead({
  description: SITE.description,
  path: "",
  title: SITE.title,
  type: "profile",
});

export const Route = createFileRoute("/")({
  component: HomeComponent,
  // Only what the page prints: the cells load from `/contributions.svg`.
  loader: async (): Promise<ContributionSummary | null> => {
    const contributions = await getContributions();
    return (
      contributions && {
        total: contributions.total,
        weekCount: contributions.weeks.length,
      }
    );
  },
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

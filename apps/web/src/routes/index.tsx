import {
  Identity,
  IdentityMark,
  IdentityName,
  IdentityStatement,
} from "@portfolio/ui/components/identity";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import { TextLink } from "@portfolio/ui/components/text";
import { createFileRoute } from "@tanstack/react-router";

import { COMPONENT_ICONS } from "@/components/component-icons";
import { ContributionGraph } from "@/components/contribution-graph";
import type { ContributionSummary } from "@/components/contribution-graph";
import { ComponentRow, ExternalRow, RowList } from "@/components/home-rows";
import { ItemLightMedia } from "@/components/item-light";
import { LazyVideo } from "@/components/lazy-video";
import { Mark } from "@/components/mark";
import { MediaBackdrop } from "@/components/media-backdrop";
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
  SOCIALS,
  skillHref,
} from "@/content";
import type { Project } from "@/content";
import { getContributions } from "@/github-contributions";
import { pageHead } from "@/lib/head";
import { personJsonLd } from "@/lib/person-json-ld";
import { REGISTRY_ITEMS } from "@/lib/registry";

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
      {/* 28px under the icons looks like the 20px above them: the eye measures
          from the statement's baseline, which its leading sits ~9px above. */}
      <div className="flex flex-col gap-7 pb-6">
        <div className="flex flex-col gap-5">
          <Identity>
            <IdentityMark>
              <Mark />
            </IdentityMark>
            <IdentityStatement>
              I’m <IdentityName>Alexandre Joly</IdentityName>, design engineer
              at{" "}
              <TextLink external href={EMPLOYER.href}>
                {EMPLOYER.name}
              </TextLink>
              . {INTRO}
            </IdentityStatement>
          </Identity>
          {/* -my-2.5 cancels the hit-area padding, so the gap is the visible one. */}
          <nav
            aria-label="Social"
            className="-my-2.5 -ml-2.5 flex items-center"
          >
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
        </div>
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
  image: { alt: SITE.name, path: "og.png" },
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
    meta: homeHead.meta,
    scripts: [
      { children: JSON.stringify(personJsonLd), type: "application/ld+json" },
    ],
  }),
});

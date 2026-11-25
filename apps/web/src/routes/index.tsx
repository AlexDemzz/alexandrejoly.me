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
import { Link, createFileRoute } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { ContributionGraph } from "@/components/contribution-graph";
import type { ContributionSummary } from "@/components/contribution-graph";
import {
  ComponentRows,
  ExternalRow,
  LabRows,
  ProjectRows,
  Rows,
  SkillRows,
} from "@/components/home-rows";
import { ItemLightMedia } from "@/components/item-light";
import { LazyVideo } from "@/components/lazy-video";
import { Mark } from "@/components/mark";
import { SectionStack } from "@/components/section-stack";
import { SiteFooter } from "@/components/site-footer";
import {
  ARCHIVES,
  AWARDS,
  EMPLOYER,
  INTRO,
  LAB_PAGE,
  PROJECTS_PAGE,
  SITE,
  SOCIALS,
} from "@/content";
import { getContributions } from "@/github-contributions";
import { pageHead } from "@/lib/head";
import { personJsonLd } from "@/lib/person-json-ld";

/** Each home section shows its newest rows, the rest behind "See more". */
const HOME_ROW_LIMIT = 3;

/** A section title that opens the section's index page. */
const SectionTitleLink = ({
  children,
  to,
}: {
  children: ReactNode;
  to: LinkProps["to"];
}) => (
  <SectionTitle>
    <Link data-slot="section-title-link" to={to}>
      {children}
    </Link>
  </SectionTitle>
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

      <SectionStack>
        <Section spacing="none">
          <SectionTitleLink to="/projects">
            {PROJECTS_PAGE.title}
          </SectionTitleLink>
          <SectionContent>
            <ProjectRows limit={HOME_ROW_LIMIT} />
          </SectionContent>
        </Section>

        <Section spacing="none">
          <SectionTitleLink to="/lab">{LAB_PAGE.title}</SectionTitleLink>
          <SectionContent>
            <LabRows limit={HOME_ROW_LIMIT} />
          </SectionContent>
        </Section>

        <Section spacing="none">
          <SectionTitleLink to="/skills">Agent skills</SectionTitleLink>
          <SectionContent>
            <SkillRows limit={HOME_ROW_LIMIT} />
          </SectionContent>
        </Section>

        <Section spacing="none">
          <SectionTitleLink to="/components">Components</SectionTitleLink>
          <SectionContent>
            <ComponentRows limit={HOME_ROW_LIMIT} />
          </SectionContent>
        </Section>

        <Section spacing="none">
          <SectionTitle>Recognition</SectionTitle>
          <SectionContent>
            <Rows
              limit={HOME_ROW_LIMIT}
              rows={AWARDS.map((award) => (
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
            />
          </SectionContent>
        </Section>

        <Section spacing="none">
          <SectionTitle>Previously</SectionTitle>
          <SectionContent>
            <Rows
              limit={HOME_ROW_LIMIT}
              rows={ARCHIVES.map((archive) => (
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
            />
          </SectionContent>
        </Section>
      </SectionStack>

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
    meta: homeHead.meta,
    scripts: [
      { children: JSON.stringify(personJsonLd), type: "application/ld+json" },
    ],
  }),
});

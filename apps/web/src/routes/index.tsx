import {
  Identity,
  IdentityMark,
  IdentityName,
  IdentityRole,
} from "@portfolio/ui/components/identity";
import { ItemGroup, ItemMedia } from "@portfolio/ui/components/item";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import { Text, TextLink } from "@portfolio/ui/components/text";
import { createFileRoute } from "@tanstack/react-router";

import { ExternalRow } from "@/components/home-rows";
import { LazyVideo } from "@/components/lazy-video";
import { Mark } from "@/components/mark";
import { MediaBackdrop } from "@/components/media-backdrop";
import { SkillIcon } from "@/components/skill-icon";
import {
  ARCHIVES,
  AWARDS,
  EMPLOYER,
  LINKS,
  PROJECTS,
  SITE,
  SKILLS,
  X_HANDLE,
  SOCIALS,
  skillHref,
} from "@/content";
import type { Project } from "@/content";

const [gymup, kwern, modals] = PROJECTS;

const ProjectLink = ({ project: { href, name } }: { project: Project }) => (
  <TextLink external href={href}>
    {name}
  </TextLink>
);

const ProjectMedia = ({
  project: { backdrop, icon: Icon },
}: {
  project: Project;
}) => (
  <ItemMedia variant="logo">
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

const HomeComponent = () => (
  <main className="mx-auto max-w-180 px-6 py-12 sm:py-24">
    <header className="flex flex-col gap-5 pb-6">
      <Identity className="mb-1">
        <IdentityMark>
          <Mark />
        </IdentityMark>
        <div>
          <IdentityName>Alexandre Joly</IdentityName>
          <IdentityRole>Developer, Geneva</IdentityRole>
        </div>
      </Identity>
      <Text>
        I’m a French developer at{" "}
        <TextLink external href={EMPLOYER.href}>
          {EMPLOYER.name}
        </TextLink>
        . I design and build interfaces end to end, and I care about the details
        that make them feel right.
      </Text>
      <Text>
        Right now I’m building <ProjectLink project={gymup} />, an AI strength
        coach built on a professional coach’s system, and{" "}
        <ProjectLink project={kwern} />, which does the marketing while you
        build the product. I also maintain <ProjectLink project={modals} />, a
        headless modal stack for React.
      </Text>
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
    </header>

    <Section>
      <SectionTitle>Projects</SectionTitle>
      <SectionContent>
        <ItemGroup>
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
        </ItemGroup>
      </SectionContent>
    </Section>

    <Section>
      <SectionTitle>Agent skills</SectionTitle>
      <SectionContent>
        <ItemGroup>
          {SKILLS.map((skill) => (
            <ExternalRow
              description={skill.description}
              href={skillHref(skill.name)}
              key={skill.name}
              media={
                <ItemMedia variant="logo">
                  <SkillIcon />
                </ItemMedia>
              }
              title={skill.name}
            />
          ))}
        </ItemGroup>
      </SectionContent>
    </Section>

    <Section>
      <SectionTitle>Recognition</SectionTitle>
      <SectionContent>
        <ItemGroup>
          {AWARDS.map((award) => (
            <ExternalRow
              aside={award.year}
              description={award.issuer}
              href={award.href}
              key={award.href}
              media={
                <ItemMedia variant="logo">
                  <award.icon />
                </ItemMedia>
              }
              title={award.title}
            />
          ))}
        </ItemGroup>
      </SectionContent>
    </Section>

    <Section>
      <SectionTitle>Previously</SectionTitle>
      <SectionContent>
        <ItemGroup>
          {ARCHIVES.map((archive) => (
            <ExternalRow
              aside={archive.year}
              description={archive.description}
              href={archive.href}
              key={archive.href}
              media={
                <ItemMedia variant="logo">
                  <LazyVideo
                    className="size-full object-cover"
                    src={archive.media}
                  />
                </ItemMedia>
              }
              title={archive.href.replace("https://", "")}
            />
          ))}
        </ItemGroup>
      </SectionContent>
    </Section>

    <footer className="pt-10">
      <Text variant="faint">© 2026 Alexandre Joly</Text>
    </footer>
  </main>
);

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  address: {
    "@type": "PostalAddress",
    addressCountry: "CH",
    addressLocality: "Geneva",
  },
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

export const Route = createFileRoute("/")({
  component: HomeComponent,
  head: () => ({
    links: [{ href: SITE.url, rel: "canonical" }],
    meta: [
      { title: SITE.title },
      { content: SITE.description, name: "description" },
      { content: "profile", property: "og:type" },
      { content: SITE.url, property: "og:url" },
      { content: SITE.title, property: "og:title" },
      { content: SITE.description, property: "og:description" },
      { content: SITE.name, property: "og:site_name" },
      { content: "summary", name: "twitter:card" },
      { content: `@${X_HANDLE}`, name: "twitter:creator" },
      { "script:ld+json": personJsonLd },
    ],
  }),
});

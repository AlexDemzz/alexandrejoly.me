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
import { Mark } from "@/components/mark";
import {
  ARCHIVES,
  AWARDS,
  LINKS,
  PROJECTS,
  SKILLS,
  skillHref,
} from "@/content";
import type { Project } from "@/content";

const [gymup, kwern, modals] = PROJECTS;

const ProjectLink = ({ project }: { project: Project }) => (
  <TextLink external href={project.href}>
    <img alt="" height={16} src={project.icon} width={16} />
    {project.name}
  </TextLink>
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
        I’m a French developer living in Geneva. I design and build interfaces
        end to end, and I care about the details that make them feel right.
      </Text>
      <Text>
        Right now I’m building <ProjectLink project={gymup} />, an AI strength
        coach built on a professional coach’s system, and{" "}
        <ProjectLink project={kwern} />, which does the marketing while you
        build the product. I also maintain <ProjectLink project={modals} />, a
        headless modal stack for React.
      </Text>
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
              media={
                <ItemMedia variant="logo">
                  <img alt="" height={36} src={project.icon} width={36} />
                </ItemMedia>
              }
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
              title={archive.href.replace("https://", "")}
            />
          ))}
        </ItemGroup>
      </SectionContent>
    </Section>

    <Section>
      <SectionTitle>Contact</SectionTitle>
      <SectionContent>
        <Text>
          <TextLink href={LINKS.email}>Email</TextLink>,{" "}
          <TextLink external href={LINKS.github}>
            GitHub
          </TextLink>
          ,{" "}
          <TextLink external href={LINKS.linkedin}>
            LinkedIn
          </TextLink>{" "}
          or{" "}
          <TextLink external href={LINKS.dribbble}>
            Dribbble
          </TextLink>
          .
        </Text>
        <Text className="mt-10" variant="faint">
          © 2026 Alexandre Joly
        </Text>
      </SectionContent>
    </Section>
  </main>
);

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

import { Dither } from "@portfolio/ui/components/dither";
import {
  Identity,
  IdentityMark,
  IdentityName,
  IdentityRole,
} from "@portfolio/ui/components/identity";
import {
  Item,
  ItemActions,
  ItemArrow,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@portfolio/ui/components/item";
import {
  Section,
  SectionCount,
  SectionTitle,
} from "@portfolio/ui/components/section";
import { Text, TextLink } from "@portfolio/ui/components/text";
import { createFileRoute } from "@tanstack/react-router";

import { Mark } from "@/components/mark";
import {
  ARCHIVES,
  AWARDS,
  LINKS,
  PROJECTS,
  SKILLS,
  skillHref,
} from "@/content";

const ExternalItem = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => (
  <li>
    <Item
      // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Item renders its children into the anchor
      render={<a href={href} rel="noreferrer" target="_blank" />}
    >
      {children}
    </Item>
  </li>
);

const HomeComponent = () => (
  <main className="mx-auto max-w-173 px-6 py-12 sm:py-24">
    <Identity>
      <IdentityMark>
        <Mark />
      </IdentityMark>
      <div>
        <IdentityName>Alexandre Joly</IdentityName>
        <IdentityRole>Creative developer in Geneva</IdentityRole>
      </div>
    </Identity>

    <div className="mt-6 flex flex-col gap-4">
      <Text>
        I’m a French creative developer based in Geneva. I design and build
        interfaces end to end, from the first sketch to the shipped product, and
        I care about the details that make them feel right.
      </Text>
      <Text>
        Lately I build my own products and the tools I use to make them. You can
        read my code on{" "}
        <TextLink external href={LINKS.github}>
          GitHub
        </TextLink>
        , find me on{" "}
        <TextLink external href={LINKS.linkedin}>
          LinkedIn
        </TextLink>{" "}
        or reach me by <TextLink href={LINKS.email}>email</TextLink>.
      </Text>
    </div>

    <Section className="mt-12 sm:mt-16">
      <SectionTitle>Projects</SectionTitle>
      <ItemGroup>
        {PROJECTS.map((project) => (
          <ExternalItem href={project.href} key={project.name}>
            <ItemMedia variant="frame">
              <span>
                <img alt="" height={28} src={project.icon} width={28} />
              </span>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {project.name}
                <ItemArrow />
              </ItemTitle>
              <ItemDescription>{project.description}</ItemDescription>
            </ItemContent>
          </ExternalItem>
        ))}
      </ItemGroup>
    </Section>

    <Section className="mt-16 sm:mt-24">
      <SectionTitle>
        Agent skills
        <SectionCount>{SKILLS.length}</SectionCount>
      </SectionTitle>
      <ItemGroup>
        {SKILLS.map((skill) => (
          <ExternalItem href={skillHref(skill.name)} key={skill.name}>
            <ItemContent>
              <ItemTitle>
                {skill.name}
                <ItemArrow />
              </ItemTitle>
              <ItemDescription>{skill.description}</ItemDescription>
            </ItemContent>
          </ExternalItem>
        ))}
      </ItemGroup>
    </Section>

    <Section className="mt-16 sm:mt-24">
      <SectionTitle>Awards</SectionTitle>
      <ItemGroup>
        {AWARDS.map((award) => (
          <ExternalItem href={award.href} key={award.href}>
            <ItemContent>
              <ItemTitle>
                {award.title}
                <ItemArrow />
              </ItemTitle>
              <ItemDescription>{award.issuer}</ItemDescription>
            </ItemContent>
            <ItemActions>{award.year}</ItemActions>
          </ExternalItem>
        ))}
      </ItemGroup>
    </Section>

    <Section className="mt-16 sm:mt-24">
      <SectionTitle>Previously</SectionTitle>
      <ItemGroup>
        {ARCHIVES.map((archive) => (
          <ExternalItem href={archive.href} key={archive.href}>
            <ItemContent>
              <ItemTitle>
                {archive.href.replace("https://", "")}
                <ItemArrow />
              </ItemTitle>
              <ItemDescription>{archive.description}</ItemDescription>
            </ItemContent>
            <ItemActions>{archive.year}</ItemActions>
          </ExternalItem>
        ))}
      </ItemGroup>
    </Section>

    <footer className="mt-16 flex flex-col gap-8 sm:mt-24">
      <Dither />
      <Text variant="faint">© 2026 Alexandre Joly</Text>
    </footer>
  </main>
);

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

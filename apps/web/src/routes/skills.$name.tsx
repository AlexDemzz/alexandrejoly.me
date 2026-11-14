import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@portfolio/ui/components/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@portfolio/ui/components/breadcrumb";
import { Heading } from "@portfolio/ui/components/heading";
import { HeadingAnchor } from "@portfolio/ui/components/heading-anchor";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableRowHeader,
} from "@portfolio/ui/components/table";
import { Text } from "@portfolio/ui/components/text";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { CodeBlock } from "@/components/docs/code-block";
import { InlineCode } from "@/components/docs/inline-code";
import { Prose, ProseRuns, paragraphKey } from "@/components/prose";
import { SiteFooter } from "@/components/site-footer";
import { SKILLS, SKILLS_PAGE } from "@/content";
import { pageHead } from "@/lib/head";
import { slugify } from "@/lib/heading-ids";
import { EXACT_ACTIVE } from "@/lib/link";
import {
  SKILL_PAGES,
  getSkillCode,
  isSkillPageName,
  skillPath,
} from "@/skill-pages";
import type {
  AnySkillAnswerBlock,
  AnySkillBlock,
  SkillCode,
  SkillPageName,
  SkillTable,
} from "@/skill-pages";

const SkillTableView = ({ head, label, rows }: SkillTable) => (
  <Table aria-label={label}>
    <TableHeader>
      <TableRow>
        <TableHead className="w-1/3">{head[0]}</TableHead>
        <TableHead>{head[1]}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map(([name, value]) => (
        <TableRow key={name}>
          <TableRowHeader>
            <InlineCode>{name}</InlineCode>
          </TableRowHeader>
          <TableCell>
            <Text>
              <InlineCode>{value}</InlineCode>
            </Text>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const answerKey = (block: AnySkillAnswerBlock) =>
  block.kind === "code" ? block.snippet : paragraphKey(block.text);

const Answer = ({
  block,
  code,
}: {
  block: AnySkillAnswerBlock;
  code: SkillCode;
}) =>
  block.kind === "code" ? (
    <CodeBlock code={code[block.snippet]} />
  ) : (
    <Text>
      <ProseRuns paragraph={block.text} />
    </Text>
  );

const Block = ({ block, code }: { block: AnySkillBlock; code: SkillCode }) => {
  if (block.kind === "table") {
    return <SkillTableView {...block} />;
  }
  if (block.kind === "questions") {
    // hiddenUntilFound keeps closed answers in the page, so find-in-page
    // reaches them and opens their item.
    return (
      <Accordion hiddenUntilFound>
        {block.items.map(({ answer, question }) => (
          <AccordionItem key={question}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-5">
                {answer.map((part) => (
                  <Answer block={part} code={code} key={answerKey(part)} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }
  return <Answer block={block} code={code} />;
};

const blockKey = (block: AnySkillBlock) => {
  if (block.kind === "table") {
    return block.label;
  }
  if (block.kind === "questions") {
    return block.kind;
  }
  return answerKey(block);
};

interface SkillPageData {
  code: SkillCode;
  name: SkillPageName;
}

const SkillPageView = ({ code, name }: SkillPageData) => {
  const { intro, sections } = SKILL_PAGES[name];

  return (
    <main className="max-w-column mx-auto px-6 py-12 sm:py-32 md:py-16">
      <header className="flex flex-col items-start gap-5">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link activeOptions={EXACT_ACTIVE} to="/" />}
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link activeOptions={EXACT_ACTIVE} to="/skills" />}
              >
                {SKILLS_PAGE.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div>
          <Heading
            render={({ children, ...props }) => <h1 {...props}>{children}</h1>}
            variant="title"
          >
            {name}
          </Heading>
          <Prose paragraphs={intro} />
        </div>
      </header>

      {sections.map((section) => {
        const id = slugify(section.title);
        return (
          <Section key={section.title} variant="stacked">
            <SectionTitle className="scroll-mt-6" id={id}>
              <HeadingAnchor id={id}>{section.title}</HeadingAnchor>
            </SectionTitle>
            <SectionContent>
              <div className="flex flex-col gap-5">
                {section.blocks.map((block) => (
                  <Block block={block} code={code} key={blockKey(block)} />
                ))}
              </div>
            </SectionContent>
          </Section>
        );
      })}

      <SiteFooter />
    </main>
  );
};

const SkillPageRoute = () => {
  const data = Route.useLoaderData();
  return <SkillPageView code={data.code} name={data.name} />;
};

export const Route = createFileRoute("/skills/$name")({
  component: SkillPageRoute,
  // TanStack infers `loaderData` in `head` only when `loader` comes first.
  loader: async ({ params: { name } }): Promise<SkillPageData> => {
    if (!isSkillPageName(name)) {
      throw notFound();
    }
    return { code: await getSkillCode(name), name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }
    const { name } = loaderData;
    const { description, documentTitle } = SKILL_PAGES[name];
    const skill = SKILLS.find((candidate) => candidate.name === name);
    return pageHead({
      description,
      image: {
        alt: `${name}: ${skill?.description ?? description}`,
        path: `og/skills/${name}.png`,
      },
      path: skillPath(name),
      title: documentTitle,
      type: "article",
    });
  },
  staleTime: Number.POSITIVE_INFINITY,
});

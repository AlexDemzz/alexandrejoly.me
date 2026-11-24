import { WarningIcon } from "@phosphor-icons/react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@portfolio/ui/components/alert";
import { Heading } from "@portfolio/ui/components/heading";
import { HeadingAnchor } from "@portfolio/ui/components/heading-anchor";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@portfolio/ui/components/tabs";
import { Text, TextLink } from "@portfolio/ui/components/text";
import { Fragment } from "react";
import type { ReactNode } from "react";

import { ApiReference } from "@/components/docs/api-reference";
import { CodeBlock } from "@/components/docs/code-block";
import { ComponentPreview } from "@/components/docs/component-preview";
import { InlineCode } from "@/components/docs/inline-code";
import type {
  ApiPart,
  BrowserNotice,
  Example,
  WcagCriterion,
} from "@/components/docs/registry-docs";
import type {
  HighlightedCode,
  HighlightedInstallation,
} from "@/lib/component-code";
import { SECTION_IDS } from "@/lib/heading-ids";

// DESIGN.md › Docs pages: the sequence every page documenting a registry item
// follows, on /components/$name and on a lab page alike.

export const AnchoredSectionTitle = ({
  children,
  id,
}: {
  children: string;
  id: string;
}) => (
  <SectionTitle className="scroll-mt-6" id={id}>
    <HeadingAnchor id={id}>{children}</HeadingAnchor>
  </SectionTitle>
);

/** The way up, the page title and its one-sentence description. */
export const DocsHeader = ({
  description,
  nav,
  title,
}: {
  description: ReactNode;
  /** The row above the title: the breadcrumb, and on /components the menu button. */
  nav: ReactNode;
  title: string;
}) => (
  // Not <header>: content extractors drop it, and it holds the page's title and description.
  <div className="flex flex-col items-start gap-5 pb-10">
    {nav}
    <div>
      <Heading
        render={({ children, ...props }) => <h1 {...props}>{children}</h1>}
        variant="title"
      >
        {title}
      </Heading>
      <Text>{description}</Text>
    </div>
  </div>
);

const Step = ({ children, code }: { children: ReactNode; code: ReactNode }) => (
  <li className="flex flex-col gap-3">
    <Text>{children}</Text>
    {code}
  </li>
);

/** What a manual install takes: the dependency steps and the one source file. */
export interface ManualInstallation {
  installation: HighlightedInstallation;
  source: HighlightedCode;
}

/** The `shadcn add` command, and the manual steps when the item is one file to copy. */
export const Installation = ({
  cli,
  manual,
}: {
  cli: HighlightedCode;
  manual?: ManualInstallation;
}) => {
  if (!manual) {
    return <CodeBlock code={cli} />;
  }
  const { installation, source } = manual;
  return (
    <Tabs defaultValue="cli">
      <TabsList>
        <TabsTrigger value="cli">CLI</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      <TabsContent value="cli">
        <CodeBlock code={cli} />
      </TabsContent>
      <TabsContent value="manual">
        <ol className="flex flex-col gap-6">
          {installation.dependencies === null ? null : (
            <Step code={<CodeBlock code={installation.dependencies} />}>
              Install the dependencies.
            </Step>
          )}
          {installation.registryDependencies === null ? null : (
            <Step code={<CodeBlock code={installation.registryDependencies} />}>
              Add the shadcn components it builds on.
            </Step>
          )}
          {installation.styles === null ? null : (
            <Step code={<CodeBlock code={installation.styles} />}>
              Add the styles to your global CSS file.
            </Step>
          )}
          <Step
            code={
              <CodeBlock
                code={source}
                collapsible
                title={installation.targetPath}
              />
            }
          >
            Copy the source into your project, then update the import paths to
            match your aliases.
          </Step>
        </ol>
      </TabsContent>
    </Tabs>
  );
};

const BrowserNoticeAlert = ({
  notice: { fallback, needs, visibility },
}: {
  notice: BrowserNotice;
}) => (
  // oxlint-disable-next-line shadcn/require-static-classes -- each notice's feature query is a static string in its docs entry
  <Alert className={visibility} role="note" variant="warning">
    <WarningIcon aria-hidden />
    <AlertTitle>In this browser, {fallback}</AlertTitle>
    <AlertDescription>
      <InlineCode>{`${needs}, which this browser doesn’t support yet.`}</InlineCode>
    </AlertDescription>
  </Alert>
);

/** Each example under its anchored title and description, its demo behind Preview and Code tabs. */
export const DocsExamples = ({
  demos,
  examples,
  ids,
}: {
  /** Highlighted demo sources, keyed by file name. */
  demos: Record<string, HighlightedCode>;
  examples: Example[];
  /** One heading id per example, in the same order. */
  ids: string[];
}) => (
  <div className="flex flex-col gap-12">
    {examples.map((example, index) => (
      <section className="flex flex-col gap-3" key={example.file}>
        <div>
          <Heading
            className="scroll-mt-6"
            id={ids[index]}
            render={({ children, ...props }) => <h3 {...props}>{children}</h3>}
          >
            <HeadingAnchor id={ids[index]}>{example.title}</HeadingAnchor>
          </Heading>
          <Text>
            <InlineCode>{example.description}</InlineCode>
          </Text>
        </div>
        {example.notice && <BrowserNoticeAlert notice={example.notice} />}
        <ComponentPreview
          Chrome={example.Chrome}
          code={demos[example.file]}
          inspector={example.inspector}
        >
          <example.Component />
        </ComponentPreview>
      </section>
    ))}
  </div>
);

const AccessibilitySection = ({
  paragraphs,
  wcag,
}: {
  paragraphs: string[];
  wcag?: WcagCriterion[];
}) => (
  <Section variant="stacked">
    <AnchoredSectionTitle id={SECTION_IDS.accessibility}>
      Accessibility
    </AnchoredSectionTitle>
    <SectionContent>
      <div className="flex flex-col gap-3">
        {paragraphs.map((paragraph) => (
          <Text key={paragraph}>
            <InlineCode>{paragraph}</InlineCode>
          </Text>
        ))}
        {wcag && (
          <Text variant="faint">
            Meets WCAG 2.2:{" "}
            {wcag.map((criterion, index) => (
              <Fragment key={criterion.href}>
                {index > 0 && " · "}
                <TextLink external href={criterion.href}>
                  {criterion.title}
                </TextLink>
              </Fragment>
            ))}
          </Text>
        )}
      </div>
    </SectionContent>
  </Section>
);

/** Installation, Usage, Examples, Accessibility and API reference, in that order. */
export const DocsSections = ({
  accessibility,
  api,
  cli,
  demos,
  examples,
  ids,
  manual,
  usage,
  wcag,
}: {
  accessibility?: string[];
  api: ApiPart[];
  cli: HighlightedCode;
  demos: Record<string, HighlightedCode>;
  /** The examples past the main demo. */
  examples: Example[];
  ids: { api: string[]; examples: string[] };
  manual?: ManualInstallation;
  usage: { imports: HighlightedCode; markup: HighlightedCode };
  wcag?: WcagCriterion[];
}) => (
  <>
    <Section variant="stacked">
      <AnchoredSectionTitle id={SECTION_IDS.installation}>
        Installation
      </AnchoredSectionTitle>
      <SectionContent>
        <Installation cli={cli} manual={manual} />
      </SectionContent>
    </Section>

    <Section variant="stacked">
      <AnchoredSectionTitle id={SECTION_IDS.usage}>Usage</AnchoredSectionTitle>
      <SectionContent>
        <div className="flex flex-col gap-6">
          <CodeBlock code={usage.imports} />
          <CodeBlock code={usage.markup} />
        </div>
      </SectionContent>
    </Section>

    {examples.length > 0 && (
      <Section variant="stacked">
        <AnchoredSectionTitle id={SECTION_IDS.examples}>
          Examples
        </AnchoredSectionTitle>
        <SectionContent>
          <DocsExamples demos={demos} examples={examples} ids={ids.examples} />
        </SectionContent>
      </Section>
    )}

    {accessibility && (
      <AccessibilitySection paragraphs={accessibility} wcag={wcag} />
    )}

    <Section variant="stacked">
      <AnchoredSectionTitle id={SECTION_IDS.api}>
        API reference
      </AnchoredSectionTitle>
      <SectionContent>
        <ApiReference ids={ids.api} parts={api} />
      </SectionContent>
    </Section>
  </>
);

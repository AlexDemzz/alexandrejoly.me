import { ArrowLeftIcon, ListIcon, WarningIcon } from "@phosphor-icons/react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@portfolio/ui/components/alert";
import { Heading } from "@portfolio/ui/components/heading";
import {
  Section,
  SectionContent,
  SectionTitle,
} from "@portfolio/ui/components/section";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@portfolio/ui/components/sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@portfolio/ui/components/tabs";
import {
  Text,
  TextLink,
  textLinkVariants,
} from "@portfolio/ui/components/text";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Fragment } from "react";
import type { ReactNode } from "react";

import { ApiReference } from "@/components/docs/api-reference";
import { CodeBlock } from "@/components/docs/code-block";
import { ComponentPreview } from "@/components/docs/component-preview";
import { ComponentsSidebar } from "@/components/docs/components-sidebar";
import { CopyMarkdownButton } from "@/components/docs/copy-markdown-button";
import { HeadingAnchor } from "@/components/docs/heading-anchor";
import { InlineCode } from "@/components/docs/inline-code";
import { REGISTRY_DOCS } from "@/components/docs/registry-docs";
import type { BrowserNotice } from "@/components/docs/registry-docs";
import { SiteFooter } from "@/components/site-footer";
import { SITE } from "@/content";
import { getComponentCode } from "@/lib/component-code";
import type { ComponentCode } from "@/lib/component-code";
import { componentJsonLd } from "@/lib/component-json-ld";
import { markdownPath, pageHead } from "@/lib/head";
import { SECTION_IDS, headingIds } from "@/lib/heading-ids";
import { componentMarkdown } from "@/lib/markdown";
import {
  componentPath,
  getRegistryItem,
  isRegistryItemName,
} from "@/lib/registry";
import type { RegistryItem } from "@/lib/registry";

const Step = ({ children, code }: { children: ReactNode; code: ReactNode }) => (
  <li className="flex flex-col gap-3">
    <Text>{children}</Text>
    {code}
  </li>
);

const AnchoredSectionTitle = ({
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

const Installation = ({
  installation,
  source,
}: {
  installation: ComponentCode["installation"];
  source: ComponentCode["source"];
}) => (
  <Tabs defaultValue="cli">
    <TabsList>
      <TabsTrigger value="cli">CLI</TabsTrigger>
      <TabsTrigger value="manual">Manual</TabsTrigger>
    </TabsList>
    <TabsContent value="cli">
      <CodeBlock code={installation.cli} />
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

interface ComponentPageData {
  code: ComponentCode;
  item: RegistryItem;
}

const ComponentDocsPage = ({
  code,
  item: { description, name, title },
}: ComponentPageData) => {
  const docs = REGISTRY_DOCS[name];
  const { accessibility, api, demo, examples, wcag } = docs;
  const ids = headingIds(docs);

  return (
    <div className="max-w-column md:max-w-docs mx-auto px-6">
      <SidebarProvider>
        <ComponentsSidebar current={name} />
        <SidebarInset className="min-w-0 md:ms-12">
          <div className="py-12 sm:py-32 md:py-16">
            <header className="flex flex-col items-start gap-5 pb-10">
              <div className="flex w-full items-center justify-between md:hidden">
                <Link className={textLinkVariants()} to="/">
                  <ArrowLeftIcon aria-hidden />
                  Home
                </Link>
                <SidebarTrigger className="md:hidden" size="icon">
                  <ListIcon aria-hidden />
                  <span className="sr-only">Open components menu</span>
                </SidebarTrigger>
              </div>
              <div>
                <Heading
                  render={({ children, ...props }) => (
                    <h1 {...props}>{children}</h1>
                  )}
                  variant="title"
                >
                  {title}
                </Heading>
                <Text>{description}</Text>
              </div>
            </header>

            <ComponentPreview
              code={code.demos[demo.file]}
              inspector={demo.inspector}
            >
              <demo.Component />
            </ComponentPreview>

            <Section variant="stacked">
              <AnchoredSectionTitle id={SECTION_IDS.installation}>
                Installation
              </AnchoredSectionTitle>
              <SectionContent>
                <Installation
                  installation={code.installation}
                  source={code.source}
                />
              </SectionContent>
            </Section>

            <Section variant="stacked">
              <AnchoredSectionTitle id={SECTION_IDS.usage}>
                Usage
              </AnchoredSectionTitle>
              <SectionContent>
                <div className="flex flex-col gap-6">
                  <CodeBlock code={code.usage.imports} />
                  <CodeBlock code={code.usage.markup} />
                </div>
              </SectionContent>
            </Section>

            {examples.length > 0 && (
              <Section variant="stacked">
                <AnchoredSectionTitle id={SECTION_IDS.examples}>
                  Examples
                </AnchoredSectionTitle>
                <SectionContent>
                  <div className="flex flex-col gap-12">
                    {examples.map((example, index) => (
                      <section
                        className="flex flex-col gap-3"
                        key={example.file}
                      >
                        <div>
                          <Heading
                            className="scroll-mt-6"
                            id={ids.examples[index]}
                            render={({ children, ...props }) => (
                              <h3 {...props}>{children}</h3>
                            )}
                          >
                            <HeadingAnchor id={ids.examples[index]}>
                              {example.title}
                            </HeadingAnchor>
                          </Heading>
                          <Text>
                            <InlineCode>{example.description}</InlineCode>
                          </Text>
                        </div>
                        {example.notice && (
                          <BrowserNoticeAlert notice={example.notice} />
                        )}
                        <ComponentPreview
                          code={code.demos[example.file]}
                          inspector={example.inspector}
                        >
                          <example.Component />
                        </ComponentPreview>
                      </section>
                    ))}
                  </div>
                </SectionContent>
              </Section>
            )}

            {accessibility && (
              <Section variant="stacked">
                <AnchoredSectionTitle id={SECTION_IDS.accessibility}>
                  Accessibility
                </AnchoredSectionTitle>
                <SectionContent>
                  <div className="flex flex-col gap-3">
                    {accessibility.map((paragraph) => (
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
            )}

            <Section variant="stacked">
              <AnchoredSectionTitle id={SECTION_IDS.api}>
                API reference
              </AnchoredSectionTitle>
              <SectionContent>
                <ApiReference ids={ids.api} parts={api} />
              </SectionContent>
            </Section>

            <div className="flex gap-4">
              <Text variant="faint">
                <TextLink href={markdownPath(componentPath(name))}>
                  View as Markdown
                </TextLink>
              </Text>
              <Text variant="faint">
                <CopyMarkdownButton markdown={componentMarkdown(name, code)} />
              </Text>
            </div>

            <SiteFooter />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

const ComponentPage = () => {
  const { code, item } = Route.useLoaderData();
  return <ComponentDocsPage code={code} item={item} />;
};

export const Route = createFileRoute("/components/$name")({
  component: ComponentPage,
  // TanStack infers `loaderData` in `head` only when `loader` comes first.
  loader: async ({ params: { name } }): Promise<ComponentPageData> => {
    if (!isRegistryItemName(name)) {
      throw notFound();
    }
    return {
      code: await getComponentCode(name),
      item: getRegistryItem(name),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {};
    }
    const { item } = loaderData;
    const { links, meta } = pageHead({
      description: REGISTRY_DOCS[item.name].metaDescription,
      image: {
        alt: `${item.title}: ${item.description}`,
        path: `og/components/${item.name}.png`,
      },
      path: componentPath(item.name),
      title: `${item.title} component for shadcn/ui – ${SITE.name}`,
      type: "article",
    });
    return {
      links,
      meta,
      scripts: [
        {
          children: JSON.stringify(componentJsonLd(item)),
          type: "application/ld+json",
        },
      ],
    };
  },
  staleTime: Number.POSITIVE_INFINITY,
});

import { Heading } from "@portfolio/ui/components/heading";
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
import { Text, textLinkVariants } from "@portfolio/ui/components/text";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import type { ReactNode } from "react";

import { ApiReference } from "@/components/docs/api-reference";
import { CodeBlock } from "@/components/docs/code-block";
import { ComponentPreview } from "@/components/docs/component-preview";
import { InlineCode } from "@/components/docs/inline-code";
import { REGISTRY_DOCS } from "@/components/docs/registry-docs";
import { SiteFooter } from "@/components/site-footer";
import { SITE } from "@/content";
import { getComponentCode } from "@/lib/component-code";
import type { ComponentCode } from "@/lib/component-code";
import { pageHead } from "@/lib/head";
import { getRegistryItem, isRegistryItemName } from "@/lib/registry";
import type { RegistryItem } from "@/lib/registry";

const Step = ({ children, code }: { children: ReactNode; code: ReactNode }) => (
  <li className="flex flex-col gap-3">
    <Text>{children}</Text>
    {code}
  </li>
);

const Installation = ({
  installation,
  source,
}: {
  installation: ComponentCode["installation"];
  source: string;
}) => (
  <Tabs defaultValue="cli">
    <TabsList>
      <TabsTrigger value="cli">CLI</TabsTrigger>
      <TabsTrigger value="manual">Manual</TabsTrigger>
    </TabsList>
    <TabsContent value="cli">
      <CodeBlock html={installation.cli} />
    </TabsContent>
    <TabsContent value="manual">
      <ol className="flex flex-col gap-6">
        {installation.dependencies === null ? null : (
          <Step code={<CodeBlock html={installation.dependencies} />}>
            Install the dependencies.
          </Step>
        )}
        {installation.registryDependencies === null ? null : (
          <Step code={<CodeBlock html={installation.registryDependencies} />}>
            Add the shadcn components it builds on.
          </Step>
        )}
        <Step
          code={<CodeBlock html={source} title={installation.targetPath} />}
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
  const { api, demo, examples } = REGISTRY_DOCS[name];

  return (
    <main className="mx-auto max-w-180 px-6 py-12 sm:py-24">
      <header className="flex flex-col items-start gap-5 pb-10">
        <Link className={textLinkVariants()} to="/">
          <ArrowLeftIcon aria-hidden />
          Home
        </Link>
        <div>
          <Heading
            render={({ children, ...props }) => <h1 {...props}>{children}</h1>}
          >
            {title}
          </Heading>
          <Text>{description}</Text>
        </div>
      </header>

      <ComponentPreview code={code.demos[demo.file] ?? ""}>
        <demo.Component />
      </ComponentPreview>

      <Section>
        <SectionTitle>Installation</SectionTitle>
        <SectionContent>
          <Installation installation={code.installation} source={code.source} />
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>Usage</SectionTitle>
        <SectionContent>
          <CodeBlock html={code.usage} />
        </SectionContent>
      </Section>

      {examples.length > 0 && (
        <Section>
          <SectionTitle>Examples</SectionTitle>
          <SectionContent>
            <div className="flex flex-col gap-12">
              {examples.map((example) => (
                <section className="flex flex-col gap-3" key={example.file}>
                  <div>
                    <Heading
                      render={({ children, ...props }) => (
                        <h3 {...props}>{children}</h3>
                      )}
                    >
                      {example.title}
                    </Heading>
                    <Text>
                      <InlineCode>{example.description}</InlineCode>
                    </Text>
                  </div>
                  <ComponentPreview code={code.demos[example.file] ?? ""}>
                    <example.Component />
                  </ComponentPreview>
                </section>
              ))}
            </div>
          </SectionContent>
        </Section>
      )}

      <Section>
        <SectionTitle>API reference</SectionTitle>
        <SectionContent>
          <ApiReference parts={api} />
        </SectionContent>
      </Section>

      <SiteFooter />
    </main>
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
      code: await getComponentCode({ data: name }),
      item: getRegistryItem(name),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead({
          description: loaderData.item.description,
          path: `components/${loaderData.item.name}`,
          title: `${loaderData.item.title} – ${SITE.name}`,
          type: "article",
        })
      : {},
  staleTime: Number.POSITIVE_INFINITY,
});

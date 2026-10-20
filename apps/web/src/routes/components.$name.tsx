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
import { SITE, findComponent } from "@/content";
import { getComponentCode } from "@/lib/component-code";
import type { ComponentCode } from "@/lib/component-code";
import { registryItemUrl } from "@/lib/registry";

const findPage = (name: string) => {
  const component = findComponent(name);
  const docs = REGISTRY_DOCS[name];
  return component && docs ? { component, docs } : undefined;
};

const Step = ({ children, code }: { children: ReactNode; code: ReactNode }) => (
  <li className="flex flex-col gap-3">
    <Text>{children}</Text>
    {code}
  </li>
);

const Installation = ({
  installation,
  name,
  source,
}: {
  installation: ComponentCode["installation"];
  name: string;
  source: string;
}) => (
  <Tabs defaultValue="cli">
    <TabsList>
      <TabsTrigger value="cli">CLI</TabsTrigger>
      <TabsTrigger value="manual">Manual</TabsTrigger>
    </TabsList>
    <TabsContent value="cli">
      <div className="flex flex-col gap-5">
        <CodeBlock html={installation.cli} />
        <Text>
          The <InlineCode>`@alexandrejoly`</InlineCode> namespace resolves once
          your <InlineCode>`components.json`</InlineCode> lists the registry:
        </Text>
        <CodeBlock html={installation.config} title="components.json" />
        <Text>
          Or add it from its URL,{" "}
          <InlineCode>{`\`${registryItemUrl(name)}\``}</InlineCode>, with no
          setup:
        </Text>
        <CodeBlock html={installation.cliFromUrl} />
      </div>
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

const ComponentDocsPage = ({
  code,
  name,
}: {
  code: ComponentCode;
  name: string;
}) => {
  const page = findPage(name);
  if (!page) {
    return null;
  }
  const {
    component: { description, title },
    docs: { api, demo, examples },
  } = page;

  return (
    <main className="mx-auto max-w-180 px-6 py-12 sm:py-24">
      <header className="flex flex-col items-start gap-5 pb-10">
        <Link className={textLinkVariants()} to="/">
          <ArrowLeftIcon aria-hidden />
          Home
        </Link>
        <div>
          <h1 className="font-medium">{title}</h1>
          <Text>{description}</Text>
        </div>
      </header>

      <ComponentPreview code={code.demos[demo.file] ?? ""}>
        <demo.Component />
      </ComponentPreview>

      <Section>
        <SectionTitle>Installation</SectionTitle>
        <SectionContent>
          <Installation
            installation={code.installation}
            name={name}
            source={code.source}
          />
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
                    <h3 className="font-book">{example.title}</h3>
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

      <footer className="pt-10">
        <Text variant="faint">© 2026 Alexandre Joly</Text>
      </footer>
    </main>
  );
};

const ComponentPage = () => (
  <ComponentDocsPage
    code={Route.useLoaderData()}
    name={Route.useParams().name}
  />
);

export const Route = createFileRoute("/components/$name")({
  component: ComponentPage,
  head: ({ params }) => {
    const component = findComponent(params.name);
    if (!component) {
      return {};
    }
    const title = `${component.title} – ${SITE.name}`;
    const url = `${SITE.url}components/${component.name}`;
    return {
      links: [{ href: url, rel: "canonical" }],
      meta: [
        { title },
        { content: component.description, name: "description" },
        { content: "article", property: "og:type" },
        { content: url, property: "og:url" },
        { content: title, property: "og:title" },
        { content: component.description, property: "og:description" },
        { content: SITE.name, property: "og:site_name" },
      ],
    };
  },
  loader: async ({ params }) => {
    if (!findPage(params.name)) {
      throw notFound();
    }
    return await getComponentCode({ data: params.name });
  },
  staleTime: Number.POSITIVE_INFINITY,
});

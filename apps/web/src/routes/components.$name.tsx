import { ListIcon } from "@phosphor-icons/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@portfolio/ui/components/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@portfolio/ui/components/sidebar";
import { Text, TextLink } from "@portfolio/ui/components/text";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { ComponentPreview } from "@/components/docs/component-preview";
import { ComponentsSidebar } from "@/components/docs/components-sidebar";
import { CopyMarkdownButton } from "@/components/docs/copy-markdown-button";
import { DocsHeader, DocsSections } from "@/components/docs/docs-sections";
import { REGISTRY_DOCS } from "@/components/docs/registry-docs";
import { SiteFooter } from "@/components/site-footer";
import { COMPONENTS_PAGE, SITE } from "@/content";
import { getComponentCode } from "@/lib/component-code";
import type { ComponentCode } from "@/lib/component-code";
import { componentJsonLd } from "@/lib/component-json-ld";
import { markdownPath, pageHead } from "@/lib/head";
import { headingIds } from "@/lib/heading-ids";
import { EXACT_ACTIVE } from "@/lib/link";
import { componentMarkdown } from "@/lib/markdown";
import {
  componentPath,
  getRegistryItem,
  isRegistryItemName,
} from "@/lib/registry";
import type { RegistryItem } from "@/lib/registry";

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
            <DocsHeader
              description={description}
              nav={
                <div className="flex w-full items-center justify-between md:hidden">
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          render={<Link activeOptions={EXACT_ACTIVE} to="/" />}
                        >
                          {SITE.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator>/</BreadcrumbSeparator>
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          render={
                            <Link
                              activeOptions={EXACT_ACTIVE}
                              to="/components"
                            />
                          }
                        >
                          {COMPONENTS_PAGE.title}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  <SidebarTrigger className="md:hidden" size="icon">
                    <ListIcon aria-hidden />
                    <span className="sr-only">Open components menu</span>
                  </SidebarTrigger>
                </div>
              }
              title={title}
            />

            <ComponentPreview
              Chrome={demo.Chrome}
              code={code.demos[demo.file]}
              inspector={demo.inspector}
            >
              <demo.Component />
            </ComponentPreview>

            <DocsSections
              accessibility={accessibility}
              api={api}
              cli={code.installation.cli}
              demos={code.demos}
              examples={examples}
              ids={ids}
              manual={{ installation: code.installation, source: code.source }}
              usage={code.usage}
              wcag={wcag}
            />

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

import { DocsArticle, DocsShell } from "@portfolio/docs-theme/layout";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { MarkdownCopyButton } from "fumadocs-ui/layouts/docs/page";
import { Suspense, use } from "react";

import { getMDXComponents } from "@/components/mdx";
import { docsSite } from "@/lib/docs-site";
import { pageHead } from "@/lib/seo";
import { getPageMarkdownUrl } from "@/lib/shared";
import { docs, source } from "@/lib/source";

const serverLoader = createServerFn({ method: "GET" })
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) {
      throw notFound();
    }

    return {
      path: page.path,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      markdownUrl: getPageMarkdownUrl(page).url,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const DocsContent = ({
  path,
  markdownUrl,
}: {
  path: string;
  markdownUrl: string;
}) => {
  const page = docs.getPage(path);
  if (!page) {
    throw new Error(`Unknown docs page: ${path}`);
  }
  // Preloaded by the route loader, so this resolves without suspending.
  const { body: MdxContent, toc } = use(page.load());

  return (
    <DocsArticle
      title={page.title}
      description={page.description}
      toc={toc}
      actions={
        <>
          <a
            className={buttonVariants({ size: "sm", variant: "secondary" })}
            href={markdownUrl}
          >
            View as Markdown
          </a>
          <MarkdownCopyButton markdownUrl={markdownUrl} />
        </>
      }
    >
      <MdxContent components={getMDXComponents()} />
    </DocsArticle>
  );
};

const Page = () => {
  const { path, markdownUrl, pageTree } = useFumadocsLoader(
    Route.useLoaderData()
  );

  return (
    <DocsShell site={docsSite} tree={pageTree}>
      <Suspense>
        <DocsContent path={path} markdownUrl={markdownUrl} />
      </Suspense>
    </DocsShell>
  );
};

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/").filter(Boolean) ?? [];
    const data = await serverLoader({ data: slugs });
    await docs.getPage(data.path)?.preload();
    return data;
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead({
          path: loaderData.url,
          title: loaderData.title,
          description: loaderData.description,
        })
      : {},
});

import { DocsArticle, DocsShell } from "@portfolio/docs-theme/layout";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import browserCollections from "collections/browser";
import { useFumadocsLoader } from "fumadocs-core/source/client";
import { Suspense } from "react";

import { getMDXComponents } from "@/components/mdx";
import { docsSeo } from "@/lib/docs-seo";
import { docsSite } from "@/lib/docs-site";
import { legacyDocsRedirect } from "@/lib/legacy-docs";
import { pageHead } from "@/lib/seo";
import { source } from "@/lib/source";

const serverLoader = createServerFn({ method: "GET" })
  .validator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) {
      throw notFound();
    }

    return {
      path: page.path,
      slugs: page.slugs,
      title: page.data.title,
      description: page.data.description,
      pageTree: await source.serializePageTree(source.getPageTree()),
    };
  });

const clientLoader = browserCollections.docs.createClientLoader({
  component({ toc, frontmatter, default: MdxContent }) {
    return (
      <DocsArticle
        title={frontmatter.title}
        description={frontmatter.description}
        toc={toc}
      >
        <MdxContent components={getMDXComponents()} />
      </DocsArticle>
    );
  },
});

const Page = () => {
  const { path, pageTree } = useFumadocsLoader(Route.useLoaderData());

  return (
    <DocsShell site={docsSite} tree={pageTree}>
      <Suspense>{clientLoader.useContent(path)}</Suspense>
    </DocsShell>
  );
};

export const Route = createFileRoute("/docs/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/").filter(Boolean) ?? [];
    const target = legacyDocsRedirect(slugs);
    if (target !== undefined) {
      throw redirect({
        to: "/docs/$",
        params: { _splat: target },
        statusCode: 301,
      });
    }
    const data = await serverLoader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(
          docsSeo({
            slugs: loaderData.slugs,
            title: loaderData.title,
            description: loaderData.description ?? "",
          })
        )
      : {},
});

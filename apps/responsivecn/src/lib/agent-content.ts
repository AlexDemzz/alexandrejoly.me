import { flattenTree } from "fumadocs-core/page-tree";

import { PAIRS, npxCommand } from "@/components/create/pairs";
import { docsSeo } from "@/lib/docs-seo";
import type { DocsEntry } from "@/lib/llms";
import { homeSeo } from "@/lib/seo";
import { appName, githubUrl, siteUrl } from "@/lib/shared";
import { source } from "@/lib/source";

type DocsPage = NonNullable<ReturnType<typeof source.getPage>>;

// In sidebar order (content/docs/meta.json), not file order.
export const docsPages = (): DocsPage[] => {
  const pages = new Map(source.getPages().map((page) => [page.url, page]));
  return flattenTree(source.getPageTree().children).flatMap((node) => {
    const page = pages.get(node.url);
    return page ? [page] : [];
  });
};

export const docsEntries = (): DocsEntry[] =>
  docsPages().map((page) => ({
    path: page.url,
    title: page.data.title,
    description: docsSeo({
      slugs: page.slugs,
      title: page.data.title,
      description: page.data.description ?? "",
    }).description,
  }));

export const indexablePaths = (): string[] => [
  homeSeo.path,
  ...docsPages().map((page) => page.url),
];

export const docsMarkdown = async (page: DocsPage): Promise<string> => {
  const body = await page.data.getText("processed");
  const description = page.data.description
    ? `\n\n${page.data.description}`
    : "";
  return `# ${page.data.title}${description}\n\n${body.trim()}\n`;
};

const homeMarkdown = (): string =>
  [
    `# ${appName}`,
    "",
    `${appName} makes shadcn/ui overlays responsive: a Dialog on desktop, a Drawer on a phone. Swap the import and keep every prop, on Base UI or Radix.`,
    "",
    "## Pairs",
    "",
    ...PAIRS.map(
      (pair) =>
        `- [${pair.desktop} → ${pair.mobile}](${siteUrl}/docs/${pair.slug}.md): a ${pair.desktop} at 768px and up, a ${pair.mobile} below. Install: \`${npxCommand(pair.slug)}\``
    ),
    "",
    "## Links",
    "",
    `- [Docs](${siteUrl}/docs.md)`,
    `- [llms.txt](${siteUrl}/llms.txt)`,
    `- [Source code](${githubUrl})`,
    "",
  ].join("\n");

// The Markdown twin of a page, or undefined when the path has none.
export const pageMarkdown = async (
  path: string
): Promise<string | undefined> => {
  if (path === homeSeo.path) {
    return homeMarkdown();
  }
  const [first, ...slugs] = path.split("/").filter(Boolean);
  if (first !== "docs") {
    return undefined;
  }
  const page = source.getPage(slugs);
  return page ? await docsMarkdown(page) : undefined;
};

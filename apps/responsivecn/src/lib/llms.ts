import { PAIRS, itemUrl } from "@/components/create/pairs";
import { homeSeo, markdownUrl } from "@/lib/seo";
import {
  appName,
  githubUrl,
  registryNamespace,
  registryUrl,
  siteUrl,
} from "@/lib/shared";

export interface DocsEntry {
  path: string;
  title: string;
  description: string;
}

// https://llmstxt.org: an H1, a blockquote summary, then H2 sections of links.
export const llmsTxt = (docs: DocsEntry[]): string =>
  [
    `# ${appName}`,
    "",
    `> ${homeSeo.description}`,
    "",
    "Each component is a drop-in replacement for the desktop shadcn/ui component: same props, same parts. Migrating means changing the import and renaming the tags. Below 768px (the shadcn `useIsMobile` breakpoint) the same children render in the mobile component. Mobile-only props go through the override prop (`drawer={{...}}`).",
    "",
    "## When to use",
    "",
    "- A shadcn/ui project needs a Dialog, Sheet or Popover that becomes a swipeable Drawer below 768px.",
    "- The project uses the Base UI or Radix base of shadcn/ui. React Aria is not supported.",
    "- Not for a custom breakpoint: it is fixed at 768px.",
    "",
    "## Install",
    "",
    `Install a component with the shadcn CLI, from the \`${registryNamespace}\` namespace (listed in the shadcn registry directory) or by URL. It adds one file to \`components/ui/\`, plus the shadcn components it builds on.`,
    "",
    "```bash",
    `npx shadcn@latest add ${registryNamespace}/dialog-drawer`,
    `npx shadcn@latest add ${itemUrl("dialog-drawer")}`,
    "```",
    "",
    "## Docs",
    "",
    ...docs.map(
      (page) =>
        `- [${page.title}](${markdownUrl(page.path)}): ${page.description}`
    ),
    "",
    "## Registry",
    "",
    `- [Catalog](${registryUrl}/registry.json): every item of the ${registryNamespace} registry, without file contents.`,
    ...PAIRS.map(
      (pair) =>
        `- [${pair.slug}](${itemUrl(pair.slug)}): ${pair.desktop} on desktop, ${pair.mobile} on mobile.`
    ),
    "",
    "## Optional",
    "",
    `- [Full docs](${siteUrl}/llms-full.txt): every docs page in one Markdown file.`,
    `- [Source code](${githubUrl}): this site.`,
    "",
  ].join("\n");

export const llmsFullTxt = (
  pages: { url: string; markdown: string }[]
): string =>
  pages
    .map((page) => `${page.markdown.trim()}\n\nSource: ${page.url}\n`)
    .join("\n---\n\n");

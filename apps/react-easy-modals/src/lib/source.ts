import { llms, loader } from "fumadocs-core/source";
import { defineDocs } from "fumadocs-mdx/macro";

import { cleanMarkdown } from "./markdown";
import { docsRoute, getPageMarkdownUrl } from "./shared";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "./site";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    async: true,
    // A collection-level mdxOptions drops the defaults, so it goes through the
    // same preset (gfm, heading ids, npm tabs, structure, toc) with only the
    // Shiki options swapped for the ones the landing shares. The imports are
    // awaited inside the macro call: they resolve while the macro is
    // evaluated, and the app build compiles the whole call away, so the
    // build-time preset never reaches the client.
    mdxOptions: await (async () => {
      const { applyMdxPreset } = await import("fumadocs-mdx/config");
      const { SHIKI_OPTIONS } = await import("./shiki");
      return applyMdxPreset({ rehypeCodeOptions: SHIKI_OPTIONS });
    })(),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
});

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${absoluteUrl(page.url)})

${cleanMarkdown(await page.data.getText("processed"))}`,
});

const header = [`# ${SITE_NAME}`, "", `> ${SITE_DESCRIPTION}`];

export const llmsIndex = () => {
  const lines = [...header];

  for (const node of source.getPageTree().children) {
    if (node.type === "separator") {
      lines.push("", `## ${node.name}`, "");
    } else if (node.type === "page") {
      const page = source.getNodePage(node);
      if (!page) {
        continue;
      }
      const url = absoluteUrl(getPageMarkdownUrl(page).url);
      const description = page.data.description
        ? `: ${page.data.description}`
        : "";
      lines.push(`- [${page.data.title}](${url})${description}`);
    }
  }

  lines.push(
    "",
    "## Optional",
    "",
    `- [Full documentation](${absoluteUrl("/llms-full.txt")})`
  );
  return `${lines.join("\n")}\n`;
};

export const llmsFull = async () => {
  const full = await docsLlms.full();
  return `${[...header, "", full].join("\n")}\n`;
};

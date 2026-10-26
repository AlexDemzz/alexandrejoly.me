import { defineConfig, defineDocs } from "fumadocs-mdx/config";

// Live demos have no Markdown form; their code tabs and prose do.
const DEMO_ONLY = new Set(["ComponentDemoRender"]);
const WRAPPERS = new Set(["ComponentDemo", "ComponentDemoCode"]);

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: {
        headingIds: false,
        filterElement: (node) => {
          if (node.type !== "mdxJsxFlowElement") {
            return true;
          }
          if (node.name !== null && DEMO_ONLY.has(node.name)) {
            return false;
          }
          if (node.name !== null && WRAPPERS.has(node.name)) {
            return "children-only";
          }
          return true;
        },
      },
    },
  },
});

export default defineConfig();

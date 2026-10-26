import { createFileRoute } from "@tanstack/react-router";

import { docsMarkdown, docsPages } from "@/lib/agent-content";
import { llmsFullTxt } from "@/lib/llms";
import { canonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        const pages = await Promise.all(
          docsPages().map(async (page) => ({
            url: canonicalUrl(page.url),
            markdown: await docsMarkdown(page),
          }))
        );
        return new Response(llmsFullTxt(pages), {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});

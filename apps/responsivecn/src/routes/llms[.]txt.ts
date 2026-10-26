import { createFileRoute } from "@tanstack/react-router";

import { docsEntries } from "@/lib/agent-content";
import { llmsTxt } from "@/lib/llms";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(llmsTxt(docsEntries()), {
          headers: { "content-type": "text/plain; charset=utf-8" },
        }),
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

import { graphSvg } from "@/contribution-paths";
import {
  CACHE_TTL_SECONDS,
  loadContributions,
} from "@/github-contributions.server";

export const Route = createFileRoute("/contributions.svg")({
  server: {
    handlers: {
      GET: async () => {
        const contributions = await loadContributions();
        if (contributions === null) {
          return new Response(null, { status: 503 });
        }
        return new Response(graphSvg(contributions.weeks), {
          headers: {
            "cache-control": `public, max-age=${CACHE_TTL_SECONDS}`,
            "content-type": "image/svg+xml",
          },
        });
      },
    },
  },
});

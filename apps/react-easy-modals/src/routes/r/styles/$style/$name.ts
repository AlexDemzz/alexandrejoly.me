import { createFileRoute } from "@tanstack/react-router";

import { resolveRegistryItem } from "@/lib/registry";

export const Route = createFileRoute("/r/styles/$style/$name")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const resolution = resolveRegistryItem(params.style, params.name);
        if (!resolution) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }
        if (resolution.kind === "redirect") {
          return Response.redirect(resolution.url, 308);
        }
        return Response.json(resolution.item);
      },
    },
  },
});

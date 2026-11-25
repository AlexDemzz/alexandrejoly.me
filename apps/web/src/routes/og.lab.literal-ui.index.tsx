import { createFileRoute } from "@tanstack/react-router";

import { LiteralOgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/lab/literal-ui.png`. */
export const Route = createFileRoute("/og/lab/literal-ui/")({
  component: LiteralOgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

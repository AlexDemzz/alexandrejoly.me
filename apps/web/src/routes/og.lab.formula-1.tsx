import { createFileRoute } from "@tanstack/react-router";

import { Formula1OgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/lab/formula-1.png`. */
export const Route = createFileRoute("/og/lab/formula-1")({
  component: Formula1OgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

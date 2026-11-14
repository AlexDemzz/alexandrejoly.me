import { createFileRoute } from "@tanstack/react-router";

import { LabOgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/lab.png`. */
export const Route = createFileRoute("/og/lab/")({
  component: LabOgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

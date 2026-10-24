import { createFileRoute } from "@tanstack/react-router";

import { ComponentsOgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/components.png`. */
export const Route = createFileRoute("/og/components/")({
  component: ComponentsOgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

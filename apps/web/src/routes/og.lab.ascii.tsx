import { createFileRoute } from "@tanstack/react-router";

import { AsciiOgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/lab/ascii.png`. */
export const Route = createFileRoute("/og/lab/ascii")({
  component: AsciiOgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

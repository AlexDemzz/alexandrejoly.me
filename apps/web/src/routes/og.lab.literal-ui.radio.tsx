import { createFileRoute } from "@tanstack/react-router";

import { RadioOgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/lab/literal-ui/radio.png`. */
export const Route = createFileRoute("/og/lab/literal-ui/radio")({
  component: RadioOgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

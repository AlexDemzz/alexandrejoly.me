import { createFileRoute } from "@tanstack/react-router";

import { CarouselOgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/lab/literal-ui/carousel.png`. */
export const Route = createFileRoute("/og/lab/literal-ui/carousel")({
  component: CarouselOgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

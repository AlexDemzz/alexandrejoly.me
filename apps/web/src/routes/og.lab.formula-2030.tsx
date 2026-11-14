import { createFileRoute } from "@tanstack/react-router";

import { FormulaOgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/lab/formula-2030.png`. */
export const Route = createFileRoute("/og/lab/formula-2030")({
  component: FormulaOgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

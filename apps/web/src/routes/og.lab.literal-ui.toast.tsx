import { createFileRoute } from "@tanstack/react-router";

import { ToastOgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/lab/literal-ui/toast.png`. */
export const Route = createFileRoute("/og/lab/literal-ui/toast")({
  component: ToastOgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

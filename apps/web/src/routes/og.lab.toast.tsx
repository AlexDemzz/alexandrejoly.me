import { createFileRoute } from "@tanstack/react-router";

import { ToastOgCard } from "@/components/og-card";

/** The page screenshotted into `public/og/lab/toast.png`. */
export const Route = createFileRoute("/og/lab/toast")({
  component: ToastOgCard,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

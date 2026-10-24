import { createFileRoute, notFound } from "@tanstack/react-router";

import { OgCard } from "@/components/og-card";
import { getRegistryItem, isRegistryItemName } from "@/lib/registry";

/** The page screenshotted into `public/og/components/<name>.png`. */
const OgCardPage = () => <OgCard item={Route.useLoaderData()} />;

export const Route = createFileRoute("/og/components/$name")({
  component: OgCardPage,
  loader: ({ params: { name } }) => {
    if (!isRegistryItemName(name)) {
      throw notFound();
    }
    return getRegistryItem(name);
  },
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

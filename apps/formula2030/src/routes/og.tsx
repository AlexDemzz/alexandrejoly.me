import { createFileRoute, notFound } from "@tanstack/react-router";

import { HeroPanel } from "@/components/hero-panel";
import { SITE_NAME } from "@/lib/site";

// The composition scripts/og.mjs screenshots into public/og.png. Dev only.
const OgImage = () => (
  <main className="bg-ice grid h-[630px] w-[1200px] grid-cols-[minmax(0,1fr)_var(--container-panel)] items-center gap-16 overflow-clip pr-18 pl-20">
    <div className="grid gap-6">
      <h1 className="text-8xl leading-none font-light tracking-tighter">
        {SITE_NAME}
      </h1>
      <p className="text-tile-dim text-2xl/[1.35]">
        Themed components for UI SDK, from a shadcn registry.
      </p>
      <p className="text-tile-dim mt-4 text-base">
        formula2030.alexandrejoly.me
      </p>
    </div>
    <HeroPanel />
  </main>
);

export const Route = createFileRoute("/og")({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw notFound();
    }
  },
  component: OgImage,
  head: () => ({ meta: [{ content: "noindex", name: "robots" }] }),
});

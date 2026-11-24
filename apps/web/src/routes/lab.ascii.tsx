import { createFileRoute } from "@tanstack/react-router";

import { ASCII_CARD } from "@/components/og-card";
import { SiteFooter } from "@/components/site-footer";
import { ASCII_PAGE } from "@/content";
import { ASCII_PATH, EXPERIMENTS } from "@/lab/experiments";
import { LabCard } from "@/lab/lab-card";
import { LabPageHeading } from "@/lab/lab-page-heading";
import { pageHead } from "@/lib/head";

const AsciiPage = () => (
  <main className="max-w-lab mx-auto px-6 py-12 sm:py-32 md:py-16" data-lab>
    <LabPageHeading className="max-w-xl" title={ASCII_PAGE.title} />

    <div className="mt-10 mb-6 grid gap-6 md:grid-cols-2">
      {EXPERIMENTS.map((experiment) => (
        <LabCard experiment={experiment} key={experiment.slug} />
      ))}
    </div>

    <SiteFooter />
  </main>
);

const asciiHead = pageHead({
  description: ASCII_PAGE.description,
  image: {
    alt: `${ASCII_CARD.title}: ${ASCII_CARD.description}`,
    path: "og/lab/ascii.png",
  },
  path: ASCII_PATH,
  title: ASCII_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/lab/ascii")({
  component: AsciiPage,
  head: () => asciiHead,
});

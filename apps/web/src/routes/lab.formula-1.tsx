import { createFileRoute } from "@tanstack/react-router";

import { FORMULA1_CARD } from "@/components/og-card";
import { SiteFooter } from "@/components/site-footer";
import { FORMULA1_PAGE } from "@/content";
import { FORMULA1_PATH } from "@/lab/experiments";
import { SteeringWheel } from "@/lab/formula-1/steering-wheel";
import { LabPageHeading } from "@/lab/lab-page-heading";
import { pageHead } from "@/lib/head";

const Formula1Page = () => (
  <main
    className="max-w-lab mx-auto overflow-x-clip px-6 py-12 sm:py-32 md:py-16"
    data-lab="formula-1"
  >
    <LabPageHeading
      className="max-w-xl"
      credit={FORMULA1_PAGE.credit}
      title={FORMULA1_PAGE.title}
    />

    <div className="mt-10 mb-6" data-formula1-stage>
      <SteeringWheel />
    </div>

    <SiteFooter />
  </main>
);

const formula1Head = pageHead({
  description: FORMULA1_PAGE.description,
  image: {
    alt: `${FORMULA1_CARD.title}: ${FORMULA1_CARD.description}`,
    path: "og/lab/formula-1.png",
  },
  path: FORMULA1_PATH,
  title: FORMULA1_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/lab/formula-1")({
  component: Formula1Page,
  head: () => formula1Head,
});

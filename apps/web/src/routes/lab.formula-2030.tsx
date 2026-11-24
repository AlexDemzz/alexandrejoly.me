import { FormulaPanel } from "@portfolio/formula2030/panel";
import { createFileRoute } from "@tanstack/react-router";

import { FORMULA_CARD } from "@/components/og-card";
import { SiteFooter } from "@/components/site-footer";
import { FORMULA_PAGE } from "@/content";
import { FORMULA_PATH } from "@/lab/experiments";
import { LabPageHeading } from "@/lab/lab-page-heading";
import { pageHead } from "@/lib/head";

const FormulaPage = () => (
  <main
    className="max-w-column mx-auto px-6 py-12 sm:py-32 md:py-16"
    data-lab="formula-2030"
  >
    <LabPageHeading credit={FORMULA_PAGE.credit} title={FORMULA_PAGE.title} />

    <div className="mt-10 mb-6" data-formula-stage>
      <FormulaPanel />
    </div>

    <SiteFooter />
  </main>
);

const formulaHead = pageHead({
  description: FORMULA_PAGE.description,
  image: {
    alt: `${FORMULA_CARD.title}: ${FORMULA_CARD.description}`,
    path: "og/lab/formula-2030.png",
  },
  path: FORMULA_PATH,
  title: FORMULA_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/lab/formula-2030")({
  component: FormulaPage,
  head: () => formulaHead,
});

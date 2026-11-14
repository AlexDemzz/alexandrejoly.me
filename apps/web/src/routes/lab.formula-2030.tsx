import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@portfolio/ui/components/breadcrumb";
import { Heading } from "@portfolio/ui/components/heading";
import { Text, TextLink } from "@portfolio/ui/components/text";
import { Link, createFileRoute } from "@tanstack/react-router";

import { FORMULA_CARD } from "@/components/og-card";
import { SiteFooter } from "@/components/site-footer";
import { FORMULA_PAGE, LAB_PAGE, SITE } from "@/content";
import { FORMULA_PATH } from "@/lab/experiments";
import { FormulaPanel } from "@/lab/formula/panel";
import { pageHead } from "@/lib/head";
import { EXACT_ACTIVE } from "@/lib/link";

const Credit = () => (
  <Text>
    {FORMULA_PAGE.credit.map((run) =>
      typeof run === "string" ? (
        run
      ) : (
        <TextLink external href={run.href} key={run.href}>
          {run.text}
        </TextLink>
      )
    )}
  </Text>
);

const FormulaPage = () => (
  <main
    className="max-w-column mx-auto px-6 py-12 sm:py-32 md:py-16"
    data-lab="formula-2030"
  >
    <header className="flex flex-col items-start gap-5 pb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link activeOptions={EXACT_ACTIVE} to="/" />}
            >
              {SITE.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link activeOptions={EXACT_ACTIVE} to="/lab" />}
            >
              {LAB_PAGE.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Heading
        render={({ children, ...props }) => <h1 {...props}>{children}</h1>}
      >
        {FORMULA_PAGE.title}
      </Heading>
    </header>

    <figure className="mt-10 mb-6 flex flex-col gap-4">
      <div data-formula-stage>
        <FormulaPanel />
      </div>
      <figcaption>
        <Credit />
      </figcaption>
    </figure>

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

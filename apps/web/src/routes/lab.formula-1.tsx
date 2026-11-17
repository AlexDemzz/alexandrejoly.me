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

import { FORMULA1_CARD } from "@/components/og-card";
import { SiteFooter } from "@/components/site-footer";
import { FORMULA1_PAGE, LAB_PAGE, SITE } from "@/content";
import { FORMULA1_PATH } from "@/lab/experiments";
import { SteeringWheel } from "@/lab/formula-1/steering-wheel";
import { pageHead } from "@/lib/head";
import { EXACT_ACTIVE } from "@/lib/link";

const Credit = () => (
  <Text>
    {FORMULA1_PAGE.credit.map((run) =>
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

const Formula1Page = () => (
  <main
    className="max-w-lab mx-auto overflow-x-clip px-6 py-12 sm:py-32 md:py-16"
    data-lab="formula-1"
  >
    <header className="flex max-w-xl flex-col items-start gap-5 pb-6">
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
      <div>
        <Heading
          render={({ children, ...props }) => <h1 {...props}>{children}</h1>}
        >
          {FORMULA1_PAGE.title}
        </Heading>
        <Credit />
      </div>
    </header>

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

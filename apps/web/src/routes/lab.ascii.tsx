import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@portfolio/ui/components/breadcrumb";
import { Heading } from "@portfolio/ui/components/heading";
import { Link, createFileRoute } from "@tanstack/react-router";

import { ASCII_CARD } from "@/components/og-card";
import { SiteFooter } from "@/components/site-footer";
import { ASCII_PAGE, LAB_PAGE } from "@/content";
import { ASCII_PATH, EXPERIMENTS } from "@/lab/experiments";
import { LabCard } from "@/lab/lab-card";
import { pageHead } from "@/lib/head";
import { EXACT_ACTIVE } from "@/lib/link";

const AsciiPage = () => (
  <main className="max-w-lab mx-auto px-6 py-12 sm:py-32 md:py-16" data-lab>
    <header className="flex max-w-xl flex-col items-start gap-5 pb-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={<Link activeOptions={EXACT_ACTIVE} to="/" />}
            >
              Home
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
        {ASCII_PAGE.title}
      </Heading>
    </header>

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

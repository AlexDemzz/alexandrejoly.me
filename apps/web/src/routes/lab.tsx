import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@portfolio/ui/components/breadcrumb";
import { Heading } from "@portfolio/ui/components/heading";
import { Text } from "@portfolio/ui/components/text";
import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { LAB_PAGE } from "@/content";
import { EXPERIMENTS, LAB_PATH } from "@/lab/experiments";
import { LabCard } from "@/lab/lab-card";
import { pageHead } from "@/lib/head";
import { EXACT_ACTIVE } from "@/lib/link";

const LabPage = () => (
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
        </BreadcrumbList>
      </Breadcrumb>
      <Heading
        render={({ children, ...props }) => <h1 {...props}>{children}</h1>}
      >
        {LAB_PAGE.title}
      </Heading>
      <Text>{LAB_PAGE.intro}</Text>
    </header>

    <div className="mt-10 mb-6 grid gap-6 md:grid-cols-2">
      {EXPERIMENTS.map((experiment) => (
        <LabCard experiment={experiment} key={experiment.slug} />
      ))}
    </div>

    <SiteFooter />
  </main>
);

const labHead = pageHead({
  description: LAB_PAGE.description,
  path: LAB_PATH,
  title: LAB_PAGE.documentTitle,
  type: "website",
});

export const Route = createFileRoute("/lab")({
  component: LabPage,
  head: () => labHead,
});

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@portfolio/ui/components/breadcrumb";
import { Heading } from "@portfolio/ui/components/heading";
import { Text, TextLink } from "@portfolio/ui/components/text";
import { cn } from "@portfolio/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { LAB_PAGE, LITERAL_PAGE, SITE } from "@/content";
import { EXACT_ACTIVE } from "@/lib/link";

export type CreditRun =
  | string
  | { readonly href: string; readonly text: string };

/** A credit's text and links, for a paragraph that wraps them. */
export const CreditRuns = ({ runs }: { runs: readonly CreditRun[] }) =>
  runs.map((run) =>
    typeof run === "string" ? (
      run
    ) : (
      <TextLink external href={run.href} key={run.href}>
        {run.text}
      </TextLink>
    )
  );

const Credit = ({ runs }: { runs: readonly CreditRun[] }) => (
  <Text>
    <CreditRuns runs={runs} />
  </Text>
);

const PageTitle = ({ children }: { children: string }) => (
  <Heading
    render={({ children: title, ...props }) => <h1 {...props}>{title}</h1>}
  >
    {children}
  </Heading>
);

/** The way up from a lab page: the home, then the Lab, then any crumbs under it. */
export const LabBreadcrumb = ({ children }: { children?: ReactNode }) => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink render={<Link activeOptions={EXACT_ACTIVE} to="/" />}>
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
      {children}
    </BreadcrumbList>
  </Breadcrumb>
);

/** The way up from a piece's page: the home, the Lab, then Literal UI. */
export const LiteralBreadcrumb = () => (
  <LabBreadcrumb>
    <BreadcrumbSeparator>/</BreadcrumbSeparator>
    <BreadcrumbItem>
      <BreadcrumbLink
        render={<Link activeOptions={EXACT_ACTIVE} to="/lab/literal-ui" />}
      >
        {LITERAL_PAGE.title}
      </BreadcrumbLink>
    </BreadcrumbItem>
  </LabBreadcrumb>
);

/** The breadcrumb, title and credit at the top of a lab experiment page. */
export const LabPageHeading = ({
  className,
  credit,
  title,
}: {
  className?: string;
  credit?: readonly CreditRun[];
  title: string;
}) => (
  // Not <header>: content extractors drop it, and it holds the page's title and credit.
  <div className={cn("flex flex-col items-start gap-5 pb-6", className)}>
    <LabBreadcrumb />
    {credit ? (
      <div>
        <PageTitle>{title}</PageTitle>
        <Credit runs={credit} />
      </div>
    ) : (
      <PageTitle>{title}</PageTitle>
    )}
  </div>
);

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@portfolio/ui/components/breadcrumb";
import { Text, textLinkVariants } from "@portfolio/ui/components/text";
import { Link } from "@tanstack/react-router";

import { AUTHOR_URL } from "@/lib/site";

export const NotFound = () => (
  <main className="max-w-column mx-auto flex w-full flex-col gap-5 px-6 py-12 sm:py-24">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={AUTHOR_URL}>Alexandre Joly</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
    <h1 className="text-foreground mt-7 text-xl leading-relaxed">
      Page not found
    </h1>
    <Text>
      This page doesn’t exist, or it has moved. Head back to{" "}
      <Link className={textLinkVariants()} to="/">
        Carbon
      </Link>
      .
    </Text>
  </main>
);

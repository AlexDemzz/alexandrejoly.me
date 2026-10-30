import { Text, textLinkVariants } from "@portfolio/ui/components/text";
import { Link } from "@tanstack/react-router";

import { HomeBreadcrumb } from "@/components/home-breadcrumb";

export const NotFound = () => (
  <main className="max-w-column mx-auto flex w-full flex-col px-6 pt-12 pb-12 sm:pb-24">
    <HomeBreadcrumb />
    <div className="text-muted-foreground mt-6 text-xl leading-relaxed text-balance">
      <h1 className="text-foreground inline font-medium">Page not found.</h1>{" "}
      This page doesn’t exist, or it has moved.
    </div>
    <Text className="mt-5">
      Head back to{" "}
      <Link className={textLinkVariants()} to="/">
        Carbon
      </Link>
      .
    </Text>
  </main>
);

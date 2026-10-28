import { Heading } from "@portfolio/ui/components/heading";
import { Text, textLinkVariants } from "@portfolio/ui/components/text";
import { Link } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteIdentity } from "@/components/site-identity";

export const NotFound = () => (
  <main className="mx-auto w-full max-w-180 px-6 py-12 sm:py-32 md:py-16">
    <SiteIdentity />

    <div className="flex flex-col gap-5 pt-10">
      <div>
        <Heading
          render={({ children, ...props }) => <h1 {...props}>{children}</h1>}
        >
          Page not found
        </Heading>
        <Text>This page does not exist, or it has moved.</Text>
      </div>
      <Text>
        Head back to the{" "}
        <Link className={textLinkVariants()} to="/">
          home page
        </Link>
        , or start from{" "}
        <Link
          className={textLinkVariants()}
          params={{ _splat: "getting-started" }}
          to="/docs/$"
        >
          Getting started
        </Link>
        .
      </Text>
    </div>

    <SiteFooter />
  </main>
);

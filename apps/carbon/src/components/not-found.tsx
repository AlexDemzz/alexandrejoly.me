import { Heading } from "@portfolio/ui/components/heading";
import { Text, textLinkVariants } from "@portfolio/ui/components/text";
import { Link } from "@tanstack/react-router";

import { LogoMark } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";

export const NotFound = () => (
  <main className="max-w-column mx-auto w-full px-6 py-12 sm:py-32 md:py-16">
    <Link aria-label="Carbon home" className="block w-fit" to="/">
      <LogoMark className="text-foreground size-10" />
    </Link>
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
        .
      </Text>
    </div>
    <SiteFooter />
  </main>
);

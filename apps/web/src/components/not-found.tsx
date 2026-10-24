import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Code } from "@portfolio/ui/components/code";
import { Heading } from "@portfolio/ui/components/heading";
import { Text, textLinkVariants } from "@portfolio/ui/components/text";
import { Link, useLocation } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";

export const NotFound = () => {
  const pathname = useLocation({ select: (location) => location.pathname });

  return (
    <main className="max-w-column mx-auto px-6 py-12 sm:py-32 md:py-16">
      <header className="flex flex-col items-start gap-5 pb-6">
        <Link className={textLinkVariants()} to="/">
          <ArrowLeftIcon aria-hidden />
          Home
        </Link>
        <Heading
          render={({ children, ...props }) => <h1 {...props}>{children}</h1>}
        >
          Page not found
        </Heading>
        <Text>
          Nothing lives at <Code>{pathname}</Code>. The page may have moved, or
          the address may contain a typo.
        </Text>
      </header>

      <SiteFooter />
    </main>
  );
};

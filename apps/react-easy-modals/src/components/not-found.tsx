import { Link } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteIdentity } from "@/components/site-identity";
import { Heading } from "@/components/ui/heading";
import { Text, TextLink } from "@/components/ui/text";

export const NotFound = () => (
  <main className="mx-auto w-full max-w-180 px-6 py-12 sm:py-32 md:py-16">
    <SiteIdentity tagline="Modals you can await." />

    <div className="flex flex-col gap-5 pt-10">
      <div>
        <Heading level={1}>Page not found</Heading>
        <Text>This page does not exist, or it has moved.</Text>
      </div>
      <Text>
        Head back to the <TextLink render={<Link to="/" />}>home page</TextLink>
        , or start from{" "}
        <TextLink
          render={<Link to="/docs/$" params={{ _splat: "getting-started" }} />}
        >
          Getting started
        </TextLink>
        .
      </Text>
    </div>

    <SiteFooter />
  </main>
);

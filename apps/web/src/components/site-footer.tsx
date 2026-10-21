import {
  Text,
  TextLink,
  textLinkVariants,
} from "@portfolio/ui/components/text";
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";

import { GithubIcon } from "@/components/github-icon";
import { LINKS } from "@/content";

const PAGES = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy", to: "/privacy" },
] as const;

export const SiteFooter = () => (
  <footer className="pt-10">
    <Text variant="faint">
      © 2026 Alexandre Joly ·{" "}
      {PAGES.map(({ label, to }) => (
        <Fragment key={to}>
          <Link className={textLinkVariants()} to={to}>
            {label}
          </Link>{" "}
          ·{" "}
        </Fragment>
      ))}
      <TextLink external href={LINKS.repo}>
        <GithubIcon />
        Source
      </TextLink>
    </Text>
  </footer>
);

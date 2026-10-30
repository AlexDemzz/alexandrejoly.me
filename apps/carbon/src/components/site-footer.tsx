import {
  Text,
  TextLink,
  textLinkVariants,
} from "@portfolio/ui/components/text";
import { Link } from "@tanstack/react-router";

import { AUTHOR_URL, LICENSE_URL } from "@/lib/site";

export const SiteFooter = () => (
  <footer className="max-w-column mx-auto flex w-full flex-wrap gap-x-4 gap-y-1 pt-10">
    <Text variant="faint">
      <TextLink external href={LICENSE_URL}>
        MIT licensed
      </TextLink>
      . Built by{" "}
      <TextLink external href={AUTHOR_URL}>
        Alexandre Joly
      </TextLink>
      .
    </Text>
    <nav aria-label="Carbon">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <li>
          <Link className={textLinkVariants()} to="/privacy">
            Privacy
          </Link>
        </li>
      </ul>
    </nav>
  </footer>
);

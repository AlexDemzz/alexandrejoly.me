import { Text, TextLink } from "@portfolio/ui/components/text";

import { AUTHOR_URL, X_URL } from "@/lib/site";

export const SiteFooter = () => (
  <footer className="flex flex-wrap gap-x-4 gap-y-1 pt-10">
    <Text variant="faint">
      Built by{" "}
      <TextLink href={AUTHOR_URL} external>
        Alexandre Joly
      </TextLink>
      .
    </Text>
    <nav aria-label="Project">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <li>
          <TextLink href={X_URL} external>
            X
          </TextLink>
        </li>
      </ul>
    </nav>
  </footer>
);

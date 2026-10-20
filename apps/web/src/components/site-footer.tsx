import { Text, TextLink } from "@portfolio/ui/components/text";

import { GithubIcon } from "@/components/github-icon";
import { LINKS } from "@/content";

export const SiteFooter = () => (
  <footer className="pt-10">
    <Text variant="faint">
      © 2026 Alexandre Joly ·{" "}
      <TextLink external href={LINKS.repo}>
        <GithubIcon />
        Source
      </TextLink>
    </Text>
  </footer>
);

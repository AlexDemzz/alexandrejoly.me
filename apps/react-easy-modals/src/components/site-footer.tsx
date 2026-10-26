import { Text, TextLink } from "@portfolio/ui/components/text";

import { AUTHOR_URL, GITHUB_URL, NPM_URL } from "@/lib/site";

export const SiteFooter = () => (
  <footer className="flex flex-wrap gap-x-4 gap-y-1 pt-10">
    <Text variant="faint">
      MIT licensed. Built by{" "}
      <TextLink href={AUTHOR_URL} external>
        Alexandre Joly
      </TextLink>
      .
    </Text>
    <nav aria-label="Project">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <li>
          <TextLink href={GITHUB_URL} external>
            GitHub
          </TextLink>
        </li>
        <li>
          <TextLink href={NPM_URL} external>
            npm
          </TextLink>
        </li>
        <li>
          <TextLink href="/llms.txt">llms.txt</TextLink>
        </li>
      </ul>
    </nav>
  </footer>
);

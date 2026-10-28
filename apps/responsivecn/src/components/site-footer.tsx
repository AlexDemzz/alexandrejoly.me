import { Text, TextLink } from "@portfolio/ui/components/text";

import { authorUrl, githubUrl } from "@/lib/shared";

export const SiteFooter = () => (
  <footer className="flex flex-wrap gap-x-4 gap-y-1 pt-10">
    <Text variant="faint">
      Built by{" "}
      <TextLink href={authorUrl} external>
        Alexandre Joly
      </TextLink>
      .
    </Text>
    <nav aria-label="Project">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <li>
          <TextLink href={githubUrl} external>
            GitHub
          </TextLink>
        </li>
        <li>
          <TextLink href="/llms.txt">llms.txt</TextLink>
        </li>
      </ul>
    </nav>
  </footer>
);

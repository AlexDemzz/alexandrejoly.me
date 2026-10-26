import { FileTextIcon } from "@phosphor-icons/react";
import type { DocsSite } from "@portfolio/docs-theme/layout";

import { NpmIcon } from "@/components/brand-icons";
import { GITHUB_URL, NPM_URL, SITE_NAME } from "@/lib/site";

export const docsSite: DocsSite = {
  title: SITE_NAME,
  repoUrl: GITHUB_URL,
  links: [
    { label: "npm", href: NPM_URL, icon: NpmIcon },
    { label: "llms.txt", href: "/llms.txt", icon: FileTextIcon },
  ],
  search: true,
};

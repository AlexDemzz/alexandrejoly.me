import { FileTextIcon, PackageIcon } from "@phosphor-icons/react";
import type { DocsSite } from "@portfolio/docs-theme/layout";

import { appName, githubUrl, registryUrl } from "@/lib/shared";

export const docsSite: DocsSite = {
  title: appName,
  repoUrl: githubUrl,
  links: [
    {
      label: "Registry",
      href: `${registryUrl}/registry.json`,
      icon: PackageIcon,
    },
    { label: "llms.txt", href: "/llms.txt", icon: FileTextIcon },
  ],
};

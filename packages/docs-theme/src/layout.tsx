import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@portfolio/ui/components/breadcrumb";
import { Link } from "fumadocs-core/link";
import type * as PageTree from "fumadocs-core/page-tree";
import type { TableOfContents } from "fumadocs-core/toc";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import type { ComponentProps, ReactNode } from "react";

import { DocsSidebarFooter } from "./docs-sidebar-footer";

interface DocsSite {
  /** Names the site in the header, linking to its home page. */
  title: string;
  /** Listed first in the sidebar footer, as GitHub. */
  repoUrl: string;
  /** The sidebar footer's other links, after GitHub. */
  links?: ComponentProps<typeof DocsSidebarFooter>["links"];
  /** Shows Fumadocs' search trigger; the site serves the search route. */
  search?: boolean;
}

// Lines up with the sidebar items, which carry their own inline padding.
const DocsHomeCrumb = ({ title }: { title: string }) => (
  <Breadcrumb className="md:mx-2">
    <BreadcrumbList>
      <BreadcrumbItem>
        <Link href="/" className="link-text">
          {title}
        </Link>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>
);

const docsBaseOptions = ({ title, search = false }: DocsSite) =>
  ({
    // A function title replaces the default link to "/", which would nest
    // the breadcrumb's own link inside it.
    nav: { title: () => <DocsHomeCrumb title={title} /> },
    themeSwitch: { enabled: false },
    searchToggle: { enabled: search },
  }) satisfies BaseLayoutProps;

interface DocsShellProps {
  site: DocsSite;
  tree: PageTree.Root;
  children: ReactNode;
}

const DocsShell = ({ site, tree, children }: DocsShellProps) => (
  <DocsLayout
    {...docsBaseOptions(site)}
    tree={tree}
    sidebar={{
      collapsible: false,
      footer: (
        <DocsSidebarFooter repoUrl={site.repoUrl} links={site.links ?? []} />
      ),
    }}
  >
    {children}
  </DocsLayout>
);

interface DocsArticleProps {
  title: ReactNode;
  description?: ReactNode;
  toc: TableOfContents;
  /** Page actions under the description, such as Fumadocs' Markdown copy. */
  actions?: ReactNode;
  children: ReactNode;
}

const DocsArticle = ({
  title,
  description,
  toc,
  actions,
  children,
}: DocsArticleProps) => (
  <DocsPage toc={toc} className="max-w-3xl">
    <DocsTitle>{title}</DocsTitle>
    <DocsDescription className="text-sm">{description}</DocsDescription>
    {actions ? (
      <div className="flex flex-wrap items-center gap-2 border-b pb-6">
        {actions}
      </div>
    ) : null}
    <DocsBody>{children}</DocsBody>
  </DocsPage>
);

export { DocsArticle, DocsShell, docsBaseOptions };
export type { DocsSite };
export type { DocsSidebarLink } from "./docs-sidebar-footer";

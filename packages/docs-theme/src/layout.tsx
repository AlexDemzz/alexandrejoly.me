import { ListIcon } from "@phosphor-icons/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@portfolio/ui/components/breadcrumb";
import { buttonVariants } from "@portfolio/ui/components/button";
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
import { SidebarTrigger } from "fumadocs-ui/layouts/docs/slots/sidebar";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { SearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";
import type { CSSProperties, ReactNode } from "react";

import { DocsNextPage } from "./docs-next-page";

interface DocsSite {
  /** Names the site in the header, linking to its home page. */
  title: string;
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

// The mobile header of alexandrejoly.me/components: the crumb in the page
// flow, a menu icon button at the end, no bar.
const DocsMobileHeader = ({
  title,
  search,
}: {
  title: string;
  search: boolean;
}) => (
  <header
    id="nd-subnav"
    className="flex items-center gap-1 pt-12 [grid-area:header] md:hidden"
  >
    <div className="me-auto">
      <DocsHomeCrumb title={title} />
    </div>
    {search ? <SearchTrigger hideIfDisabled /> : null}
    <SidebarTrigger
      className={buttonVariants({
        variant: "ghost",
        size: "icon",
        className: "-me-2",
      })}
    >
      <ListIcon aria-hidden />
    </SidebarTrigger>
  </header>
);

const DocsDrawerClose = () => (
  <SidebarTrigger className="link-text ms-2 self-start md:hidden">
    Close
  </SidebarTrigger>
);

const docsBaseOptions = ({ title, search = false }: DocsSite) =>
  ({
    // A function title replaces the default link to "/", which would nest
    // the breadcrumb's own link inside it.
    nav: {
      title: () => <DocsHomeCrumb title={title} />,
      component: <DocsMobileHeader title={title} search={search} />,
    },
    themeSwitch: { enabled: false },
    searchToggle: { enabled: search },
  }) satisfies BaseLayoutProps;

// The sidebar and the content share one centred block, as on
// alexandrejoly.me/components, with the TOC beside them; `docs-layout.css`
// styles everything inside.
const DOCS_CONTAINER_PROPS = {
  "data-docs-layout": "",
  style: {
    gridTemplate: `". sidebar header toc ."
". sidebar toc-popover toc ."
". sidebar tabs toc ."
". sidebar main toc ." 1fr / minmax(0, 1fr) var(--fd-sidebar-col) minmax(0, var(--container-column)) var(--fd-toc-width) minmax(0, 1fr)`,
  } satisfies CSSProperties,
};

interface DocsShellProps {
  site: DocsSite;
  tree: PageTree.Root;
  children: ReactNode;
}

const DocsShell = ({ site, tree, children }: DocsShellProps) => (
  <DocsLayout
    {...docsBaseOptions(site)}
    tree={tree}
    containerProps={DOCS_CONTAINER_PROPS}
    sidebar={{
      collapsible: false,
      banner: <DocsDrawerClose />,
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
  /** The site's footer, 64px under the next page link (48px plus the page's 16px gap). */
  footer?: ReactNode;
  children: ReactNode;
}

const DocsArticle = ({
  title,
  description,
  toc,
  actions,
  footer,
  children,
}: DocsArticleProps) => (
  <DocsPage
    toc={toc}
    tableOfContentPopover={{ enabled: false }}
    footer={{
      component: (
        <>
          <DocsNextPage />
          {footer ? <div className="pt-12">{footer}</div> : null}
        </>
      ),
    }}
  >
    <DocsTitle>{title}</DocsTitle>
    <DocsDescription>{description}</DocsDescription>
    {actions ? (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    ) : null}
    <DocsBody>{children}</DocsBody>
  </DocsPage>
);

export { DocsArticle, DocsShell, docsBaseOptions };
export type { DocsSite };

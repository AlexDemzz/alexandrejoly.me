import { GithubLogoIcon } from "@phosphor-icons/react";
import { Separator } from "@portfolio/ui/components/separator";
import type { ComponentType } from "react";

const AUTHOR_URL = "https://alexandrejoly.me";
const EXTERNAL_HREF = /^https?:\/\//u;

interface DocsSidebarLink {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

interface DocsSidebarFooterProps {
  repoUrl: string;
  links: readonly DocsSidebarLink[];
}

const DocsSidebarFooter = ({ repoUrl, links }: DocsSidebarFooterProps) => (
  <div className="flex flex-col text-sm">
    <ul className="flex flex-col">
      {[{ label: "GitHub", href: repoUrl, icon: GithubLogoIcon }, ...links].map(
        ({ label, href, icon: Icon }) => (
          <li key={label}>
            <a
              href={href}
              {...(EXTERNAL_HREF.test(href) && {
                rel: "noopener noreferrer",
                target: "_blank",
              })}
              className="text-muted-foreground focus-visible:ring-ring/50 can-hover:hover:bg-accent can-hover:hover:text-foreground flex items-center gap-3 rounded-md px-2 py-2 transition-colors duration-150 ease-out outline-none focus-visible:ring-3"
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </a>
          </li>
        )
      )}
    </ul>
    <Separator className="my-3" />
    <p className="text-muted-foreground px-2 leading-relaxed">
      Made by{" "}
      <a
        href={AUTHOR_URL}
        rel="noopener noreferrer"
        target="_blank"
        className="link-text"
      >
        Alexandre Joly
      </a>
    </p>
  </div>
);

export { DocsSidebarFooter };
export type { DocsSidebarLink };

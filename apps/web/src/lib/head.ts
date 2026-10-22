import type { ComponentProps } from "react";

import { SITE } from "@/content";

export const absolute = (path: string) => new URL(path, SITE.url).href;

/** The Markdown twin of a page: its path plus `.md`, `index.md` for home. */
export const markdownPath = (path: string) =>
  `/${path === "" ? "index" : path}.md`;

export const markdownUrl = (path: string) => absolute(markdownPath(path));

interface PageHeadOptions {
  description: string;
  /** Path from the site root, without a leading slash; empty for home. */
  path: string;
  title: string;
  type: "article" | "profile" | "website";
}

/** Canonical and Markdown links plus the description and Open Graph tags every page shares. */
export const pageHead = ({
  description,
  path,
  title,
  type,
}: PageHeadOptions): {
  links: ComponentProps<"link">[];
  meta: ComponentProps<"meta">[];
} => {
  const url = absolute(path);
  return {
    links: [
      { href: url, rel: "canonical" },
      { href: markdownUrl(path), rel: "alternate", type: "text/markdown" },
    ],
    meta: [
      { title },
      { content: description, name: "description" },
      { content: type, property: "og:type" },
      { content: url, property: "og:url" },
      { content: title, property: "og:title" },
      { content: description, property: "og:description" },
      { content: SITE.name, property: "og:site_name" },
    ],
  };
};

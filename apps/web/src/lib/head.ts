import type { ComponentProps } from "react";

import { SITE } from "@/content";

interface PageHeadOptions {
  description: string;
  /** Path from the site root, without a leading slash; empty for home. */
  path: string;
  title: string;
  type: "article" | "profile";
}

/** Canonical link plus the description and Open Graph tags every page shares. */
export const pageHead = ({
  description,
  path,
  title,
  type,
}: PageHeadOptions): {
  links: ComponentProps<"link">[];
  meta: ComponentProps<"meta">[];
} => {
  const url = new URL(path, SITE.url).href;
  return {
    links: [{ href: url, rel: "canonical" }],
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

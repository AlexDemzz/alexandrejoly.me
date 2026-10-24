import type { ComponentProps } from "react";

import { SITE, X_HANDLE } from "@/content";

export const absolute = (path: string) => new URL(path, SITE.url).href;

/** The Markdown twin of a page: its path plus `.md`, `index.md` for home. */
export const markdownPath = (path: string) =>
  `/${path === "" ? "index" : path}.md`;

export const markdownUrl = (path: string) => absolute(markdownPath(path));

interface PageImage {
  alt: string;
  /** Path from the site root, without a leading slash. */
  path: string;
}

/** The home page's card, shared by every page without one of its own. */
const SITE_IMAGE: PageImage = {
  alt: `${SITE.name}: I design and build interfaces end to end, and I care about the details that make them feel right.`,
  path: "og.png",
};

interface PageHeadOptions {
  description: string;
  /** A 1200×630 PNG Open Graph image, shown as a large card on X. Defaults to the home page's. */
  image?: PageImage;
  /** Path from the site root, without a leading slash; empty for home. */
  path: string;
  title: string;
  type: "article" | "profile" | "website";
}

/** Canonical and Markdown links plus the description, Open Graph and X card tags every page shares. */
export const pageHead = ({
  description,
  image = SITE_IMAGE,
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
      { content: "en_US", property: "og:locale" },
      { content: absolute(image.path), property: "og:image" },
      { content: "image/png", property: "og:image:type" },
      { content: "1200", property: "og:image:width" },
      { content: "630", property: "og:image:height" },
      { content: image.alt, property: "og:image:alt" },
      { content: "summary_large_image", name: "twitter:card" },
      { content: `@${X_HANDLE}`, name: "twitter:site" },
      { content: `@${X_HANDLE}`, name: "twitter:creator" },
    ],
  };
};

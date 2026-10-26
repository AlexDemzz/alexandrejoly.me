// Imported by scripts/generate-images.ts under plain Node, hence the explicit
// `.ts` extensions and no `@/` alias.
import { appName, githubUrl, siteUrl } from "./shared.ts";

export interface PageSeo {
  path: string;
  title: string;
  description: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown>;
}

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const homeSeo = {
  path: "/",
  title: "responsivecn: responsive Dialog and Drawer for shadcn/ui",
  description:
    "shadcn/ui overlays that switch to their mobile counterpart below 768px: Dialog, Sheet and Popover to Drawer, Tooltip to Popover. On Base UI or Radix.",
} as const satisfies PageSeo;

const normalizePath = (path: string): string => {
  const trimmed = path.replace(/\/+$/u, "");
  return trimmed === "" ? "/" : trimmed;
};

export const canonicalUrl = (path: string): string =>
  `${siteUrl}${normalizePath(path)}`;

export const ogImagePath = (path: string): string => {
  const page = normalizePath(path);
  return `/og${page === "/" ? "/index" : page}.png`;
};

export const markdownUrl = (path: string): string => {
  const page = normalizePath(path);
  return `${siteUrl}${page === "/" ? "/index" : page}.md`;
};

// `<` is escaped so a string value can never close the inline script.
const serializeJsonLd = (data: Record<string, unknown>): string =>
  JSON.stringify({
    "@context": "https://schema.org",
    ...data,
  }).replaceAll("<", "\\u003c");

interface MetaTag {
  title?: string;
  name?: string;
  property?: string;
  content?: string;
}
interface LinkTag {
  rel: string;
  href: string;
  type?: string;
}
interface ScriptTag {
  type: string;
  children: string;
}

export const pageHead = (
  page: PageSeo
): {
  meta: MetaTag[];
  links: LinkTag[];
  scripts: ScriptTag[];
} => {
  const url = canonicalUrl(page.path);
  const image = `${siteUrl}${ogImagePath(page.path)}`;
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { property: "og:type", content: page.type ?? "website" },
      { property: "og:url", content: url },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:image", content: image },
      { property: "og:image:width", content: String(OG_IMAGE_WIDTH) },
      { property: "og:image:height", content: String(OG_IMAGE_HEIGHT) },
      { property: "og:image:alt", content: page.title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: image },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", type: "text/markdown", href: markdownUrl(page.path) },
    ],
    scripts: page.jsonLd
      ? [
          {
            type: "application/ld+json",
            children: serializeJsonLd(page.jsonLd),
          },
        ]
      : [],
  };
};

const websiteNode = {
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: appName,
  url: `${siteUrl}/`,
  inLanguage: "en",
};

export const homeJsonLd = (): Record<string, unknown> => ({
  "@graph": [
    { ...websiteNode, description: homeSeo.description },
    {
      "@type": "SoftwareSourceCode",
      name: appName,
      description: homeSeo.description,
      url: `${siteUrl}/`,
      codeRepository: githubUrl,
      programmingLanguage: "TypeScript",
      runtimePlatform: "React",
      isAccessibleForFree: true,
    },
  ],
});

export const docsJsonLd = (page: {
  path: string;
  title: string;
  description: string;
  breadcrumb: string;
}): Record<string, unknown> => {
  const url = canonicalUrl(page.path);
  const docsUrl = canonicalUrl("/docs");
  const crumbs = [
    { name: "Docs", item: docsUrl },
    ...(url === docsUrl ? [] : [{ name: page.breadcrumb, item: url }]),
  ];
  return {
    "@graph": [
      {
        "@type": "TechArticle",
        headline: page.title,
        description: page.description,
        url,
        inLanguage: "en",
        isPartOf: { "@id": websiteNode["@id"] },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          ...crumb,
        })),
      },
      websiteNode,
    ],
  };
};

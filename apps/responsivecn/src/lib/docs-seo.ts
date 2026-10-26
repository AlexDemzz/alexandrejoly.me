import { isPairSlug, PAIRS } from "@/components/create/pairs";
import type { Pair } from "@/components/create/pairs";
import { docsJsonLd } from "@/lib/seo";
import type { PageSeo } from "@/lib/seo";

const INTRO_TITLE =
  "Introduction to responsivecn: responsive shadcn/ui overlays";
const PAIR_DESCRIPTION_SUFFIX =
  " Installs with the shadcn CLI on Base UI or Radix.";

const docsTitle = (
  title: string,
  slugs: string[],
  pair: Pair | undefined
): string => {
  if (pair) {
    return `${title}: shadcn ${pair.desktop} on desktop, ${pair.mobile} on mobile`;
  }
  if (slugs.length === 0) {
    return INTRO_TITLE;
  }
  return `${title} | responsivecn`;
};

export const docsSeo = (page: {
  slugs: string[];
  title: string;
  description: string;
}): PageSeo => {
  const path = ["/docs", ...page.slugs].join("/");
  const [slug] = page.slugs;
  const pair =
    page.slugs.length === 1 && isPairSlug(slug)
      ? PAIRS.find((item) => item.slug === slug)
      : undefined;

  const title = docsTitle(page.title, page.slugs, pair);
  const description = pair
    ? `${page.description}${PAIR_DESCRIPTION_SUFFIX}`
    : page.description;

  return {
    path,
    title,
    description,
    type: "article",
    jsonLd: docsJsonLd({ path, title, description, breadcrumb: page.title }),
  };
};

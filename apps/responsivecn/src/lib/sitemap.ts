import { canonicalUrl } from "@/lib/seo";

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const escapeXml = (value: string): string =>
  value.replaceAll(/[&<>"']/gu, (char) => XML_ESCAPES[char] ?? char);

export const sitemapXml = (paths: string[]): string => {
  const urls = paths.map(
    (path) =>
      `  <url>\n    <loc>${escapeXml(canonicalUrl(path))}</loc>\n  </url>`
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
};

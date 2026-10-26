import { createGetUrl } from "fumadocs-core/source";

export const docsRoute = "/docs";

const getDocsUrl = createGetUrl(docsRoute);

const MARKDOWN_EXTENSION = /\.md$/u;

export const getPageMarkdownUrl = (page: { slugs: string[] }) => {
  const segments = [...page.slugs];
  segments[segments.length - 1] += ".md";
  return { segments, url: getDocsUrl(segments) };
};

/** @returns page slugs */
export const decodeMarkdownUrl = (segments: string[]) => {
  const last = segments.at(-1);
  if (last === undefined) {
    return [];
  }

  return [...segments.slice(0, -1), last.replace(MARKDOWN_EXTENSION, "")];
};

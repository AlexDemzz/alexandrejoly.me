// Content negotiation for agents: a page's Markdown twin is served either at
// its own URL for `Accept: text/markdown`, or at `<path>.md`.

const MARKDOWN = "text/markdown";
const HTML = "text/html";

const acceptedQualities = (accept: string): Map<string, number> => {
  const qualities = new Map<string, number>();
  for (const range of accept.split(",")) {
    const [type = "", ...params] = range.split(";").map((part) => part.trim());
    if (type === "") {
      continue;
    }
    const qParam = params.find((param) => param.startsWith("q="));
    const quality = qParam === undefined ? 1 : Number(qParam.slice(2));
    qualities.set(type.toLowerCase(), Number.isNaN(quality) ? 0 : quality);
  }
  return qualities;
};

export const prefersMarkdown = (accept: string | null): boolean => {
  if (accept === null) {
    return false;
  }
  const qualities = acceptedQualities(accept);
  const markdown = qualities.get(MARKDOWN) ?? 0;
  const html = qualities.get(HTML) ?? 0;
  return markdown > 0 && markdown >= html;
};

const MD_SUFFIX = ".md";

export const markdownTwinPath = (pathname: string): string | undefined => {
  if (!pathname.endsWith(MD_SUFFIX)) {
    return undefined;
  }
  const page = pathname.slice(0, -MD_SUFFIX.length);
  return page === "/index" ? "/" : page;
};

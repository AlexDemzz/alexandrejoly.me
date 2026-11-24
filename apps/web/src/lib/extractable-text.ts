/** What content extractors remove before they read a page. */
const DROPPED_BY_EXTRACTORS = "header, footer, nav, script, style";

const WHITESPACE = /\s+/gu;

/**
 * The text a content extractor keeps from server-rendered HTML, the way
 * is-agentic's no-JavaScript check reads a page. Needs a DOM, so tests that
 * call it run in jsdom.
 */
export const extractableText = (html: string): string => {
  const { body } = new DOMParser().parseFromString(html, "text/html");
  for (const dropped of body.querySelectorAll(DROPPED_BY_EXTRACTORS)) {
    dropped.remove();
  }
  return (body.textContent ?? "").replaceAll(WHITESPACE, " ").trim();
};

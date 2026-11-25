import { TOAST_PATH, TOAST_PATH_BEFORE } from "@/lab/experiments";
import { markdownPath } from "@/lib/head";
import { stripTrailingSlashes } from "@/lib/trailing-slash";

/**
 * Addresses that changed, old path to new, both from the site root without a
 * leading slash: the Toast page, and the Literal UI registry items, each under
 * every name its install command was shared with: `toaster` then `toast`, and
 * `carousel`. Each goes to the current address in one hop.
 */
const MOVED = new Map<string, string>([
  [TOAST_PATH_BEFORE, TOAST_PATH],
  ["r/toaster.json", "r/literal-ui/toast.json"],
  ["r/toast.json", "r/literal-ui/toast.json"],
  ["r/carousel.json", "r/literal-ui/carousel.json"],
]);

/**
 * A permanent redirect from a page's old address to its new one, for the page
 * and its Markdown twin, trailing slash or not, query kept.
 */
export const movedRedirect = (request: Request): Response | undefined => {
  const url = new URL(request.url);
  const pathname = stripTrailingSlashes(url.pathname);
  for (const [before, after] of MOVED) {
    if (pathname === `/${before}`) {
      url.pathname = `/${after}`;
      return Response.redirect(url.href, 301);
    }
    if (pathname === markdownPath(before)) {
      url.pathname = markdownPath(after);
      return Response.redirect(url.href, 301);
    }
  }
  return undefined;
};

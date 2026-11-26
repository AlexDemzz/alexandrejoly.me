import { TOAST_PATH, TOAST_PATH_BEFORE } from "@/lab/experiments";
import { markdownPath } from "@/lib/head";
import { stripTrailingSlashes } from "@/lib/trailing-slash";

/**
 * Addresses that changed, old path to new, both from the site root without a
 * leading slash, kept for the ones posted publicly: the Toast page, and its
 * registry item, posted as `toaster` before it moved under Literal UI.
 */
const MOVED = new Map<string, string>([
  [TOAST_PATH_BEFORE, TOAST_PATH],
  ["r/toaster.json", "r/literal-ui/toast.json"],
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

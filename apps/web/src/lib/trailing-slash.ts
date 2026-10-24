const TRAILING_SLASHES = /\/+$/u;

export const stripTrailingSlashes = (pathname: string) =>
  pathname.replace(TRAILING_SLASHES, "") || "/";

/**
 * A permanent redirect from `/page/` to `/page`, query kept: the router's own
 * is a 307, which search engines treat as temporary.
 */
export const trailingSlashRedirect = (
  request: Request
): Response | undefined => {
  const url = new URL(request.url);
  if (url.pathname === "/" || !url.pathname.endsWith("/")) {
    return undefined;
  }
  url.pathname = stripTrailingSlashes(url.pathname);
  return Response.redirect(url.href, 308);
};

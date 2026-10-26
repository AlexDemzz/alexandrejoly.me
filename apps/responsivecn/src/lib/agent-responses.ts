import { markdownTwinPath, prefersMarkdown } from "@/lib/markdown-negotiation";
import { canonicalUrl } from "@/lib/seo";
import { siteUrl } from "@/lib/shared";

type ResolveMarkdown = (path: string) => Promise<string | undefined>;

const notFoundMarkdown = (path: string): string =>
  [
    "# Page not found",
    "",
    `Nothing is published at ${canonicalUrl(path)}.`,
    "",
    `Start from [llms.txt](${siteUrl}/llms.txt), which lists every docs page, or the [sitemap](${siteUrl}/sitemap.xml).`,
    "",
  ].join("\n");

const markdownResponse = (
  markdown: string | undefined,
  path: string,
  headers: HeadersInit
): Response =>
  new Response(markdown ?? notFoundMarkdown(path), {
    status: markdown === undefined ? 404 : 200,
    headers: { "content-type": "text/markdown; charset=utf-8", ...headers },
  });

// The response an agent gets instead of the app's HTML, or undefined when the
// request is the app's to answer.
export const agentResponse = async (
  request: Request,
  resolveMarkdown: ResolveMarkdown
): Promise<Response | undefined> => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return undefined;
  }
  const { pathname } = new URL(request.url);

  const twin = markdownTwinPath(pathname);
  if (twin !== undefined) {
    return markdownResponse(await resolveMarkdown(twin), twin, {
      link: `<${canonicalUrl(twin)}>; rel="canonical"`,
    });
  }

  if (prefersMarkdown(request.headers.get("accept"))) {
    return markdownResponse(await resolveMarkdown(pathname), pathname, {
      vary: "Accept",
    });
  }

  return undefined;
};

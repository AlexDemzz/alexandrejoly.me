import { prefersMarkdown } from "@/lib/accept";
import { llmsTxt, markdownFor } from "@/lib/markdown";

const READ_METHODS = new Set(["GET", "HEAD"]);
const SERVER_FN_PREFIX = "/_serverFn";

const textResponse = (
  request: Request,
  body: string,
  {
    canonical,
    contentType,
    status,
  }: { canonical?: string; contentType: string; status: number }
) =>
  new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "content-type": contentType,
      vary: "Accept",
      ...(canonical && { link: `<${canonical}>; rel="canonical"` }),
    },
    status,
  });

/**
 * The answer for agents: `/llms.txt`, and the Markdown twin of a page when the
 * path ends in `.md` or the request prefers `text/markdown`, canonical to the
 * HTML page so search engines index that one. `undefined` lets the app render
 * HTML.
 */
export const agentResponse = async (
  request: Request
): Promise<Response | undefined> => {
  if (!READ_METHODS.has(request.method)) {
    return undefined;
  }
  const { pathname } = new URL(request.url);
  if (pathname === "/llms.txt") {
    return textResponse(request, llmsTxt(), {
      contentType: "text/plain; charset=utf-8",
      status: 200,
    });
  }
  const wantsMarkdown =
    pathname.endsWith(".md") || prefersMarkdown(request.headers.get("accept"));
  if (!wantsMarkdown || pathname.startsWith(SERVER_FN_PREFIX)) {
    return undefined;
  }
  const { body, canonical, status } = await markdownFor(pathname);
  return textResponse(request, body, {
    canonical,
    contentType: "text/markdown; charset=utf-8",
    status,
  });
};

/**
 * Every app response depends on `Accept` (HTML, Markdown or 406), so shared
 * caches must key on it.
 */
export const withVaryAccept = (response: Response): Response => {
  const varied = new Response(response.body, response);
  varied.headers.append("vary", "Accept");
  return varied;
};

import { createMiddleware, createStart } from "@tanstack/react-start";

import { pageMarkdown } from "@/lib/agent-content";
import { agentResponse } from "@/lib/agent-responses";

// Pages also answer Accept: text/markdown, so caches must key on Accept.
const varyHtmlOnAccept = <T extends { response: Response }>(result: T): T => {
  if (result.response.headers.get("content-type")?.startsWith("text/html")) {
    result.response.headers.append("vary", "Accept");
  }
  return result;
};

const agentMiddleware = createMiddleware().server(async ({ request, next }) => {
  const response = await agentResponse(request, pageMarkdown);
  if (response) {
    return response;
  }
  return varyHtmlOnAccept(await next());
});

export const startInstance = createStart(() => ({
  requestMiddleware: [agentMiddleware],
}));

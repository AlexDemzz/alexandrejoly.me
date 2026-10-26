import { redirect } from "@tanstack/react-router";
import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";
import { isMarkdownPreferred } from "fumadocs-core/negotiation";

import { docsRoute, getPageMarkdownUrl } from "@/lib/shared";

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

// Agents that ask for Markdown get the page's .md twin.
const llmMiddleware = createMiddleware().server(({ next, request }) => {
  const url = new URL(request.url);

  if (
    url.pathname.startsWith(`${docsRoute}/`) &&
    !url.pathname.endsWith(".md") &&
    isMarkdownPreferred(request)
  ) {
    const slugs = url.pathname
      .slice(docsRoute.length)
      .split("/")
      .filter((v) => v.length > 0);
    url.pathname = getPageMarkdownUrl({ slugs }).url;

    throw redirect({ href: url.href, headers: { Vary: "Accept" } });
  }

  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, llmMiddleware],
}));
